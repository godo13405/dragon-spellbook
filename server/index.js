'use strict';

if (process.env.SILENT) process.env.DEBUG = false;

global.express = require('express');
let compression = require('compression');
global.bodyParser = require('body-parser');
global.capabilities = process.env.CAPABILITIES ? [process.env.CAPABILITIES] : ['audio', 'screen'];
global.i18n = require('../config/lang/en');
global.ex = express();

global.params = {};
global.suggestions = require('../config/suggestions');

global.service = require('./service');

const webhook = (request, response) => {
  if (!process.env.SILENT && process.env.DEBUG) console.time('total response time');
  if (request.body.queryResult) {
    if (!process.env.SILENT) console.log("\x1b[36m", request.body.queryResult.queryText, "\x1b[2m", request.body.queryResult.action, "\x1b[0m");
  }
  global.request = request;
  global.response = response;
  global.actionArr = request.body.queryResult.action.split(".");
  global.collection = actionArr[0];
  global.intention = actionArr[actionArr.length - 1];
  global.source = request.body.originalDetectIntentRequest.source || 'web';

  // Get surface capabilities, such as screen
  capabilities = service.setCapabilities(request.body.originalDetectIntentRequest);

  // get context parameters
  let par = service.params.fromContext(request.body.queryResult.outputContexts);

  // get the spell's name from parameters or context
  par = par ? Object.assign(par.parameters, service.params.fromQuery(request.body.queryResult.parameters)) : service.params.fromQuery(request.body.queryResult.parameters);

  global.params = par;

  //direct intents to proper functions
  return service.router(request.body.queryResult.action, actionArr[1]);
};

global.sak = require('./swiss-army-knife');
global.tools = require('./tools');
global.responses = require('./responses');

process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.google_application_credentials;

ex.use(bodyParser.json());
ex.use(compression(6))
ex.use(express.static('./www'));
ex.post('/', webhook);
let port = process.env.PORT || 3000;
ex.listen(port, () => {
  if (!process.env.SILENT) console.log('Spell Book is open on port ' + port);
});

exports.webhook = webhook;
