import os
import htmlmin
import shutil
import json
import csv
import cssutils
import jinja2
import datetime
from bs4 import BeautifulSoup
from rcssmin import cssmin
from jsmin import jsmin
from staticjinja import Site
from SNL import nick_logger as logn

"""
Developed by: Nicolas Mendes 2023-2024
Build script for Jinja3 templates

This is the optimized and updated version 3 of the build engine.
"""

# Logging and debugging options
App_Version = "v3.0 - Dev"
Debug_Mode = True

script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)

BASE_URL = "https://nickdesign.netlify.app/"

Log_Routine_Controller = logn.log_routine_controller(
    Debug_Mode, True, "log", 5000, True, True, True, f"{App_Version}"
)

logn.log_routine(logn.log_os_details())

if Debug_Mode:
    logn.log_routine(
        f"Debug mode is enabled! Debug = {Debug_Mode}",
        is_warnings=True,
        is_default_log=False,
    )

# CSV/HubDB Content
hubdb_projects = "./.editor/hubdb/hubdb_projects.csv"
hubdb_index = "./.editor/hubdb/hubdb_index.csv"


def extract_metadata(html_content):
    """Extract metadata from HTML comments at the top of the file."""
    metadata = {}
    lines = html_content.splitlines()
    in_metadata_block = False

    for line in lines:
        line = line.strip()

        # Start extracting when a comment block is found
        if line.startswith("<!--"):
            in_metadata_block = True

        if in_metadata_block:
            # Extract key-value pairs from the comment block
            if ":" in line and not line.startswith("{%"):
                key, value = line.split(":", 1)
                metadata[key.strip()] = value.strip()

            # Stop if the end of the comment block is reached
            if line.endswith("-->"):
                break

        # Stop extracting if a non-comment line is encountered
        if not in_metadata_block and not line.startswith("<!--"):
            break

    logn.log_routine(
        f"Extracted metadata: {metadata}",
        time_needed=True,
        is_default_log=False,
        is_warnings=False,
        is_error=False,
        show_default_label=False,
        is_success=True,
        custom_label=f"METADATA: ",
    )

    return metadata


def compile_scss(source_dir, output_dir):
    """Compile SCSS files to CSS."""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for root, dirs, files in os.walk(source_dir):
        for file in files:
            if file.endswith(".scss"):
                scss_file = os.path.join(root, file)
                css_file = os.path.join(output_dir, file.replace(".scss", ".css"))

                os.system(f"sass --style=compressed {scss_file} {css_file}")


def minify_files(directories, remove_comments=True):
    """Minify all CSS, JS and HTML files in the given directories."""
    logn.log_routine(
        f"Minifying files is enabled!",
        is_warnings=True,
        is_default_log=False,
    )
    for directory in directories:
        try:
            for filename in os.listdir(directory):
                filepath = os.path.join(directory, filename)
                if not os.path.isfile(filepath):
                    continue
                else:
                    with open(filepath, "r", encoding="utf-8") as f:
                        try:
                            file_content = f.read()
                        except UnicodeDecodeError:
                            logn.log_routine(f"Error decoding file: {filename}", True)
                            continue

                        if filename.endswith(".js"):
                            logn.log_routine(f"Minifying {filename}", True)
                            minified_content = jsmin(file_content)
                            with open(filepath, "w", encoding="utf-8") as f:
                                f.write(minified_content)

                        elif filename.endswith(".html"):
                            logn.log_routine(f"Minifying {filename}", True)
                            soup = BeautifulSoup(file_content, "html.parser")
                            style_tags = soup.find_all("style")
                            for tag in style_tags:
                                css = tag.string
                                if css:
                                    minified_css = cssmin(css)
                                    tag.string.replace_with(minified_css)
                            minified_css_html = str(soup)
                            minified_content = htmlmin.minify(
                                minified_css_html, remove_comments=remove_comments
                            )
                            with open(filepath, "w", encoding="utf-8") as f:
                                f.write(minified_content)

        except FileNotFoundError:
            logn.log_routine(f"Directory {directory} does not exist!", True)


def render_page_with_url_info(
    site, page_name, url, context={}, raw_url=BASE_URL, case_study_header=None
):
    """Render a page with the given name and URL, conditionally based on 'isAvailableForNewContent'."""

    # Construct the template path
    template_path = os.path.join("./", page_name)

    # Read the content of the template file
    try:
        with open(template_path, "r", encoding="utf-8") as file:
            template_content = file.read()
            logn.log_routine(
                f"template_content read!",
                is_warnings=True,
                is_default_log=False,
                is_error=False,
            )
    except FileNotFoundError:
        logn.log_routine(
            f"Template file not found: {template_path}",
            is_warnings=False,
            is_default_log=False,
            is_error=True,
        )
        return

    # Extract metadata from the template content
    metadata = extract_metadata(template_content)
    logn.log_routine(
        f"Template: {page_name}, Page metadata: {metadata}",
        time_needed=True,
        is_default_log=False,
        is_warnings=False,
        is_error=False,
        show_default_label=False,
        is_success=True,
        custom_label=f"METADATA: ",
    )

    # Check if 'isAvailableForNewContent' is true
    if metadata.get("isAvailableForNewContent", "false").lower() == "true":
        logn.log_routine(
            f"Rendering page: {page_name} with URL: {url}",
            time_needed=True,
            is_default_log=False,
            is_warnings=True,
            custom_label=f"RENDERING: ",
        )

        if "case-studies" in page_name and case_study_header:
            # Handle case studies specifically
            site.render_template(case_study_header, context=context)
        else:
            # General page rendering
            context["current_page_name"] = page_name
            context["current_page_url"] = url
            context["raw_url"] = raw_url
            template = site.get_template(page_name)
            site.render_template(template=template, context=context)
    else:
        logn.log_routine(
            f"Skipping page: {page_name} because 'isAvailableForNewContent' is false",
            is_warnings=True,
            is_default_log=False,
        )


def garbage_collector(paths):
    """Delete dev directories and files."""
    for path in paths:
        logn.log_routine(
            f"Deleting {path}",
            time_needed=True,
            is_default_log=False,
            is_error=True,
            show_default_label=False,
            custom_label=f"GARBAGE COLLECTOR: ",
        )
        if os.path.isfile(path):
            if not os.path.exists(path):
                logn.log_routine(
                    f"File {path} doesn't exist!",
                    is_error=True,
                    is_default_log=False,
                    show_default_label=False,
                    custom_label=f"GARBAGE COLLECTOR: ",
                )
                continue
            else:
                os.remove(path)
        else:
            if not os.path.exists(path):
                logn.log_routine(
                    f"Directory {path} doesn't exist!",
                    is_error=True,
                    is_default_log=False,
                    show_default_label=False,
                    custom_label=f"GARBAGE COLLECTOR: ",
                )
                continue
            else:
                shutil.rmtree(path)


def generate_sitemap(remove_html_extension=True):
    """Generate sitemap.xml file based on the pages built in the output path."""
    logn.log_routine(
        "Generating sitemap.xml...",
        time_needed=True,
        is_default_log=False,
        is_warnings=True,
        custom_label=f"SITEMAP GENERATOR: ",
    )

    output_dir = "../"

    with open("../sitemap.xml", "w") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write(
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n'
        )

        for root, dirs, files in os.walk(output_dir):
            dirs[:] = [d for d in dirs if not d.startswith(("_", ".")) and d != "@src"]

            for file in files:
                if file.endswith(".html"):
                    page_url = os.path.join(root, file).replace(output_dir, "")
                    if remove_html_extension:
                        page_url = page_url[:-5]
                    f.write("<url>\n")
                    f.write(f"<loc>{BASE_URL}{page_url}</loc>\n")
                    f.write("<changefreq>weekly</changefreq>\n")
                    f.write("<priority>0.8</priority>\n")
                    f.write("</url>\n")

        f.write("</urlset>\n")


def extract_css_from_style_tags(soup):
    """Get CSS from all style tags in the soup."""
    css_str = ""
    for style_tag in soup.find_all("style"):
        css_str += style_tag.string or ""
    return css_str


def inline_critical_css(output_dir):
    """Inline critical-path CSS for the pages in the output path."""
    css_parser = cssutils.CSSParser()

    for root, dirs, files in os.walk(output_dir):
        dirs[:] = [d for d in dirs if not d.startswith((".", "_", "@"))]

        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(root, file)
                with open(file_path, "r") as f:
                    html_content = f.read()

                soup = BeautifulSoup(html_content, "html.parser")

                css_str = ""
                for link_tag in soup.find_all("link", {"rel": "stylesheet"}):
                    css_file_path = os.path.join(root, link_tag["href"])
                    if os.path.exists(css_file_path):
                        with open(css_file_path, "r") as css_file:
                            css_str += css_file.read()
                        link_tag.extract()

                css_str += extract_css_from_style_tags(soup)

                head_tag = soup.head
                if head_tag is None:
                    head_tag = soup.new_tag("head")
                    soup.html.insert(0, head_tag)

                style_tag = soup.new_tag("style")
                style_tag.string = css_str
                head_tag.append(style_tag)

                with open(file_path, "w") as f:
                    f.write(str(soup))


def load_hubdb(file_path):
    """Function to load projects from the CSV file with dynamic column name handling."""
    projects = []
    with open(file_path, mode="r", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Dynamically create a dictionary for each row
            project = {key: value for key, value in row.items()}
            projects.append(project)
    return projects


def templateEngineCreation(extraOption: int = 1):
    receivedOption = extraOption

    if receivedOption == 1:
        userInputPreview = input("Do you want to preview the site first? (Y/n): ")
        if userInputPreview.lower() in ["y", "yes", ""]:
            logn.log_routine(
                "Previewing the site first...", time_needed=True, is_warnings=True
            )
            OUTPUT_DIR = "../static/@preview"
            preview_mode = True

            MINIFY_FILES = False

            if not os.path.exists("../@preview"):
                os.mkdir("../@preview")

            site = Site.make_site(
                searchpath="./", outpath="../@preview", staticpaths=["static"], rules=[]
            )
            site.pages = []
        else:
            preview_mode = False

            MINIFY_FILES = True

            OUTPUT_DIR = "../"
            site = Site.make_site(
                searchpath="./", outpath="../", staticpaths=["static"], rules=[]
            )
            site.pages = []
    elif receivedOption == 2:
        preview_mode = False

        MINIFY_FILES = True

        OUTPUT_DIR = "../"
        site = Site.make_site(
            searchpath="./", outpath="../", staticpaths=["static"], rules=[]
        )
        site.pages = []
    elif receivedOption == 3:
        logn.log_routine(
            "Previewing the site first...", time_needed=True, is_warnings=True
        )
        OUTPUT_DIR = "../static/@preview"
        preview_mode = True

        MINIFY_FILES = False

        if not os.path.exists("../@preview"):
            os.mkdir("../@preview")

        site = Site.make_site(
            searchpath="./", outpath="../@preview", staticpaths=["static"], rules=[]
        )
        site.pages = []
    elif receivedOption == 4:
        logn.log_routine("CLEANNING PROJECT", time_needed=True, is_warnings=True)
        garbage_paths = [
            "../_partials",
            "../_modules",
            "../@cms",
            "../_layouts",
            "../_layouts/base.html",
            "../Resources",
            "../SNL.py",
            "../requirements.txt",
            "../static",
            "../case-studies",
            "../system",
            "../blog",
            "../test.html",
            "../index.html",
            "../resources.html",
            "../privacy-policy.html",
            "../editor.html",
            "../blog.html",
            "../aboutme.html",
            "../404.html",
        ]
        garbage_collector(garbage_paths)
        return

    # Define a helper function to check metadata
    def should_render_template(template_name):
        """Check if the template should be rendered based on its metadata."""
        template_path = os.path.join("./", template_name)
        try:
            with open(template_path, "r", encoding="utf-8") as file:
                template_content = file.read()
                metadata = extract_metadata(template_content)
                return (
                    metadata.get("isAvailableForNewContent", "false").lower() == "true"
                )
        except FileNotFoundError:
            logn.log_routine(
                f"Template file not found: {template_path}",
                is_warnings=False,
                is_default_log=False,
                is_error=True,
            )
            return False

    global_template = site.get_template("_partials/global.html")
    base_template = site.get_template("_layouts/base.html")
    index_template = site.get_template("index.html")
    about_template = site.get_template("aboutme.html")

    password_template = site.get_template("system/password.html")
    error_template = site.get_template("404.html")

    portfolioLanguage = "en"
    projects = []

    if portfolioLanguage == "en":
        # Load projects from the CSV
        projects = load_hubdb(hubdb_projects)

    case_study_projects = [
        project
        for project in projects
        if project.get("is_case_study", "").lower() == "true"
    ]

    logn.log_routine(
        f"Here is the case study projects: {case_study_projects}",
        time_needed=True,
        is_default_log=False,
        is_warnings=True,
        custom_label=f"CASE STUDY PROJECTS: ",
    )

    pagesLanguage = portfolioLanguage

    global_context = {
        "portfolioLanguage": portfolioLanguage,
        "pageMainURL": f"{BASE_URL}",
    }

    base_context = {
        "pagesLanguage": pagesLanguage,
        "pageMainURL": f"{BASE_URL}",
        "year": f"{datetime.datetime.now().year}",
    }

    index_context = {"projects": projects}
    about_context = {"title": "About me", "greeting": "Learn more about me."}
    password_template = {"title": "Password"}
    error_template = {"title": "404"}

    template = index_template
    global_render_template = global_template
    base_render_template = base_template

    site.render()

    render_page_with_url_info(
        site,
        page_name="_layouts/base.html",
        url=f"{BASE_URL}_layouts/base.html",
        context={"description": "This is the base engine."},
    )
    render_page_with_url_info(
        site,
        page_name="_partials/header.html",
        url=f"{BASE_URL}_partials/header.html",
        context={"description": "This is the header."},
    )
    render_page_with_url_info(
        site,
        page_name="index.html",
        url=f"{BASE_URL}index.html",
        context={"description": "This is the home page."},
    )

    site.render_template(global_render_template, context=global_context)
    site.render_template(base_render_template, context=base_context)
    if should_render_template(f"index.html"):
        site.render_template(template, context=index_context)

    if MINIFY_FILES:
        logn.log_routine("Optimizing files...", True)
        logn.log_routine(f"Current working directory is {os.getcwd()}", True)
        directories_to_minify = [
            "../static/styles/02_base",
            "../static/styles/00_settings",
            "../static/styles/04_trumps",
            "../static/styles/01_generic",
            "../static/styles/03_components",
            "../static/engine",
            "../",
            "../system",
            "../case-studies",
            "../blog",
        ]
        minify_files(directories_to_minify, True)

    garbage_paths = [
        "../_partials",
        "../_modules",
        "../@cms",
        "../_layouts",
        "../_layouts/base.html",
        "../Resources",
        "../SNL.py",
        "../requirements.txt",
        "../static/styles/00_settings",
        "../static/styles/02_base",
        "../static/styles/03_components/_default-modules.scss",
        "../static/styles/04_trumps",
        "../static/styles/compiled",
        "../styles-engine.css",
        "../static/styles/fallback.css",
        "../static/styles/master.scss",
        "../static/styles/fallback.scss",
        "../editor.html",
    ]
    garbage_collector(garbage_paths)

    if preview_mode:
        logn.log_routine(
            "Preview mode enabled, skipping...",
            time_needed=True,
            is_default_log=False,
            is_warnings=True,
        )
    else:
        generate_sitemap()

    if preview_mode:
        logn.log_routine("Previewing site...", True)
        logn.log_routine(
            "In preview mode, garbage directories and files are not deleted!",
            is_default_log=False,
            is_warnings=True,
        )
    else:
        garbage_collector(["../@preview"])

    logn.log_routine("Building process completed!", time_needed=True, is_success=True)


if __name__ == "__main__":
    compile_scss("./static/styles", "./static/styles/compiled")

    logn.log_routine(
        "\n\n0 -> Quit\n1 -> Start Building\n2 -> Quick Build (Prod)\n3 -> Quick Build (Preview)\n4 -> Clear Project\n",
        time_needed=True,
        show_default_label=False,
        custom_label="Welcome to Static Portfolio Nick Framework",
    )
    projectEditorMode = input("Select an option (2): ")
    if projectEditorMode.lower() in ["y", "2", ""]:
        templateEngineCreation(2)
        logn.log_routine(
            f"Option Selected: {projectEditorMode} (if none, probably 2)",
            is_default_log=True,
            is_warnings=True,
            time_needed=True,
        )
    elif projectEditorMode.lower() in ["1"]:
        templateEngineCreation()
        logn.log_routine(
            f"Option Selected: {projectEditorMode}",
            is_default_log=True,
            is_warnings=True,
            time_needed=True,
        )
    elif projectEditorMode.lower() in ["3"]:
        templateEngineCreation(3)
        logn.log_routine(
            f"Option Selected: {projectEditorMode}",
            is_default_log=True,
            is_warnings=True,
            time_needed=True,
        )
    elif projectEditorMode.lower() in ["4"]:
        templateEngineCreation(4)
        logn.log_routine(
            f"Option Selected: {projectEditorMode}",
            is_default_log=True,
            is_warnings=True,
            time_needed=True,
        )
    else:
        logn.log_routine(
            "Exiting!", is_default_log=False, is_warnings=True, time_needed=True
        )
        exit(0)
