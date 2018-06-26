require('./setup.js');

describe('responses', () => {
    let restore = tools.getCollection;
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
