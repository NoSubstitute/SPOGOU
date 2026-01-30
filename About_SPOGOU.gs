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
