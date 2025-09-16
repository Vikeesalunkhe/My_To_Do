import flask
from flask import Flask, render_template, request

app = Flask(__name__)
list_data = []
@app.route("/", methods=["POST", "GET"])
def index():
    if request.method == "POST":
        data = request.form.get("variable_data")
        list_data.append(data)
        return render_template("index.html", variable_data=list_data)
    
    return render_template("index.html",  variable_data=list_data)

@app.route("/delete/<string:data>")
def delerte(data):
    if data in list_data:
        list_data.remove(data)

    return flask.redirect(flask.url_for("index"))

@app.route("/edit/<string:edit_data>", methods=["POST", "GET"])
def edit(edit_data):
    print(request.method)
    if request.method == "POST":
        new_data = request.form.get("edit_data")
        if new_data:
            index = list_data.index(edit_data)
            list_data[index] = new_data
        return flask.redirect(flask.url_for("index"))
    
    return render_template("edit.html", variable_data=edit_data)


if __name__ == "__main__":
    app.run(debug=True)