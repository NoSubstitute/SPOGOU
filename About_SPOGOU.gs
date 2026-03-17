/**
 * SPOGOU - Set Passwords On a Group Of Users
 * 
 * An easy to use addon to set passwords on many users (a class or an entire school year) 
 * provided only an address to a Google Workspace group, and share the results back 
 * to the teacher who asked for it.
 */

const APP_CONFIG = {
  VERSION: "1.3.0",
  MARKETPLACE_URL: "https://workspace.google.com/marketplace/app/spogou/195844102395",
  PRIVACY_POLICY_URL: "https://tools.no-substitute.com/pp",
  TERMS_OF_SERVICE_URL: "https://tools.no-substitute.com/tos",
  CHANGELOG: [
    {
      date: "2026-03-17",
      changes: [
        "Feature: Implemented alternative password generation options (Simple, Random, Word-based).",
        "Feature: Added word-based generator using a simple 200+ word list.",
        "UI: Updated setup sidebar with interactive password generation toggles and customizable length settings.",
        "Fix: Improved authorization resilience and added critical startup logging for troubleshooting.",
        "Internal: Refactored password logic into modular generators."
      ]
    },
    {
      date: "2026-02-13",
      changes: [
        "Feature: Implemented 'About' dialog as a single source of truth for legal and version info.",
        "UX: Major overhaul of all sidebars with improved wording, modern Materialize UI, and clear step-by-step guidance.",
        "UX: Added specific 'Classroom Visitor' guidance for delegated admins when classrooms are not found.",
        "Fix: Refactored autocomplete and field-enabling logic for better responsiveness and state persistence.",
        "Marketplace: Finalized OAuth justifications and testing instructions for submission."
      ]
    },
    {
      date: "2026-02-10",
      changes: [
        "Feature: Enhanced setPasswords with descriptive error handling. Added pre-checks for suspended users.",
        "Feature: Implemented printUsersFromClassroom to fetch students from Google Classroom.",
        "Feature: Added classroom.profile.emails scope.",
        "Security: Replaced all innerHTML usages with textContent to prevent potential XSS."
      ]
    },
    {
      date: "2026-01-30",
      changes: [
        "Feature: Implemented group and teacher email autocomplete with debouncing.",
        "Feature: Integrated Google Classroom as a student source.",
        "UI: Optimized performance with client-side caching and responsive validation icons."
      ]
    }
  ]
};

/**
 * Displays the About dialog with version info, legal links, and changelog.
 */
function showAbout() {
  const changelogHtml = APP_CONFIG.CHANGELOG.map(entry => `
    <div style="margin-bottom: 15px;">
      <strong>${entry.date}</strong>
      <ul style="margin-top: 5px; padding-left: 20px;">
        ${entry.changes.map(change => `<li>${change}</li>`).join('')}
      </ul>
    </div>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_top">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
      <style>
        body { padding: 20px; font-family: sans-serif; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee; text-align: center; font-size: 0.9rem; }
        h6 { font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 5px; }
      </style>
    </head>
    <body>
      <h5>SPOGOU v${APP_CONFIG.VERSION}</h5>
      <p>Set Passwords On a Group Of Users</p>
      
      <h6>Legal Information</h6>
      <p>
        <a href="${APP_CONFIG.PRIVACY_POLICY_URL}" target="_blank">Privacy Policy</a> | 
        <a href="${APP_CONFIG.TERMS_OF_SERVICE_URL}" target="_blank">Terms of Service</a>
      </p>
      <p>Marketplace: <a href="${APP_CONFIG.MARKETPLACE_URL}" target="_blank">View on Store</a></p>

      <h6>Changelog</h6>
      <div style="max-height: 250px; overflow-y: auto; padding-right: 10px;">
        ${changelogHtml}
      </div>

      <div class="footer">
        &copy; ${new Date().getFullYear()} No Substitute
      </div>
    </body>
    </html>
  `;

  const html = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(450)
    .setHeight(600)
    .setTitle('About SPOGOU');
  
  SpreadsheetApp.getUi().showModalDialog(html, 'About SPOGOU');
}
