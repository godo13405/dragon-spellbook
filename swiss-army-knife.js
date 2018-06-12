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
        return text.replace(/\*+/g, '').replace(/\_+/g, '');
    },
    clearSpeech: text => {
        return text.replace(/<[^>]*>+/g, '');
    },
    formatText: (input, platform = 'slack') => {
        let output = null;
        if (input && input.length) {
            switch (platform) {
                case ('slack'):
                    output = input.replace(/\*\*+/g, '*');
                    break;
            }
        }
        return output;
    },
    combinePhrase: input => {
        let output = '';
        for (var i = 0; i < input.length; i++) {
            output = output + input[i];
            if (i === 1) {
                output = output + ' and ';
            } else if (i > 1) {
                output = output + ', ';
            }
        }
        return output;
    }
};