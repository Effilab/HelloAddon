#!/usr/bin/env node

// Automated testing of a deployed GApp script.
// Displays the list of test results, and exit
// With 0 if they are all ok, or a number > 1 if
// there are test failures.
// Env variables:
// SCRIPT_ID: The id of the script

const {google} = require('googleapis');
const {authenticate} = require('./auth');

authenticate()
.then((auth) => callAppsScript(auth))

/**
 * Call the gastTestRunner test function on the deployed script.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @return [Number] Exit with the number of failed tests
 */
function callAppsScript(auth) {
  const script = google.script({version: "v1"});

  const scriptId = process.env.SCRIPT_ID;

  const request = {
    function: "gastTestRunner",
    parameters: [],
    devMode: true
  }
  script.scripts.run({ auth: auth, scriptId: scriptId, resource: request }, function(err, resp) {
    if (err) {
      // The API encountered a problem before the script started executing.
      console.log('The API returned an error: ' + err);
      process.exit(1);
    }
    if (resp.error) {
      // The API executed, but the script returned an error.

      // Extract the first (and only) set of error details. The values of this
      // object are the script's 'errorMessage' and 'errorType', and an array
      // of stack trace elements.
      var error = resp.error.details[0];
      console.log('Script error message: ' + error.errorMessage);
      console.log('Script error stacktrace:');

      if (error.scriptStackTraceElements) {
        // There may not be a stacktrace if the script didn't start executing.
        for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
          var trace = error.scriptStackTraceElements[i];
          console.log('\t%s: %s', trace.function, trace.lineNumber);
        }
      }
      process.exit(1);
    } else {
      const data = resp.data.response.result;
      const log = data.log;
      console.log(log);
      const failureCount = data.failures;
      process.exit(failureCount);
    }
  })
}
