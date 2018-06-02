'use strict';

const functions = require('firebase-functions'),
    firebase = require('firebase'),
    {
        WebhookClient,
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

exports.hook = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({
        request,
        response
    });
    let spell = request.body.queryResult.parameters.spell;
    if (request.body.queryResult.outputContexts && request.body.queryResult.outputContexts.length) {
        for (var i = request.body.queryResult.outputContexts.length - 1; i >= 0; i--) {
            if(request.body.queryResult.outputContexts[i].name === `projects/dnd-wiki-ca7bd/agent/sessions/${request.session}/contexts/spell`) {
                spell = request.body.queryResult.outputContexts[i].parameters.name;
                break;
            }
        }
    }

    function welcome(agent) {
        let talk = setResponse(`Hi! What spell do you want to know about?`, [
            {"title": `what is Acid Splash`},
            {"title": `what damage does Harm do`},
        ]);
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
        } else if (suggestions.length){
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
        if (spell) {
            res.outputContexts = [{
                "name": `projects/dnd-wiki-ca7bd/agent/sessions/${request.session}/contexts/Spell`,
                "lifespanCount": 5,
                "parameters": {
                    name: spell.name
                }
            }];
        }
        return res;
    }

    function spellDuration(agent) {
        return getSpell(agent).then((data) => {
            spell = data;
            let output = "This spell has no duration.";

            if (spell) {
                output = `${spell.name} lasts for ${spell.duration}`;
            }

            let suggestions = [
                {
                    "title": `what is ${spell.name}?`
                }
            ];

            if (spell.damage) {
                suggestions.push({"title": `what damage does it do`});
            }
            let talk = setResponse(output, suggestions);
            response.json(talk);
            return;
        });
    }

    function spellDamage(agent) {
        return getSpell(agent).then((data) => {
            spell = data;
            let output = "This spell doesn't cause damage.";

            if (spell) {
                output = `${spell.name} does ${spell.damage}`;
            }

            let suggestions = [
                {
                    "title": `what is ${spell.name}?`
                }
            ];
            if (spell.duration) {
                suggestions.push({"title": `how long does it last?`});
            }
            let talk = setResponse(output, suggestions);
            response.json(talk);
            return;
        });
    }

    function getSpell(agent) {
        return new Promise((resolve, reject) => {
            console.log("getting spell -> ", spell, spell.replace(/\s+/g, '_').replace(/\/+/g, '_or_').toLowerCase());
            return firebase.database().ref(`/${spell.replace(/\s+/g, '_').replace(/\/+/g, '_or_').toLowerCase()}`)
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
            let talk = "";
            spell = data;
            if (spell) {
                let speechOutput = `${spell.name} is a ${spell.type}`;
                if (spell.damage) {
                    speechOutput = `${speechOutput} which does ${spell.damage}`
                }

                let responseInput = {
                        output: speechOutput,
                        richOutput: {
                            items: []
                        }
                    },
                    table = {
                        "title": spell.name,
                        "subtitle": spell.type,
                        "rows": [],
                        "columnProperties": [
                            {
                                header: ""
                            }, {
                                header: ""
                            }
                        ]
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

                let suggestions = [
                    {
                        "title": `describe it`
                    }
                ];

                if (spell.damage) {
                    suggestions.push({"title": `what damage does it do`});
                }
                if (spell.components.material) {
                    suggestions.push({"title": `what materials do I need`});
                }
                if (spell.higher_levels) {
                    suggestions.push({"title": `how does it level up`});
                }

                if (!table.rows.length) {
                    responseInput.richOutput.items.push({"tableCard": table});
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

                talk = setResponse(responseInput, suggestions);
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

    // if(request.body.originalDetectIntentRequest.source === 'slack' && request.body.originalDetectIntentRequest.payload.data.event.text.substring(0, request.body.originalDetectIntentRequest.payload.data.authed_users[0].length + 3) !== `<@${request.body.originalDetectIntentRequest.payload.data.authed_users[0]}>`) {
    //     console.log('ignoring slack');
    // } else {
    agent.handleRequest(intentMap);

    
});