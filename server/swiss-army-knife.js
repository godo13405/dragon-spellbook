'use strict';

exports = module.exports = {
  shuffleArray: (arr, limit) => {
    let output = arr.sort(() => {
      return 0.5 - Math.random()
    });
    if (limit) {
      output = output.slice(0, limit);
    }
    return output;
  },
  cleanText: text => {
    return text && text.length ? text
      .replace(/\*+/g, '')
      .replace(/_+/g, '')
      .replace(/^[ \t]+/g, '') // trim leading whitespace
      .replace(/[ \t]+$/g, '') // trim trailing whitespace
      :
      null;
  },
  clearSpeech: text => {
    return text && text.length ? text
      .replace(/<[^>]*>+/g, '') :
      null;
  },
  formatText: (input, platform = 'slack') => {
    let output = null;
    if (input && input.length) {
      switch (platform) {
        case ('slack'):
          output = sak.clearSpeech(input.replace(/\*\*+/g, '*'));
          break;
      }
    }
    return output;
  },
  combinePhrase: ({
    input = [],
    concat = 'and',
    capabilities = global.capabilities,
    makePlural = false,
    lowerCase = false
  } = {}) => {
    let output = '',
      len = input.length,
      last = len - 2;
    for (var i = 0; i < len; i++) {
      if (makePlural) input[i] = sak.plural(input[i]);
      if (lowerCase) input[i] = input[i].toLowerCase();
      output = output + input[i];
      if (!capabilities.includes('screen') && capabilities.includes('audio')) {
        output = output + '<break time=\'500ms\' />';
      }
      if (i === last) {
        output = output + ' ' + concat + ' ';
      } else if (i < last) {
        output = output + ', ';
      }
    }
    return output;
  },
  plural: input => {
    let talk;
    if (input === 'foot') {
      talk = 'feet';
    } else {
      let add = 's';
      if (input.slice(-1) === 't') {
        add = 'es';
      }
      talk = input + add;
    }
    return talk;
  },
  rng: (limit = 9) => {
    return Math.ceil(Math.random() * limit);
  },
  i18n: (input, varReplace) => {
    if (Array.isArray(input)) {
      input = input[sak.rng(input.length - 1)];
    }
    if (varReplace) {
      let rex;
      for (let k in varReplace) {
        rex = new RegExp(`<${k}>`, "g");
        input = input.replace(rex, varReplace[k]);
      }
    }
    return input;
  },
  caseInsensitive: input => {
    return new RegExp(`^${input}$`, "i");
  },
  queryBuilder: ({
    param = 'name',
    params = global.params
  } = {}) => {
    let query = [];
    if (param) {
      // Each parameter, such as Class, Name, Level
      for (let par in params) {
        if (Array.isArray(params[par])) {
          // Each parameter value, such as Wizard, Fireball, 4
          for (let val in params[par]) {
            let obj = {};
            // regex to make it case insensitive
            obj[par] = sak.caseInsensitive(params[par][val]);
            query.push(obj);
          }
        }
      }
      let temp;
      if (params.spell && params.spell.length) {
        temp = 'spell';
      } else if (params.weapon && params.weapon.length) {
        temp = 'weapon';
      }
      if (temp) {
        let tempy = {};
        tempy[param] = params[temp][0];
        query.push(tempy);
        query = query.filter(x => !(temp in x));
      }
    } else if (param === 'condition') {
      query['_id'] = params['condition'];
      delete query.condition;
    }
    if (query.length) {
      // then join the params in a mongo $and statement
      query = {
        $and: query
      };
    } else {
      // if the query is empty MongoDB will crash
      query = false;
    }
    return query;
  },
  preposition: input => {
    let prep = 'a';
    if (input.match(/^[aeiouh]/gi)) {
      prep = 'an';
    }
    return `${prep} ${input}`;
  },
  titleCase: str => {
    return str.toLowerCase().split(' ').map(word => {
      return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
  },
  sentenceCase: str => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  arrayRemove: (array, element) => {
    const index = array.indexOf(element);
    if (index !== -1) {
      array.splice(index, 1);
    }
  },
  unit: ({
    input = null,
    system = 'imperial',
    convert = true
  }) => {
    let unit;
    if (system === 'imperial') {
      unit = 'foot';
      if (convert) {
        if (input > 5000) {
          // convert feet to miles
          input = (Math.round((input / 5280) * 100) / 100);
          unit = 'mile'
        }
      }
    }

    if (input > 1) unit = sak.plural(unit);

    return input + ' ' + unit;
  }
};
