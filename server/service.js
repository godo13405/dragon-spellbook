'use strict';

exports = module.exports = {
  setCapabilities: (capabilities) => {
    // Get surface capabilities, such as screen
    if (request.body.originalDetectIntentRequest) {
      switch (request.body.originalDetectIntentRequest.source) {
        case ('google'):
          capabilities = [];
          request.body.originalDetectIntentRequest.payload.surface.capabilities.forEach(cap => {
            if (cap.name) {
              cap = cap.name.split('.');
              cap = cap[cap.length - 1].replace(/_OUTPUT/g, '').toLowerCase();
              capabilities.push(cap);
            }
          });
          break;
        case ('alexa'):
          capabilities = ['audio'];
      }
    }
    return capabilities;
  },
  router: (input, midIntention) => {
    let arr = ['text', 'speech'];
    switch (midIntention) {
      case ('what'):
        if (intention === 'description') arr = ['speech', 'card'];
        return responses.whatProperty({intention:global.intention, target: global.collection, responses: arr});
      case ('check'):
        return responses.checkProperty({intention:global.intention, target: global.collection, responses: arr});
    }

    switch (input) {
      case ('spell.init' || 'spell.folllowupInit'):
        return responses.whatProperty({intention:global.intention, responses: ['text', 'speech', 'card']});
      case ('weapon.init' || 'weapon.folllowupInit'):
        return responses.whatProperty({intention:global.intention, target:'weapon', responses: ['text', 'speech', 'card']});
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
      return input ? input.filter(x => { return x.name.substr(x.name.length - 5) === 'spell'; })[0] : false;
    },
    fromQuery: input => {
      let output = [];
        for (let par in input) {
          if (input[par].length) {
            output[par] = input[par];
          }
        }
        return output;
    },
    smartClear: (input = global.params) => {
      const output = {};
      switch (actionArr[0]) {
        case ('condition'):
          output.condition = input.condition;
          // should we keep level?
          if (input.condition) {
            output.level = input.level;
          }
          break;
        case ('spell'):
          if (input.spell) output.spell = input.spell;
          if (input.level) output.level = input.level;
          if (input.class) output.class = input.class;
          if (input.school) output.school = input.school;
          break;
      }
      switch (true) {
        case (actionArr[1] === 'check' && actionArr[2] === 'class'):
          if (input.spell) output.spell = input.spell;
          if (input.class) output.class = input.class;
          break;
      }
      return output;
    }
  }
};
