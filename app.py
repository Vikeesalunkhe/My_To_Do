from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from datetime import datetime, date
from contextlib import contextmanager
from werkzeug.security import generate_password_hash, check_password_hash

import pyodbc
app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this'  # Change this in production

# Database Connection Function
def get_db_connection():
    """Create a fresh database connection"""
    return pyodbc.connect(
            'Driver={ODBC Driver 17 for SQL Server};'
            'Server=INTERN-DELL\SQLEXPRESS;'
            'Database=My_To_Do;'
            'Trusted_Connection=yes;'
        )

# ✅ Context manager for database operations
@contextmanager
def get_db_cursor():
    """Context manager for database operations with automatic cleanup"""
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        yield conn, cursor
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()


@app.route("/")
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = get_db_connection()
        cursor = conn.cursor()
        # fetch id, username, and password_hash
        cursor.execute("SELECT id, username, password_hash FROM users WHERE username=?", (username,))
        user = cursor.fetchone()
        print("user data : ", user)

        if user and check_password_hash(user[2], password):
            session['user_id'] = user[0]
            session['username'] = user[1]
            flash("Login successful!", "success")
            return redirect(url_for('dashboard'))
        else:
            flash("Invalid username or password!", "error")

    return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    # return render_template("register.html")
    print("in register_______________________")
    if request.method == "POST":
        username = request.form["username"]
        email = request.form["email"]
        password = request.form["password"]
        confirm_password = request.form["confirm_Password"]
        print("form data", username, email, password, confirm_password)

        if password != confirm_password:
            flash("Passwords do not match!", "error")
            return render_template("register.html")

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE username=? OR email=?", (username, email))
        existing_user = cursor.fetchone()

        print("existing user", existing_user)

        if existing_user:
            flash("Username or email already exists!", "error")
            return render_template("login.html")
        
        # Hash the password before storing
        hashed_password = generate_password_hash(password)

        cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", (username, email, hashed_password))
        conn.commit()
        conn.close()

        flash("Registration successful! Please log in.", "success")

        return redirect(url_for('login'))

    return render_template("register.html")

@app.route("/dashboard")
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    user_id = session['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, description, due_date, status FROM todos WHERE user_id=?", (user_id,))
    todos = cursor.fetchall()
    print("todos", todos)
    conn.close()

    #return jsonify([{'id': todo[0], 'title': todo[1], 'description': todo[2], 'due_date': todo[3]} for todo in todos])

    return render_template("dashboard.html", todos=todos)

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for('login'))

@app.route("/add_todo", methods=["POST"])
def add_todo(): 
    if 'user_id' not in session:
        return redirect(url_for('login'))

    title = request.form["title"]
    description = request.form["description"]
    due_date = request.form["due_date"]
    user_id = session['user_id']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO todos (user_id, title, description, due_date) VALUES (?, ?, ?, ?)",
                       (user_id, title, description, due_date))
    conn.commit()

    flash("Todo added successfully!", "success")
    return redirect(url_for('dashboard'))



# -------- Update Todo --------
@app.route('/update_todo/<int:todo_id>', methods=['POST'])
def update_todo(todo_id):
    title = request.form.get("title")
    description = request.form.get("description")
    due_date = request.form.get("due_date")
    status = request.form.get("status")

    conn = get_db_connection()
    cursor = conn.cursor()

    sql = """UPDATE todos
             SET title=?, description=?, due_date=?, status=?
             WHERE id=?"""
    cursor.execute(sql, (title, description, due_date, status, todo_id))

    conn.commit()
    cursor.close()
    conn.close()
    return redirect(url_for("dashboard"))

# -------- Delete Todo --------
@app.route('/delete_todo/<int:todo_id>', methods=['POST'])
def delete_todo(todo_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    sql = "DELETE FROM todos WHERE id=?"
    cursor.execute(sql, (todo_id,))

    conn.commit()
    cursor.close()
    conn.close()
    return redirect(url_for("dashboard"))

# -------- Toggle Todo --------
@app.route('/toggle_todo/<int:todo_id>', methods=['POST'])
def toggle_todo(todo_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT status FROM todos WHERE id=?", (todo_id,))
    todo = cursor.fetchone()

    if todo:
        current_status = todo[0]  # fetchone() returns a tuple in pyodbc
        new_status = "done" if current_status == "pending" else "pending"
        cursor.execute("UPDATE todos SET status=? WHERE id=?", (new_status, todo_id))
        conn.commit()

    cursor.close()
    conn.close()
    return redirect(url_for("dashboard"))

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)