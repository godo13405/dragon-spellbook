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
    spellDuration: () => {
        return tools.getCollection().then(data => {
            if (data && data.data && typeof data.data === 'function') {
                let spell = data.data(),
                    speech = sak.i18n(i18n.spell.notFound),
                    suggestions = [];

                if (spell) {
                    if (spell.duration) {
                        speech = `${spell.name} ${spell.duration === 'instantaneous' ? 'is' : 'lasts for'} ${spell.duration}`;
                    } else {
                        speech = sak.i18n(i18n.spell.noDuration)
                    }

                    if (spell.name) {
                        suggestions.push({
                            "title": `what is ${spell.name}?`
                        });
                    }

                    if (spell.damage) {
                        suggestions.push({
                            "title": `what damage does it do`
                        });
                    }
                }
                let talk = tools.setResponse(speech, suggestions);
                return response.json(talk);
            } else {
                return false;
            }
        }).catch(err => {
            console.log(err);
        });
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
                console.log(spell);

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
    what: {
        spellCastTime: () => {
            tools.getCollection()
                .then(data => {
                    let spell = data.data(),
                        output = [];

                    for (var i = spell.casting_time.length - 1; i >= 0; i--) {
                        let o = `${spell.name} takes ${spell.casting_time[i].amount} ${spell.casting_time[i].amount > 1 ? sak.plural(spell.casting_time[i].unit) : spell.casting_time[i].unit} to cast.`;
                        if (spell.casting_time.description) {
                            o = `${o} You can take it ${spell.casting_time.description}`;
                        }
                        output.push(o);
                    }

                    response.json(tools.setResponse(output.join(" or "), tools.getSuggestions([
                        'damage',
                        'materials',
                        'higher_levels'
                    ], spell, 'Would you like to know ')));
                }).catch(err => {
                    console.log(err);
                });
        },
        spellClass: () => {
            tools.getCollection()
                .then(data => {
                    let spell = data.data(),
                        output = [];
                    if (spell.class && Object.keys(spell.class).length) {
                        for (let classy in spell.class) {
                            output.push(sak.plural(classy));
                        }

                        response.json(tools.setResponse(`${spell.name} can be cast by ${sak.combinePhrase(output)}`, tools.getSuggestions([
                            'description',
                            'materials',
                            'higher_levels'
                        ], spell, 'Would you like to know ')));
                    }
                }).catch(err => {
                    console.log(err);
                });
        },
    },
    whatProperty: () => {
        if (Array.isArray(params['spell']) && params['spell'].length > 1) {
            response.json(tools.setResponse(sak.i18n(i18n.tools.oneAtATime)));
        } else {
            tools.getCollection()
                .then(data => {
                    let spell = data.data();
                    if (spell) {
                        let talk = sak.i18n(i18n.spell.what[intention].doesntHaveProperty, {
                            spellName: spell.name
                        });
                        if (spell[intention] && spell[intention].length) {
                            let res = tools.formatWhatData(spell, intention);
                            talk = sak.i18n(i18n.spell.what[intention].hasProperty, {
                                spellName: spell.name,
                                res: res
                            });
                        }
                        response.json(tools.setResponse(talk, tools.getSuggestions([
                            'description',
                            'materials',
                            'higher_levels'
                        ], spell, 'Would you like to know ')));
                    } else {
                        response.json(tools.setResponse(sak.i18n(i18n.spell.notFound)));
                    }
                }).catch(err => {
                    console.log(err);
                });
        }
    },
};