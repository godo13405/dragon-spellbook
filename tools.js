'use strict';
const firebaseAdmin = require('firebase-admin'),
    serviceAccount = require("./service-key.json");

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://dnd-wiki-ca7bd.firebaseio.com/"
});
const db = firebaseAdmin.firestore().collection('spells');

exports.spells = {    
        setResponse: (input, spellName, suggestions = []) => {
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
                    "name": `spell`,
                    "lifespanCount": 5,
                    "parameters": {
                        name: spellName
                    }
                }];
            }
            return res;
        },
        getSuggestions: (input) => {
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
        },
        getSpell: (agent, spellName) => {
            let out = db.doc(spellName.replace(/\s+/g, '_').replace(/\/+/g, '_or_').toLowerCase())
                .get();
            return out;
        },
        querySpell: (agent, value = 'name', key = '') => {
            return new Promise((resolve, reject) => {
                return firebase.database().ref(`/`).orderBy(value).equalTo(key)
                    .once('value', (data) => {
                        if (data.val()) {
                            let spell = data.val();
                            resolve(spell);
                        } else {
                            tools.setResponse("Sorry, I don't know that spell...");
                            resolve(false);
                        }
                    });
            });
        },
        buildRow: (data) => {
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
    };