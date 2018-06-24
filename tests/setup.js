global.chai = require('chai'),
global.should = chai.should,
global.expect = chai.expect,
global.assert = chai.assert,
global.chaiAsPromised = require('chai-as-promised'),
global.server = require('../server/index'),
global.fakeRes = {
        json: (input) => {
            return input;
        },
        send: (input) => {
            return input;
        }
    };
chai.use(chaiAsPromised);
global.log = {
    where: [],
    limit: null
};
global.params = {
    spell: ['Acid Splash'],
    condition: ['conditioned']
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
        session: 'sessionId',
        queryResult: {}
    }
};
global.intention = '';
global.response = {
    json: input => {
        return input;
    }
};
