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
    condition: (params = global.params) => {
        return tools.getCollection({collection: 'conditions', param: 'condition', customParams: {condition: [params.condition[0]]}})
            .then(data => {
                let condition = data,
                    sugg = [],
                    talk = sak.i18n(i18n.condition.notFound);
                if (condition) {
                  talk = {
                      speech: `With ${params['condition'][0]} ${condition.description}`,
                      card: {
                          title: params['condition'][0],
                          text: condition.description
                      }
                  };

                  // if the condition is exhaustion, suggest there's more detail
                  if (condition.levels && condition.levels.length) {
                      // if the condition is exhaustion, check if a level is being asked for
                      if (params.level) {
                          delete talk.card;
                          // check if the level exists
                          if (condition.levels[parseInt(params.level) - 1]) {
                              talk.speech = `Level ${params.level} Exhaustion results in ${condition.levels[params.level - 1].toLowerCase()}`;
                              talk.text = `${condition.levels[params.level - 1]}`;
                          } else {
                              talk.speech = `Exhaustions levels only go up to 6`;
                          }
                      }
                      sugg.push(`what's level ${sak.rng(6)} exhaustion`);
                  }

                  if (condition.long_description) {
                    sugg.push('Tell me more');
                  }
                } else {
                  talk = sak.i18n(i18n.server.timeOut);
                }

                return response.json(tools.setResponse(talk, sugg));
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
    whatProperty: (intention = global.intention, responses = ['speech','text']) => {
        if (Array.isArray(params['spell']) && params['spell'].length > 1) {
            return response.json(tools.setResponse(sak.i18n(i18n.tools.oneAtATime)));
        } else {
            return tools.getCollection()
                .then(data => {
                    let spell = data;
                    if (spell) {
                        let talk = {
                            speech: sak.i18n(i18n.spell.what[intention].doesntHaveProperty ? i18n.spell.what[intention].doesntHaveProperty : i18n.spell.notFound, {
                                spellName: spell.name
                            })
                        };

                        if (spell[intention] || intention === 'init') {
                            let args = tools.formatWhatData(spell, intention);
                            args.spellName = spell.name;
                            talk.speech = sak.i18n(i18n.spell.what[intention].hasProperty, args);
                        }

                        if (responses) {
                            if (responses.includes('card')) {
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

                        talk = tools.setResponse(talk, tools.getSuggestions(sugg, spell, 'Would you like to know '));
                        return response.json(talk);
                    } else {
                        return response.json(tools.setResponse(sak.i18n(i18n.spell.notFound)));
                    }
                }).catch(err => {
                    console.log(err);
                });
        }
    },
};
