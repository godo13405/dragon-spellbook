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
        tools.getCollection().then(data => {
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
            response.json(tools.setResponse(speech, suggestions));
        }).catch(err => {
            console.log(err);
        });
    },
    spellDescription: () => {
        tools.getCollection()
            .then(data => {
                let spell = data.data();

                let responseInput = {
                    speech: spell.description
                };


                response.json(tools.setResponse(responseInput, tools.getSuggestions([
                    'damage',
                    'materials',
                    'higher_levels'
                ], spell)));
            }).catch(err => {
                console.log(err);
            });
    },
    spellInit: () => {
        tools.getCollection()
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


                response.json(tools.setResponse(responseInput, tools.getSuggestions([
                    'damage',
                    'materials',
                    'higher_levels'
                ], spell, 'Would you like to know ')));
            }).catch(err => {
                console.log(err);
            });
    },
    condition: () => {
        tools.getCollection('conditions', 'Condition')
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
                if (params.Condition === 'Exhaustion') {

			        // if the condition is exhaustion, check if a level is being asked for
			        if (params.Level) {
			        	delete responseInput.card;
			        	// check if the level exists
			        	if (condition.levels && condition.levels[params.Level - 1]) {
			        		responseInput.speech = `Level ${params.Level} exhaustion results in ${condition.levels[params.Level - 1]}`;
			        		responseInput.text = `${condition.levels[params.Level - 1]}`;
			        	} else {
			        		responseInput.speech = 'Exhaustions levels only go from 1 to 6';
			        	}
			        }
                	sugg.push(`what's level ${sak.rng(6)} exhaustion`);
                }

                response.json(tools.setResponse(responseInput, sugg));
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
        spellDamage: () => {
            tools.getCollection()
                .then(data => {
                    let spell = data.data(),
                        output = [];
                    if (spell.damage && spell.damage.length) {
                        for (var i = spell.damage.length - 1; i >= 0; i--) {
                            let o = `${spell.damage[i].amount ? spell.damage[i].amount : ''}${spell.damage[i].dice ? spell.damage[i].dice : ''} ${spell.damage[i].type ? spell.damage[i].type : ''} damage${spell.damage[i].extra ? ' and ' + spell.damage[i].extra : ''}`;
                            output.push(o);
                        }

                        response.json(tools.setResponse(`${spell.name} does ${output.join(" and ")}`, tools.getSuggestions([
                            'description',
                            'materials',
                            'higher_levels'
                        ], spell, 'Would you like to know ')));
                    } else {
                        response.json(tools.setResponse(`${spell.name} doesn't cause any damage.`, tools.getSuggestions([
                            'description',
                            'materials',
                            'higher_levels'
                        ], spell, 'Would you like to know ')));
                    }
                }).catch(err => {
                    console.log(err);
                });
        },
    }
};