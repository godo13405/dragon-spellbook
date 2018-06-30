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
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        expect(data).to.have.deep.nested.property('payload.slack.text', match);
        expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
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
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        expect(data).to.have.deep.nested.property('payload.slack.text', match);
        expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
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
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        expect(data).to.have.deep.nested.property('payload.slack.text', match);
        expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
  });
});
