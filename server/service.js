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
    switch (midIntention) {
      case ('what'):
        let arr = ['text', 'speech'];
        if (intention === 'description') arr = ['speech', 'card'];
        return responses.whatProperty({intention:global.intention, responses: arr});
    }

    switch (input) {
      case ('spell.init' || 'spell.folllowupInit'):
        return responses.whatProperty({intention:global.intention, responses: ['text', 'speech', 'card']});
      case ('weapon.init' || 'weapon.folllowupInit'):
        return responses.whatProperty({intention:global.intention, target:'weapon', responses: ['text', 'speech', 'card']});
      case 'query.complex':
        return responses.query.spellComplex();
      case 'count.complex':
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
      if (input && input.outputContexts && input.outputContexts.length) {
        for (var i = input.outputContexts.length - 1; i >= 0; i--) {
          for (let par in input.outputContexts[i].parameters) {
            if (par.substr(par.length - 9) !== '.original' &&
              input.outputContexts[i].parameters[par]) {
              par = par.toLowerCase();
              params[par] = input.outputContexts[i].parameters[par];
            }
          }
        }
      }
    },
    fromQuery: input => {
        for (let par in input) {
          if (input[par].length && par.substr(par.length - 9) !== '.original') {
            params[par.toLowerCase()] = input[par];
          }
        }
    },
    smartClear: (input = global.params) => {
      const output = {};
      switch (actionArr[0]) {
        case ('condition'):
          output.condition = params.condition;
          // should we keep level?
          if (params.condition) {
            output.level = params.level;
          }
          break;
        case ('spell'):
          if (params.spell) output.spell = params.spell;
          if (params.level) output.level = params.level;
          if (params.class) output.class = params.class;
          if (params.school) output.school = params.school;
          break;
      }
      return output;
    }
  }
};
