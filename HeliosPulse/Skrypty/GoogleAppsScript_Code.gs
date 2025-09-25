function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("presence");
  var ts = new Date();
  sheet.appendRow([ts, e.parameter.nick || "Unknown"]);
  return ContentService.createTextOutput("OK");
}
