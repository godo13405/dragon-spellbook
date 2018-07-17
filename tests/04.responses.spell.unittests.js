'use strict';
require('./setup.js');

describe('Spell', () => {
  global.restore = tools.getCollection;
  describe('spellDuration', () => {
    global.intention = 'duration';
    it('spell has no duration', () => {
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
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
    it('spell has a duration', () => {
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
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
    it('spell is instantaneousn', () => {
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
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
  });
  describe('spellDescription', () => {
    global.intention = 'description';
    it('output description', () => {
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
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
  });
  describe('spellInit', () => {
    global.intention = 'init';
    it('summary', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            type: 'spellType',
            description: 'lorem ipsum'
          });
        })
      };
      const match = 'Spellname is a spellType';
      return responses.whatProperty({
        intention: 'init',
        responses: ['text', 'speech', 'card']
      }).then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);

        expect(data).to.have.deep.nested.property('fulfillmentMessages[0].card', {
          title: 'Spellname',
          subtitle: 'lorem ipsum'
        });
        /*
        expect(data).to.have.deep.nested.property('payload.slack.attachments[0]', {
          title: 'Spellname',
          author_name: 'spellType',
          text: 'lorem ipsum'
        });
        expect(data).to.have.deep.nested.property('payload.google.richResponse.items[1].basicCard', {
          title: 'Spellname',
          subtitle: 'spellType',
          formattedText: 'lorem ipsum'
        });
        */
        tools.getCollection = restore;
      });
    });
  });
});
describe('what', () => {
  describe('heal', () => {
    global.actionArr = ['spell', 'check', 'class'];
    global.collection = 'spell';
    it('simple', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            heal: {
              amount: 1,
              dice: 'd4',
              extra: 'your spellcasting ability modifier '
            }
          });
        })
      };
      let output = responses.whatProperty({
          intention: 'heal',
          target: 'spell',
          params: {
            spell: ['Spellname']
          },
          responses: ['text', 'speech', 'card']
        }),
        match = 'Spellname heals for 1d4 and your spellcasting ability modifier';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
    it('doesnt heal', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname'
          });
        })
      };
      let output = responses.whatProperty({
          intention: 'heal',
          target: 'spell',
          params: {
            spell: ['Spellname'],
          },
          responses: ['text', 'speech', 'card']
        }),
        match = 'Spellname doesn\'t heal';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
  });
  describe('components', () => {
    global.actionArr = ['spell', 'check', 'range'];
    global.collection = 'spell';
    it('single', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            components: ['verbal']
          });
        })
      };
      i18n.spell.what.components.hasProperty = i18n.spell.what.components.hasProperty[0];
      let output = responses.whatProperty({
          intention: 'components',
          target: 'spell',
          checks: 'components',
          params: {
            spell: ['Spellname']
          },
          responses: ['text', 'speech', 'card']
        }),
        match = 'Spellname is cast using a verbal component';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
    it('multiple', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            components: ['verbal','material','somatic']
          });
        })
      };
      let output = responses.whatProperty({
          intention: 'components',
          target: 'spell',
          checks: 'components',
          params: {
            spell: ['Spellname']
          },
          responses: ['text', 'speech', 'card']
        }),
        match = 'Spellname is cast using verbal, material and somatic components';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
  });
  describe('materials', () => {
    global.actionArr = ['spell', 'check', 'range'];
    global.collection = 'spell';
    it('single', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            materials: ['spell materials']
          });
        })
      };
      i18n.spell.what.materials.hasProperty = i18n.spell.what.materials.hasProperty[0];
      let output = responses.whatProperty({
          intention: 'materials',
          target: 'spell',
          checks: 'materials',
          params: {
            spell: ['Spellname']
          },
          responses: ['text', 'speech', 'card']
        }),
        match = 'Spellname is cast using spell materials';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
    it('multiple', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            components: ['verbal','material','somatic']
          });
        })
      };
      let output = responses.whatProperty({
          intention: 'components',
          target: 'spell',
          checks: 'components',
          params: {
            spell: ['Spellname']
          },
          responses: ['text', 'speech', 'card']
        }),
        match = 'Spellname is cast using verbal, material and somatic components';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
  });
  describe('higher_levels', () => {
    global.actionArr = ['spell', 'check', 'range'];
    global.collection = 'spell';
    it('single', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            higher_levels: ['when you cast it at higher levels, it hurts more']
          });
        })
      };
      i18n.spell.what.higher_levels.hasProperty = i18n.spell.what.higher_levels.hasProperty[0];
      let output = responses.whatProperty({
          intention: 'higher_levels',
          target: 'spell',
          checks: 'higher_levels',
          params: {
            spell: ['Spellname']
          },
          responses: ['text', 'speech', 'card']
        }),
        match = 'Casting Spellname when you cast it at higher levels, it hurts more';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
  });
});
describe('check', () => {
  describe('class', () => {
    global.actionArr = ['spell', 'check', 'class'];
    global.collection = 'spell';
    it('one yes', () => {
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
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
    it('one no', () => {
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
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
    it('one yes, one no', () => {
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
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
  });
  describe('range', () => {
    global.actionArr = ['spell', 'check', 'range'];
    global.collection = 'spell';
    i18n.spell.what.range.hasProperty = i18n.spell.what.range.hasProperty[0];
    it('simple', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            range: 30
          });
        })
      };
      let output = responses.whatProperty({
          intention: 'range',
          target: 'spell',
          checks: 'range',
          params: {
            spell: ['Spellname']
          },
          responses: ['text', 'speech', 'card']
        }),
        match = 'Spellname\'s range is 30 feet';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
    it('unit conversion to miles', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            range: 30000
          });
        })
      };
      let output = responses.whatProperty({
          intention: 'range',
          target: 'spell',
          checks: 'range',
          params: {
            spell: ['Spellname']
          },
          responses: ['text', 'speech', 'card']
        }),
        match = 'Spellname\'s range is 5.68 miles';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
    it('unit conversion to mile singular', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            range: 5280
          });
        })
      };
      let output = responses.whatProperty({
          intention: 'range',
          target: 'spell',
          checks: 'range',
          params: {
            spell: ['Spellname']
          },
          responses: ['text', 'speech', 'card']
        }),
        match = 'Spellname\'s range is 1 mile';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
    it('has a shape', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            range: 10,
            shape: 'line'
          });
        })
      };
      let output = responses.whatProperty({
          intention: 'range',
          target: 'spell',
          checks: 'range',
          params: {
            spell: ['Spellname']
          },
          responses: ['text', 'speech', 'card']
        }),
        match = 'Spellname\'s range is 10 feet as a line';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
  });
  describe('ritual', () => {
    global.actionArr = ['spell', 'check', 'range'];
    global.collection = 'spell';
    it('yes', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname',
            ritual: true
          });
        })
      };
      i18n.spell.check.ritual.hasProperty = i18n.spell.check.ritual.hasProperty[0];
      let output = responses.checkProperty({
          intention: 'ritual',
          target: 'spell',
          checks: 'ritual',
          params: {
            spell: ['Spellname']
          },
          responses: ['text', 'speech', 'card']
        }),
        match = 'Yes, Spellname can be cast as a ritual';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
    it('no', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Spellname'
          });
        })
      };
      i18n.spell.check.ritual.doesntHaveProperty = i18n.spell.check.ritual.doesntHaveProperty[0];
      let output = responses.checkProperty({
          intention: 'ritual',
          target: 'spell',
          checks: 'ritual',
          params: {
            spell: ['Spellname']
          },
          responses: ['text', 'speech', 'card']
        }),
        match = 'No, Spellname can\'t be cast as a ritual';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
  });
});
