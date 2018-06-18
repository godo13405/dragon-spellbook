const chai = require('chai'),
    assert = require('assert'),
    should = chai.should,
    expect = chai.expect,
    server = require('../server/index'),
    fakeReq = {
        send: () => {}
    };

describe('server', () => {
    describe('capabilities', () => {
        it('on Alexa should not include screen', () => {
            let cappy = capabilities,
            	res = {
                body: {
                    originalDetectIntentRequest: {}
                }
            };

            server(res, fakeReq);
            console.log(capabilities);

            expect(capabilities).not.to.include('screen');
            capabilities = cappy;
        });
        it('on Google should include screen', () => {
            let cappy = capabilities,
            	res = {
                body: {
                    originalDetectIntentRequest: {
                        source: 'google',
                        payload: {
                            surface: {
                                capabilities: [{
                                    "name": "actions.capability.WEB_BROWSER"
                                }, {
                                    "name": "actions.capability.MEDIA_RESPONSE_AUDIO"
                                }, {
                                    "name": "actions.capability.SCREEN_OUTPUT"
                                }, {
                                    "name": "actions.capability.AUDIO_OUTPUT"
                                }]
                            }
                        }
                    }
                }
            };

            server(res, fakeReq);

            expect(capabilities).to.include('screen');
            capabilities = cappy;
        });
    });
});