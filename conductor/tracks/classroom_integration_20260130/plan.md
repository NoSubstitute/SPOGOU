# Implementation Plan - Google Classroom Integration

## Phase 1: Infrastructure & Backend [checkpoint: dbe4d49]
- [x] Task: Update `appsscript.json` configuration. 9673344
    - [x] Enable `Classroom` advanced service.
    - [x] Add `https://www.googleapis.com/auth/classroom.courses.readonly` and `https://www.googleapis.com/auth/classroom.rosters.readonly` scopes.
- [x] Task: Implement `getClassrooms(teacherEmail)` in `spogou.gs`. e070ef1
    - [x] Write Tests: Create `test/classroom.test.js` (mocked).
    - [x] Implement Feature: Use `Classroom.Courses.list({teacherId: ...})`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Backend'

## Phase 2: Frontend Implementation [checkpoint: pending]
- [x] Task: Update `SidebarPrepSheets.html` UI. c623a01
    - [x] Add "Select Classroom here" input field and datalist after the Group field.
    - [x] Add `id="classroom"` and `list="classroom-list"`.
- [x] Task: Implement client-side logic. 5458b6a
    - [x] Trigger `google.script.run.getClassrooms` when `teacheremail` validation succeeds (or on blur).
    - [x] Populate `classroom-list` with the results.
    - [x] Ensure typing filters the list (native datalist behavior).
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend Implementation'

## Phase 3: Core Logic Integration (TBD)
- [ ] Task: Update `saveData` and `printUsersFromGroup` to handle Classroom ID.
    - [ ] *Pending clarification on how this interacts with the Group field.*
