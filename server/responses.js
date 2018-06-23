'use strict';

exports = module.exports = {
    welcome: () => {
        let talk = tools.setResponse(sak.i18n(i18n.welcome.say), tools.getSuggestions([
            `what is Acid Splash`,
            `what damage does Harm do`
        ], undefined, 'You can ask me stuff like '));
        return response.json(talk);
    },
    fallback: () => {
        let talk = tools.setResponse(sak.i18n(i18n.fallback.say));
        return response.json(talk);
    },
    spellInit: () => {
        let output = tools.getCollection()
            .then(data => {
                let spell = data,
                    responseInput = {
                        speech: `${spell.name} is a ${spell.type}`,
                        card: {
                            title: spell.name,
                            subtitle: spell.type,
                            text: spell.description
                        }
                    },
                    talk = tools.setResponse(responseInput, tools.getSuggestions([
                        'damage',
                        'materials',
                        'higher_levels'
                    ], spell, 'Would you like to know '));
                return response.json(talk);
            }).catch(err => {
                console.log(err);
            });
        return output;
    },
    condition: (params = params) => {
        return tools.getCollection('conditions', 'Condition')
            .then(data => {
                let condition = data,
                    sugg = [];

                let responseInput = {
                    speech: `With ${params.Condition} ${condition.description}`,
                    card: {
                        title: params.Condition,
                        text: condition.description
                    }
                };

                // if the condition is exhaustion, suggest there's more detail
                if (condition.levels && condition.levels.length) {

                    // if the condition is exhaustion, check if a level is being asked for
                    if (params.Level) {
                        delete responseInput.card;
                        // check if the level exists
                        if (condition.levels[parseInt(params.Level) - 1]) {
                            responseInput.speech = `Level ${params.Level} exhaustion results in ${condition.levels[params.Level - 1]}`;
                            responseInput.text = `${condition.levels[params.Level - 1]}`;
                        } else {
                            responseInput.speech = `Exhaustions levels only go up to 6`;
                        }
                    }
                    sugg.push(`what's level ${sak.rng(6)} exhaustion`);
                }

                return response.json(tools.setResponse(responseInput, sugg));
            }).catch(err => {
                console.log(err);
            });
    },
    query: {
        spellComplex: () => {
            let q = tools.getQuery();
            if (q) {
                tools.querySpell(q).then(list => {
                    // set suggestions
                    let sugg = {
                        text: [
                            `which are level ${sak.rng()}`
                        ],
                        speech: [
                            `tell you which are level ${sak.rng()}`
                        ]
                    };

                    // if they are a manageable number, offer to read them out loud
                    if (list.size <= 10) {
                        sugg.text.push('read them all out');
                        sugg.speech.push('read them all out');
                    }


                    let output = tools.setResponse(tools.listComplex(list, 'summary'), tools.getSuggestions(sugg), 2);
                    response.json(output);
                }).catch(err => {
                    console.log(err);
                });
            }
        },
        countComplex: () => {
            let q = tools.getQuery(true);
            if (q) {
                tools.querySpell(q).then(list => {
                    // set suggestions
                    let sugg = {
                        text: [
                            `which are level ${sak.rng()}`
                        ],
                        speech: [
                            `tell you which are level ${sak.rng()}`
                        ]
                    };

                    // if they are a manageable number, offer to read them out loud
                    if (list.size <= 10) {
                        sugg.text.push('read them all out');
                        sugg.speech.push('read them all out');
                    }


                    let output = tools.setResponse(tools.listComplex(list), tools.getSuggestions(sugg), 2);
                    response.json(output);
                }).catch(err => {
                    console.log(err);
                });
            }
        }
    },
    whatProperty: (intention = intention, richResponses) => {
        if (Array.isArray(params['spell']) && params['spell'].length > 1) {
            return response.json(tools.setResponse(sak.i18n(i18n.tools.oneAtATime)));
        } else {
            return tools.getCollection()
                .then(data => {
                    let spell = data;
                    if (spell) {
                        let talk = {
                            speech: sak.i18n(i18n.spell.what[intention].doesntHaveProperty, {
                                spellName: spell.name
                            })
                        };

                        if (spell[intention]) {
                            let args = tools.formatWhatData(spell, intention);
                            args.spellName = spell.name;
                            talk.speech = sak.i18n(i18n.spell.what[intention].hasProperty, args);
                        }

                        if (richResponses) {
                            if (richResponses.card) {
                                talk.card = {
                                    title: spell.name,
                                    subtitle: spell.type,
                                    text: spell.description
                                };
                            }
                        }

                        let sugg = suggestions[intention] || [
                            'description',
                            'materials',
                            'higher_levels'
                        ];

                        for (var i = sugg.length - 1; i >= 0; i--) {
                            sugg[i] = sak.i18n(sugg[i]);
                        }
                        console.log(intention, talk)
                        return response.json(tools.setResponse(talk, tools.getSuggestions(sugg, spell, 'Would you like to know ')));
                    } else {
                        return response.json(tools.setResponse(sak.i18n(i18n.spell.notFound)));
                    }
                }).catch(err => {
                    console.log(err);
                });
        }
    },
};