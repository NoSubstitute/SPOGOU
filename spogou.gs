/**
 * Triggered when the add-on is installed.
 * Calls onOpen to initialize the menu.
 * 
 * @param {Object} e - The event object.
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Triggered when the spreadsheet is opened.
 * Creates the add-on menu.
 * 
 * @param {Object} e - The event object.
 */
function onOpen(e) {
  SpreadsheetApp.getUi().createAddonMenu()
    .addItem('Start', 'startPreparing')
    .addToUi()
}

/**
 * Wrapper function to start the preparation process.
 * Initializes the sheets and opens the first sidebar.
 */
function startPreparing() {
  prepareSheets();
  openSidebarPrepSheets();
}

/**
 * Opens the sidebar for preparing sheets.
 * Passes the user's domain to the client-side logic (unused in template but stored in properties).
 */
function openSidebarPrepSheets() {
  var html = HtmlService.createHtmlOutputFromFile('SidebarPrepSheets').setTitle('SPOGOU preparing sheets').setWidth(370);
  var userProperties = PropertiesService.getUserProperties();
  //  Logger.log(userProperties);
  var userEmail = Session.getActiveUser().getEmail()
  var domain = userEmail.split('@').pop();
  PropertiesService.getUserProperties().setProperty("userDomainProp", domain);
  //  Logger.log(domain);
  html.domain = domain;
  //  Logger.log(html.domain);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Opens the sidebar for preparing passwords.
 * Also triggers the list and format process in the background.
 */
function openSidebarPrepPasswords() {
  var html = HtmlService.createHtmlOutputFromFile('SidebarPrepPasswords').setTitle('SPOGOU preparing passwords').setWidth(370);
  SpreadsheetApp.getUi().showSidebar(html);
  listUsersFormatPassword();
  SpreadsheetApp.flush();
}

/**
 * Opens the sidebar indicating passwords have been prepared.
 */
function openSidebarPasswordsPreped() {
  var html = HtmlService.createHtmlOutputFromFile('SidebarPasswordsPreped').setTitle('SPOGOU finished preparing passwords').setWidth(370);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Opens the sidebar for setting passwords.
 * Triggers the password setting and sharing process.
 */
function openSidebarSetPasswords() {
  var html = HtmlService.createHtmlOutputFromFile('SidebarSetPasswords').setTitle('SPOGOU setting passwords').setWidth(370);
  SpreadsheetApp.getUi().showSidebar(html);
  setPassShare();
}

/**
 * Opens the final sidebar indicating the process is finished.
 */
function openSidebarFinished() {
  var p = PropertiesService.getScriptProperties();
  p.setProperty("sidebarFinishedProp", "open");
  var html = HtmlService.createHtmlOutputFromFile('SidebarFinished').setTitle('SPOGOU is finished!').setWidth(370);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Closes the finished sidebar and triggers final cleanup.
 */
function closeSidebarFinished() {
  var p = PropertiesService.getScriptProperties();
  if (p.getProperty("sidebarFinishedProp") == "open") {
    cleanUp();
    SpreadsheetApp.flush();
    var html = HtmlService.createHtmlOutput("<script>google.script.host.close();</script>");
    SpreadsheetApp.getUi().showSidebar(html);
    p.setProperty("sidebarFinishedProp", "close");
  }
}

/**
 * Prepares the spreadsheet by creating 'Log', 'Group', and 'Users' sheets.
 * Removes existing 'Group' and 'Users' sheets to prevent conflicts.
 * Moves sheets to the beginning of the spreadsheet.
 */
function prepareSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetsToDelete = ['Group', 'Users'];
  sheetsToDelete.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (sheet) {
      ss.deleteSheet(sheet);
    }
  });
  SpreadsheetApp.flush();

  var domain = PropertiesService.getUserProperties().getProperty("userDomainProp");
  //  Logger.log(domain);
  // Naming the spreadsheet
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var spreadsheet = activeSpreadsheet.setName("DEV - SPOGOU - DEV");
  
  // Get the Log sheet (guaranteed by cleanUpDEV)
  var sheet = activeSpreadsheet.getSheetByName("Log");
  if (!sheet) {
    // Fallback if cleanUpDEV didn't create it for some reason
    sheet = activeSpreadsheet.insertSheet("Log");
  } else {
    activeSpreadsheet.setActiveSheet(sheet);
  }
  activeSpreadsheet.moveActiveSheet(1);
  
  // Clearing and naming the first sheet, so we can return to it later
  sheet.clear();
  sheet.clearConditionalFormatRules();
  sheet.clearNotes();
  sheet.setFrozenColumns(0);
  sheet.setFrozenRows(0);
  //  sheet.getFilter().remove();
  // sheet.setName("Log"); // Removed redundant setName
  SpreadsheetApp.flush();
  // Creating the other sheets and naming them  
  var activeSpreadsheet1 = SpreadsheetApp.getActiveSpreadsheet();
  var newSheet1 = activeSpreadsheet1.insertSheet();
  newSheet1.setName("Group");
  activeSpreadsheet1.moveActiveSheet(2);
  var header1 = ['Group Name', 'User Id', 'User role', 'User Status'];
  newSheet1.appendRow(header1).setFrozenRows(1);
  SpreadsheetApp.flush();

  var activeSpreadsheet2 = SpreadsheetApp.getActiveSpreadsheet();
  var newSheet2 = activeSpreadsheet2.insertSheet();
  newSheet2.setName("Users");
  activeSpreadsheet2.moveActiveSheet(3);
  var header2 = ['primaryEmail', 'FirstName', 'LastName'];
  newSheet2.appendRow(header2).setFrozenRows(1);
  SpreadsheetApp.flush();

  // Send me back to first sheet, ready to receive user input
  var spreadsheet = SpreadsheetApp.getActive();
  SpreadsheetApp.setActiveSheet(spreadsheet.getSheetByName("Log"));
}

/**
 * Saves user input data (group email, teacher email, change password setting) to UserProperties.
 * 
 * @param {string} groupemail1 - The group email address.
 * @param {string} teacheremail1 - The teacher's email address.
 * @param {string} changePass1 - Whether to force password change on next login.
 * @returns {Array} An array containing the input data and domain.
 */
function saveData(groupemail1, teacheremail1, changePass1) {
  var domain = PropertiesService.getUserProperties().getProperty("userDomainProp");
  PropertiesService.getUserProperties().setProperty("groupEmailProp", groupemail1);
  PropertiesService.getUserProperties().setProperty("teacherEmailProp", teacheremail1);
  PropertiesService.getUserProperties().setProperty("changePassProp", changePass1);
  var result = [groupemail1, teacheremail1, changePass1, domain]
  //  Logger.log([result]);
  return [result];
}

/**
 * Fetches users from the specified Google Workspace group and writes them to the 'Group' sheet.
 * Handles pagination for large groups.
 * Logs errors if the group is not found.
 */
function printUsersFromGroup() {
  var domain = PropertiesService.getUserProperties().getProperty("userDomainProp");
  //  Logger.log(domain);

  var groupKey = PropertiesService.getUserProperties().getProperty("groupEmailProp");
  //  Logger.log(groupKey);

  // Get the current spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  SpreadsheetApp.setActiveSheet(ss.getSheetByName("Group"));// Switch view to the Group sheet
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.getRange('A2').activate();

  // Grab group members and create the array
  var onSheet = SpreadsheetApp.getActiveSpreadsheet();
  var rows = [];
  var pageToken, page;
  try {
    do {
      page = AdminDirectory.Members.list(groupKey,
        {
          domainName: domain,
          maxResults: 500,
          pageToken: pageToken,
        });
      var members = page.members
      if (members) {
        for (var i = 0; i < members.length; i++) {
          var member = members[i];
          var row = [groupKey, member.email, member.role, member.status];
          rows.push(row);
        }
      }
      pageToken = page.nextPageToken;
    } while (pageToken);
  } catch (err) {
    var logsheet = onSheet.getSheetByName("Log");
    if (logsheet) {
      logsheet.appendRow([new Date(), "System", "Error fetching group members: " + err.message]);
    }
    SpreadsheetApp.getUi().alert("Error: Could not find group '" + groupKey + "'.\nDetails: " + err.message);
    return;
  }
  if (rows.length > 1) {
    // Print group members on second sheet called Group
    var sheetData = onSheet.getSheetByName("Group")
    var header = ['Group Name', 'User Id', 'User role', 'User Status'];
    sheetData.getRange(2, 1, rows.length, header.length).setValues(rows);
  }
  SpreadsheetApp.flush();
  SpreadsheetApp.setActiveSheet(ss.getSheetByName('Group'));// Switch view to the Group sheet
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.getRange('A2').activate();
}

/**
 * Retrieves detailed user information (names) for the group members and writes to 'Users' sheet.
 */
function getUserNames() {
  // Get the current spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  SpreadsheetApp.setActiveSheet(ss.getSheetByName("Users"));// send me to the Users sheet
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.getRange('A2').activate();
  // Set the active sheet be the one called Groups
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Group');
  // Log actions to the sheet called Users
  var logsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
  // Get all data from the second row to the last row with data, and the last column with data
  var lastrow = sheet.getLastRow();
  var lastcolumn = sheet.getLastColumn();
  var range = sheet.getRange(2, 1, lastrow - 1, lastcolumn);
  var list = range.getValues();
  for (var i = 0; i < list.length; i++) {
    // Grab usernames from the second column (1) (first column is 0), then the rest from adjoining columns and set necessary variables
    var userinfo = list[i][1];
    // For each line, try to get the user with given data, and log the result
    try {
      var userdata = AdminDirectory.Users.get(userinfo);
      var fname = userdata.name.givenName;
      var lname = userdata.name.familyName;
      // Print the gathered info to the logsheet
      logsheet.appendRow([userinfo, fname, lname]);
      // If the update fails for some reason, log the error
    } catch (err) {
      logsheet.appendRow([userinfo, err.message]);
    }
  }
  SpreadsheetApp.flush();
  SpreadsheetApp.setActiveSheet(ss.getSheetByName("Users"));// send me to the Users sheet
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.getRange('A2').activate();
}

/**
 * Formats the 'Users' sheet and generates temporary passwords for students.
 * Performs clean up of password characters and columns.
 */
function FormatAndCreateListOfStudentPasswords() {
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Users'), true);
  var sheet = spreadsheet.getActiveSheet();

  // Adding an extra column here where passwords will end up
  sheet.getRange('A:A').activate();
  sheet.insertColumnsAfter(sheet.getActiveRange().getLastColumn(), 1);
  sheet.getActiveRange().offset(0, sheet.getActiveRange().getNumColumns(), sheet.getActiveRange().getNumRows(), 1).activate();
  sheet.getRange('B1').activate();
  sheet.getCurrentCell().setValue('PasswordTemp');

  // Removing the Class splitter, as other organisations may not have this, and I should make this work for others first, and only after make a special version for myself.
  // Splitting my familyName column I get Class as a separate column
  // sheet.getRange('D1').activate();
  // sheet.getCurrentCell().setValue('LastName');
  // sheet.getRange('D:D').activate();
  // sheet.getRange('D:D').splitTextToColumns(' - ');
  // sheet.getRange('E1').activate();
  // sheet.getCurrentCell().setValue('Class');
  sheet.getRange('E1').activate();
  sheet.getCurrentCell().setValue('PreparePass');

  // Now it's time to create the simple passwords Based off firstNames in C and four random numbers
  // Included a length check of names in C; if too short (passwords must be 8+ characters) repeat firstName
  // Put the temp passwords in column E
  sheet.getRange('E2').activate();
  sheet.getCurrentCell().setFormula('=IFS(LEN(C2) > 3;C2 & RANDBETWEEN(1111;9999);LEN(C2) > 2;C2 & RANDBETWEEN(11111;99999);LEN(C2) > 1;C2 & C2 & RANDBETWEEN(1111;9999))');
  sheet.getActiveRange().autoFillToNeighbor(SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);

  // ADDING A DELAY HERE! The previous auto-fill command is slow
  // A flush makes sure previous code is done. https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app#flush
  SpreadsheetApp.flush();

  // Copying those temp passwords from E to E, but only values, and not formulas
  sheet.getRange('E1').activate();
  sheet.getRange('E:E').copyTo(sheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);

  // Another delay needed here
  SpreadsheetApp.flush();

  // Removing characters that can't be used in passwords
  // Grab data from column E and put in column B
  sheet.getRange('B2').activate();
  sheet.getCurrentCell().setFormula('=SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(E2;"å";"a");"ä";"a");"ö";"o");"Å";"A");"Ä";"A");"Ö";"O");"é";"e");"Ü";"u");"ü";"u");"-";"-");"ë";"e");"è";"e");"Ø";"O");"ø";"o");"õ";"o");"ó";"o");"€";"€");"€";"€")');
  sheet.getActiveRange().autoFillToNeighbor(SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES);

  // Another delay needed here
  SpreadsheetApp.flush();

  // Copying those clean passwords from B to B, but only values, and not formulas
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Users'), true);
  var sheet = spreadsheet.getActiveSheet();
  sheet.getRange('B1').activate();
  sheet.getRange('B:B').copyTo(sheet.getActiveRange(), SpreadsheetApp.CopyPasteType.PASTE_VALUES, false);

  // Deleting the PreparePass column E
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Users'), true);
  var sheet = spreadsheet.getActiveSheet();
  sheet.getRange('E:E').activate();
  sheet.deleteColumns(sheet.getActiveRange().getColumn(), sheet.getActiveRange().getNumColumns());

  // Naming the B column to Password, as that's what it needs to be when I'm finished
  sheet.getRange('B1').activate();
  sheet.getCurrentCell().setValue('Password');

  // Deleting empty columns
  var spreadsheet = SpreadsheetApp.getActive();
  var maxColumns = spreadsheet.getActiveSheet().getMaxColumns();
  var lastColumn = spreadsheet.getActiveSheet().getLastColumn();
  spreadsheet.getActiveSheet().deleteColumns(lastColumn + 1, maxColumns - lastColumn);

  // Remove empty rows
  var spreadsheet = SpreadsheetApp.getActive();
  var maxRows = spreadsheet.getActiveSheet().getMaxRows();
  var lastRow = spreadsheet.getActiveSheet().getLastRow();
  spreadsheet.getActiveSheet().deleteRows(lastRow + 1, maxRows - lastRow);

  // Tidying up

  // Adding filters
  var spreadsheet = SpreadsheetApp.getActive();
  var sheet = spreadsheet.getActiveSheet();
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).activate();
  sheet = spreadsheet.getActiveSheet();
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).createFilter();
  sheet.getRange('A1').activate();

  // Resizing columns
  var spreadsheet = SpreadsheetApp.getActive();
  sheet = spreadsheet.getActiveSheet();
  spreadsheet.getActiveSheet().autoResizeColumns(1, 4);
  for (var i = 1; i < spreadsheet.getActiveSheet().getMaxColumns() + 1; i++) {
    var currentwidth = spreadsheet.getActiveSheet().getColumnWidth(i)
    spreadsheet.getActiveSheet().setColumnWidth(i, currentwidth + 25)
  };
  SpreadsheetApp.flush();
  // Move sheet Users to be the first sheet, to prepare for cleanup
  SpreadsheetApp.getActiveSpreadsheet().moveActiveSheet(1);
  SpreadsheetApp.flush();
}

/**
 * Sets the new passwords for the users in the 'Users' sheet using the Admin SDK.
 * Logs success or failure to the 'Log' sheet.
 */
function setPasswords() {
  // Get User/Operator Info
  var userEmail = Session.getActiveUser().getEmail()
  // Get the current spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // Set the Users sheet as the sheet we're working in
  var sheet = ss.getSheetByName("Users");
  // Log actions to the Log sheet
  var logsheet = ss.getSheetByName('Log')
  // Grab true/false for chpass from properties
  var getchangePassProp = PropertiesService.getUserProperties().getProperty("changePassProp");
  //  Logger.log(getchangePassProp);
  var chpass = getchangePassProp
  //  Logger.log(chpass);
  // Get all data from the second row to the last row with data, and the last column with data
  var lastrow = sheet.getLastRow();
  var lastcolumn = sheet.getLastColumn();
  var range = sheet.getRange(2, 1, lastrow - 1, lastcolumn);
  var list = range.getValues();
  for (var i = 0; i < list.length; i++) {
    // Grab username from the first column (0), then the rest from adjoing columns and set necessary variables
    var email = list[i][0].toString();
    var pass = list[i][1].toString();
    // For each line, try to update the user with given data, and log the result.
    try {
      var updateuser = AdminDirectory.Users.update({ password: pass, changePasswordAtNextLogin: chpass }, email);
      logsheet.appendRow([new Date(), userEmail, "Password changed" + " User: " + email]);

      // If the update fails for some reason, log the error
    } catch (err) {
      logsheet.appendRow([email, err.message]);
    }
  }
  SpreadsheetApp.flush();
}

/**
 * Shares the spreadsheet with the specified teacher (requester).
 * Logs success or failure to the 'Log' sheet.
 */
function shareSheet() {
  // Get User/Operator Info
  var userEmail = Session.getActiveUser().getEmail()
  var spreadsheet = SpreadsheetApp.getActive();
  // Get the teacher's email from properties, share sheet with user
  var getteacherEmailProp = PropertiesService.getUserProperties().getProperty("teacherEmailProp");
  var teacher = getteacherEmailProp

  // Log actions to the Log sheet
  var logsheet = spreadsheet.getSheetByName('Log')
  try {
    spreadsheet.addEditor(teacher);
    logsheet.appendRow([new Date(), userEmail, "Sheet shared with:" + teacher]);
    // If the share fails for some reason, log the error
  } catch (err) {
    logsheet.appendRow([teacher, err.message]);
  }
}

/**
 * Performs final cleanup after the process is finished.
 * Deletes 'Group', 'Log', and 'Instructions' sheets.
 * Keeps 'Users' sheet.
 * Closes sidebars.
 */
function cleanUp() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetsToDelete = ['Group', 'Log', 'Instructions'];
  
  // Delete the specific sheets if they exist
  sheetsToDelete.forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (sheet) {
      ss.deleteSheet(sheet);
    }
  });
  
  // Ensure we end up on the Users sheet if it exists
  var usersSheet = ss.getSheetByName('Users');
  if (usersSheet) {
    ss.setActiveSheet(usersSheet);
  }

  // Close any open sidebars
  var html = HtmlService.createHtmlOutput("<script>google.script.host.close();</script>");
  SpreadsheetApp.getUi().showSidebar(html);
}

// Helper functions combined...
/**
 * Wrapper to list users, get names, create passwords, and open next sidebar.
 */
function listUsersFormatPassword() {
  printUsersFromGroup();
  SpreadsheetApp.flush();
  getUserNames();
  SpreadsheetApp.flush();
  FormatAndCreateListOfStudentPasswords();
  SpreadsheetApp.flush();
  openSidebarPasswordsPreped();
}

/**
 * Wrapper to set passwords, share sheet, and finish.
 */
function setPassShare() {
  setPasswords();
  SpreadsheetApp.flush();
  shareSheet();
  SpreadsheetApp.flush();
  openSidebarFinished();
}

/**
 * Developer tool to completely reset the spreadsheet for testing.
 * Deletes all sheets and creates a blank 'Sheet1'.
 * Closes sidebars.
 */
function cleanUpDEV() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  
  // Ensure there is at least one sheet to keep (create a temp one if needed)
  if (sheets.length === 1 && (sheets[0].getName() === 'Sheet1')) {
    // Already clean
    sheets[0].clear();
  } else {
    var blankSheet = ss.getSheetByName('Sheet1') || ss.insertSheet('Sheet1');
    ss.setActiveSheet(blankSheet);
    blankSheet.clear();
    
    // Delete all other sheets
    var allSheets = ss.getSheets();
    for (var i = 0; i < allSheets.length; i++) {
      if (allSheets[i].getName() !== 'Sheet1') {
        ss.deleteSheet(allSheets[i]);
      }
    }
  }
  
  // Close sidebars
  var html = HtmlService.createHtmlOutput("<script>google.script.host.close();</script>");
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
Last edit: 20210706-1940
*/

/**
 * Searches for groups matching the query using the Admin Directory API.
 * 
 * @param {string} query - The search query (part of the group email).
 * @returns {Array} An array of group objects {email, name}.
 */
function searchGroups(query) {
  if (!query || query.length < 3) {
    return [];
  }
  
  try {
    var userEmail = Session.getActiveUser().getEmail();
    var domain = userEmail.split('@').pop();
    
    var args = {
      domain: domain,
      query: "email:" + query + "*",
      maxResults: 10
    };
    
    var page = AdminDirectory.Groups.list(args);
    var groups = page.groups;
    
    if (groups) {
      return groups.map(function(group) {
        return {
          email: group.email,
          name: group.name
        };
      });
    } else {
      return [];
    }
  } catch (err) {
        console.error('Error searching groups: ' + err.message);
        return [];
      }
    }
    
    /**
     * Searches for users matching the query using the Admin Directory API.
     * 
     * @param {string} query - The search query (part of the user email).
     * @returns {Array} An array of user objects {email, name}.
     */
    function searchUsers(query) {
      if (!query || query.length < 3) {
        return [];
      }
      
      try {
        var userEmail = Session.getActiveUser().getEmail();
        var domain = userEmail.split('@').pop();
        
        var args = {
          domain: domain,
          query: "email:" + query + "*",
          maxResults: 10
        };
        
        var page = AdminDirectory.Users.list(args);
        var users = page.users;
        
        if (users) {
          return users.map(function(user) {
            return {
              email: user.primaryEmail,
              name: user.name.fullName
            };
          });
        } else {
          return [];
        }
      } catch (err) {
            console.error('Error searching users: ' + err.message);
            return [];
          }
        }
        
        /**
         * Fetches active classrooms for a specific teacher.
         * 
         * @param {string} teacherEmail - The email of the teacher.
         * @returns {Array} An array of course objects {id, name}.
         */
        function getClassrooms(teacherEmail) {
          if (!teacherEmail) {
            return [];
          }
          
          try {
            var args = {
              teacherId: teacherEmail,
              courseStates: ['ACTIVE']
            };
            
            var response = Classroom.Courses.list(args);
            var courses = response.courses;
            
            if (courses) {
              return courses.map(function(course) {
                return {
                  id: course.id,
                  name: course.name
                };
              });
            } else {
              return [];
            }
          } catch (err) {
            console.error('Error fetching classrooms: ' + err.message);
            return [];
          }
        }
        