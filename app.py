from flask import Flask, render_template, request, redirect, url_for
import pymysql
import os

app = Flask(__name__)

# ✅ Function to create a fresh DB connection each time
def get_db_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "sql12.freesqldatabase.com"),
        user=os.getenv("DB_USER", "sql12798816"),
        password=os.getenv("DB_PASS", "IsbRUesD5c"),
        database=os.getenv("DB_NAME", "sql12798816"),
        cursorclass=pymysql.cursors.DictCursor
    )

@app.route("/", methods=["GET", "POST"])
def index():
    conn = get_db_connection()
    cursor = conn.cursor()

    if request.method == "POST":
        title = request.form.get("title")
        description = request.form.get("description")

        cursor.execute(
            "INSERT INTO Tasks (title, description) VALUES (%s, %s)",
            (title, description)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return redirect(url_for("index"))

    cursor.execute("SELECT id, title, description, status FROM Tasks")
    tasks = cursor.fetchall()
    cursor.close()
    conn.close()
    return render_template("index.html", tasks=tasks)

if __name__ == "__main__":
    # For Render, keep host=0.0.0.0 and set port from env
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
