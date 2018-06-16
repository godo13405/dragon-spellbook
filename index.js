'use strict';

global.express = require('express');
global.firebase = require('firebase-admin');
global.bodyParser = require('body-parser');
global.capabilities = [];

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
            cap = cap.name.split('.');
            cap = cap[cap.length - 1].replace(/_OUTPUT/g, '').toLowerCase;
            capabilities.push(cap);
        });
        /*
             [ 'AUDIO_OUTPUT',
              'SCREEN_OUTPUT',
              'MEDIA_RESPONSE_AUDIO',
              'WEB_BROWSER' ]
        */
    } else {
        capabilities.push('audio');
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
                responses.spellInit();
                break;
            case ('spell.description'):
                responses.spellDescription();
                break;
            case 'spell.what.damage':
                responses.what.spellDamage();
                break;
            case 'spell.what.Class':
                responses.what.spellClass();
                break;
            case 'spell.duration':
                responses.spellDuration();
                break;
            case 'spell.what.castTime':
                responses.spellCastTime();
                break;
            case 'query.school':
                responses.query.spellSchool();
                break;
            case 'query.level':
                responses.query.spellLevel();
                break;
            case 'query.complex':
                responses.query.spellComplex();
                break;
            case 'count.complex':
                responses.query.countComplex();
                break;
            case 'query.class':
                responses.query.spellClass();
                break;
            case 'condition':
                responses.condition();
                break;
            case 'input.welcome':
                responses.welcome();
                break;
            case 'input.unknown':
                responses.fallback();
                break;
            default:
                responses.fallback();
        }
    } else {
        response.send('Problem with the resuest.body. Check the console.log');
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