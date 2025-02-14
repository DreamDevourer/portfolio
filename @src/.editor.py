#! /usr/bin/env python3
r"""Nick DnD Editor curated to edit Nick's staticjinja portfolio ~ by Nicolas Mendes.
"""

# 🧶 Modules Imports
from flask import Flask, request, jsonify, url_for
import uuid
from jinja2 import Environment, FileSystemLoader, TemplateNotFound
import json
import os
import csv
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
DATA_DIR = "./@src/.editor/storage"

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
jinja_env.globals.update(
    {
        "url_for": url_for,
    }
)

# 🔖 Main execution


@app.route("/")
def serve_editor():
    try:
        # Render the CMS Panel from ed-panel-main.html
        template = jinja_env.get_template("ed-panel-main.html")
        return template.render()
    except Exception as e:
        logn.log_routine(f"Error rendering CMS Panel: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Error rendering CMS Panel"}), 500


@app.route("/save-json", methods=["POST"])
def save_json():
    try:
        payload = request.get_json()
        # Expect payload to have projectData, projectHTML, and projectCSS
        projectData = payload.get("projectData", {})
        projectHTML = payload.get("projectHTML", "")
        projectCSS = payload.get("projectCSS", "")
        logn.log_routine(f"Received projectData: {projectData}", is_success=True)

        # Extract used module names from projectData
        def extract_module_names(item):
            modules = set()
            if isinstance(item, dict):
                if (
                    "id" in item
                    and isinstance(item["id"], str)
                    and item["id"].startswith("module__")
                ):
                    modules.add(item["id"])
                for value in item.values():
                    modules.update(extract_module_names(value))
            elif isinstance(item, list):
                for subitem in item:
                    modules.update(extract_module_names(subitem))
            return modules

        used_modules = list(extract_module_names(projectData))
        projectData["usedModules"] = used_modules
        # Update payload with the modified projectData
        payload["projectData"] = projectData

        filename = projectData.get("pageName")
        if not filename:
            return jsonify({"status": "error", "message": "pageName is required"}), 400
        json_filename = f"{filename}.json"
        filepath = os.path.join(DATA_DIR, json_filename)

        # Save the complete payload (including HTML and CSS) to the JSON file
        with open(filepath, "w", encoding="utf-8") as json_file:
            json.dump(payload, json_file, indent=2)

        logn.log_routine(f"Data saved to {filepath}", is_success=True)

        # Generate final static HTML file using projectHTML and projectCSS
        pages_dir = os.path.join(script_dir, ".editor", "pages")
        if not os.path.exists(pages_dir):
            os.makedirs(pages_dir)
        html_filename = f"{filename}.html"
        html_filepath = os.path.join(pages_dir, html_filename)
        # Build final HTML by including projectCSS inside a <style> tag (if provided) and appending projectHTML
        final_html = f"<!-- Page: {filename} -->\n"
        if projectCSS:
            final_html += f"<style>\n{projectCSS}\n</style>\n"
        final_html += projectHTML
        with open(html_filepath, "w", encoding="utf-8") as html_file:
            html_file.write(final_html)

        return jsonify(
            {
                "status": "success",
                "message": f"Data saved to {json_filename} and static HTML saved to {html_filename}",
            }
        )
    except Exception as e:
        logn.log_routine(f"Failed to save data: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Failed to save data"}), 500


@app.route("/load-json/<page_name>", methods=["GET"])
def load_json(page_name):
    try:
        # Build the full path to the JSON file
        filepath = os.path.join(DATA_DIR, f"{page_name}.json")
        if not os.path.exists(filepath):
            logn.log_routine(f"Page not found: {page_name}", is_warnings=True)
            return jsonify({"status": "error", "message": "Page not found"}), 404

        with open(filepath, "r", encoding="utf-8") as json_file:
            data = json.load(json_file)

            # Remove unnecessary fields from the top level of the JSON data.
            data.pop("projectHTML", {})
            data.pop("projectCSS", {})
            data.pop("pageName", {})
            data.pop("usedModules", {})

            # Move every key-value pair from the "projectData" dictionary to the top level.
            project_data = data.pop("projectData", {})
            if isinstance(project_data, dict):
                data.update(project_data)
            else:
                logn.log_routine(
                    "Expected 'projectData' to be a dictionary.", is_warnings=True
                )
        logn.log_routine(f"Data for page: {data}", is_success=True)
        logn.log_routine(f"Page loaded: {page_name}", is_success=True)
        return jsonify(data)

    except json.JSONDecodeError as e:
        logn.log_routine(f"Error decoding JSON: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Error decoding JSON"}), 400
    except Exception as e:
        logn.log_routine(f"Failed to load data: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Failed to load data"}), 500


@app.route("/preview/<page_name>", methods=["GET"])
def preview(page_name):
    """
    Load the JSON file for the given page_name and render a preview using
    a Jinja2 template (e.g., page_template.html) with the JSON data as context.
    """
    try:
        filepath = os.path.join(DATA_DIR, f"{page_name}.json")
        if not os.path.exists(filepath):
            logn.log_routine(
                f"Page not found for preview: {page_name}", is_warnings=True
            )
            return jsonify({"status": "error", "message": "Page not found"}), 404

        with open(filepath, "r", encoding="utf-8") as json_file:
            page_data = json.load(json_file)

        # Render a preview page using a template named "page_template.html" located in @src.
        template = jinja_env.get_template("page_template.html")
        rendered_preview = template.render(content=page_data)
        logn.log_routine(f"Preview rendered for page: {page_name}", is_success=True)
        return rendered_preview
    except Exception as e:
        logn.log_routine(f"Error rendering preview: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Error rendering preview"}), 500


@app.route("/create-page", methods=["POST"])
def create_page():
    try:
        data = request.get_json()
        page_name = data.get("pageName")
        internal_name = data.get("internalName")
        if not page_name or not internal_name:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Both pageName and internalName are required",
                    }
                ),
                400,
            )

        # Define filenames for JSON and HTML
        json_filename = f"{internal_name}.json"
        html_filename = f"{internal_name}.html"

        # Use the provided JSON template as the new page template.
        json_template = {
            "pageName": page_name,
            "assets": [],
            "styles": [
                {"selectors": ["my-page1-el"], "style": {"color": "red"}},
                {"selectors": ["my-page2-el"], "style": {"color": "blue"}},
            ],
            "pages": [
                {
                    "frames": [
                        {
                            "component": {
                                "type": "wrapper",
                                "stylable": [
                                    "background",
                                    "background-color",
                                    "background-image",
                                    "background-repeat",
                                    "background-attachment",
                                    "background-position",
                                    "background-size",
                                ],
                                "components": [
                                    {
                                        "type": "text",
                                        "classes": ["my-page1-el"],
                                        "components": [
                                            {
                                                "type": "textnode",
                                                "content": "Use me to add new Drag and Drop content :)",
                                            }
                                        ],
                                    }
                                ],
                                "head": {"type": "head"},
                                "docEl": {"tagName": "html"},
                            },
                            "id": "RUZDgrbUm15LZMyj",
                        }
                    ],
                    "id": "my-first-page",
                },
                {
                    "frames": [
                        {
                            "component": {
                                "type": "wrapper",
                                "stylable": [
                                    "background",
                                    "background-color",
                                    "background-image",
                                    "background-repeat",
                                    "background-attachment",
                                    "background-position",
                                    "background-size",
                                ],
                                "components": [
                                    {
                                        "type": "text",
                                        "classes": ["my-page2-el"],
                                        "components": [
                                            {
                                                "type": "textnode",
                                                "content": "Use me to add new Drag and Drop content :)",
                                            }
                                        ],
                                    }
                                ],
                                "head": {"type": "head"},
                                "docEl": {"tagName": "html"},
                            },
                            "id": "WwtNBJEjwSCvDhOW",
                        }
                    ],
                    "id": "my-second-page",
                },
            ],
            "symbols": [],
            "dataSources": [],
        }

        # Save the JSON template to the storage folder
        json_filepath = os.path.join(DATA_DIR, json_filename)
        with open(json_filepath, "w", encoding="utf-8") as jf:
            json.dump(json_template, jf, indent=2)

        # Ensure the pages directory exists inside .editor
        pages_dir = os.path.join(script_dir, ".editor", "pages")
        if not os.path.exists(pages_dir):
            os.makedirs(pages_dir)

        # Create a basic HTML template for the new page.
        html_template = f"""<!--
    templateType: page
    isAvailableForNewContent: false
    label: New Page Template
    pageName: {page_name}
    pageURL: Not needed!
-->
{{% set navType = "internal" %}}
{{% extends "_layouts/base.html" %}}
{{% block title %}}
New Page: {page_name}
{{% endblock title %}}
{{% block meta %}}
Description for {page_name}
{{% endblock meta %}}
{{% block body %}}
<main>
  <p>Content for new page: {page_name}</p>
</main>
{{% endblock body %}}
"""
        html_filepath = os.path.join(pages_dir, html_filename)
        with open(html_filepath, "w", encoding="utf-8") as hf:
            hf.write(html_template)

        logn.log_routine(
            f"New page created: JSON -> {json_filename}, HTML -> {html_filename}",
            is_success=True,
        )
        return jsonify(
            {
                "status": "success",
                "message": f"Page '{page_name}' created with internal name '{internal_name}'.",
            }
        )
    except Exception as e:
        logn.log_routine(f"Error creating new page: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Error creating new page"}), 500


@app.route("/hubdb-panel", methods=["GET"])
def hubdb_panel():
    try:
        # Render the CMS Panel from ed-panel-hubdb.html
        template = jinja_env.get_template("ed-panel-hubdb.html")
        return template.render()
    except Exception as e:
        logn.log_routine(f"Error rendering CMS Panel: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Error rendering CMS Panel"}), 500


# New route for editing a page
@app.route("/edit/pages/<page_name>", methods=["GET"])
def edit_page(page_name):
    try:
        # Render the GrapesJS editor with the specific page's project data.
        filepath = os.path.join(DATA_DIR, f"{page_name}.json")
        page_data = {}
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as json_file:
                page_data = json.load(json_file)
        # Render the editor.html with additional context for editing the page.
        template = jinja_env.get_template("editor.html")
        return template.render(
            page_name=page_name, projectData=page_data, subDirectoryDetected=True
        )
    except Exception as e:
        logn.log_routine(
            f"Error rendering edit page for {page_name}: {e}", is_error=True
        )
        return jsonify({"status": "error", "message": "Error rendering edit page"}), 500


@app.route("/api/pages", methods=["GET"])
def get_pages():
    """
    Scans the DATA_DIR for JSON files and returns a list of pages.
    Each page object includes:
      - pageName: extracted from JSON or fallback to filename
      - internalName: the filename without the .json extension
      - createdDate: formatted file creation date (YYYY-MM-DD)
    """
    try:
        pages_list = []
        for filename in os.listdir(DATA_DIR):
            if filename.endswith(".json"):
                filepath = os.path.join(DATA_DIR, filename)
                # Open and load the JSON file
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                # Attempt to get pageName from top-level or from projectData
                page_name = data.get("pageName")
                if not page_name:
                    project_data = data.get("projectData", {})
                    if isinstance(project_data, dict):
                        page_name = project_data.get("pageName")
                # Fallback: use the filename (without extension)
                if not page_name:
                    page_name = os.path.splitext(filename)[0]

                # The internal name can be the filename without extension
                internal_name = os.path.splitext(filename)[0]

                # Use the file's creation timestamp (adjust formatting as needed)
                from datetime import datetime

                created_timestamp = os.path.getctime(filepath)
                created_date = datetime.fromtimestamp(created_timestamp).strftime(
                    "%Y-%m-%d"
                )

                pages_list.append(
                    {
                        "pageName": page_name,
                        "internalName": internal_name,
                        "createdDate": created_date,
                    }
                )

        return jsonify({"status": "success", "pages": pages_list})
    except Exception as e:
        logn.log_routine(f"Error loading pages: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Error loading pages"}), 500


@app.route("/api/delete-pages", methods=["POST"])
def delete_pages():
    """
    Deletes selected pages by removing both their JSON and HTML files.
    Expects a JSON payload in the format:
      { "pages": ["internalName1", "internalName2", ...] }
    """
    try:
        payload = request.get_json()
        pages_to_delete = payload.get("pages", [])
        if not pages_to_delete or not isinstance(pages_to_delete, list):
            return jsonify({"status": "error", "message": "No pages provided"}), 400

        # Get the absolute path for the pages directory
        pages_dir = os.path.join(script_dir, ".editor", "pages")
        deleted_pages = []
        errors = []

        for internal_name in pages_to_delete:
            # Build paths for the JSON and HTML files
            json_path = os.path.join(DATA_DIR, f"{internal_name}.json")
            html_path = os.path.join(pages_dir, f"{internal_name}.html")

            # Delete JSON file if it exists
            if os.path.exists(json_path):
                try:
                    os.remove(json_path)
                    deleted_pages.append(internal_name)
                except Exception as e:
                    errors.append(f"Error deleting JSON for '{internal_name}': {e}")
            else:
                errors.append(f"JSON file for '{internal_name}' does not exist.")

            # Delete HTML file if it exists (not critical if missing)
            if os.path.exists(html_path):
                try:
                    os.remove(html_path)
                except Exception as e:
                    errors.append(f"Error deleting HTML for '{internal_name}': {e}")

        # If any errors occurred, log and return them
        if errors:
            logn.log_routine(f"Delete pages errors: {errors}", is_error=True)
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Some errors occurred",
                        "errors": errors,
                    }
                ),
                500,
            )

        logn.log_routine(f"Deleted pages: {deleted_pages}", is_success=True)
        return jsonify(
            {"status": "success", "message": f"Deleted pages: {deleted_pages}"}
        )
    except Exception as e:
        logn.log_routine(f"Error deleting pages: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Error deleting pages"}), 500


# Directory where your HubDB CSV files will be stored
HUBDB_DIR = os.path.join(script_dir, ".editor", "hubdb")
if not os.path.exists(HUBDB_DIR):
    os.makedirs(HUBDB_DIR)


@app.route("/edit/tables/<table_name>", methods=["GET"])
def edit_table(table_name):
    """
    Edit table by sending the CSV file data to the ed-panel-hubdb-edit.html template.
    The CSV file is expected to be located in the HUBDB_DIR and named as <table_name>.csv.
    The CSV data is parsed into a list of rows, where each row is a list of cell values.
    """
    try:
        csv_filepath = os.path.join(HUBDB_DIR, f"{table_name}.csv")
        if not os.path.exists(csv_filepath):
            logn.log_routine(f"Table not found: {table_name}", is_warnings=True)
            return jsonify({"status": "error", "message": "Table not found"}), 404

        # Parse the CSV file into a list of rows
        with open(csv_filepath, "r", encoding="utf-8") as csvfile:
            csv_reader = csv.reader(csvfile)
            csv_data = list(csv_reader)  # Each element is a row (list of cell values)

        logn.log_routine(f"Loaded CSV data for table: {table_name}", is_success=True)

        # Render the template for editing the table, passing the CSV data as context
        template = jinja_env.get_template("ed-panel-hubdb-edit.html")
        return template.render(table_name=table_name, csv_data=csv_data)
    except Exception as e:
        logn.log_routine(f"Error editing table {table_name}: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Error editing table"}), 500


@app.route("/api/tables", methods=["GET"])
def get_tables():
    """
    Scans the HUBDB_DIR for CSV files and returns a list of tables.
    Each table object includes:
      - tableName: the filename (with extension)
      - internalTableName: the filename without the .csv extension
      - createdDate: formatted file creation date (YYYY-MM-DD)
    """
    try:
        tables_list = []
        for filename in os.listdir(HUBDB_DIR):
            if filename.endswith(".csv"):
                filepath = os.path.join(HUBDB_DIR, filename)
                # Use the filename (with and without extension)
                table_name = filename
                internal_name = os.path.splitext(filename)[0]
                from datetime import datetime

                created_timestamp = os.path.getctime(filepath)
                created_date = datetime.fromtimestamp(created_timestamp).strftime(
                    "%Y-%m-%d"
                )
                tables_list.append(
                    {
                        "tableName": table_name,
                        "internalTableName": internal_name,
                        "createdDate": created_date,
                    }
                )
        return jsonify({"status": "success", "tables": tables_list})
    except Exception as e:
        logn.log_routine(f"Error loading tables: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Error loading tables"}), 500


@app.route("/api/delete-tables", methods=["POST"])
def delete_tables():
    """
    Deletes selected tables by removing their CSV files from HUBDB_DIR.
    Expects a JSON payload in the format:
      { "tables": ["internalTableName1", "internalTableName2", ...] }
    """
    try:
        payload = request.get_json()
        tables_to_delete = payload.get("tables", [])
        if not tables_to_delete or not isinstance(tables_to_delete, list):
            return jsonify({"status": "error", "message": "No tables provided"}), 400

        deleted_tables = []
        errors = []

        for internal_name in tables_to_delete:
            csv_path = os.path.join(HUBDB_DIR, f"{internal_name}.csv")
            if os.path.exists(csv_path):
                try:
                    os.remove(csv_path)
                    deleted_tables.append(internal_name)
                except Exception as e:
                    errors.append(f"Error deleting CSV for '{internal_name}': {e}")
            else:
                errors.append(f"CSV file for '{internal_name}' does not exist.")

        if errors:
            logn.log_routine(f"Delete tables errors: {errors}", is_error=True)
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Some errors occurred",
                        "errors": errors,
                    }
                ),
                500,
            )

        logn.log_routine(f"Deleted tables: {deleted_tables}", is_success=True)
        return jsonify(
            {"status": "success", "message": f"Deleted tables: {deleted_tables}"}
        )
    except Exception as e:
        logn.log_routine(f"Error deleting tables: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Error deleting tables"}), 500


@app.route("/api/save-table", methods=["POST"])
def save_table():
    """
    Saves CSV table data.
    Expects a JSON payload in the format:
      {
         "internalTableName": "table1",
         "tableData": [
             ["Header1", "Header2", "Header3"],
             ["Data1", "Data2", "Data3"],
             ...
         ]
      }
    Writes the CSV file to HUBDB_DIR as <internalTableName>.csv.
    """
    try:
        data = request.get_json()
        internal_table_name = data.get("internalTableName")
        table_data = data.get("tableData")

        if not internal_table_name or not table_data:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "internalTableName and tableData are required",
                    }
                ),
                400,
            )

        # Build the file path for the CSV file in HUBDB_DIR
        csv_filepath = os.path.join(HUBDB_DIR, f"{internal_table_name}.csv")

        # Write the table_data (array of rows) to CSV file
        with open(csv_filepath, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            for row in table_data:
                writer.writerow(row)

        logn.log_routine(f"Saved table data to {csv_filepath}", is_success=True)
        return jsonify(
            {"status": "success", "message": "Table data saved successfully"}
        )
    except Exception as e:
        logn.log_routine(f"Error saving table data: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Error saving table data"}), 500


def hubdb_table_rows(table_name, specific_scope=None):
    """
    Reads CSV data for a given table name from the HUBDB_DIR.
    Expects a CSV file named <table_name>.csv with headers.

    Parameters:
      - table_name (str): Name of the CSV file (without .csv extension).
      - specific_scope (str, optional): A string in the format 'column=value' to filter rows.

    Returns:
      A list of dictionaries (one per row) that match the filtering condition,
      or all rows if no specific_scope is provided.
    """
    csv_filepath = os.path.join(HUBDB_DIR, f"{table_name}.csv")
    if not os.path.exists(csv_filepath):
        # Log a warning or simply return an empty list if the file is missing.
        return []

    with open(csv_filepath, "r", encoding="utf-8") as csvfile:
        # Read CSV data into a list of dictionaries
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    # If a specific scope is provided, filter the rows accordingly.
    if specific_scope:
        try:
            # Expecting specific_scope to be in the format 'column=value'
            key, value = specific_scope.split("=", 1)
        except ValueError:
            # If the format is incorrect, you could log a warning here.
            return []

        # Filter rows where the specified column matches the value.
        rows = [row for row in rows if row.get(key) == value]

    return rows


jinja_env.globals["hubdb_table_rows"] = hubdb_table_rows


@app.route("/dev-panel", methods=["GET"])
def dev_panel():
    try:
        # Render the developer panel template
        template = jinja_env.get_template("ed-panel-dev.html")
        return template.render()
    except Exception as e:
        logn.log_routine(f"Error rendering dev panel: {e}", is_error=True)
        return jsonify({"status": "error", "message": "Error rendering dev panel"}), 500


@app.route("/api/files", methods=["GET"])
def list_files():
    try:
        # List files in the directory
        files = os.listdir(script_dir)
        files = [f for f in files if os.path.isfile(os.path.join(script_dir, f))]
        return jsonify({"status": "success", "files": files})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/file-content", methods=["GET"])
def file_content():
    file_name = request.args.get("file")
    rel_path = request.args.get("path", "")
    safe_file_name = os.path.basename(file_name)
    directory = os.path.join(script_dir, rel_path)
    file_path = os.path.join(directory, safe_file_name)
    if not os.path.exists(file_path):
        return jsonify({"status": "error", "message": "File not found"}), 404
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return jsonify({"status": "success", "content": content})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/list", methods=["GET"])
def list_directory():
    # Get the relative path from the query parameter; default is the base directory ("")
    rel_path = request.args.get("path", "")
    base_dir = script_dir  # Or change this to a dedicated base directory if needed.
    requested_dir = os.path.join(base_dir, rel_path)

    # Prevent directory traversal: ensure the requested directory is inside base_dir.
    if not os.path.abspath(requested_dir).startswith(os.path.abspath(base_dir)):
        return jsonify({"status": "error", "message": "Invalid path"}), 400

    try:
        items = os.listdir(requested_dir)
        directories = [
            item for item in items if os.path.isdir(os.path.join(requested_dir, item))
        ]
        files = [
            item for item in items if os.path.isfile(os.path.join(requested_dir, item))
        ]
        return jsonify(
            {
                "status": "success",
                "path": rel_path,
                "directories": directories,
                "files": files,
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/publish-file", methods=["POST"])
def publish_file():
    data = request.get_json()
    file_name = data.get("file")
    content = data.get("content")
    rel_path = data.get("path", "")
    if not file_name or content is None:
        return jsonify({"status": "error", "message": "Missing file or content"}), 400

    safe_file_name = os.path.basename(file_name)
    directory = os.path.join(script_dir, rel_path)
    file_path = os.path.join(directory, safe_file_name)

    if not os.path.exists(file_path):
        return jsonify({"status": "error", "message": "File not found"}), 404

    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        logn.log_routine(f"Published changes to {file_path}", is_success=True)
        return jsonify({"status": "success", "message": "File published successfully"})
    except Exception as e:
        logn.log_routine(f"Error publishing file {file_path}: {e}", is_error=True)
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
