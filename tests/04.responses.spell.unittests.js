require('./setup.js');

describe('responses', () => {
  let restore = tools.getCollection;
  describe('spellDuration', () => {
    global.intention = 'duration';
    describe('spell has no duration', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname'
          });
        })
      };
      let output = responses.whatProperty({
          intention: 'duration',
          target: 'spell'
        }),
        match = sak.i18n(i18n.spell.what.duration.doesntHaveProperty, {
          targetName: 'Spellname'
        });
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
    describe('spell has a duration', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            duration: '1 minute'
          });
        })
      };
      let output = responses.whatProperty({
          intention: 'duration',
          target: 'spell'
        }),
        match = 'Spellname lasts for 1 minute';
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
    describe('spell is instantaneousn', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            duration: 'instantaneous'
          });
        })
      };
      let output = responses.whatProperty({
          intention: 'duration',
          target: 'spell'
        }),
        match = 'Spellname is instantaneous';
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
  describe('spellDescription', () => {
    global.intention = 'description';
    describe('output description', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            description: 'lorem ipsum'
          });
        })
      };
      let output = responses.whatProperty({
          intention: 'description',
          target: 'spell',
          responses: ['text', 'speech', 'card']
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
  });
  describe('spellInit', () => {
    global.intention = 'init';
    describe('summary', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            type: 'spellType',
            description: 'lorem ipsum'
          });
        })
      };
      let output = responses.whatProperty({
          intention: 'init',
          responses: ['text', 'speech', 'card']
        }),
        match = 'Spellname is a spellType';
      it('agnostic text', () => {
        return expect(output).to.eventually.have.property('fulfillmentText', match);
      });
      it('slack text', () => {
        return expect(output).to.eventually.have.deep.nested.property('payload.slack.text', match);
      });
      it('google text', () => {
        return expect(output).to.eventually.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
      });

      it('agnostic card', () => {
        return expect(output).to.eventually.have.deep.nested.property('fulfillmentMessages[0].card', {
          title: 'Spellname',
          subtitle: 'lorem ipsum'
        });
      });
      it('slack card', () => {
        return expect(output).to.eventually.have.deep.nested.property('payload.slack.attachments[0]', {
          title: 'Spellname',
          author_name: 'spellType',
          text: 'lorem ipsum'
        });
      });
      it('google card', () => {
        return expect(output).to.eventually.have.deep.nested.property('payload.google.richResponse.items[1].basicCard', {
          title: 'Spellname',
          subtitle: 'spellType',
          formattedText: 'lorem ipsum'
        });
      });

      tools.getCollection = restore;
    });
  });
  describe('check', () => {
    describe('class', () => {
      global.actionArr = ['spell', 'check', 'class'];
      global.collection = 'spell';
      describe('one yes', () => {
        tools.getCollection = () => {
          return new Promise((res, rej) => {
            res({
              name: 'Spellname',
              class: [
                'wizard'
              ]
            });
          })
        };
        let output = responses.checkProperty({
            intention: 'class',
            target: 'spell',
            params: {
              spell: ['Spellname'],
              class: [
                'wizard'
              ]
            },
            responses: ['text', 'speech', 'card']
          }),
          match = 'Yes, Spellname can be cast by wizards';
        it('agnostic text', () => {
          return expect(output).to.eventually.have.property('fulfillmentText', match);
        });
        it('slack text', () => {
          return expect(output).to.eventually.have.deep.nested.property('payload.slack.text', match);
        });
        it('google text', () => {
          return expect(output).to.eventually.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        });
        tools.getCollection = restore;
      });
      describe('one no', () => {
        tools.getCollection = () => {
          return new Promise((res, rej) => {
            res({
              name: 'Spellname',
              class: [
                'wizard'
              ]
            });
          })
        };
        let output = responses.checkProperty({
            intention: 'class',
            target: 'spell',
            params: {
              spell: ['Spellname'],
              class: [
                'bard'
              ]
            },
            responses: ['text', 'speech', 'card']
          }),
          match = 'No, Spellname can\'t be cast by bards';
        it('agnostic text', () => {
          return expect(output).to.eventually.have.property('fulfillmentText', match);
        });
        it('slack text', () => {
          return expect(output).to.eventually.have.deep.nested.property('payload.slack.text', match);
        });
        it('google text', () => {
          return expect(output).to.eventually.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        });
        tools.getCollection = restore;
      });
      describe('one yes, one no', () => {
        tools.getCollection = () => {
          return new Promise((res, rej) => {
            res({
              name: 'Spellname',
              class: [
                'wizard',
                'sorcerer'
              ]
            });
          })
        };
        let output = responses.checkProperty({
            intention: 'class',
            target: 'spell',
            params: {
              spell: ['Spellname'],
              class: [
                'wizard',
                'bard'
              ]
            },
            responses: ['text', 'speech', 'card']
          }),
          match = 'Wizards can cast Spellname, but bards can\'t';
        it('agnostic text', () => {
          return expect(output).to.eventually.have.property('fulfillmentText', match);
        });
        it('slack text', () => {
          return expect(output).to.eventually.have.deep.nested.property('payload.slack.text', match);
        });
        it('google text', () => {
          return expect(output).to.eventually.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        });
        tools.getCollection = restore;
      });
    });
  });
});
