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
    .addItem('About', 'showAbout')
    .addToUi()
}

/**
 * Wrapper function to start the preparation process.
 * Initializes the sheets and opens the first sidebar.
 */
function startPreparing() {
  var userEmail = "";
  try {
    userEmail = Session.getActiveUser().getEmail();
  } catch (e) {
    userEmail = "Unknown (Auth pending)";
  }
  console.log("CRITICAL DEBUG: startPreparing called. User: " + userEmail);
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
 * Saves user input data (group email, teacher email, change password setting, classroom) to UserProperties.
 *
 * @param {string} groupemail1 - The group email address.
 * @param {string} teacheremail1 - The teacher's email address.
 * @param {string} changePass1 - Whether to force password change on next login.
 * @param {string} classroomName - The name of the selected classroom (optional).
 * @param {string} altPass1 - Whether to use alternative password generation (TRUE/FALSE).
 * @param {string} passType1 - The type of password to generate (simple, random, word).
 * @param {string} passLength1 - The length for random passwords.
 * @returns {Array} An array containing the input data and domain.
 */
function saveData(groupemail1, teacheremail1, changePass1, classroomName, altPass1, passType1, passLength1) {
  console.log("CRITICAL DEBUG: saveData called from Sidebar");
  console.log("CRITICAL DEBUG: classroomName passed: '" + classroomName + "'");
  console.log("CRITICAL DEBUG: groupemail1 passed: '" + groupemail1 + "'");

  var domain = PropertiesService.getUserProperties().getProperty("userDomainProp");
  var userProps = PropertiesService.getUserProperties();
  
  userProps.setProperty("groupEmailProp", groupemail1 || "");
  userProps.setProperty("teacherEmailProp", teacheremail1);
  userProps.setProperty("changePassProp", changePass1);
  userProps.setProperty("classroomNameProp", classroomName || "");
  userProps.setProperty("alternativePassProp", altPass1 || "FALSE");
  userProps.setProperty("passTypeProp", passType1 || "simple");
  userProps.setProperty("passLengthProp", passLength1 || "12");

  console.log("CRITICAL DEBUG: Properties set in saveData");
  console.log("CRITICAL DEBUG: Verification - classroomNameProp set to: '" + userProps.getProperty("classroomNameProp") + "'");

  var result = [groupemail1, teacheremail1, changePass1, domain, classroomName];
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
  if (lastrow < 2) {
    Logger.log("No users found in 'Group' sheet.");
    return;
  }
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
  sheet.getCurrentCell().setValue('Password');

  // Grab password settings from properties
  var userProps = PropertiesService.getUserProperties();
  var altPass = userProps.getProperty("alternativePassProp") === "TRUE";
  var passType = userProps.getProperty("passTypeProp") || "simple";
  var passLength = parseInt(userProps.getProperty("passLengthProp") || "12");

  console.log("CRITICAL DEBUG: FormatAndCreateListOfStudentPasswords - altPass: " + altPass + ", passType: " + passType + ", passLength: " + passLength);

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  
  // Column C is FirstName (index 2 in values array)
  var range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
  var data = range.getValues();
  var passwords = [];

  for (var i = 0; i < data.length; i++) {
    var firstName = data[i][2] ? data[i][2].toString() : "";
    var generatedPass = "";

    if (altPass) {
      if (passType === "random") {
        generatedPass = generateRandomPassword(passLength);
      } else if (passType === "word") {
        generatedPass = generateWordBasedPassword(WORD_LIST);
      } else {
        generatedPass = generateSimplePassword(firstName);
      }
    } else {
      generatedPass = generateSimplePassword(firstName);
    }
    passwords.push([generatedPass]);
  }

  // Set the passwords in Column B
  sheet.getRange(2, 2, passwords.length, 1).setValues(passwords);

  SpreadsheetApp.flush();
  tidyUpSpreadsheet();
}

/**
 * Generates a simple password based on firstName and random numbers.
 * Replaces non-ASCII characters.
 */
function generateSimplePassword(firstName) {
  var cleanName = cleanString(firstName);
  var pass = "";
  if (cleanName.length > 3) {
    pass = cleanName + Math.floor(Math.random() * (9999 - 1111 + 1) + 1111);
  } else if (cleanName.length > 2) {
    pass = cleanName + Math.floor(Math.random() * (99999 - 11111 + 1) + 11111);
  } else if (cleanName.length > 1) {
    pass = cleanName + cleanName + Math.floor(Math.random() * (9999 - 1111 + 1) + 1111);
  } else {
    pass = "Password" + Math.floor(Math.random() * (9999 - 1111 + 1) + 1111);
  }
  return pass;
}

/**
 * Replaces common Swedish and other characters with their ASCII equivalents.
 */
function cleanString(str) {
  if (!str) return "";
  var replacements = {
    'å': 'a', 'ä': 'a', 'ö': 'o', 'Å': 'A', 'Ä': 'A', 'Ö': 'O',
    'é': 'e', 'Ü': 'u', 'ü': 'u', 'ë': 'e', 'è': 'e', 'Ø': 'O',
    'ø': 'o', 'õ': 'o', 'ó': 'o'
  };
  return str.split('').map(function(char) {
    return replacements[char] || char;
  }).join('').replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Tidies up the spreadsheet after password generation.
 */
function tidyUpSpreadsheet() {
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.setActiveSheet(spreadsheet.getSheetByName('Users'), true);
  var sheet = spreadsheet.getActiveSheet();
  
  // Naming the B column to Password
  sheet.getRange('B1').setValue('Password');

  // Deleting empty columns
  var maxColumns = sheet.getMaxColumns();
  var lastColumn = sheet.getLastColumn();
  if (maxColumns > lastColumn) {
    sheet.deleteColumns(lastColumn + 1, maxColumns - lastColumn);
  }

  // Remove empty rows
  var maxRows = sheet.getMaxRows();
  var lastRow = sheet.getLastRow();
  if (maxRows > lastRow) {
    sheet.deleteRows(lastRow + 1, maxRows - lastRow);
  }

  // Adding filters
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).createFilter();
  sheet.getRange('A1').activate();

  // Resizing columns
  sheet.autoResizeColumns(1, 4);
  for (var i = 1; i <= sheet.getMaxColumns(); i++) {
    var currentwidth = sheet.getColumnWidth(i);
    sheet.setColumnWidth(i, currentwidth + 25);
  }
  SpreadsheetApp.flush();
  
  // Move sheet Users to be the first sheet
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
  var chpass = (getchangePassProp === "TRUE");

  // Get all data from the second row to the last row with data, and the last column with data
  var lastrow = sheet.getLastRow();
  if (lastrow < 2) return;
  var lastcolumn = sheet.getLastColumn();
  var range = sheet.getRange(2, 1, lastrow - 1, lastcolumn);
  var list = range.getValues();
  
  for (var i = 0; i < list.length; i++) {
    var email = list[i][0].toString();
    var pass = list[i][1].toString();
    
    try {
      // 1. Pre-check: Is the user suspended or deleted?
      var user = AdminDirectory.Users.get(email);
      if (user.suspended) {
         logsheet.appendRow([new Date(), userEmail, "FAILED: User is SUSPENDED. User: " + email]);
         continue;
      }
      
      // 2. Attempt update
      AdminDirectory.Users.update({ 
        password: pass, 
        changePasswordAtNextLogin: chpass 
      }, email);
      
      logsheet.appendRow([new Date(), userEmail, "Password changed. User: " + email]);

    } catch (err) {
      var errorMsg = err.message;
      // Refine common error messages
      if (errorMsg.indexOf("Invalid Password") !== -1) {
        errorMsg = "Invalid Password: Does not meet complexity requirements or is a recently used password.";
      } else if (errorMsg.indexOf("suspended") !== -1) {
        errorMsg = "Account suspended.";
      }
      
      logsheet.appendRow([new Date(), userEmail, "ERROR for " + email + ": " + errorMsg]);
      console.error("Error setting password for " + email + ": " + err.message);
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
  var userProps = PropertiesService.getUserProperties();
  var classroomName = userProps.getProperty("classroomNameProp");
  var groupEmail = userProps.getProperty("groupEmailProp");
  
  console.log("CRITICAL DEBUG: listUsersFormatPassword called");
  console.log("CRITICAL DEBUG: classroomNameProp value: '" + classroomName + "' (Type: " + typeof classroomName + ")");
  console.log("CRITICAL DEBUG: groupEmailProp value: '" + groupEmail + "' (Type: " + typeof groupEmail + ")");
  
  if (classroomName && classroomName.trim() !== "") {
    console.log("CRITICAL DEBUG: classroomName detected, calling printUsersFromClassroom()");
    printUsersFromClassroom();
  } else if (groupEmail && groupEmail.trim() !== "") {
    console.log("CRITICAL DEBUG: groupEmail detected, calling printUsersFromGroup()");
    printUsersFromGroup();
  } else {
    console.error("CRITICAL DEBUG: Neither classroomName nor groupEmail found in properties.");
    SpreadsheetApp.getUi().alert("Error: No classroom or group was selected. Please restart the process.");
    return;
  }
  
  SpreadsheetApp.flush();
  
  var groupSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Group');
  if (!groupSheet || groupSheet.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert("No students were found in the selected Classroom or Group. Please check your selection and try again.");
    return;
  }
  
  getUserNames();
  SpreadsheetApp.flush();
  FormatAndCreateListOfStudentPasswords();
  SpreadsheetApp.flush();
  openSidebarPasswordsPreped();
}

/**
 * Fetches students from the specified Google Classroom and writes them to the 'Group' sheet.
 * Handles pagination for large classes.
 */
function printUsersFromClassroom() {
  var userProps = PropertiesService.getUserProperties();
  var classroomName = userProps.getProperty("classroomNameProp");
  var teacherEmail = userProps.getProperty("teacherEmailProp");
  
  console.log("In printUsersFromClassroom");
  console.log("classroomName: " + classroomName);
  console.log("teacherEmail: " + teacherEmail);
  
  if (!classroomName || !teacherEmail) {
    console.error("Missing classroom or teacher information.");
    return;
  }

  var courseId = null;
  
  // Find the Course ID from name
  var courses = getClassrooms(teacherEmail);
  console.log("Found " + courses.length + " courses for teacher.");
  for (var i = 0; i < courses.length; i++) {
    console.log("Checking course: " + courses[i].name);
    if (courses[i].name === classroomName) {
      courseId = courses[i].id;
      console.log("Matched courseId: " + courseId);
      break;
    }
  }
  
  if (!courseId) {
    SpreadsheetApp.getUi().alert("Error: Could not find classroom '" + classroomName + "'.");
    return;
  }

  // Get the current spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  SpreadsheetApp.setActiveSheet(ss.getSheetByName("Group"));
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.getRange('A2').activate();

  var rows = [];
  var pageToken = null;
  
  try {
    do {
      var response = Classroom.Courses.Students.list(courseId, {
        pageSize: 100,
        pageToken: pageToken
      });
      var students = response.students;
      
      if (students) {
        for (var i = 0; i < students.length; i++) {
          var student = students[i];
          var email = (student && student.profile) ? student.profile.emailAddress : "";
          if (email) {
            var row = [classroomName, email, 'STUDENT', 'ACTIVE'];
            rows.push(row);
          }
        }
      }
      pageToken = response.nextPageToken;
    } while (pageToken);
  } catch (err) {
    var logsheet = ss.getSheetByName("Log");
    var errorMessage = err.message;
    var userFriendlyMessage = "Error fetching students: " + errorMessage;

    if (errorMessage.indexOf("Requested entity was not found") !== -1 || errorMessage.indexOf("Entity not found") !== -1 || errorMessage.indexOf("not found") !== -1) {
       userFriendlyMessage = "Access Denied: You do not have permission to view this Classroom's roster.\n\n" +
                             "SOLUTION: Use the 'Classroom Visitor' feature in the Google Admin Console to temporarily join this class, then try again.";
    }

    if (logsheet) {
      logsheet.appendRow([new Date(), "System", "Error fetching classroom students for ID " + courseId + ": " + errorMessage]);
    }
    SpreadsheetApp.getUi().alert(userFriendlyMessage);
    return;
  }

  if (rows.length > 0) {
    var sheetData = ss.getSheetByName("Group");
    sheetData.getRange(2, 1, rows.length, 4).setValues(rows);
  }
  
  SpreadsheetApp.flush();
  SpreadsheetApp.setActiveSheet(ss.getSheetByName('Group'));
  spreadsheet.getRange('A2').activate();
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
        
/**
 * Generates a random password of given length.
 * Characters: a-zA-Z0-9#$%&/()=?+-_
 */
function generateRandomPassword(length) {
  var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&/()=?+-_";
  var password = "";
  for (var i = 0; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }
  return password;
  }

  /**
  * Generates a password by joining random words from a list.
  * @param {string[]} wordList Array of words to pick from.
  * @param {number} [count=3] Number of words to include.
  */
  function generateWordBasedPassword(wordList, count) {
  count = count || 3;
  var words = [];
  for (var i = 0; i < count; i++) {
    var randomIndex = Math.floor(Math.random() * wordList.length);
    words.push(wordList[randomIndex]);
  }
  return words.join("-");
  }