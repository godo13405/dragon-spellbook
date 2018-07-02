'use strict';

const service = {
  setCapabilities: input => {
    let output = input;
    if (input && input.source) {
      // Get surface capabilities, such as screen
      switch (input.source) {
        case ('google'):
          output = [];
          input.payload.surface.capabilities.forEach(cap => {
            if (cap.name) {
              cap = cap.name.split('.');
              cap = cap[cap.length - 1].replace(/_OUTPUT/g, '').toLowerCase();
              output.push(cap);
            }
          });
          break;
        case ('alexa'):
          output = ['audio'];
      }
    } else {
      output = global.capabilities;
    }
    return output;
  },
  router: (input, midIntention) => {
    let arr = ['text', 'speech'];
    switch (midIntention) {
      case ('what'):
        if (intention === 'description') arr = ['speech', 'card'];
        return responses.whatProperty({
          intention: global.intention,
          target: global.collection,
          responses: arr
        });
      case ('check'):
        return responses.checkProperty({
          intention: global.intention,
          target: global.collection,
          checks: global.intention,
          responses: arr
        });
    }

    switch (input) {
      case ('spell.init' || 'spell.folllowupInit'):
        return responses.whatProperty({
          intention: global.intention,
          responses: ['text', 'speech', 'card']
        });
      case ('weapon.init' || 'weapon.folllowupInit'):
        return responses.whatProperty({
          intention: global.intention,
          target: 'weapon',
          responses: ['text', 'speech'],
          prepose: true
        });
      case 'query.complex':
        return responses.query.spellComplex();
      case 'condition':
        return responses.condition();
      case 'input.welcome':
        return responses.welcome();
      case 'input.unknown':
        return responses.fallback();
    }
    return false;
  },
  params: {
    fromContext: (input, params = global.params) => {
      return input ? input.filter(x => {
        return x.name.substr(x.name.length - 5) === 'spell';
      })[0] : false;
    },
    fromQuery: input => {
      let output = [];
      for (let par in input) {
        if (input[par].length) {
          output[par] = input[par];
        }
      }
      return output;
    }
  }
};
exports = module.exports = service;
