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

                let speechOutput = `${spell.name} is a ${spell.type}`;

                let responseInput = {
                    speech: speechOutput,
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
                if (request.body.queryResult.parameters[k] && request.body.queryResult.parameters[k].length) {
                	if (request.body.queryResult.parameters[k].length > 1) {
                		response.json(tools.setResponse(`Sorry, can we do this one ${k.toLowerCase()} at a time?`));
                		break;
                	} else {
                    	keys[k] = request.body.queryResult.parameters[k][0];
                    	params[k] = [keys[k]];
                    }
                } else if (params[k]) {
                    keys[k] = params[k];
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
                }
            };

            tools.querySpell(queryWhere).then(list => {
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


                let output = tools.setResponse(tools.listComplex(keys, keysSetup, list), tools.getSuggestions(sugg), 2);
                response.json(output);
            }).catch(err => {
                console.log(err);
            });
        },
        countComplex: () => {
        	
        }
    }
};