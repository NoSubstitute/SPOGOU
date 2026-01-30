/**
 * SPOGOU - Set Passwords On a Group Of Users
 * 
 * An easy to use addon to set passwords on many users (a class or an entire school year) 
 * provided only an address to a Google Workspace group, and share the results back 
 * to the teacher who asked for it.
 * 
 * Marketplace: https://workspace.google.com/marketplace/app/spogou/195844102395
 * Privacy Policy: https://tools.no-substitute.com/pp
 */

/**
 * CHANGELOG
 * 
 * 2026-01-30:
 * - Feature: Added 'admin.directory.group.readonly' scope for group autocomplete.
 * - Feature: Implemented server-side group search function.
 * - Feature: Implemented server-side teacher search function.
 * - Feature: Added 'classroom.courses.readonly' and 'classroom.rosters.readonly' scopes.
 * - Feature: Implemented server-side getClassrooms function.
 * - UI: Added autocomplete datalist and validation icon to SidebarPrepSheets.html for both group and teacher emails.
 * - UI: Added 'Select Classroom' input field with datalist to SidebarPrepSheets.html.
 * - UI: Implemented client-side logic to fetch Classrooms when a valid teacher is selected.
 * - UI: Removed 'SAVE' button; 'NEXT' button now saves data and proceeds. Updated validation to require Teacher AND (Group OR Classroom).
 * - UI: Implemented client-side autocomplete logic with debouncing and validation status.
 * - UI: Optimized validation UI responsiveness by using local cache and adjusted icon positioning.
 * - UI: Swapped teacher and group email fields; updated button labels to 'SAVE' and 'NEXT'.
 * - UI: Optimized performance with client-side caching and reduced debounce to 300ms.
 * - Dev: Changed spreadsheet name to 'DEV - SPOGOU - DEV' for development identification.
 * 
 * 2026-01-29: 
 * - Refactored cleanUpDEV() for robustness.
 * - Integrated cleanUpDEV() into prepareSheets() to prevent sheet duplication errors.
 * - Security: Upgraded jQuery to 3.7.1 in all sidebars.
 * - Security: Removed unused 'userinfo.profile' scope.
 * - Security: Log err.message instead of full error object.
 * - Fix: Added error handling for invalid group emails in printUsersFromGroup.
 * 2026-01-16: Reverted 'openid' scope addition (determined unnecessary).
 */
