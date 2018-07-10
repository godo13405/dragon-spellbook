require('./setup.js');

describe('Concentration', () => {
  global.restore = tools.getCollection;
  global.intention = 'concentration';
  global.midIntention = 'what';
  it('yes', () => {
    tools.getCollection = () => {
      return new Promise((res, rej) => {
        res({
          name: 'Spellname',
          concentration: true
        });
      })
    };
    i18n.spell.what.concentration.hasProperty = i18n.spell.what.concentration.hasProperty[0];
    let output = responses.whatProperty({
        intention: 'concentration',
        responses: ['text', 'speech']
      }),
      match = 'Yes, Spellname needs concentration';
    return output.then(data => {
      expect(data).to.have.property('fulfillmentText', match);
      // expect(data).to.have.deep.nested.property('payload.slack.text', match);
      // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
      tools.getCollection = restore;
    });
  });
});
