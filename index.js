'use strict';

const express = require('express'),
    firebase = require('firebase-admin'),
    bodyParser = require('body-parser');

firebase.initializeApp({
    credential: firebase.credential.cert('./service-key.json'),
    apiKey: "AIzaSyDfwydPClh-B6RCRtS3Nvt-D_0F4j35zHg",
    authDomain: "dnd-wiki-ca7bd.firebaseio.com",
    databaseURL: "https://dnd-wiki-ca7bd.firebaseio.com/",
    storageBucket: "dnd-wiki-ca7bd.appspot.com"
});

const db = firebase.firestore(),
    ex = express();

let spellName = false;

const webhook = (request, response) => {
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
        console.log(request);
        response.send('Problem with the resuest.body. Check the console.log');
    }
};

const tools = {
    getSpell: () => {
        return db.collection('spells').doc(spellName.replace(/\s+/g, '_').replace(/\/+/g, '_or_').toLowerCase()).get();
    },
    querySpell: (key, value, limit = 5, operator = '==', order = 'name') => {
        return db.collection('spells').where(key, operator, value).orderBy(order).limit(limit).get();
    },
    buildRow: data => {
        let output = {
            "cells": [],
            "dividerAfter": true
        };

        for (var i = data.length - 1; i >= 0; i--) {
            output.cells.unshift({
                text: data[i]
            });
        }

        return output;
    },
    getSuggestions: (spell = null, input = []) => {
        let suggestions = [];

        if (spell) {
            if (input.includes('description') && spell.description) {
                suggestions.push({
                    "title": `what is ${spellName}?`
                });
            }
            if (input.includes('damage') && spell.damage) {
                suggestions.push({
                    "title": `what damage does it do?`
                });
            }
            if (input.includes('duration') && spell.duration) {
                suggestions.push({
                    "title": `how long does it last?`
                });
            }
            if (input.includes('cast_time') && spell.cast_time) {
                suggestions.push({
                    "title": `how long does it take to cast?`
                });
            }
            if (input.includes('materials') && spell.components && spell.components.material) {
                suggestions.push({
                    "title": `what materials do I need`
                });
            }
            if (input.includes('materials') && spell.higher_levels) {
                suggestions.push({
                    "title": `how does it level up`
                });
            }
        } else {
            for (var i = 0; i < input.length; i++) {
                suggestions.push({
                    "title": input[i]
                });
            }
        }
        return suggestions;
    },
    setResponse: (request, input, suggestions = []) => {
        if (typeof input === 'string') {
            input = {
                output: input
            };
        }
        if (!input.richOutput) {
            input.richOutput = {
                "items": []
            };
        }
        input.richOutput.items.unshift({
            "simpleResponse": {
                "textToSpeech": input.output
            }
        });
        if (input.suggestions) {
            input.richOutput.suggestions = input.suggestions;
        } else if (suggestions.length) {
            input.richOutput.suggestions = suggestions;
        }
        let res = {};
        res.fulfillmentText = input.output;
        res.payload = {
            google: {
                expectUserResponse: true,
                richResponse: input.richOutput
            },
            slack: {
                text: input.output.replace(/\*\*+/g, '*')
            }
        };
        if (input.slackRichOutput) {
            res.payload.slack.attachments = [
                input.slackRichOutput
            ];
        }
        if (spellName) {
            res.outputContexts = [{
                "name": `${request.body.session}/contexts/spell`,
                "lifespanCount": 5,
                "parameters": {
                    name: spellName
                }
            }];
        }
        return res;
    }
};

const responses = {
    welcome: (request, response) => {
        let talk = tools.setResponse(request, `Hi! What spell do you want to know about?`, tools.getSuggestions([
            `what is Acid Splash`,
            `what damage does Harm do`
        ]));
        response.json(talk);
    },
    fallback: (request, response) => {
        let talk = tools.setResponse(request, `Sorry, I didn't get that, can you try again?`);
        return response.json(talk);
    },
    spellDuration: (request, response) => {
        tools.getSpell().then(data => {
            let spell = data.data(),
                output = "This spell has no duration.";

            if (spell && spell.duration) {
                output = `${spell.name} lasts for ${spell.duration}`;
            }

            let suggestions = [{
                "title": `what is ${spell.name}?`
            }];

            if (spell.damage) {
                suggestions.push({
                    "title": `what damage does it do`
                });
            }
            response.json(tools.setResponse(request, output, suggestions));
        });
    },
    spellDamage: (request, response) => {
        tools.getSpell().then(data => {
            let spell = data.data(),
                output = "This spell doesn't cause damage.";

            if (spell && spell.damage) {
                output = `${spell.name} does ${spell.damage}`;
            }

            let suggestions = [{
                "title": `what is ${spell.name}?`
            }];
            if (spell.duration) {
                suggestions.push({
                    "title": `how long does it last?`
                });
            }
            response.json(tools.setResponse(request, output, suggestions));
        });
    },
    spellInit: (request, response) => {
        tools.getSpell()
            .then(data => {
                let spell = data.data();

                let speechOutput = `${spell.name} is a ${spell.type}`;

                let responseInput = {
                    output: speechOutput,
                    slackRichOutput: {
                        title: spell.name,
                        text: spell.description.replace(/\*\*+/g, '*')
                    }
                };


                response.json(tools.setResponse(request, responseInput, tools.getSuggestions(spell, [
                    'damage',
                    'materials',
                    'higher_levels'
                ])));
            }).catch(err => {
                console.log(err);
            });
    },
    query: {
        spellSchool: (request, response) => {
                tools.querySpell('school', request.body.queryResult.parameters.School.toLowerCase(), 1000).then(list => {
                    let spells = [],
                        output = "I can't find this School",
                        listSize = list.size,
                        readLimit = 5,
                        readCounter = 0;

                    list.forEach(spell => {
                        if(readCounter <= readLimit) {
                            spells.push(spell.data().name);
                            readCounter = readCounter + 1;
                        } else {
                            list = null;
                        }
                    });

                    if(spells.length) {
                        output = `The School of ${request.body.queryResult.parameters.School} includes ${spells.join(", ")}`;
                        if (listSize > readLimit) {
                            output = `${output} and ${listSize - 5} others.`;
                        }
                    }

                    let suggestions = [];
                    response.json(tools.setResponse(request, output, suggestions));
                });
        },
        spellLevel: (request, response) => {
                let level = parseInt(request.body.queryResult.parameters.Level);
                tools.querySpell('level', level, 1000).then(list => {
                    let spells = [],
                        output = "I don't know any spells of this level",
                        levelName = `Level ${level} spell`,
                        listSize = list.size,
                        readLimit = 5,
                        readCounter = 0;

                    list.forEach(spell => {
                        if(readCounter <= readLimit) {
                            spells.push(spell.data().name);
                            readCounter = readCounter + 1;
                        } else {
                            list = null;
                        }
                    });

                    // Deal with the bloody cantrips
                    if (level === 0) {
                        levelName = 'Cantrip';
                    }
                    if (listSize > 1) {
                        levelName = levelName + 's include';
                    } else {
                        levelName = levelName + ' is';
                    }

                    if(spells.length) {
                        output = `${levelName} ${spells.join(", ")}`;
                        if (listSize > readLimit) {
                            output = `${output} and ${listSize - 5} others.`;
                        }
                    }

                    let suggestions = [];
                    response.json(tools.setResponse(request, output, suggestions));
                });
        }
    }
};


process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.google_application_credentials;

ex.use(bodyParser.json());
ex.post('/', webhook);
ex.listen((process.env.PORT || 3000), () => console.log('Spell Book is open'));