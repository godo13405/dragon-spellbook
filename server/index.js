'use strict';

global.express = require('express');
global.firebase = require('firebase-admin');
global.bodyParser = require('body-parser');
global.capabilities = ['audio'];
global.i18n = require('../lang/en');

firebase.initializeApp({
    credential: firebase.credential.cert('./service-key.json'),
    apiKey: "AIzaSyDfwydPClh-B6RCRtS3Nvt-D_0F4j35zHg",
    authDomain: "dnd-wiki-ca7bd.firebaseio.com",
    databaseURL: "https://dnd-wiki-ca7bd.firebaseio.com/",
    storageBucket: "dnd-wiki-ca7bd.appspot.com"
});

global.db = firebase.firestore();
global.ex = express();

global.params = {};

const webhook = (request, response) => {
    global.request = request;
    global.response = response;

    // Get surface capabilities, such as screen
    if (request.body.originalDetectIntentRequest.payload && request.body.originalDetectIntentRequest.source === 'google') {
        request.body.originalDetectIntentRequest.payload.surface.capabilities.forEach(cap => {
            if (cap.name) {
                cap = cap.name.split('.');
                cap = cap[cap.length - 1].replace(/_OUTPUT/g, '').toLowerCase();
                capabilities.push(cap);
            }
        });
        /*
             [ 'AUDIO_OUTPUT',
              'SCREEN_OUTPUT',
              'MEDIA_RESPONSE_AUDIO',
              'WEB_BROWSER' ]
        */
    }

    // get context parameters
    if (request.body.queryResult && request.body.queryResult.outputContexts && request.body.queryResult.outputContexts.length) {
        for (var i = request.body.queryResult.outputContexts.length - 1; i >= 0; i--) {
            for (let par in request.body.queryResult.outputContexts[i].parameters) {
                if (par.substr(par.length - 9) !== '.original') {
                    params[par] = request.body.queryResult.outputContexts[i].parameters[par];
                }
            }
        }
    }

    // get the spell's name from parameters or context
    if (request.body.queryResult) {
        if (request.body.queryResult.parameters && request.body.queryResult.parameters.spell) {
            params.name = request.body.queryResult.parameters.spell;
        }
        switch (request.body.queryResult.action) {
            case ('spell.init' || 'spell.folllowupInit'):
                return responses.spellInit();
            case ('spell.description'):
                return responses.spellDescription();
            case 'spell.what.damage':
                return responses.what.spellDamage();
            case 'spell.what.Class':
                return responses.what.spellClass();
            case 'spell.duration':
                return responses.spellDuration();
            case 'spell.what.castTime':
                return responses.spellCastTime();
            case 'query.school':
                return responses.query.spellSchool();
            case 'query.level':
                return responses.query.spellLevel();
            case 'query.complex':
                return responses.query.spellComplex();
            case 'count.complex':
                return responses.query.countComplex();
            case 'query.class':
                return responses.query.spellClass();
            case 'condition':
                return responses.condition();
            case 'input.welcome':
                return responses.welcome();
            case 'input.unknown':
                return responses.fallback();
            default:
                return responses.fallback();
        }
    } else {
        return response.send('Problem with the resuest.body. Check the console.log');
    }
};

global.sak = require('./swiss-army-knife');
global.tools = require('./tools');
global.responses = require('./responses');


process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.google_application_credentials;

ex.use(bodyParser.json());
ex.get('/', (req,res) => {
    res.redirect(301, 'https://bot.dialogflow.com/spell-book')
});
ex.post('/', webhook);
ex.listen((process.env.PORT || 3000), () => console.log('Spell Book is open'));

exports = module.exports = webhook;