#!/usr/bin/env node

/* Write credentials files with ENV variables */
const fs = require('fs');
const path = require('path');

CLIENT_SECRET_FILE="client_secret.json"
DOT_CLASPRC_FILE=path.join(process.env.HOME, ".clasprc.json")
DOT_CLASP_FILE=".clasp.json"
ENV_FILE="env.js"
CREDENTIALS_FILE="credentials.json"

const client_secret = {
  installed: {
    client_id: process.env.CLIENT_ID,
    project_id: process.env.PROJECT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://accounts.google.com/o/oauth2/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: [ 'urn:ietf:wg:oauth:2.0:oob', 'http://localhost' ]
  }
}

const clasprc = {
  access_token: process.env.CLASPRC_ACCESS_TOKEN,
  token_type: 'Bearer',
  refresh_token: process.env.CLASPRC_REFRESH_TOKEN,
  expiry_date: process.env.CLASPRC_EXPIRY_DATE
}

const credentials = {
  access_token: process.env.CLIENT_ACCESS_TOKEN,
  token_type: 'Bearer',
  refresh_token: process.env.CLIENT_REFRESH_TOKEN,
  expiry_date: process.env.CLIENT_EXPIRY_DATE
}

const dot_clasp = {
  scriptId: process.env.SCRIPT_ID
}

write_json_file(CLIENT_SECRET_FILE, client_secret);
write_json_file(DOT_CLASPRC_FILE, clasprc);
write_json_file(CREDENTIALS_FILE, credentials);
write_json_file(DOT_CLASP_FILE, dot_clasp);

function write_json_file(filename, content) {
  fs.writeFileSync(filename, JSON.stringify(content, null, 4));
}
