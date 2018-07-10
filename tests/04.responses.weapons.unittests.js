require('./setup.js');

describe('Weapon', () => {
  describe('init', () => {
    global.actionArr = ['spell', 'check', 'range'];
    global.collection = 'spell';
    it('simple', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Weaponname',
            type:"melee",
            tier:"martial",
            damage:[
              { amount:1,
                dice:"d4",
                type:"slashing"
              }
            ]
          });
        })
      };
      i18n.weapon.what.init.hasProperty = i18n.weapon.what.init.hasProperty[0];
      let output = responses.whatProperty({
            intention: 'init',
            target: 'weapon',
            params: {
              weapon: ['Weaponname']
            },
            responses: ['text', 'speech']
        }),
        match = 'Weaponname is a a martial melee weapon that does 1d4 slashing damage';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
    it('damage', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Weaponname',
            damage:[
              { amount:1,
                dice:"d4",
                type:"slashing"
              }
            ]
          });
        })
      };
      i18n.weapon.what.damage.hasProperty = i18n.weapon.what.damage.hasProperty[0];
      let output = responses.whatProperty({
            intention: 'damage',
            target: 'weapon',
            params: {
              weapon: ['Weaponname']
            },
            responses: ['text', 'speech']
        }),
        match = 'Weaponname does 1d4 slashing damage';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', match);
        // expect(data).to.have.deep.nested.property('payload.slack.text', match);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', match);
        tools.getCollection = restore;
      });
    });
    it('cost', () => {
      tools.getCollection = () => {
        return new Promise((res, rej) => {
          res({
            name: 'Weaponname',
            cost: {
              amount: 1,
              unit: "gold"
            }
          });
        })
      };
      i18n.weapon.what.damage.hasProperty = i18n.weapon.what.damage.hasProperty[0];
      let output = responses.whatProperty({
            intention: 'cost',
            target: 'weapon',
            params: {
              weapon: ['Weaponname']
            },
            responses: ['text', 'speech']
        }),
        costMatch = 'A Weaponname costs 1 gold pieces';
      return output.then(data => {
        expect(data).to.have.property('fulfillmentText', costMatch);
        // expect(data).to.have.deep.nested.property('payload.slack.text', costMatch);
        // expect(data).to.have.deep.nested.property('payload.google.richResponse.items[0].simpleResponse.displayText', costMatch);
        tools.getCollection = restore;
      });
    });
  });
});
