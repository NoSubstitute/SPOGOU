# Specification: Group Autocomplete

## Overview
Add a live search/autocomplete feature to the group email input field in `SidebarPrepSheets.html`. This will help users find the correct Google Workspace group quickly and reduce entry errors.

## User Stories
- As a user, I want to see a list of suggested groups as I type, so I don't have to remember the exact email address.
- As a user, I want to know immediately if the group email I have entered or selected is valid.

## Functional Requirements
- **Server-Side Search:** A new GAS function `searchGroups(query)` that queries the Admin Directory API.
- **Client-Side Debouncing:** Delay search execution until the user has stopped typing for 500ms.
- **Minimum Query Length:** Only trigger search after 3+ characters.
- **Autocomplete UI:** Use an HTML5 `<datalist>` or custom dropdown for suggestions.
- **Validation UI:** Show a visual indicator (e.g., green check/red cross) based on group existence.

## Technical Requirements
- Update `appsscript.json` to include `https://www.googleapis.com/auth/admin.directory.group.readonly` scope.
