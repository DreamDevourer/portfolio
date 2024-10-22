#! /usr/bin/env python3
r"""Nick DnD Editor curated to edit Nick's staticjinja portfolio ~ by Nicolas Mendes.
"""

# 🧶 Modules Imports
from flask import Flask, request, jsonify, render_template_string, url_for
from jinja2 import Environment, FileSystemLoader, TemplateNotFound
import json
import os
from SNL import nick_logger as logn

""" Made by Nicolas Mendes - Aug 2024
SUMMARY:
🧶 Modules Imports
✍️ Initial Setup to load assets
🔖 Main execution
"""

__copyright__ = """
    Nick DnD Editor - Copyright (c) 2024, Nicolas Mendes; mailto:nicolasmendes_developer@outlook.com
    Permission to use, copy, modify, and distribute this software and its
    documentation for any purpose and without fee or royalty is hereby granted,
    provided that the above copyright notice appear in all copies and that
    both that copyright notice and this permission notice appear in
    supporting documentation or portions thereof, including modifications,
    that you make.
"""

# ✍️ Initial Setup to load assets
# Logging and debugging options
App_Version = "v1.0 - Editor Dev"
Debug_Mode = True

script_dir = os.path.dirname(os.path.abspath(__file__))

Log_Routine_Controller = logn.log_routine_controller(
    Debug_Mode, True, "log_editor", 5000, True, True, True, f"{App_Version}"
)

logn.log_routine(logn.log_os_details())

if Debug_Mode:
    logn.log_routine(
        f"Debug mode is enabled! Debug = {Debug_Mode}",
        is_warnings=True,
        is_default_log=False,
    )

app = Flask(__name__)

# Directory where your GrapesJS JSON data will be stored
DATA_DIR = "./@src/.editor"

logn.log_routine(
    f"Nick's DnD Editor started with Flask!",
    time_needed=True,
    is_default_log=False,
    is_warnings=False,
    is_error=False,
    show_default_label=False,
    is_success=True,
    custom_label=f"EDITOR REPORT: ",
)

# Ensure the directory exists
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Set up the Jinja environment to include the @src directory
jinja_env = Environment(loader=FileSystemLoader("./@src"))

# Add Flask-specific functions to the Jinja environment
jinja_env.globals.update(
    {
        "url_for": url_for,
    }
)


# 🔖 Main execution
@app.route("/")
def serve_editor():
    try:
        # Render the editor.html from the @src directory using the custom Jinja environment
        template = jinja_env.get_template("editor.html")
        return template.render()
    except TemplateNotFound as e:
        logn.log_routine(f"Template not found: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Template not found"}), 404
    except Exception as e:
        logn.log_routine(f"Unexpected error: {e}", is_error=True)
        return (
            jsonify({"status": "error", "message": "An unexpected error occurred"}),
            500,
        )


@app.route("/save-json", methods=["POST"])
def save_json():
    try:
        data = request.json
        print("Received data:", data)  # Debug: Print received data
        filename = data.get("pageName", "default") + ".json"
        filepath = os.path.join(DATA_DIR, filename)

        # Save the JSON data to a file
        with open(filepath, "w") as json_file:
            json.dump(data, json_file)

        logn.log_routine(f"Data saved to {filepath}", is_success=True)
        return jsonify({"status": "success", "message": f"Data saved to {filename}"})
    except Exception as e:
        logn.log_routine(f"Failed to save data: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Failed to save data"}), 500


@app.route("/load-json/<page_name>", methods=["GET"])
def load_json(page_name):
    try:
        filepath = os.path.join(DATA_DIR, f"{page_name}.json")

        if not os.path.exists(filepath):
            logn.log_routine(f"Page not found: {page_name}", is_warnings=True)
            return jsonify({"status": "error", "message": "Page not found"}), 404

        with open(filepath, "r") as json_file:
            data = json.load(json_file)

        logn.log_routine(f"Page loaded: {page_name}", is_success=True)
        return jsonify({"status": "success", "data": data})
    except json.JSONDecodeError as e:
        logn.log_routine(f"Error decoding JSON: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Error decoding JSON"}), 400
    except Exception as e:
        logn.log_routine(f"Failed to load data: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Failed to load data"}), 500


if __name__ == "__main__":
    app.run(debug=True)
