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
    let arr = ['text', 'speech'],
      func;
    switch (midIntention) {
      case ('what'):
        if (intention === 'description') arr = ['speech', 'card'];
        func = responses.whatProperty;
        break;
      case ('check'):
        func = responses.checkProperty;
        break;
    }
    switch (collection) {
      case ('spell'):
        arr = ['text', 'speech', 'card'];
        return func({
          intention: global.intention,
          target: global.collection,
          responses: arr
        });
      case ('weapon'):
        return func({
          intention: global.intention,
          target: global.collection,
          responses: arr
        });
      case ('help'):
        return responses.help({
          intention: global.intention,
          target: global.collection,
          responses: arr
        });
      }

    switch (input) {
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
