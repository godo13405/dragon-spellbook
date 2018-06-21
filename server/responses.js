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
    spellDescription: (sugg = ['damage', 'materials', 'higher_levels']) => {
        return tools.getCollection()
            .then(data => {
                let spell = data.data();

                let responseInput = {
                    speech: spell.description
                };


                return response.json(tools.setResponse(responseInput, tools.getSuggestions(sugg), spell));
            }).catch(err => {
                console.log(err);
            });
    },
    spellInit: () => {
        return tools.getCollection()
            .then(data => {
                let spell = data.data();

                let responseInput = {
                    speech: `${spell.name} is a ${spell.type}`,
                    card: {
                        title: spell.name,
                        subtitle: spell.type,
                        text: spell.description
                    }
                };

                let talk = tools.setResponse(responseInput, tools.getSuggestions([
                    'damage',
                    'materials',
                    'higher_levels'
                ], spell, 'Would you like to know '));
                return response.json(talk);
            }).catch(err => {
                console.log(err);
            });
    },
    condition: (params = params) => {
        return tools.getCollection('conditions', 'Condition')
            .then(data => {
                let condition = data.data(),
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
    whatProperty: () => {
        if (Array.isArray(params['spell']) && params['spell'].length > 1) {
            return response.json(tools.setResponse(sak.i18n(i18n.tools.oneAtATime)));
        } else {
            return tools.getCollection()
                .then(data => {
                    let spell = data.data();
                    if (spell) {
                        let talk = sak.i18n(i18n.spell.what[intention].doesntHaveProperty, {
                            spellName: spell.name
                        });
                        if (spell[intention]) {
                            let args = tools.formatWhatData(spell, intention);
                            args.spellName = spell.name;
                            talk = sak.i18n(i18n.spell.what[intention].hasProperty, args);
                        }

                        let sugg = suggestions[intention] || [
                            'description',
                            'materials',
                            'higher_levels'
                        ];
                        for (var i = sugg.length - 1; i >= 0; i--) {
                            sugg[i] = sak.i18n(sugg[i]);
                        }

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