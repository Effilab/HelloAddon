function gastTestRunner() {
   if ((typeof GasTap)==='undefined') { // GasT Initialization. (only if not initialized yet.)
     eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/zixia/gast/master/src/gas-tap-lib.js').getContentText())
   } // Class GasTap is ready for use now!

   var log = "";
   var loggerFunc = function (msg) { log += msg + "\n" }

   var test = new GasTap({
     logger: loggerFunc
   })

   var url = 'https://docs.google.com/spreadsheets/d/1Qaa7rM6czEEPFWiDorbu9P2BVnAauudb9b1rRW0y4Ac/edit#gid=0'
   var ss = SpreadsheetApp.openByUrl(url)
   SpreadsheetApp.setActiveSpreadsheet(ss);

   testSayHello(test);

   test.finish();

   return { failures: test.totalFailed(), log: log }
}

function testSayHello(test) {
  test("sayHello writes Hello in the top-left cell", function(t) {
    sayHello();

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var cell = ss.getActiveSheet().getRange("A1");
    var value = cell.getValue();
    t.equal(value, "Hello", "it writes Hello");
  })
}
