# Implementation Plan - Group Autocomplete

## Phase 1: Infrastructure & Backend [checkpoint: fead14f]
- [x] Task: Update OAuth Scopes in `appsscript.json`. 816b183
    - [x] Add `https://www.googleapis.com/auth/admin.directory.group.readonly`.
- [x] Task: Implement `searchGroups(query)` in `spogou.gs`. 0ce75fb
    - [x] Write Tests: Create `test/search.test.js` to verify searching logic (mocked).
    - [x] Implement Feature: Use `AdminDirectory.Groups.list` with a query filter.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Backend' (Protocol in workflow.md)

## Phase 2: Frontend Implementation [checkpoint: 632f719]
- [x] Task: Update `SidebarPrepSheets.html` UI. 2ca58bd
    - [x] Add a `<datalist>` or result container for autocomplete.
    - [x] Add a status indicator icon/element next to the input.
- [x] Task: Implement client-side search logic. f769350
    - [x] Add debounce function.
    - [x] Handle input events to call `google.script.run.searchGroups`.
    - [x] Update UI with results and validation state.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend Implementation' (Protocol in workflow.md)
