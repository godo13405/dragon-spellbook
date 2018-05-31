'use strict';

const functions = require('firebase-functions'),
    firebase = require('firebase'),
    https = require('https'),
    {
        WebhookClient
    } = require('dialogflow-fulfillment'),
    {
        Card,
        Suggestion,
    } = require('dialogflow-fulfillment'),
    {
        BasicCard,
        Suggestions,
        Carousel,
        Button
    } = require('actions-on-google'),
    appName = 'Dragon Spellbook',
    firebaseConfig = {
        apiKey: "AIzaSyDfwydPClh-B6RCRtS3Nvt-D_0F4j35zHg",
        authDomain: "dnd-wiki-ca7bd.firebaseio.com",
        databaseURL: "https://dnd-wiki-ca7bd.firebaseio.com/",
        storageBucket: "dnd-wiki-ca7bd.appspot.com"
    };

firebase.initializeApp(firebaseConfig);

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({
        request,
        response
    });
    /* get the spell's name from parameters or context */
    let spellName = false;
    if (request.body.queryResult.parameters.spell) {
        spellName = request.body.queryResult.parameters.spell;
    } else if (request.body.queryResult.outputContexts && request.body.queryResult.outputContexts.length) {
        for (var i = request.body.queryResult.outputContexts.length - 1; i >= 0; i--) {
            console.log(`${request.body.queryResult.outputContexts[i].name} === projects/dnd-wiki-ca7bd/agent/sessions/${request.session}/contexts/spell`, request.body.queryResult.outputContexts[i].name === `projects/dnd-wiki-ca7bd/agent/sessions/${request.session}/contexts/spell`);
            if (request.body.queryResult.outputContexts[i].name === `projects/dnd-wiki-ca7bd/agent/sessions/${request.session}/contexts/spell`) {
                spellName = request.body.queryResult.outputContexts[i].parameters.name;
                console.log(`I found the spell, it's ${spellName}`);
                break;
            }
        }
    }

    function welcome(agent) {
        let talk = setResponse(`Hi! What spell do you want to know about?`, [{
            "title": `what is Acid Splash`
        }, {
            "title": `what damage does Harm do`
        }, ]);
        response.json(talk);
    }

    function fallback(agent) {
        let talk = setResponse(`Sorry, I didn't get that, can you try again?`);
        response.json(talk);
    }

    function setResponse(input, suggestions = []) {
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
        /*
        res.messages = [
          {
            speech: input.output,
            type: 0
          }
        ];
        */
        res.payload = {
            google: {
                expectUserResponse: true,
                richResponse: input.richOutput
            },
            slack: {
                text: input.output.replace(/\*\*+/g, '*')
            }
        };
        /*
        if (input.richOutput.basicCard) {
            let cardAgnostic;
            cardAgnostic.type = 1;
            input.messages.push(cardAgnostic);
        }
        */
        if (input.slackRichOutput) {
            res.payload.slack.attachments = [
                input.slackRichOutput
            ];
        }
        if (spellName) {
            res.outputContexts = [{
                "name": `projects/dnd-wiki-ca7bd/agent/sessions/${request.session}/contexts/Spell`,
                "lifespanCount": 5,
                "parameters": {
                    name: spellName
                }
            }];
        }
        return res;
    }

    function spellDuration(agent) {
        return getSpell(agent).then((data) => {
            let spell = data;
            let output = "This spell has no duration.";

            if (spell) {
                output = `${spell.name} lasts for ${spell.duration}`;
            }

            let talk = setResponse(output, getSuggestions([
                'description',
                'damage',
                'cast time'
            ]));
            response.json(talk);
            return;
        });
    }

    function spellDamage(agent) {
        return getSpell(agent).then((data) => {
            let spell = data;
            let output = "This spell doesn't cause damage.";

            if (spell) {
                output = `${spell.name} does ${spell.damage}`;
            }

            let talk = setResponse(output, getSuggestions([
                'description',
                'duration',
                'cast time'
            ]));
            response.json(talk);
            return;
        });
    }

    function spellCastTime(agent) {
        return getSpell(agent).then((data) => {
            let spell = data,
                output = "Sorry, I don't know this. Please try again another day.";

            if (spell) {
                output = `${spell.name} takes ${spell.casting_time} to cast`;
            }

            let talk = setResponse(output, getSuggestions([
                'description',
                'duration',
                'damage'
            ]));
            response.json(talk);
            return;
        });
    }

    function getSuggestions(input) {
        let suggestions = [];

        if (input.includes('description')) {
            suggestions.push({
                "title": `what is ${spellName}?`
            });
        }
        if (input.includes('damage')) {
            suggestions.push({
                "title": `what damage does it do?`
            });
        }
        if (input.includes('duration')) {
            suggestions.push({
                "title": `how long does it last?`
            });
        }
        if (input.includes('cast time')) {
            suggestions.push({
                "title": `how long does it take to cast?`
            });
        }

        return suggestions;
    }

    function getSpell(agent) {
        return new Promise((resolve, reject) => {
            console.log(`getting spell ${spellName}`, typeof spellName);
            return firebase.database().ref(`/${spellName.replace(/\s+/g, '_').replace(/\/+/g, '_or_').toLowerCase()}`)
                .once('value', (data) => {
                    if (data.val()) {
                        let spell = data.val();
                        resolve(spell);
                    } else {
                        setResponse("Sorry, I don't know that spell...");
                        resolve(false);
                    }
                });
        });
    }

    function buildRow(data) {
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
    }

    function spellInit(agent) {
        return getSpell(agent).then((data) => {
            let talk = "",
                spell = data;
            if (spell) {
                let speechOutput = `${spell.name} is a ${spell.type}`,
                    responseInput = {
                        output: speechOutput,
                        richOutput: {
                            items: []
                        }
                    },
                    table = {
                        "title": spell.name,
                        "subtitle": spell.type,
                        "rows": [],
                        "columnProperties": [{
                            header: ""
                        }, {
                            header: ""
                        }]
                    };

                if (spell.damage) {
                    table.rows.push(buildRow(["Damage", spell.damage]));
                }
                if (spell.saving_throw) {
                    table.rows.push(buildRow(["Saving Throw", spell.range]));
                }
                if (spell.range) {
                    table.rows.push(buildRow(["Range", spell.range]));
                }
                if (spell.casting_time) {
                    table.rows.push(buildRow(["Casting Time", spell.range]));
                }
                if (spell.duration) {
                    table.rows.push(buildRow(["Duration", spell.duration]));
                }

                if (!table.rows.length) {
                    responseInput.richOutput.items.push({
                        "tableCard": table
                    });
                } else {
                    responseInput.richOutput.items.push({
                        "basicCard": {
                            "title": spell.name,
                            "subtitle": spell.type,
                            "formattedText": spell.description
                        }
                    });
                }
                responseInput.slackRichOutput = {
                    title: spell.name,
                    text: spell.description.replace(/\*\*+/g, '*')
                }

                talk = setResponse(responseInput, getSuggestions([
                    'damage',
                    'duration',
                    'cast time'
                ]));
            } else {
                talk = setResponse("Sorry, I don't know that spell...");
            }
            response.json(talk);
            return true;
        });
    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('Spell', spellInit);
    intentMap.set('Spell damage', spellDamage);
    intentMap.set('Spell duration', spellDuration);
    intentMap.set('Spell cast time', spellCastTime);
    agent.handleRequest(intentMap);


});