We need to change and update how things works inside my editor of my static portfolio website made with staticjinja, html, scss and javascript. The editor uses grapesjs and it is working well, but we need to improve the edition flow, I’m planning to make this a simple CMS.

This is the detailed explanation of the **CMS Editor** built using **Python (Flask/Staticjinja)** and **GrapesJS** for a WYSIWYG drag-and-drop editing experience. We already have GrapesJS working well, now we need to implement the new panel ".ed-panel-main.html".

---

## System Architecture

The CMS consists of multiple interconnected components:

1. **CMS Panel (.ed-panel-main.html)** - Main UI to manage pages.
2. **GrapesJS Editor (.editor.html)** - Drag-and-drop page builder.
3. **Python Backend (Flask/Staticjinja)** - Handles file operations, rendering, and data management.
4. **Project Data (each page will be saved with a name inside the storage folder)** - Stores metadata and content structure.
5. **Jinja Module Renderer** - Converts Jinja templates into static HTML adn saves under the pages folder.

---

## System Flow

### **1. CMS Panel (Entry Point)**

- The CMS panel allows users to **create, delete, and edit pages**.
- Hosted at:  
  **http://127.0.0.1:5000/**
- This panel acts as a gateway for managing static pages.

#### **Key Features:**

- List all existing pages in a table with select capability (the columns are "Page Name", "Internal File Name", "Created Date" and the "Actions" column where we will have an edit link).
- Allow users to create new pages.
- Enable page deletion.
- Provide an "Edit" option to open pages in GrapesJS.

---

### **2. Loading Page Content in GrapesJS**

- The user selects a page from the CMS Panel.
- The page loads by fetching **projectData** from the json file inside the storage folder, which contains the content structure.
- Modules are appended inside GrapesJS as draggable **blocks/components**.
- Hosted at:  
  **http://127.0.0.1:5000/edit/<page-name>** (which is basically the .editor.html loading a specific page projectData)

---

### **3. Editing and Saving a Page**

- Users modify content using the **GrapesJS** interface.
- When saving, two key files are created:
  1. **Final static HTML file:**
     - Stored in .editor/pages/<page-name>.html
  2. **Custom JSON file:**
     - Stores "var projectData = editor.getProjectData();" for the page inside .editor/storage/<page-name>.json.

#### **Saving Process:**

- .editor.html sends the modified data to the Python backend .editor.py.
- The backend updates page json inside the storage folder.

---

## **How .ed-panel-main.html UI will look like**

### **1. Sidebar Navigation (100vh) with black background and white text**

The links/menus are:

- **Content**: Manage pages and modules.
- **Library**: Stores reusable components.
- **Developer**: Likely for advanced settings or logs.

### **2. Main Page Management Panel**

**Table View** needs to contain a simple search with columns:

- **Page Name** → Readable name.
- **Internal Name** → Corresponding filename (e.g., page-name.html).
- **Created Date** → Timestamp of creation.
- **Action** → Edit button/link to open the page in GrapesJS (.editor.js opens the page under http://127.0.0.1:5000/edit/<page-name>).

### **3. Action Buttons**

- **Create Page** (Black Button with white text) → Adds a new page.
- **Delete Selected Pages** (Red Button with white text) → Allows bulk deletion.
- **Checkboxes** → Select multiple pages for actions (such as delete).
