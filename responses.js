'use strict';

exports = module.exports = {
    welcome: () => {
        let talk = tools.setResponse(`Hi! What spell do you want to know about?`, tools.getSuggestions([
            `what is Acid Splash`,
            `what damage does Harm do`
        ], undefined, 'You can ask me stuff like '));
        response.json(talk);
    },
    fallback: () => {
        let talk = tools.setResponse(`Sorry, I didn't get that, can you try again?`);
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
            response.json(tools.setResponse(speech, suggestions));
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
        tools.getSpell()
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
    query: {
        spellComplex: () => {
            let q = tools.getQuery();
            if (q) {
                tools.querySpell(q).then(list => {
                    // set suggestions
                    let sugg = {
                        text: [
                            `which are level ${Math.ceil(Math.random()*9)}`
                        ],
                        speech: [
                            `tell you which are level ${Math.ceil(Math.random()*9)}`
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
                            `which are level ${Math.ceil(Math.random()*9)}`
                        ],
                        speech: [
                            `tell you which are level ${Math.ceil(Math.random()*9)}`
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
            tools.getSpell()
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
        spellDamage: () => {
            tools.getSpell()
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