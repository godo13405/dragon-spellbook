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
    combinePhrase: input => {
        let output = '',
            len = input.length,
            last = len - 2;
        for (var i = 0; i < len; i++) {
            output = output + input[i];
            if (!capabilities.screen && capabilities.audio) {
                output = output + '<break time=\'500ms\' />';
            }
            if (i === last) {
                output = output + ' and ';
            } else if (i < last) {
                output = output + ', ';
            }
        }
        return output;
    },
    plural: input => {
        let add = 's';
        if (input.slice(-1) === 't') {
            add = 'es';
        }

        return input + add;
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
    queryBuilder: (param, params = global.params) => {
        let query = [],
            thisParam = Object.assign({}, params);
            if (param === 'name') {
                thisParam['name'] = thisParam['spell'];
                delete thisParam.spell;
            } else if (param === 'condition') {
                thisParam['_id'] = thisParam['condition'];
                delete thisParam.condition;
            }
            if (!Array.isArray(param)) {
                param = [
                    param
                ];
            }
            // Each parameter, such as Class, Name, Level
            for (let par in thisParam) {
                // Each parameter value, such as Wizard, Fireball, 4
                    for (let val in thisParam[par]) {
                        let obj = {};
                        // regex to make it case insensitive
                        obj[par] = new RegExp(`^${thisParam[par][val]}$`, "i");
                        query.push(obj);
                    }
            }
            // then join the thisParam in a mongo $and statement
            query = {$and: query};
        return query;
    },
    arrayRemove: (array, element) => {
        const index = array.indexOf(element);

        if (index !== -1) {
            array.splice(index, 1);
        }
    }
};
