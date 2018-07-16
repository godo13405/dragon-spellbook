'use strict';

const service = {
  setCapabilities: input => {
    let output = input;
    if (input && input.source) {
      // Get surface capabilities, such as screen
      switch (input.source) {
        case ('web'):
          output = input.capabilities;
          break;
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
    let args = {
        intention: global.intention,
        target: global.collection,
        responses: ['text', 'speech']
      };
    if (collection === 'spell' &&  midIntention === 'init') {
      args.responses = ['text', 'speech', 'card'];
    }

    if (midIntention === 'what' || midIntention === 'init') {
      responses.whatProperty(args);
    } else if (midIntention === 'check') {
      responses.checkProperty(args);
    } else if (collection === 'help') {
      responses.help(args);
    }

    switch (input) {
      case 'query.complex':
        return responses.query.spellComplex();
      case 'count.spell.complex':
        return responses.query.countComplex();
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
