'use strict';

exports = module.exports = {
    welcome: () => {
        let talk = tools.setResponse(request, `Hi! What spell do you want to know about?`, tools.getSuggestions([
            `what is Acid Splash`,
            `what damage does Harm do`
        ], undefined, 'You can ask me stuff like '));
        response.json(talk);
    },
    fallback: () => {
        let talk = tools.setResponse(request, `Sorry, I didn't get that, can you try again?`);
        return response.json(talk);
    },
    spellDuration: () => {
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
    spellDamage: () => {
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
    spellDescription: () => {
        tools.getSpell()
            .then(data => {
                let spell = data.data();

                let responseInput = {
                    speech: spell.description
                };


                response.json(tools.setResponse(request, responseInput, tools.getSuggestions([
                    'damage',
                    'materials',
                    'higher_levels'
                ], spell)));
            }).catch(err => {
                console.log(err);
            });
    },
    spellInit: () => {
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


                response.json(tools.setResponse(request, responseInput, tools.getSuggestions([
                    'damage',
                    'materials',
                    'higher_levels'
                ], spell, 'Would you like to know ')));
            }).catch(err => {
                console.log(err);
            });
    },
    query: {
        spellComplex: () => {
            // check how many parameters are defined
            let keys = {
                Class: false,
                Level: false,
                School: false
            },
            keysSetup = {
                Class: {
                    deep: true,
                    phrase: false
                },
                Level: {
                    deep: false,
                    phrase: 'level '
                },
                School: {
                    deep: false,
                    phrase: 'school of'
                }
            },
            queryWhere = [];

            for (let k in keys) {

                // is this key in a context from a previous action?
                let spellContext = false;
                if (request.body.outputContexts) {
                    for (var i = request.body.outputContexts.length - 1; i >= 0; i--) {
                        if (request.body.outputContexts[i] === `${request.body.session}/contexts/spell`){
                            spellContext = request.body.outputContexts[i];
                        }
                    }
                } 
                if (request.body.queryResult.parameters[k] && request.body.queryResult.parameters[k].length) {
                	if (request.body.queryResult.parameters[k].length > 1) {
                		response.json(tools.setResponse(request, `Sorry, can we do this one ${k.toLowerCase()} at a time?`));
                		break;
                	} else {
                    	keys[k] = request.body.queryResult.parameters[k][0];
                    }
                } else if (spellContext && spellContext.parameters[k]) {
                    keys[k] = spellContext.parameters[k];
                }

                // is it a direct comparison, or do I need to look in an object?
                let q = `${k.toLowerCase()}`;
                if (keysSetup[k].deep && keys[k]) {
                    q = `${k.toLowerCase()}.${keys[k].toLowerCase()}`;
                }

                if (keys[k]){
                    queryWhere.push([
                        q,
                        '==',
                        keysSetup[k].deep ? true : keys[k].toLowerCase()
                    ]);
                    console.log('queryWhere: ', queryWhere);
                }
            };

            tools.querySpell(queryWhere).then(list => {
                let output = tools.setResponse(tools.listComplex(keys, keysSetup, list), tools.getSuggestions([
                    `which are level ${Math.ceil(Math.random()*9)}`
                ]));
                response.json(output);
            }).catch(err => {
                console.log(err);
            });
        },
        spellSchool: () => {
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
        spellClass: () => {
            let classes = request.body.queryResult.parameters.Class;

            if (classes.length > 1) {
                response.json(tools.setResponse(request, 'Sorry, can we do this one class at a time?'));
            } else {
                tools.querySpell(`class.${classes[0].toLowerCase()}`, true, 1000).then(list => {
                    let output = tools.listByClass(classes[0], list);
                    response.json(tools.setResponse(request, output, tools.getSuggestions([
                        `which are level ${Math.ceil(Math.random()*9)}`
                    ])));
                }).catch(err => {
                    console.log(err);
                });
            }
        },
        spellLevel: () => {
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