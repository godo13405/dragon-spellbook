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
});