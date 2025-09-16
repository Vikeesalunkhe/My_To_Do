from flask import Flask, render_template, redirect, url_for, request
import pyodbc
import pymysql


app = Flask(__name__)

def connection():  # SQL server connection changes needed
    """SQL Server Connection"""
    try:
        # conn = pyodbc.connect(
        #     'Driver={ODBC Driver 17 for SQL Server};'
        #     'Server=AYUSHP-DELL\SQLEXPRESS03;'       # example: "localhost\\SQLEXPRESS"
        #     'Database=My_To_Do;'             # 👈 your DB name
        #     'Trusted_Connection=yes;'
        # )

        conn = pymysql.connect(
        host="sql12.freesqldatabase.com",
        user="sql12798816",
        password="IsbRUesD5c",
        database="sql12798816",
        cursorclass=pymysql.cursors.DictCursor  # so results come as dicts
        )
        cursor = conn.cursor()
        return cursor, conn
    except Exception as error:
        print("SQL Connection", error)

def get_tasks():
    cursor, conn = connection()
    cursor.execute("SELECT id, title, description, status FROM Tasks")
    return cursor.fetchall()

def add_task(title, description=""):
    print("Call to add task __________________________")
    cursor, conn = connection()
    cursor.execute("INSERT INTO Tasks (title, description) VALUES (?, ?)", (title, description))
    conn.commit()



@app.route("/", methods=["POST", "GET"])
def index():
    return render_template("login.html")

@app.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        if username == "admin" and password == "123":
            return redirect(url_for("update_all"))
        else:            
            return render_template("to_do_home.html")
        
@app.route("/fetch_Task")
def update_all():
    data = get_tasks()
    print("data-------------------", data)
    return render_template("to_do_home.html", task_list=data)

@app.route("/add_task", methods=["POST", "GET"])
def add_task_page():
    
    if request.method == "POST":
        title = request.form.get("Title")
        description = request.form.get("Description")
        if title:
            add_task(title, description)
            return redirect(url_for("update_all"))
    
    return render_template("add.html")



if __name__ == "__main__":
    #app.run(debug=True)
    app.run(host='0.0.0.0', port=5000, debug=True)