# Tech Stack - SPOGOU

## Core Platform & Runtime
- **Google Apps Script (V8 Runtime):** The primary development platform and execution environment for the add-on.
- **Google Workspace Add-on:** The distribution and integration framework for extending Google Sheets/Workspace.

## Languages & Syntax
- **JavaScript (ES6+):** Utilized via the Apps Script V8 engine, allowing for modern JavaScript features.
- **HTML/CSS:** Used for building the custom sidebar and dialog interfaces (e.g., `SidebarPrepSheets.html`).

## APIs & Services
- **Admin Directory API (Advanced Google Service):** Required for programmatic access to Google Workspace users and group memberships.
- **SpreadsheetApp (Google Sheets API):** Used for interacting with active spreadsheets to read user lists and write results.
- **GmailApp/MailApp:** (Likely used) for sharing results via email with the requester.

## Tooling & Workflow
- **clasp (Command Line Apps Script Projects):** Used for local development, version control (Git integration), and pushing code to the Apps Script environment.
- **Testing:** `mocha` and `chai` for local regression testing (manifest, security, logic).
