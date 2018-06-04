'use strict';

const functions = require('firebase-functions'),
    firebase = require('firebase-admin'),
    bodyParser = require('body-parser'),
    {
        WebhookClient
    } = require('dialogflow-fulfillment'),
    firebaseConfig = {
        apiKey: "AIzaSyDfwydPClh-B6RCRtS3Nvt-D_0F4j35zHg",
        authDomain: "dnd-wiki-ca7bd.firebaseio.com",
        databaseURL: "https://dnd-wiki-ca7bd.firebaseio.com/",
        storageBucket: "dnd-wiki-ca7bd.appspot.com"
    };

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

exports.hook = functions.https.onRequest((request, response) => {

    // get the spell's name from parameters or context
    let spellNameLet = false;
    if (request.body.queryResult.parameters.spell) {
        spellNameLet = request.body.queryResult.parameters.spell;
    } else if (request.body.queryResult.outputContexts && request.body.queryResult.outputContexts.length) {
        for (var i = request.body.queryResult.outputContexts.length - 1; i >= 0; i--) {
            if (request.body.queryResult.outputContexts[i].name === `spell`) {
                spellNameLet = request.body.queryResult.outputContexts[i].parameters.name;
                break;
            }
        }
    }
    const spellName = spellNameLet;

    const responses = {
        welcome: () => {
            let talk = tools.setResponse(`Hi! What spell do you want to know about?`, tools.getSuggestions([
                `what is Acid Splash`,
                `what damage does Harm do`
            ]));
            response.json(talk);
        },
        fallback: () => {
            let talk = tools.spells.tools.setResponse(`Sorry, I didn't get that, can you try again?`);
            return response.json(talk);
        },
        spellDuration: () => {
            return tools.getSpell().then(data => {
                spell = data;
                let output = "This spell has no duration.";

                if (spell) {
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
                let talk = tools.setResponse(output, suggestions);
                // response.json(talk);
                resolve(talk);
                return;
            });
        },
        spellDamage: () => {
            return tools.getSpell().then(data => {
                spell = data;
                let output = "This spell doesn't cause damage.";

                if (spell) {
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
                let talk = tools.setResponse(output, suggestions);
                response.json(talk);
                return;
            });
        },
        spellInit: () => {
            tools.getSpell()
                .then(data => {
                    let talk = "",
                        spell = data.data();

                    let speechOutput = `${spell.name} is a ${spell.type}`;

                    let responseInput = {
                        output: speechOutput,
                        slackRichOutput: {
                            title: spell.name,
                            text: spell.description.replace(/\*\*+/g, '*')
                        }
                    };

                    talk = tools.setResponse(responseInput, tools.getSuggestions(spell, [
                        'damage',
                        'materials',
                        'higher_levels'
                    ]));

                    response.json(talk);
                });
        }
    };

    const tools = {
        getSpell: () => {
            return db.collection('spells').doc(spellName.replace(/\s+/g, '_').replace(/\/+/g, '_or_').toLowerCase()).get();
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
        setResponse: (input, suggestions = []) => {
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
                    "name": `spell`,
                    "lifespanCount": 5,
                    "parameters": {
                        name: spellName
                    }
                }];
            }
            return res;
            /*
                agent.add(input.output);
                agent.add(new Payload(agent.ACTIONS_ON_GOOGLE, res.payload.google));
                agent.add(new Payload(agent.SLACK, res.payload.slack));
                console.log(agent);
            */
        }
    };

    switch (request.body.queryResult.action) {
        case 'spell.init':
            responses.spellInit();
            break;
        case 'spell.damage':
            responses.spellDamage();
            break;
        case 'spell.duration':
            responses.spellDuration();
            break;
        case 'spell.castTime':
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
});