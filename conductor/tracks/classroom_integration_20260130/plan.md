# Implementation Plan - Google Classroom Integration

## Phase 1: Infrastructure & Backend [checkpoint: dbe4d49]
- [x] Task: Update `appsscript.json` configuration. 9673344
    - [x] Enable `Classroom` advanced service.
    - [x] Add `https://www.googleapis.com/auth/classroom.courses.readonly`, `https://www.googleapis.com/auth/classroom.profile.emails`, and `https://www.googleapis.com/auth/classroom.rosters.readonly` scopes.
- [x] Task: Implement `getClassrooms(teacherEmail)` in `spogou.gs`. e070ef1
    - [x] Write Tests: Create `test/classroom.test.js` (mocked).
    - [x] Implement Feature: Use `Classroom.Courses.list({teacherId: ...})`.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Backend'

## Phase 2: Frontend Implementation [checkpoint: 5df2470]
- [x] Task: Update `SidebarPrepSheets.html` UI. c623a01
    - [x] Add "Select Classroom here" input field and datalist after the Group field.
    - [x] Add `id="classroom"` and `list="classroom-list"`.
- [x] Task: Implement client-side logic. 5458b6a
    - [x] Trigger `google.script.run.getClassrooms` when `teacheremail` validation succeeds (or on blur).
    - [x] Populate `classroom-list` with the results.
    - [x] Ensure typing filters the list (native datalist behavior).
- [x] Task: Improve UI/UX.
    - [x] Add "Clear" (X) buttons to all inputs.
    - [x] Implement auto-clear (exclusive selection) for Group/Classroom.
    - [x] Consolidate SAVE/NEXT buttons.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Frontend Implementation'

## Phase 3: Core Logic Integration [checkpoint: 83b19e1]
- [x] Task: Update `printUsersFromGroup` (or create `printUsersFromClassroom`).
    - [x] Handle the `classroomNameProp` property.
    - [x] If classroom is selected, fetch students using `Classroom.Courses.Students.list`.
    - [x] Map students to the spreadsheet format.
- [x] Task: Verify Sheet Preparation.
    - [x] Ensure the 'Group' sheet is populated correctly regardless of source.
    - [x] Ensure 'Log' sheet reflects the source type.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Core Logic Integration'

