'use strict';

exports = module.exports = {
    getSpell: () => {
        return db.collection('spells').doc(spellName.replace(/\s+/g, '_').replace(/\/+/g, '_or_').toLowerCase()).get();
    },
    querySpell: (where, limit, order = 'name') => {
        let output = db.collection('spells'),
        log = [];

        for (var i = where.length - 1; i >= 0; i--) {
            output = output.where(where[i][0], where[i][1], where[i][2]);
            log.push([where[i][0], where[i][1], where[i][2]]);
        }

        if (limit) {
            output = output.limit(limit);
        }

        return output.get();
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
    getSuggestions: (input = [], spell = null, suggestionIntro = 'I can also tell you ') => {
        let suggestions = [];

        if (spell) {
            if (input.includes('description') && spell.description) {
                if (capabilities.includes('SCREEN_OUTPUT')) {
                    suggestions.push({
                        "title": `what is ${spellName}?`
                    });
                } else if (capabilities.includes('AUDIO_OUTPUT')){
                    suggestions.push({
                        "title": `what it is`
                    });
                }
            }
            if (input.includes('damage') && spell.damage) {
                if (capabilities.includes('SCREEN_OUTPUT')) {
                    suggestions.push({
                        "title": `what damage does it do?`
                    });
                } else if (capabilities.includes('AUDIO_OUTPUT')){
                    suggestions.push({
                        "title": `what damage it does`
                    });
                }
            }
            if (input.includes('duration') && spell.duration) {
                if (capabilities.includes('SCREEN_OUTPUT')) {
                    suggestions.push({
                        "title": `how long does it last?`
                    });
                } else if (capabilities.includes('AUDIO_OUTPUT')){
                    suggestions.push({
                        "title": `how long it lasts`
                    });
                }
            }
            if (input.includes('cast_time') && spell.cast_time) {
                if (capabilities.includes('SCREEN_OUTPUT')) {
                    suggestions.push({
                        "title": `how long does it take to cast?`
                    });
                } else if (capabilities.includes('AUDIO_OUTPUT')){
                    suggestions.push({
                        "title": `how long it takes to cast`
                    });
                }
            }
            if (input.includes('materials') && spell.components && spell.components.material) {
                if (capabilities.includes('SCREEN_OUTPUT')) {
                    suggestions.push({
                        "title": `what materials do I need`
                    });
                } else if (capabilities.includes('AUDIO_OUTPUT')){
                    suggestions.push({
                        "title": `what materials it needs`
                    });
                }
            }
            if (input.includes('materials') && spell.higher_levels) {
                if (capabilities.includes('SCREEN_OUTPUT')) {
                    suggestions.push({
                        "title": `how does it level up`
                    });
                } else if (capabilities.includes('AUDIO_OUTPUT')){
                    suggestions.push({
                        "title": `how it levels up`
                    });
                }
            }
        } else {
            input.forEach(sugg => {
                suggestions.push({
                    "title": sugg
                });
            });
        }

        // prevent too many suggestions
        suggestions = sak.shuffleArray(suggestions, 3);

        // structure voice suggestions
        if (capabilities !== undefined && !capabilities.includes('SCREEN_OUTPUT') && capabilities.includes('AUDIO_OUTPUT')) {
            let sugg = '';
            for (var i = suggestions.length - 1; i >= 0; i--) {
                sugg = sugg + suggestions[i].title;
                if (i === 1) {
                    sugg = sugg + " or ";
                } else if (i > 1){
                    sugg = sugg + ', ';
                }
            }
            suggestions = `${suggestionIntro} ${sugg}`;
        }

        return suggestions;
    },
    setResponse: (input, suggestions = []) => {
        if (typeof input === 'string') {
            input = {
                speech: input
            };
        }

        // no text? take the speech
        if (!input.text && input.speech)
            input.text = input.speech;
        // no speech? take the text
        if (!input.speech && input.text)
            input.speech = input.text;

        // if it doesn't have a screen, read out the suggestions
        if (suggestions.length && !capabilities.includes('SCREEN_OUTPUT') && capabilities.includes('AUDIO_OUTPUT')) {
            input.speech = `${input.speech}.<break time='5s'/>${suggestions}`;
        }

        let output = {
            fulfillmentText: input.speech,
            fulfillmentMessages: []
        };
        output.payload = {
            google: {
                expectUserResponse: true,
                is_ssml: true,
                richResponse: {
                    items: [{
                        simpleResponse: {
                            textToSpeech: `<speech>${sak.cleanText(input.speech)}</speech>`,
                            displayText: sak.cleanText(sak.clearSpeech(input.text))
                        }
                    }]
                }
            },
            slack: {
                text: sak.formatText(input.speech, 'slack')
            }
        };
        if (input.card) {
            output = tools.buildCard(output, input.card);
        }
        if (suggestions.length  && capabilities.includes('SCREEN_OUTPUT')) {
            output.payload.google.richResponse.suggestions = suggestions;
        }
        if (spellName) {
            output.outputContexts = [{
                "name": `${request.body.session}/contexts/spell`,
                "lifespanCount": 5,
                "parameters": {
                    name: spellName
                }
            }];
        }
        return output;
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
    listByClass: (theClass, listRaw) => {
        let output = {
                speech: `I don't know any ${theClass} spells.`,
                data: []
            },
            listSize = listRaw && listRaw.size ? listRaw.size : 0,
            shortList = listRaw && listRaw.docs ? sak.shuffleArray(listRaw.docs, 4) : null,
            className = listSize > 1 ? `There are ${listSize} ${theClass} spells, <break time='350ms' /> including` : `${theClass} spell is`;

        if (listSize) {
            output.speech = '';
            for (var i = shortList.length - 1; i >= 0; i--) {
                output.speech = output.speech + shortList[i]._fieldsProto.name.stringValue;
                if (i === 1) {
                    output.speech = output.speech + ' and ';
                } else if (i > 1) {
                    output.speech = output.speech + ', ';
                }
                console.log(i, shortList[i]._fieldsProto.name.stringValue, output.speech);
            }
            output.speech = `${className} ${output.speech}`;
        }

        output.size = listSize;
        output.className = theClass;


        return output;
    },
    listComplex: (keys, keysSetup, listRaw) => {
        let keyPhrase = '';
        for (let k in keys) {
            if(keys[k]) {
                let out = keys[k];
                if (keysSetup[k] && keysSetup[k].phrase && keysSetup[k].phrase.length) {
                    out = keysSetup[k].phrase + out;
                }
                keyPhrase = keyPhrase + ' ' + out;
            }
        };

        let output = {
                speech: `I don't know any ${keyPhrase} spells.`,
                data: []
            },
            listSize = listRaw && listRaw.size ? listRaw.size : 0,
            shortList = listRaw && listRaw.docs ? sak.shuffleArray(listRaw.docs, 4) : null,
            className = listSize > 1 ? `There are ${listSize} ${keyPhrase} spells, <break time='350ms' /> including` : `The only ${keyPhrase} spell is`;

        if (listSize) {
            let spellNames = [];
            output.speech = '';
            for (var i = shortList.length - 1; i >= 0; i--) {
                output.speech = output.speech + shortList[i]._fieldsProto.name.stringValue;
                if (i === 1) {
                    output.speech = output.speech + ' and ';
                } else if (i > 1) {
                    output.speech = output.speech + ', ';
                }
            }
            output.speech = `${className} ${output.speech}`;
        }

        output.size = listSize;
        output.className = keyPhrase;


        return output;
    }
};