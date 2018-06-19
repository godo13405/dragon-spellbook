const chai = require('chai'),
    should = chai.should,
    expect = chai.expect,
    assert = chai.assert,
    chaiAsPromised = require('chai-as-promised'),
    server = require('../server/index'),
    fakeRes = {
        json: (input) => {
            return input;
        }
    },
    fakeReq = {
        body: {
            queryResult: {
                action: ''
            },
            originalDetectIntentRequest: {
                payload: {}
            }
        }
    };
chai.use(chaiAsPromised);
global.log = {
    where: [],
    limit: null
};
global.params = {
    spell: 'Acid Splash',
    Condition: 'conditioned'
};
global.db = {
    collection: (input) => {
        let arr = [
            'spells',
            'conditions'
        ];
        if (!arr.includes(input)) {
            return false;
        } else {
            let ret = ({
                where: (a, b, c) => {
                    log.where.push([a, b, c]);
                    return ret;
                },
                limit: input => {
                    log.limit = input;
                    return ret;
                },
                doc: (input) => {
                    return ret;
                },
                get: () => {
                    return log;
                }
            });
            return ret;
        }
    }
};
global.request = {
    body: {
        session: 'sessionId'
    }
};
global.response = {
    json: input => {
        return input;
    }
};

describe('server', () => {
    describe('capabilities', () => {
        it('on Alexa should not include screen', () => {
            let cappy = capabilities,
                req = fakeReq;

            server(req, fakeRes);

            expect(capabilities).not.to.include('screen');
            capabilities = cappy;
        });
        it('on Google should include screen', () => {
            let cappy = capabilities,
                req = fakeReq;

            req.body.originalDetectIntentRequest.source = 'google';
            req.body.originalDetectIntentRequest.payload = {
                surface: {
                    capabilities: [{
                        "name": "actions.capability.SCREEN_OUTPUT"
                    }]
                }
            };

            server(req, fakeRes);

            expect(capabilities).to.include('screen');
            capabilities = cappy;
        });
    });
});
describe('responses', () => {
    let restore = tools.getCollection;
    describe('welcome', () => {
        it('user says nothing, is greeted', () => {
            let req = fakeReq;
            req.body.queryResult.action = "input.welcome";

            let output = server(req, fakeRes);
            expect(output.fulfillmentText).to.equal(i18n.welcome.say);
        });
    });
    describe('fallback', () => {
        it('something goes wrong', () => {
            let req = fakeReq;
            req.body.queryResult.action = "input.unknown";

            let output = server(req, fakeRes);
            expect(i18n.fallback.say).to.be.an('array').that.includes(output.fulfillmentText);
        });
    });
    describe('spellDuration', () => {
        describe('spell has no duration', () => {
            tools.getCollection = () => {
                return new Promise((res, rej) => {
                    res({
                        data: () => {
                            return {
                                name: 'spellName'
                            };
                        }
                    });
                })
            };
            let output = responses.spellDuration(),
                match = i18n.spell.noDuration;
            it('agnostic', () => {
                return expect(output).to.eventually.have.property('fulfillmentText', match);
            });
            it('slack', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.slack.text', match);
            });
            it('google', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
            });
            tools.getCollection = restore;
        });
        describe('spell has a duration', () => {
            tools.getCollection = () => {
                return new Promise((res, rej) => {
                    res({
                        data: () => {
                            return {
                                name: 'spellName',
                                duration: '1 minute'
                            };
                        }
                    });
                })
            };
            let output = responses.spellDuration(),
                match = 'spellName lasts for 1 minute';
            it('agnostic', () => {
                return expect(output).to.eventually.have.property('fulfillmentText', match);
            });
            it('slack', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.slack.text', match);
            });
            it('google', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
            });
            tools.getCollection = restore;
        });
        describe('spell is instantaneousn', () => {
            tools.getCollection = () => {
                return new Promise((res, rej) => {
                    res({
                        data: () => {
                            return {
                                name: 'spellName',
                                duration: 'instantaneous'
                            };
                        }
                    });
                })
            };
            let output = responses.spellDuration(),
                match = 'spellName is instantaneous';
            it('agnostic', () => {
                return expect(output).to.eventually.have.property('fulfillmentText', match);
            });
            it('slack', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.slack.text', match);
            });
            it('google', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
            });
            tools.getCollection = restore;
        });
    });
    describe('spellDescription', () => {
        describe('output describtion', () => {
            tools.getCollection = () => {
                return new Promise((res, rej) => {
                    res({
                        data: () => {
                            return {
                                description: 'lorem ipsum'
                            }
                        }
                    });
                })
            };
            let output = responses.spellDescription(),
                match = 'lorem ipsum';
            it('agnostic', () => {
                return expect(output).to.eventually.have.property('fulfillmentText', match);
            });
            it('slack', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.slack.text', match);
            });
            it('google', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
            });

            tools.getCollection = restore;
        });
    });
    describe('spellInit', () => {
        describe('summary', () => {
            tools.getCollection = () => {
                return new Promise((res, rej) => {
                    res({
                        data: () => {
                            return {
                                name: 'spellName',
                                type: 'spellType',
                                description: 'lorem ipsum'
                            }
                        }
                    });
                })
            };
            let output = responses.spellInit(),
                match = 'spellName is a spellType';
            it('agnostic text', () => {
                return expect(output).to.eventually.have.property('fulfillmentText', match);
            });
            it('slack text', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.slack.text', match);
            });
            it('google text', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
            });

            it('agnostic card', () => {
                return expect(output).to.eventually.have.deep.nested.property('fulfillmentMessages[0].card', {
                    title: 'spellName',
                    subtitle: 'lorem ipsum'
                });
            });
            it('slack card', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.slack.attachments[0]', {
                    title: 'spellName',
                    author_name: 'spellType',
                    text: 'lorem ipsum'
                });
            });
            it('google card', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.google.richResponse.items[1].basicCard', {
                    title: 'spellName',
                    subtitle: 'spellType',
                    formattedText: 'lorem ipsum'
                });
            });

            tools.getCollection = restore;
        });
    });
    describe('condition', () => {
        describe('describe', () => {
            tools.getCollection = () => {
                return new Promise((res, rej) => {
                    res({
                        data: () => {
                            return {
                                description: 'lorem ipsum'
                            }
                        }
                    });
                })
            };
            let output = responses.condition({Condition:'conditioned', Level:2}),
                match = 'With conditioned lorem ipsum';
            it('agnostic', () => {
                return expect(output).to.eventually.have.property('fulfillmentText', match);
            });
            it('slack', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.slack.text', match);
            });
            it('google', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
            });

            tools.getCollection = restore;
        });
        describe('get Exhaustion level', () => {
            tools.getCollection = () => {
                return new Promise((res, rej) => {
                    res({
                        data: () => {
                            return {
                                levels: [
                                    'not lorem',
                                    'lorem ipsum'
                                ]
                            }
                        }
                    });
                })
            };
            let output = responses.condition({Condition:'Exhaustion', Level:2}),
                match = 'lorem ipsum';
            it('agnostic', () => {
                return expect(output).to.eventually.have.property('fulfillmentText', match);
            });
            it('slack', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.slack.text', match);
            });
            it('google', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
            });
            tools.getCollection = restore;
        });
        describe('get Exhaustion level which doesn\'t exist', () => {
            tools.getCollection = () => {
                return new Promise((res, rej) => {
                    res({
                        data: () => {
                            return {
                                levels: [
                                    'lorem ipsum'
                                ]
                            }
                        }
                    });
                })
            };
            let output = responses.condition({Condition:'Exhaustion', Level:9}),
                match = 'Exhaustions levels only go up to 6';
            it('agnostic', () => {
                return expect(output).to.eventually.have.property('fulfillmentText', match);
            });
            it('slack', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.slack.text', match);
            });
            it('google', () => {
                return expect(output).to.eventually.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
            });
            tools.getCollection = restore;
        });
    });
});
describe('tools', () => {
    describe('queryArgumentBuild', () => {
        it('simple query', () => {
            q = tools.queryArgumentBuild("2", 'Level');
            expect(q).to.have.members(['level', '==', '2']);
        });
        it('deep query', () => {
            q = tools.queryArgumentBuild("sorcerer", 'Class');
            expect(q).to.have.members(['Class.sorcerer', '==', true]);
        });
    });
    describe('getQuery', () => {
        it('one at a time', () => {
            let req = fakeReq;

            req.body.queryResult.parameters = {
                'Class': [
                    'wizard'
                ],
                'Level': [
                    '3'
                ]
            };
            q = tools.getQuery(false, req);
            expect(q[0]).to.have.members(['Class.wizard', '==', true]);
            expect(q[1]).to.have.members(['level', '==', '3']);
        });
        it('multiples not allowed', () => {
            let req = fakeReq;

            req.body.queryResult.parameters = {
                'Class': [
                    'wizard',
                    'sorcerer'
                ]
            };
            q = tools.getQuery(false, req);
            expect(q).not.to.equal('Sorry, can we do this one Class at a time?');
        });
    });
    describe('querySpell', () => {
        it('simple query', () => {
            let w = [
                ['class', '==', 'wizard']
            ];

            log = {
                where: []
            };

            let out = tools.querySpell(w);
            expect(log.where).to.deep.include.members(w);
        });
        describe('complex query with limit', () => {
            let w = [
                    ['class', '==', 'wizard'],
                    ['level', '==', '2']
                ],
                l = 3;

            log = {
                where: [],
                limit: null
            };
            let out = tools.querySpell(w, l);

            it('where part of the query', () => {
                return expect(w).to.deep.include.members(out.where);
            });
            it('limit part of the query', () => {
                return expect(out.limit).to.equal(l);
            });
        });
    });
    describe('getCollection', () => {
        it('returns Promise', () => {
            let output = tools.getCollection();

            expect(output).to.be.an('Promise');
        });
    });
    describe('getSuggestions', () => {
        let sugg = [
                'description',
                'damage',
                'duration',
                'cast_time',
                'materials',
                'higher_levels'
            ],
            spell = {
                name: 'Fireball',
                description: true,
                cast_time: true,
                higher_levels: true,
                damage: true,
                duration: true,
                components: {
                    material: true
                }
            };
        it('with array for screen', () => {
            capabilities = {
                screen: true
            };

            let expected = [{
                    title: 'what is Fireball?'
                }, {
                    title: 'what damage does it do?'
                }, {
                    title: 'how long does it last?'
                }, {
                    title: 'how long does it take to cast?'
                }, {
                    title: 'what materials do I need'
                }, {
                    title: 'how does it level up'
                }],
                output = tools.getSuggestions(sugg, spell);

            expect(expected).to.deep.contains.members(output);
        });
        it('with array for speech', () => {
            capabilities = {
                audio: true
            };

            let output = tools.getSuggestions(sugg, spell)

            expect(output).to.be.a('string');
        });
    });
    describe('setResponse', () => {
        let str = 'this is a sample response';
        it('speech only', () => {
            let output = tools.setResponse(str);

            expect(output.fulfillmentText).to.equal(str);
            expect(output.payload.google.richResponse.items[0].simpleResponse.displayText).to.equal(str);
            expect(output.payload.slack.text).to.equal(str);
            expect(output.payload.google.richResponse.items[0].simpleResponse.textToSpeech).to.equal(`<speech>${str}</speech>`);
        });
    });
    describe('buildCard', () => {
        let card = {
                title: 'this is a sample response',
                subtitle: 'fire',
                text: 'lorem ipsum dolor sit amet'
            },
            data = {
                fulfillmentMessages: [],
                payload: {
                    google: {
                        richResponse: {
                            items: []
                        }
                    },
                    slack: {
                        attachments: []
                    }
                }
            };
        it('google', () => {
            let output = tools.buildCard(data, card, ['google']),
                googleCard = {
                    title: card.title,
                    subtitle: card.subtitle,
                    formattedText: card.text
                };

            expect(googleCard).to.deep.equal(output.payload.google.richResponse.items[0].basicCard);
        });
        it('slack', () => {
            let output = tools.buildCard(data, card, ['slack']),
                slackCard = {
                    title: card.title,
                    author_name: card.subtitle,
                    text: card.text
                };

            expect(slackCard).to.deep.equal(output.payload.slack.attachments[0]);
        });
        it('dialogflow', () => {
            let output = tools.buildCard(data, card, ['dialogflow']),
                dialogflowCard = {
                    title: card.title,
                    subtitle: card.text
                };

            expect(dialogflowCard).to.deep.equal(output.fulfillmentMessages[0].card);
        });
    });
    describe('addPhrase', () => {
        it('convert to School speech informal', () => {
            global.params = {
                'School': [
                    'necromancy'
                ]
            };
            let output = tools.addPhrase();

            expect(output).to.equal('necromancy');
        });
        it('convert to School speech formal', () => {
            global.params = {
                'School': [
                    'necromancy'
                ]
            };
            let output = tools.addPhrase(1);

            expect(output).to.equal('school of necromancy');
        });
        it('convert to Level speech', () => {
            global.params = {
                'Level': [
                    '2'
                ]
            };
            let output = tools.addPhrase();

            expect(output).to.equal('level 2');
        });
    });
    describe('listComplex', () => {
        it('query returns empty', () => {
            global.params = {
                'Class': [],
                'Level': [
                    '2'
                ],
                'School': [
                    'necromancy'
                ]
            };
            let output = tools.listComplex([]);

            expect(output.speech).to.equal('I don\'t know any level 2 necromancy spells.');
            expect(output.data.length).to.equal(0);
        });
        it('query returns 1 spell', () => {
            global.params = {
                'Class': [],
                'Level': [
                    '2'
                ],
                'School': [
                    'necromancy'
                ]
            };
            let output = tools.listComplex({
                size: 1
            });

            expect(output.speech).to.equal('There is only 1 level 2 necromancy spell.');
            expect(output.data.length).to.equal(0);
        });
        it('query returns multiple spells', () => {
            global.params = {
                'Class': [],
                'Level': [
                    '2'
                ],
                'School': [
                    'necromancy'
                ]
            };
            let output = tools.listComplex({
                size: 2
            });

            expect(output.speech).to.equal('There are 2 level 2 necromancy spells.');
            expect(output.data.length).to.equal(0);
        });
        it('query lists out multiple spells', () => {
            global.params = {
                'Class': [],
                'Level': [
                    '2'
                ],
                'School': [
                    'necromancy'
                ]
            };
            let output = tools.listComplex({
                size: 6,
                docs: [{
                    _fieldsProto: {
                        name: {
                            stringValue: 'spell 1'
                        }
                    }
                }, {
                    _fieldsProto: {
                        name: {
                            stringValue: 'spell 2'
                        }
                    }
                }, {
                    _fieldsProto: {
                        name: {
                            stringValue: 'spell 3'
                        }
                    }
                }, {
                    _fieldsProto: {
                        name: {
                            stringValue: 'spell 4'
                        }
                    }
                }, {
                    _fieldsProto: {
                        name: {
                            stringValue: 'spell 5'
                        }
                    }
                }, {
                    _fieldsProto: {
                        name: {
                            stringValue: 'spell 6'
                        }
                    }
                }]
            }, true);

            expect(output.speech.substr(0, 72)).to.equal('There are 6 level 2 necromancy spells, <break time=\'350ms\' /> including ');
        });
    });
    /*
    describe('setResponse', () => {
        it('with array for screen', () => {
        	
        });
    });
    */
});
describe('Swiss Army Knife', () => {
    describe('shuffleArray', () => {
        it('array is shuffled', () => {
            let arr = [{
                    n: 1
                }, {
                    n: 2
                }, {
                    n: 3
                }],
                shuffle = Object.assign([], arr);
            shuffle = sak.shuffleArray(shuffle);

            expect(shuffle).to.have.members(arr);
            expect(shuffle).not.to.equal(arr);
        });
    });
    describe('cleanText', () => {
        it('_ and * removed', () => {
            let text = sak.cleanText(' sample **text** _is this ');

            expect(text).to.equal('sample text is this');
        });
    });
    describe('clearSpeech', () => {
        it('tags removed', () => {
            let text = sak.clearSpeech('<speech>sample text <break time=\'350ms\' />is this</speech>');

            expect(text).to.equal('sample text is this');
        });
    });
    describe('formatText', () => {
        it('for Slack', () => {
            let text = sak.formatText('<speech>sample **text** <break time=\'350ms\' />is this</speech>');

            expect(text).to.equal('sample *text* is this');
        });
    });
    describe('combinePhrase', () => {
        it('phrase constructed for screen', () => {
            capabilities = {
                'screen': true
            };
            let text = sak.combinePhrase([
                'this',
                'this',
                'that'
            ]);

            expect(text).to.equal('this, this and that');
        });
        it('phrase constructed for speech', () => {
            capabilities = {
                'audio': true
            };
            let text = sak.combinePhrase([
                'this',
                'this',
                'that'
            ]);

            expect(text).to.equal('this<break time=\'500ms\' />, this<break time=\'500ms\' /> and that<break time=\'500ms\' />');
        });
    });
    describe('plural', () => {
        it('regular', () => {
            let text = sak.plural('regular');
            expect(text).to.equal('regulars');
        });
    });
    describe('rng', () => {
        it('Random Number Generator', () => {
            let text = sak.rng(10);
            expect(text).to.be.within(1, 10);
        });
    });
    describe('i18n', () => {
        it('get a string', () => {
            let obj = sak.i18n('string');
            expect(obj).to.equal('string');
        });
        it('get a random string from an array', () => {
            let arr = [
                    'text1',
                    'text2',
                    'text3'
                ],
                obj = sak.i18n(arr);

            expect(arr).to.be.an('array').that.includes(obj);
        });
        it('replace a variable in a string', () => {
            let str = 'sample <var> is here',
                obj = sak.i18n(str, {
                    var: 'variable'
                });

            expect(obj).to.equal('sample variable is here');
        });
    });
});