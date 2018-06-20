require('./setup.js');

describe('server', () => {
    describe('capabilities', () => {
        let cappy = [],
            req = {
                body: {
                    originalDetectIntentRequest: {
                        payload: {}
                    }
                }
            };
        it('on Alexa should not include screen', () => {
            req.body.originalDetectIntentRequest.source = 'alexa';
            server(req, fakeRes);
            expect(capabilities).not.to.include('screen');
            capabilities = cappy;
        });
        it('on Google should include screen', () => {
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