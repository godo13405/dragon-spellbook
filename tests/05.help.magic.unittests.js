require('./setup.js');

describe('Help', () => {
  describe('magic', () => {
    global.actionArr = ['help', 'magic', 'school'];
    global.collection = 'help';
    it('school', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            school: {
              data: {
              testing: [
                "first line",
                "second line"
              ]
            }
          }
          });
        })
      };
      i18n.help.magic.school.hasProperty = i18n.help.magic.school.hasProperty[0];
      let output = responses.help({
            intention: 'school',
            target: 'help',
            params: {
              school: ['testing']
            },
            responses: ['text', 'speech']
        }),
        schoolMatch = 'The School of Testing is about first line and second line';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', schoolMatch);
        expect(data).to.have.deep.nested.property('payload.slack.text', schoolMatch);
        expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', schoolMatch);
        tools.getCollection = restore;
      });
    });
  });
});
