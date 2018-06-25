require('./setup.js');

describe('responses', () => {
    let restore = tools.getCollection;
    describe('spellDuration', () => {
      global.intention = 'duration';
        describe('spell has no duration', () => {
            tools.getCollection = () => {
                return new Promise((res, rej) => {
                    res({
                        name: 'spellName'
                    });
                })
            };
            let output = responses.whatProperty('duration'),
                match = sak.i18n(i18n.spell.what.duration.doesntHaveProperty, {targetName: 'spellName'});
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
                        name: 'spellName',
                        duration: '1 minute'
                    });
                })
            };
            let output = responses.whatProperty('duration'),
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
                        name: 'spellName',
                        duration: 'instantaneous'
                    });
                })
            };
            let output = responses.whatProperty('duration'),
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
      global.intention = 'description';
        describe('output description', () => {
            tools.getCollection = () => {
                return new Promise((res, rej) => {
                    res({
                        name: 'spellName',
                        description: 'lorem ipsum'
                    });
                })
            };
            let output = responses.whatProperty('description', ['text', 'speech', 'card']),
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
      global.intention = 'init';
        describe('summary', () => {
            tools.getCollection = () => {
                return new Promise((res, rej) => {
                    res({
                        name: 'spellName',
                        type: 'spellType',
                        description: 'lorem ipsum'
                    });
                })
            };
            let output = responses.whatProperty({intention: 'init', responses: ['text', 'speech', 'card']}),
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
      global.intention = 'condition';
        describe('describe', () => {
            tools.getCollection = () => {
                return new Promise((res, rej) => {
                    res({
                        description: 'lorem ipsum'
                    });
                })
            };
            let output = responses.condition({
                    condition: ['conditioned'],
                    Level: [2]
                }),
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
                        levels: [
                            'not lorem',
                            'lorem ipsum'
                        ]
                    });
                })
            };
            let output = responses.condition({
                    condition: ['Exhaustion'],
                    level: [2]
                }),
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
                        levels: [
                            'lorem ipsum'
                        ]
                    });
                })
            };
            let output = responses.condition({
                    condition: ['Exhaustion'],
                    level: [9]
                }),
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
