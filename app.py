
from flask import Flask, render_template, request, redirect, url_for
import pymysql

app = Flask(__name__)

# 🔗 MySQL connection
conn = pymysql.connect(
    host="sql12.freesqldatabase.com",
    user="sql12798816",
    password="IsbRUesD5c",
    database="sql12798816",
    cursorclass=pymysql.cursors.DictCursor  # so results come as dicts
)


@app.route("/", methods=["GET", "POST"])
def index():
    cursor = conn.cursor()

    if request.method == "POST":
        title = request.form.get("title")
        description = request.form.get("description")

        # Insert into DB
        cursor.execute(
            "INSERT INTO Tasks (title, description) VALUES (%s, %s)",
            (title, description)
        )
        conn.commit()
        return redirect(url_for("index"))

    # Fetch all tasks
    cursor.execute("SELECT id, title, description, status FROM Tasks")
    tasks = cursor.fetchall()
    return render_template("index.html", tasks=tasks)

if __name__ == "__main__":
    #app.run(debug=True)
    app.run(host='0.0.0.0', port=5000, debug=True)