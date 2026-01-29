# Implementation Plan - Group Autocomplete

## Phase 1: Infrastructure & Backend
- [ ] Task: Update OAuth Scopes in `appsscript.json`.
    - [ ] Add `https://www.googleapis.com/auth/admin.directory.group.readonly`.
- [ ] Task: Implement `searchGroups(query)` in `spogou.gs`.
    - [ ] Write Tests: Create `test/search.test.js` to verify searching logic (mocked).
    - [ ] Implement Feature: Use `AdminDirectory.Groups.list` with a query filter.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Backend' (Protocol in workflow.md)

## Phase 2: Frontend Implementation
- [ ] Task: Update `SidebarPrepSheets.html` UI.
    - [ ] Add a `<datalist>` or result container for autocomplete.
    - [ ] Add a status indicator icon/element next to the input.
- [ ] Task: Implement client-side search logic.
    - [ ] Add debounce function.
    - [ ] Handle input events to call `google.script.run.searchGroups`.
    - [ ] Update UI with results and validation state.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend Implementation' (Protocol in workflow.md)
