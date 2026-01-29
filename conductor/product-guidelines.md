# Product Guidelines - SPOGOU

## Communication Style
- **Professional & Functional:** The language used in the add-on and documentation should be clear, concise, and focused on providing immediate utility to school staff and administrators.

## UI/UX Principles
- **Standard Google Workspace UI:** Adhere to Material Design principles and standard Apps Script UI patterns to ensure the add-on feels like a native part of the Google Workspace environment.
- **Minimalist Design:** Keep interfaces clean and uncluttered. Minimize inputs and buttons to reduce cognitive load and prevent user error.
- **Guided Workflow:** Implement a step-by-step "wizard" style approach (Prepare -> Set Passwords -> Finish) to guide users through the complex process of bulk password management.

## Security & Privacy
- **Data Minimization:** Strictly follow the principle of least privilege. Only request and access the specific user and group data required for the current operation.
- **Data Sovereignty:** Ensure that no user data is ever transmitted or stored outside of the user's Google Workspace environment.
- **Accountability:** Maintain a clear audit trail of actions through localized logging (e.g., in `About_SPOGOU.gs`) and detailed execution reports shared with the requester.
