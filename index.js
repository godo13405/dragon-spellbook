'use strict';

const functions = require('firebase-functions'),
    firebase = require('firebase'),
        cors = require('cors')({
        origin: true,
    }),
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
    tools = require('./tools.js');


exports.hook = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({request: request, response: response});
  console.log('Dialogflow response headers: ' + JSON.stringify(response.headers));
  console.log('Dialogflow response body: ' + JSON.stringify(response.body));

    /* get the spell's name from parameters or context */
    let spellName = false;
    if (request.body.queryResult.parameters.spell) {
        spellName = request.body.queryResult.parameters.spell;
    } else if (request.body.queryResult.outputContexts && request.body.queryResult.outputContexts.length) {
        for (var i = request.body.queryResult.outputContexts.length - 1; i >= 0; i--) {
            if (request.body.queryResult.outputContexts[i].name === `spell`) {
                spellName = request.body.queryResult.outputContexts[i].parameters.name;
                break;
            }
        }
    }

    let welcome = (agent) => {
        let talk = tools.spells.setResponse(`Hi! What spell do you want to know about?`, [{
            "title": `what is Acid Splash`
        }, {
            "title": `what damage does Harm do`
        }, ]);
        return response.json(talk);
    },

    fallback = (agent) => {
        let talk = tools.spells.setResponse(`Sorry, I didn't get that, can you try again?`);
        return response.json(talk);
    },

    spellDuration = (agent) => {
        return tools.spells.getSpell(agent, spellName).then((data) => {
            let spell = data;
            let output = "This spell has no duration.";

            if (spell) {
                output = `${spell.name} lasts for ${spell.duration}`;
            }

            let talk = tools.spells.setResponse(output, spellName, tools.spells.getSuggestions([
                'description',
                'damage',
                'cast time'
            ]));
            return response.json(talk);
        });
    },

    spellDamage = (agent) => {
        return tools.spells.getSpell(agent, spellName).then((data) => {
            let spell = data;
            let output = "This spell doesn't cause damage.";

            if (spell) {
                output = `${spell.name} does ${spell.damage}`;
            }

            let talk = tools.spells.setResponse(output, spellName, tools.spells.getSuggestions([
                'description',
                'duration',
                'cast time'
            ]));
            return response.json(talk);
        });
    },

    spellCastTime = (agent) => {
        return tools.spells.getSpell(agent, spellName).then((data) => {
            let spell = data,
                output = "Sorry, I don't know this. Please try again another day.";

            if (spell) {
                output = `${spell.name} takes ${spell.casting_time} to cast`;
            }

            let talk = tools.spells.setResponse(output, spellName, tools.spells.getSuggestions([
                'description',
                'duration',
                'damage'
            ]));
            return response.json(talk);
        });
    },

    spellInit = (agent) => {
        return tools.spells.getSpell(agent, spellName).then(data => {
            let talk = "",
                spell = data.data();
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
                    table.rows.push(tools.spells.buildRow(["Damage", spell.damage]));
                }
                if (spell.saving_throw) {
                    table.rows.push(tools.spells.buildRow(["Saving Throw", spell.range]));
                }
                if (spell.range) {
                    table.rows.push(tools.spells.buildRow(["Range", spell.range]));
                }
                if (spell.casting_time) {
                    table.rows.push(tools.spells.buildRow(["Casting Time", spell.range]));
                }
                if (spell.duration) {
                    table.rows.push(tools.spells.buildRow(["Duration", spell.duration]));
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

                talk = tools.spells.setResponse(responseInput, spellName, tools.spells.getSuggestions([
                    'damage',
                    'duration',
                    'cast time'
                ]));
            } else {
                talk = tools.spells.setResponse("Sorry, spellName, I don't know that spell...");
            }
            console.log(talk);
            return response.status(200).json(talk);
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