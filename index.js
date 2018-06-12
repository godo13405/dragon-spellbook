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

global.spellName = false;

const webhook = (request, response) => {
    // Get surface capabilities, such as screen
    if (request.body.originalDetectIntentRequest.payload && request.body.originalDetectIntentRequest.source === 'google') {
        request.body.originalDetectIntentRequest.payload.surface.capabilities.forEach(cap => {
            cap = cap.name.split('.');
            cap = cap[cap.length - 1];
            capabilities.push(cap);
        });
        /*
             [ 'AUDIO_OUTPUT',
              'SCREEN_OUTPUT',
              'MEDIA_RESPONSE_AUDIO',
              'WEB_BROWSER' ]
        */
    }

    // get the spell's name from parameters or context
    if (request.body.queryResult) {
        if (request.body.queryResult.parameters && request.body.queryResult.parameters.spell) {
            spellName = request.body.queryResult.parameters.spell;
        } else if (request.body.queryResult.outputContexts && request.body.queryResult.outputContexts.length) {
            for (var i = request.body.queryResult.outputContexts.length - 1; i >= 0; i--) {
                if (request.body.queryResult.outputContexts[i].name === `spell`) {
                    spellName = request.body.queryResult.outputContexts[i].parameters.name;
                    break;
                }
            }
        }
        switch (request.body.queryResult.action) {
            case ('spell.init' || 'spell.folllowupInit'):
                responses.spellInit(request, response);
                break;
            case ('spell.description'):
                responses.spellDescription(request, response);
                break;
            case 'spell.damage':
                responses.spellDamage(request, response);
                break;
            case 'spell.duration':
                responses.spellDuration(request, response);
                break;
            case 'spell.castTime':
                break;
            case 'query.school':
                responses.query.spellSchool(request, response);
                break;
            case 'query.level':
                responses.query.spellLevel(request, response);
                break;
            case 'query.complex':
                responses.query.spellComplex(request, response);
                break;
            case 'query.class':
                responses.query.spellClass(request, response);
                break;
            case 'input.welcome':
                responses.welcome(request, response);
                break;
            case 'input.unknown':
                responses.fallback(request, response);
                break;
            default:
                responses.fallback(request, response);
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
ex.post('/', webhook);
ex.listen((process.env.PORT || 3000), () => console.log('Spell Book is open'));