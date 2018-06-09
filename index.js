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
        console.log(request);
        response.send('Problem with the resuest.body. Check the console.log');
    }
};

const tools = {
    getSpell: () => {
        return db.collection('spells').doc(spellName.replace(/\s+/g, '_').replace(/\/+/g, '_or_').toLowerCase()).get();
    },
    querySpell: (key, value, limit = 5, operator = '==', order = 'name') => {
        return db.collection('spells').where(key, operator, value).limit(limit).get();
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
    cleanText: text => {
        return text.replace(/\*+/g, '').replace(/\_+/g, '');
    },
    setResponse: (request, input, suggestions = []) => {
        if (typeof input === 'string') {
            input = {
                speech: input
            };
        }
        let res = {
            fulfillmentText: input.speech,
            fulfillmentMessages: []
        };
        res.payload = {
            google: {
                expectUserResponse: true,
                richResponse: {
                    items: [{
                        simpleResponse: {
                            textToSpeech: input.speech ? input.speech : input.text,
                            displayText: input.text ? input.text : input.speech
                        }
                    }]
                }
            },
            slack: {
                text: tools.formatText(input.speech, 'slack')
            }
        };
        if (input.card) {
            res = tools.buildCard(res, input.card);
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
    },
    buildButtons: (input, platform = 'google') => {
        let buttons = [],
            output = false,
            button;
        switch (platform) {
            case ('dialogflow'):
                buttons = [];
                input.forEach(btn => {
                    button = {};
                    input.title ? button.title = input.title : null;
                    input.url ? button.postback = input.url : null;
                    buttons.push(button);
                });
                output = buttons;
                break;
            case ('google'):
                buttons = [];
                input.forEach(btn => {
                    button = {};
                    input.title ? button.title = input.title : null;
                    input.url ? button.openUrlAction = {
                        url: input.url
                    } : null;
                    buttons.push(button);
                });
                output = buttons;
                break;
            case ('slack'):
                actions = [];
                input.forEach(btn => {
                    button = {};
                    if (input.title) {
                        button.text = input.title;
                        button.type = input.title;
                        button.value = input.title;
                    }
                    actions.push(button);
                });
                output = actions;
                break;
        }
        return output;
    },
    formatText: (input, platform = 'slack') => {
        let output = null;
        if (input && input.length) {
            switch (platform) {
                case ('slack'):
                    output = input.replace(/\*\*+/g, '*');
                    break;
            }
        }
        return output;
    },
    buildCard: (output, input, platforms = ['dialogflow', 'google', 'slack']) => {
        let card;

        if (platforms.includes('dialogflow')) {
            card = {};
            input.title ? card.title = input.title : null;
            input.text ? card.subtitle = input.text : null;
            input.image ? card.imageUri = input.imageUri : null;
            input.buttons && input.buttons.length ? card.buildButtons(input.buttons, 'dialogflow') : null;
            output.fulfillmentMessages.push({
                card
            });
        }
        if (platforms.includes('google')) {
            card = {};
            input.title ? card.title = input.title : null;
            input.subtitle ? card.subtitle = input.subtitle : null;
            input.text ? card.formattedText = input.text : null;
            input.image ? card.image_url = input.image : null;
            output.payload.google.richResponse.items.push({
                basicCard: card
            });
        }
        if (platforms.includes('slack')) {
            card = {};
            input.title ? card.title = input.title : null;
            input.subtitle ? card.author_name = input.subtitle : null;
            input.text ? card.text = input.text : null;
            input.image ? card.image = {
                url: input.image,
                accessibilityText: input.title ? input.title : null
            } : null;
            input.buttons && input.buttons.length ? card.actions = buildButtons(input.buttons, 'slack') : null;
            input.suggestions && input.suggestions.length ? card.push(buildButtons(input.suggestions, 'slack')) : null;
            if (!output.payload.slack.attachments || !output.payload.slack.attachments.length) {
                output.payload.slack.attachments = [];
            }
            output.payload.slack.attachments.push(card);
        }

        return output;
    },
    listByLevel: (level, list) => {
        let spells = [],
            output = `I don't know any level ${level} spells.`,
            levelName = `Level ${level} spell`,
            listSize = list.size,
            readLimit = listSize > 1 ? 3 : 5,
            readCounter = 0;

        list.forEach(spell => {
            if (readCounter <= readLimit) {
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

        if (spells.length) {
            output = `${levelName} ${spells.join(", ")}`;
            if (listSize > readLimit) {
                output = `${output} and ${listSize - readLimit} others.`;
            }
        }

        return output;
    },
    listByClass: (theClass, list) => {
        let output = {
                speech: `I don't know any ${theClass} spells.`,
                data: []
            },
            listSize = list.size,
            readLimit = listSize > 1 ? 3 : 5,
            readCounter = 0,
            className = listSize > 1 ? `${theClass} spells include` : `${theClass} spell is`;

        list.forEach(spell => {
            if (readCounter <= readLimit) {
                output.data.push(`${spell.data().name}`);
                readCounter = readCounter + 1;
            } else {
                list = null;
            }
        });

        if (output.data.length) {
            output.speech = `${className} ${output.data.join(", ")}`;
            if (listSize > readLimit) {
                output.speech = `${output.speech} and ${listSize - readLimit} others.`;
            }
        }

        output.size = listSize;
        output.className = theClass;

        return output;
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
                speech = "This spell has no duration.";

            if (spell && spell.duration) {
                speech = `${spell.name} lasts for ${spell.duration}`;
            }

            let suggestions = [{
                "title": `what is ${spell.name}?`
            }];

            if (spell.damage) {
                suggestions.push({
                    "title": `what damage does it do`
                });
            }
            response.json(tools.setResponse(request, speech, suggestions));
        }).catch(err => {
            console.log(err);
        });
    },
    spellDamage: (request, response) => {
        tools.getSpell().then(data => {
            let spell = data.data(),
                speech = "This spell doesn't cause damage.";

            if (spell && spell.damage) {
                speech = `${spell.name} does ${spell.damage}`;
            }

            let suggestions = [{
                "title": `what is ${spell.name}?`
            }];
            if (spell.duration) {
                suggestions.push({
                    "title": `how long does it last?`
                });
            }
            response.json(tools.setResponse(request, speech, suggestions));
        }).catch(err => {
            console.log(err);
        });
    },
    spellInit: (request, response) => {
        tools.getSpell()
            .then(data => {
                let spell = data.data();

                let speechOutput = `${spell.name} is a ${spell.type}`;

                let responseInput = {
                    speech: speechOutput,
                    card: {
                        title: spell.name,
                        subtitle: spell.type,
                        text: spell.description
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
                    if (readCounter <= readLimit) {
                        spells.push(spell.data().name);
                        readCounter = readCounter + 1;
                    } else {
                        list = null;
                    }
                });

                if (spells.length) {
                    output = `The School of ${request.body.queryResult.parameters.School} includes ${spells.join(", ")}`;
                    if (listSize > readLimit) {
                        output = `${output} and ${listSize - 5} others.`;
                    }
                }

                let suggestions = [];
                response.json(tools.setResponse(request, output, suggestions));
            }).catch(err => {
                console.log(err);
            });
        },
        spellClass: (request, response) => {
            let classes = request.body.queryResult.parameters.Class;

            let talk = "",
                outputs = [],
                suggestions = [],
                queries = [],
                level;
            classes.forEach((theClass) => {
                queries.push(
                    tools.querySpell(`class.${theClass.toLowerCase()}`, true, 1000).then(list => {
                        let output = tools.listByClass(theClass, list);
                        outputs.push(output);
                    }).catch(err => {
                        console.log(err);
                    })
                );
            });

            Promise.all(queries).then(() => {
                let respond = {
                        speech: []
                    };
                outputs.forEach(theResponse => {
                    respond.speech.push(theResponse.speech);
                });

                respond.speech = respond.speech.join('\n');
                response.json(tools.setResponse(request, respond));
            }).catch(err => {
                console.log(err);
            });

        },
        spellLevel: (request, response) => {
            let levels = request.body.queryResult.parameters.Level;

            let talk = "",
                outputs = [],
                suggestions = [],
                queries = [],
                level;
            levels.forEach((lvl) => {
                queries.push(
                    tools.querySpell('level', parseInt(lvl), 1000).then(list => {
                        let output = tools.listByLevel(lvl, list);
                        outputs.push(output);
                    }).catch(err => {
                        console.log(err);
                    })
                );
            });

            Promise.all(queries).then(() => {
                outputs = outputs.join('.\n    ');
                response.json(tools.setResponse(request, outputs, suggestions));
            }).catch(err => {
                console.log(err);
            });
        }
    }

};


process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.google_application_credentials;

ex.use(bodyParser.json());
ex.post('/', webhook);
ex.listen((process.env.PORT || 3000), () => console.log('Spell Book is open'));