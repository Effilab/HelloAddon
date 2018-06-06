#!/usr/bin/env node

/**
 * Using clasp, create and deploy a new version of the script.
 * Then update the archive manifest with the new version number, and
 * get a refreshed google auth token, then upload the archive and publish
 * the application on the chrome web store
 * Env variables:
 * APP_ID: ID of the deployed application on the chrome web store
 * PRODUCTION_CLIENT_ID: client id of the project on google coud console
 * PRODUCTION_CLIENT_SECRET: client secret
 * PRODUCTION_CLIENT_REFRESH_TOKEN: refresh token (see authenticate() function)
 */

const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const path = require('path');

const fetch = require('node-fetch');
const FormData = require('form-data');
const { exec } = require('child_process');
const archiver = require('archiver');

const ARCHIVE_NAME="archive.zip";
const MANIFEST="archive/manifest.json";

// If you need to generate a token for the get_refreshed_token function,
// call authenticate with a chromewebstore auth scope:
/*
const {authenticate} = require('./auth');
const SCOPES = [
  'https://www.googleapis.com/auth/chromewebstore',
];
authenticate(SCOPES);
*/

console.log("creating new version...")
return create_new_version()
.then((version) => {
  console.log(`deploying new version ${version}...`)
  return deploy_version(version)
  .then(() => {
    console.log("updating manifest...")
    return update_manifest_version(version)
  })
})
.then(() => {
  console.log("zipping archive...")
  return zip_archive()
})
.then(() => {
  console.log("getting oauth token...")
  return get_refreshed_token()
})
.then((token) => {
  console.log("uploading archive to google chrome store...")
  return upload_archive(token)
  .then(() => {
    console.log("publishing application...");
    return publish(token)
  })
})
.then(() => {
  console.log("Successfully updated application !")
  process.exit(0)
})
.catch((error) => {
  console.log("Error while updating application")
  console.log(error)
  process.exit(1)
})

// Creates an immutable version of the script.
// @return [String] the version number
function create_new_version() {
  return new Promise((resolve, reject) => {
    exec("clasp version 'new version'", (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }

      resolve(stdout)
    });
  })
  .then((stdout) => {
    match = stdout.match(/Created version (\d+)\./)
    if(match) {
      return match[1];
    } else {
      throw new Error(`no version number found in stdout : ${stdout}`)
    }
  })
}

// Deploys a version of the script.
// @param [String] the version to deploy
// @return [String] the version number
function deploy_version(version) {
  return new Promise((resolve, reject) => {
    exec(`clasp deploy ${version} 'deploy version ${version}'`, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }

      resolve(version)
    });
  })
}

// Update the archive manifest content with the new version number
// @param [String] the version number
function update_manifest_version(version) {
  var contents = fs.readFileSync(MANIFEST);
  var json = JSON.parse(contents);
  json.container_info.container_version = version;
  json.version = version;
  json.description = `Facebook Addon - PRODUCTION - version ${version}`;
  fs.writeFileSync(MANIFEST, JSON.stringify(json, null, 4));

  return Promise.resolve();
}

// Zip the archive
function zip_archive() {
  return new Promise((resolve, reject) => {
    var output = fs.createWriteStream(ARCHIVE_NAME);
    var archive = archiver('zip');

    output.on('close', function() {
      resolve()
    });

    archive.on('error', function(err) {
      reject(err)
    });

    archive.pipe(output);
    archive.directory('archive/', false);
    archive.finalize();
  })
}

// Get a valid auth token
// @return [Promise] a (refreshed) google auth token
function get_refreshed_token() {
  var form = new FormData();
  form.append('client_id', process.env.PRODUCTION_CLIENT_ID);
  form.append('client_secret', process.env.PRODUCTION_CLIENT_SECRET);
  form.append('refresh_token', process.env.PRODUCTION_CLIENT_REFRESH_TOKEN);
  form.append('grant_type', "refresh_token");

  return fetch("https://accounts.google.com/o/oauth2/token", {
    method: "POST",
    body: form
  })
  .then((result) => result.json())
  .then((json) => {
    if(!json.access_token) {
      throw new Error("No access_token in response")
    }
    return json.access_token;
  })
  .catch((err) => {
    throw err;
  })
}

// Upload the ARCHIVE_NAME archive on the chrome web store
// @param [String] A valid oauth token with chromewebstore authorization
function upload_archive(token) {
  var bufferContent = fs.readFileSync(ARCHIVE_NAME);

  return fetch(`https://www.googleapis.com/upload/chromewebstore/v1.1/items/${process.env.APP_ID}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-goog-api-version": "2"
    },
    body: bufferContent
  })
  .then((res) => {
    if(res.status != 200) {
      return res.json().then((json) => {
        throw new Error(json.error.message)
      })
    }
    return res.json()
  })
  .then((json) => {
    if(json.itemError) {
      throw new Error(JSON.stringify(json.itemError))
    }
  })
}

// Publish the application on the chrome web store
// @param [String] A valid oauth token with chromewebstore authorization
function publish(token) {
  return fetch(`https://www.googleapis.com/chromewebstore/v1.1/items/${APP_ID}/publish`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-goog-api-version": "2",
      "Content-Length": "0"
    }
  })
  .then((res) => {
    if(res.status != 200) {
      console.log("got a " + res.status)
      return res.json().then((json) => {
        throw new Error(json.error.message)
      })
    }
    return res.json()
  })
  .then((json) => {
    if(json.itemError) {
      throw new Error(JSON.stringify(json.itemError))
    }
  })
}
