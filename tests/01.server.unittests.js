'use strict';

require('./setup.js');

describe('server', () => {
    describe('capabilities', () => {
        let cappy = [],
            req = {
                body: {
                    queryResult: {
                        action: 'input.welcome'
                    },
                    originalDetectIntentRequest: {
                        payload: {}
                    }
                }
            };
        it('on Alexa should not include screen', () => {
            let capabilities = service.setCapabilities({
              source: 'alexa'
            });
            expect(capabilities).not.to.include('screen');
            capabilities = cappy;
        });
        it('on Google should include screen', () => {
            let capabilities = service.setCapabilities({
              source: 'google',
              payload: {
                  surface: {
                      capabilities: [{
                          "name": "actions.capability.SCREEN_OUTPUT"
                      }]
                  }
              }
            });

            expect(capabilities).to.include('screen');
            capabilities = cappy;
        });
    });
});
