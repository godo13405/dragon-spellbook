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
        return text && text.length ? text.replace(/\*+/g, '').replace(/\_+/g, '') : null;
    },
    clearSpeech: text => {
        return text && text.length ? text.replace(/<[^>]*>+/g, '') : null;
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
        let output = '',
        	len = input.length,
        	last = len - 2;
        for (var i = 0; i < len; i++) {
            output = output + input[i];
            if (!capabilities.includes('SCREEN_OUTPUT') && capabilities.includes('AUDIO_OUTPUT')) {
            	output = output + '<break time=\'500ms\' />';
            }
            if (i === last) {
                output = output + ' and ';
            } else if (i < last) {
                output = output + ', ';
            }
        }
        return output;
    }
};