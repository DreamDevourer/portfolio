from flask import Flask, request, jsonify, render_template_string, url_for
from jinja2 import Environment, FileSystemLoader
import json
import os

app = Flask(__name__)

# Directory where your GrapesJS JSON data will be stored
DATA_DIR = "./@src/.editor"

# Ensure the directory exists
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Set up the Jinja environment to include the @src directory
jinja_env = Environment(loader=FileSystemLoader("./@src"))

# Add Flask-specific functions to the Jinja environment
jinja_env.globals.update(
    {
        "url_for": url_for,  # Add url_for to the Jinja environment
    }
)


@app.route("/")
def serve_editor():
    # Render the editor.html from the @src directory using the custom Jinja environment
    template = jinja_env.get_template("editor.html")
    return template.render()


@app.route("/save-json", methods=["POST"])
def save_json():
    data = request.json
    print("Received data:", data)  # Debug: Print received data
    filename = data.get("pageName", "default") + ".json"
    filepath = os.path.join(DATA_DIR, filename)

    # Save the JSON data to a file
    with open(filepath, "w") as json_file:
        json.dump(data, json_file)

    print(f"Data saved to {filepath}")  # Debug: Confirm file save
    return jsonify({"status": "success", "message": f"Data saved to {filename}"})


@app.route("/load-json/<page_name>", methods=["GET"])
def load_json(page_name):
    filepath = os.path.join(DATA_DIR, f"{page_name}.json")

    if not os.path.exists(filepath):
        return jsonify({"status": "error", "message": "Page not found"}), 404

    with open(filepath, "r") as json_file:
        data = json.load(json_file)

    return jsonify({"status": "success", "data": data})


if __name__ == "__main__":
    app.run(debug=True)
