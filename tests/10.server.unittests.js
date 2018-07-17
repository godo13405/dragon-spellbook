'use strict';

require('./setup.js');

describe('server', () => {
    describe('capabilities', () => {
        let req = {
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
        });
    });
});
