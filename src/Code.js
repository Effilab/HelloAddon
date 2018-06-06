function onInstall(e) {
  onOpen(e);
}

function onOpen(e) {
  var menu = SpreadsheetApp.getUi().createAddonMenu();

  menu.addItem('Say Hello', 'sayHello');
  menu.addToUi();
}

function getActiveSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getActiveSheet();
}

// Displays data in the spreadsheet
// @param sheet [Sheet] The current sheet
// @param rows [Array] An array of rows, each row an array of String (one string per column)
function setSheetData(sheet, rows) {
 // The size of the range must match the size of the data.
 var numRows = rows.length;
 var numColumns = rows[0].length;
 var range = sheet.getRange(1, 1, numRows, numColumns);
 range.setValues(rows);
}

function sayHello() {
  var sheet = getActiveSheet();
  var rows = [["Yellow"]];
  setSheetData(sheet, rows);
}
