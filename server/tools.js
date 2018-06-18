'use strict';

const keysSetup = {
        Class: {
            deep: true,
            phrase: false
        },
        Level: {
            deep: false,
            phrase: 'level ',
            phraseLevel: 0
        },
        School: {
            deep: false,
            phrase: 'school of ',
            phraseLevel: 1
        }
    };

exports = module.exports = {
    getQuery: (multipleAllowed = false, request = request) => {
        // check how many parameters are defined
        let output = [];

        for (let kParam in request.body.queryResult.parameters) {
            let thisParam = request.body.queryResult.parameters[kParam];

            if (!multipleAllowed) {
                if (thisParam.length > 1) {
                    response.json(tools.setResponse(i18n.tools.oneAtATime.replace(/<param>/g, kParam.toLowerCase())));
                    return false;
                }
            }
            for (var i = thisParam.length - 1; i >= 0; i--) {
                output.push(tools.queryArgumentBuild(thisParam[i], kParam));
            }
        }

        return output;
    },
    queryArgumentBuild: (input, className) => {
        // is it a direct comparison, or do I need to look in an object?
        let output = `${className.toLowerCase()}`;
        if (keysSetup[className].deep) {
            output = `${className}.${input.toLowerCase()}`;
        }

        output = [
            output,
            '==',
            keysSetup[className].deep ? true : input.toLowerCase()
        ];

        return output;
    },
    getCollection: (collection = 'spells', param = 'spell') => {
        return db.collection(collection)
            .doc(params[param].replace(/\s+/g, '_')
            .replace(/\/+/g, '_or_').toLowerCase())
            .get();
    },
    querySpell: (where, limit, order = 'name') => {
        let output = db.collection('spells'),
            log = [];
        for (var i = where.length - 1; i >= 0; i--) {
            output = output.where(where[i][0], where[i][1], where[i][2]);
        }

        if (limit) {
            output = output.limit(limit);
        }

        return output.get();
    },
    /*
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
    */
    getSuggestions: (input = [], spell = {name: params.Spell}, suggestionIntro = 'I can also tell you') => {
        let output = [];

        // if speech variant has't been defined, clone text
        if (Array.isArray(input)) {
            input = {
                text: input,
                speech: input
            };
        }

        if (spell) {
            if (capabilities.screen) {
                if (input.text.includes('description') && spell.description) {
                    output.push({
                        "title": `what is ${spell.name}?`
                    });
                }
                if (input.text.includes('damage') && spell.damage) {
                    output.push({
                        "title": `what damage does it do?`
                    });
                }
                if (input.text.includes('duration') && spell.duration) {
                    output.push({
                        "title": `how long does it last?`
                    });
                }
                if (input.text.includes('cast_time') && spell.cast_time) {
                    output.push({
                        "title": `how long does it take to cast?`
                    });
                }
                if (input.text.includes('materials') && spell.components && spell.components.material) {
                    output.push({
                        "title": `what materials do I need`
                    });
                }
                if (input.text.includes('higher_levels') && spell.higher_levels) {
                    output.push({
                        "title": `how does it level up`
                    });
                }
            } else if (capabilities.audio) {
                if (input.speech.includes('description') && spell.description) {
                    output.push({
                        "title": `what it is`
                    });
                }
                if (input.speech.includes('damage') && spell.damage) {
                    output.push({
                        "title": `what damage it does`
                    });
                }
                if (input.speech.includes('duration') && spell.duration) {
                    output.push({
                        "title": `how long it lasts`
                    });
                }
                if (input.speech.includes('cast_time') && spell.cast_time) {
                    output.push({
                        "title": `how long it takes to cast`
                    });
                }
                if (input.speech.includes('materials') && spell.components && spell.components.material) {
                    output.push({
                        "title": `what materials it needs`
                    });
                }
                if (input.speech.includes('higher_levels') && spell.higher_levels) {
                    output.push({
                        "title": `how it levels up`
                    });
                }
            }
        } else {
            if (capabilities.screen) {
                input.text.forEach(sugg => {
                    output.push({
                        "title": sugg
                    });
                });
            } else if (capabilities.audio) {
                input.speech.forEach(sugg => {
                    output.push({
                        "title": sugg
                    });
                });
            }
        }

        // prevent too many suggestions
        output = sak.shuffleArray(output, 3);

        // structure voice suggestions
        if (!capabilities.screen && capabilities.audio) {
            let sugg = '';
            for (var i = output.length - 1; i >= 0; i--) {
                sugg = sugg + output[i].title;
                if (i === 1) {
                    sugg = sugg + " or ";
                } else if (i > 1) {
                    sugg = sugg + ', ';
                }
            }
            output = `${suggestionIntro} ${sugg}`;
        }

        return output;
    },
    setResponse: (input, suggestions = [], pause = 5) => {
        if (typeof input === 'string') {
            input = {
                speech: input
            };
        }

        // no text? take the speech
        if (!input.text && input.speech)
            input.text = sak.clearSpeech(input.speech);
        // no speech? take the text
        if (!input.speech && input.text)
            input.speech = input.text;

        // if it doesn't have a screen, read out the suggestions
        if (suggestions.length && !capabilities.screen && capabilities.audio) {
            input.speech = `${input.speech}.<break time='${pause}s'/>${suggestions}`;
        }

        let output = {
            fulfillmentText: input.text,
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
                text: sak.formatText(input.text, 'slack')
            }
        };
        if (input.card) {
            output = tools.buildCard(output, input.card);
        }
        if (suggestions.length && capabilities.screen) {
            output.payload.google.richResponse.suggestions = suggestions;
        }

        // set contexts
        output.outputContexts = [{
            "name": `${request.body.session}/contexts/spell`,
            "lifespanCount": 5,
            "parameters": params
        }];

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
    addPhrase: (level = 0) => {
        let output = '';
        for (let k in params) {
            if (params[k].length) {
                let out = params[k];
                if (keysSetup[k] && keysSetup[k].phrase && keysSetup[k].phrase.length && keysSetup[k].phraseLevel === level) {
                    out = keysSetup[k].phrase + out;
                }
                output = output + ' ' + out;
            }
        }
        output = sak.cleanText(output);

        return output;
    },
    listComplex: (listRaw, verboseLevel) => {
        let keyPhrase = tools.addPhrase();

        let output = {
                speech: `I don't know any ${keyPhrase} spells.`,
                data: []
            },
            listSize = listRaw && listRaw.size ? listRaw.size : 0,
            shortList = listRaw && listRaw.docs ? sak.shuffleArray(listRaw.docs, 4) : null;

        switch (true) {
            case (!listSize):
                output.speech = `I don't know any ${keyPhrase} spells.`;
                break;
            case (listSize === 1):
                output.speech = `There is only 1 ${keyPhrase} spell.`;
                break;
            case (listSize >1):
                output.speech = `There are ${listSize} ${keyPhrase} spells.`;
                break;
        }

        if (verboseLevel) {
            let className = listSize > 1 ? `There are ${listSize} ${keyPhrase} spells, <break time='350ms' /> including` : `The only ${keyPhrase} spell is`;

            if (listSize) {
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
        }

        output.size = listSize;
        output.keyPhrase = keyPhrase;

        return output;
    }
};