const chai = require('chai'),
    should = chai.should,
    expect = chai.expect,
    assert = require('assert'),
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

global.log = {};
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
                limit: (input) => {
                    log.limit = input;
                    return ret;
                },
                get: () => {
                    return ret;
                }
            });
            return ret;
        }
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
describe('phrases', () => {
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
            expect(log.where).to.exist;
            expect(log.where[0]).to.have.members(w[0]);
        });
        it('complex query with limit', () => {
            let w = [
                    ['class', '==', 'wizard'],
                    ['level', '==', '2']
                ],
                l = 3;

            log = {
                where: []
            };

            let out = tools.querySpell(w, l);
            expect(log.where).to.exist;
            expect(log.where[0]).to.have.members(w[1]);
            expect(log.where[1]).to.have.members(w[0]);
            expect(log.limit).to.exist;
            expect(log.limit).to.equal(l);
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
    });
});