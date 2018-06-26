require('./setup.js');

describe('Swiss Army Knife', () => {
    describe('shuffleArray', () => {
        it('array is shuffled', () => {
            let arr = [{
                    n: 1
                }, {
                    n: 2
                }, {
                    n: 3
                }],
                shuffle = Object.assign([], arr);
            shuffle = sak.shuffleArray(shuffle);

            expect(shuffle).to.have.members(arr);
            expect(shuffle).not.to.equal(arr);
        });
    });
    describe('cleanText', () => {
        it('_ and * removed', () => {
            let text = sak.cleanText(' sample **text** _is this ');

            expect(text).to.equal('sample text is this');
        });
    });
    describe('clearSpeech', () => {
        it('tags removed', () => {
            let text = sak.clearSpeech('<speech>sample text <break time=\'350ms\' />is this</speech>');

            expect(text).to.equal('sample text is this');
        });
    });
    describe('formatText', () => {
        it('for Slack', () => {
            let text = sak.formatText('<speech>sample **text** <break time=\'350ms\' />is this</speech>');

            expect(text).to.equal('sample *text* is this');
        });
    });
    describe('combinePhrase', () => {
        it('phrase constructed for screen', () => {
            capabilities = {
                'screen': true
            };
            let text = sak.combinePhrase({input:[
                'this',
                'this',
                'that'
            ]});

            expect(text).to.equal('this, this and that');
        });
        it('phrase constructed for speech', () => {
            capabilities = {
                'audio': true
            };
            let text = sak.combinePhrase({input:[
                'this',
                'this',
                'that'
            ]});

            expect(text).to.equal('this<break time=\'500ms\' />, this<break time=\'500ms\' /> and that<break time=\'500ms\' />');
        });
    });
    describe('plural', () => {
        it('regular', () => {
            let text = sak.plural('regular');
            expect(text).to.equal('regulars');
        });
    });
    describe('rng', () => {
        it('Random Number Generator', () => {
            let text = sak.rng(10);
            expect(text).to.be.within(1, 10);
        });
    });
    describe('i18n', () => {
        it('get a string', () => {
            let obj = sak.i18n('string');
            expect(obj).to.equal('string');
        });
        it('get a random string from an array', () => {
            let arr = [
                    'text1',
                    'text2',
                    'text3'
                ],
                obj = sak.i18n(arr);

            expect(arr).to.be.an('array').that.includes(obj);
        });
        it('replace a variable in a string', () => {
            let str = 'sample <var> is here',
                obj = sak.i18n(str, {
                    var: 'variable'
                });

            expect(obj).to.equal('sample variable is here');
        });
    });
});
