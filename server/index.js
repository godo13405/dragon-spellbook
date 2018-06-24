'use strict';

global.express = require('express');
// global.firebase = require('firebase-admin');
global.bodyParser = require('body-parser');
global.capabilities = ['audio', 'screen'];
global.i18n = require('../config/lang/en');
/*
firebase.initializeApp({
    credential: firebase.credential.cert('./service-key.json'),
    apiKey: "AIzaSyDfwydPClh-B6RCRtS3Nvt-D_0F4j35zHg",
    authDomain: "dnd-wiki-ca7bd.firebaseio.com",
    databaseURL: "https://dnd-wiki-ca7bd.firebaseio.com/",
    storageBucket: "dnd-wiki-ca7bd.appspot.com"
});
*/
// global.db = firebase.firestore();
global.ex = express();

global.params = {};
global.suggestions = require('../config/suggestions');

const webhook = (request, response) => {
  if (request.body.queryResult) {
    console.log("\x1b[36m", request.body.queryResult.queryText, "\x1b[2m", request.body.queryResult.action);
    console.log("\x1b[0m");
  }
  global.request = request;
  global.response = response;
  global.actionArr = request.body.queryResult.action.split(".");
  global.intention = actionArr[actionArr.length - 1];

  // Get surface capabilities, such as screen
  if (request.body.originalDetectIntentRequest) {
    switch(request.body.originalDetectIntentRequest.source) {
      case ('google'):
      capabilities = [];
        request.body.originalDetectIntentRequest.payload.surface.capabilities.forEach(cap => {
          if (cap.name) {
            cap = cap.name.split('.');
            cap = cap[cap.length - 1].replace(/_OUTPUT/g, '').toLowerCase();
            capabilities.push(cap);
          }
        });
        break;
    case ('alexa'):
      capabilities = ['audio'];
    }
}

  // get context parameters
  if (request.body.queryResult && request.body.queryResult.outputContexts && request.body.queryResult.outputContexts.length) {
    for (var i = request.body.queryResult.outputContexts.length - 1; i >= 0; i--) {
      for (let par in request.body.queryResult.outputContexts[i].parameters) {
        if (par.substr(par.length - 9) !== '.original' &&
          request.body.queryResult.outputContexts[i].parameters[par]) {
          par = par.toLowerCase();
          params[par] = request.body.queryResult.outputContexts[i].parameters[par];
        }
      }
    }
  }

  // clear parameters except relevant ones
  // this will depend on what the intention is
  const paramsKeep = {};
  switch (actionArr[0]) {
    case ('condition'):
      paramsKeep.condition = params.condition;
      // should we keep level?
      if (params.condition) {
        paramsKeep.level = params.level;
      }
      break;
    case ('spell'):
      if (params.spell) paramsKeep.spell = params.spell;
      if (params.level) paramsKeep.level = params.level;
      if (params.class) paramsKeep.class = params.class;
      if (params.school) paramsKeep.school = params.school;
      break;
  }
  // scrub the parameters clean
  params = {};
  // assign them to our new var
  params = paramsKeep;

  // get the spell's name from parameters or context
  if (request.body.queryResult.parameters) {
    for (let par in request.body.queryResult.parameters) {
      if (request.body.queryResult.parameters[par].length && par.substr(par.length - 9) !== '.original') {
        params[par.toLowerCase()] = request.body.queryResult.parameters[par];
      }
    }
  }

  switch (actionArr[1]) {
    case ('what'):
      let arr = ['text', 'speech'];
      if (intention === 'description') arr = ['speech', 'card'];
      return responses.whatProperty(global.intention, arr);
  }

  switch (request.body.queryResult.action) {
    case ('spell.init' || 'spell.folllowupInit'):
      return responses.whatProperty(global.intention, ['text', 'speech', 'card']);
    case 'query.complex':
      return responses.query.spellComplex();
    case 'count.complex':
      return responses.query.countComplex();
    case 'condition':
      return responses.condition();
    case 'input.welcome':
      return responses.welcome();
    case 'input.unknown':
      return responses.fallback();
  }
  return false;
};

global.sak = require('./swiss-army-knife');
global.tools = require('./tools');
global.responses = require('./responses');


process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.google_application_credentials;

ex.use(bodyParser.json());
ex.use(express.static('./www'));
// ex.get('/', (req, res) => {
//   res.redirect(301, 'https://bot.dialogflow.com/spell-book')
// });
ex.post('/', webhook);

ex.listen((process.env.PORT || 3000), () => console.log('Spell Book is open'));

exports = module.exports = webhook;
