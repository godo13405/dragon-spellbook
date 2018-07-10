require('./setup.js');

describe('tools', () => {
    describe('queryArgumentBuild', () => {
        it('simple query', () => {
            q = tools.queryArgumentBuild("2", 'Level');
            expect(q).to.have.members(['level', '==', '2']);
        });
        it('deep query', () => {
            q = tools.queryArgumentBuild("sorcerer", 'Class');
            expect(q).to.have.members(['Class.sorcerer', '==', true]);
        });
    });
    describe('getQuery', () => {
        it('one at a time', () => {
            let req = {
                body: {
                    queryResult: {
                        parameters: {
                            'Class': [
                                'wizard'
                            ],
                            'Level': [
                                '3'
                            ]
                        }
                    }
                }
            };
            q = tools.getQuery(false, req);
            expect(q[0]).to.have.members(['Class.wizard', '==', true]);
            expect(q[1]).to.have.members(['level', '==', '3']);
        });
        it('multiples not allowed', () => {
            let req = {
                body: {
                    queryResult: {
                        parameters: {
                            'Class': [
                                'wizard',
                                'sorcerer'
                            ]
                        }
                    }
                }
            };
            q = tools.getQuery(false, req);
            expect(q).not.to.equal('Sorry, can we do this one Class at a time?');
        });
    });
    describe('querySpell', () => {
        it('simple query', () => {
            let w = [
                ['class', '==', 'wizard']
            ];

            log = {
                where: []
            };

            let out = tools.querySpell(w);
            expect(log.where).to.deep.include.members(w);
        });
        describe('complex query with limit', () => {
            let w = [
                    ['class', '==', 'wizard'],
                    ['level', '==', '2']
                ],
                l = 3;

            log = {
                where: [],
                limit: null
            };
            let out = tools.querySpell(w, l);

            it('where part of the query', () => {
                return expect(w).to.deep.include.members(out.where);
            });
            it('limit part of the query', () => {
                return expect(out.limit).to.equal(l);
            });
        });
    });
    describe('getSuggestions', () => {
        const sugg = [
                'description',
                'damage',
                'duration',
                'cast_time',
                'materials',
                'higher_levels'
            ],
            spell = {
                name: 'Fireball',
                description: true,
                cast_time: true,
                higher_levels: true,
                damage: true,
                duration: true,
                components: {
                    material: true
                }
            };
        it('with array for screen', () => {
            capabilities = ['screen'];

            let expected = ['what is Fireball?'],
                output = tools.getSuggestions(sugg, spell);

            expect(expected).to.deep.contains.members(output);
        });
        it('with array for speech', () => {
            capabilities = ['audio'];

            let output = tools.getSuggestions(sugg, spell);
            expect(output).to.be.a('string');
        });
    });
    describe('setResponse', () => {
        let str = 'this is a sample response';
        it('speech only', () => {
            let output = tools.setResponse({input: str});

            expect(output.fulfillmentText).to.equal(str);
            // expect(output.payload.google.richResponse.items[0].simpleResponse.displayText).to.equal(str);
            // expect(output.payload.slack.text).to.equal(str);
            // expect(output.payload.google.richResponse.items[0].simpleResponse.textToSpeech).to.equal(`<speech>${str}</speech>`);
        });
    });
    describe('buildCard', () => {
        let card = {
                title: 'this is a sample response',
                subtitle: 'fire',
                text: 'lorem ipsum dolor sit amet'
            },
            data = {
                fulfillmentMessages: [],
                payload: {
                    google: {
                        richResponse: {
                            items: []
                        }
                    },
                    slack: {
                        attachments: []
                    }
                }
            };
        it('google', () => {
            let output = tools.buildCard(data, card, 'google'),
                googleCard = {
                    title: card.title,
                    subtitle: card.subtitle,
                    formattedText: card.text
                };

            expect(googleCard).to.deep.equal(output.payload.google.richResponse.items[0].basicCard);
        });
        it('slack', () => {
            let output = tools.buildCard(data, card, 'slack'),
                slackCard = {
                    title: card.title,
                    author_name: card.subtitle,
                    text: card.text
                };

            expect(slackCard).to.deep.equal(output.payload.slack.attachments[0]);
        });
        it('dialogflow', () => {
            let output = tools.buildCard(data, card, 'dialogflow'),
                dialogflowCard = {
                    title: card.title,
                    subtitle: card.text
                };

            expect(dialogflowCard).to.deep.equal(output.fulfillmentMessages[0].card);
        });
    });
    describe('addPhrase', () => {
        it('convert to School speech informal', () => {
            global.params = {
                'School': [
                    'necromancy'
                ]
            };
            let output = tools.addPhrase();

            expect(output).to.equal('necromancy');
        });
        it('convert to School speech formal', () => {
            global.params = {
                'School': [
                    'necromancy'
                ]
            };
            let output = tools.addPhrase(1);

            expect(output).to.equal('school of necromancy');
        });
        it('convert to Level speech', () => {
            global.params = {
                'Level': [
                    '2'
                ]
            };
            let output = tools.addPhrase();

            expect(output).to.equal('level 2');
        });
    });
    describe('listComplex', () => {
        it('query returns empty', () => {
            global.params = {
                'Class': [],
                'Level': [
                    '2'
                ],
                'School': [
                    'necromancy'
                ]
            };
            let output = tools.listComplex([]);

            expect(output.speech).to.equal('I don\'t know any level 2 necromancy spells.');
            expect(output.data.length).to.equal(0);
        });
        it('query returns 1 spell', () => {
            global.params = {
                'Class': [],
                'Level': [
                    '2'
                ],
                'School': [
                    'necromancy'
                ]
            };
            let output = tools.listComplex({
                size: 1
            });

            expect(output.speech).to.equal('There is only 1 level 2 necromancy spell.');
            expect(output.data.length).to.equal(0);
        });
        it('query returns multiple spells', () => {
            global.params = {
                'Class': [],
                'Level': [
                    '2'
                ],
                'School': [
                    'necromancy'
                ]
            };
            let output = tools.listComplex({
                size: 2
            });

            expect(output.speech).to.equal('There are 2 level 2 necromancy spells.');
            expect(output.data.length).to.equal(0);
        });
        it('query lists out multiple spells', () => {
            global.params = {
                'Class': [],
                'Level': [
                    '2'
                ],
                'School': [
                    'necromancy'
                ]
            };
            let output = tools.listComplex({
                size: 6,
                docs: [{
                    _fieldsProto: {
                        name: {
                            stringValue: 'spell 1'
                        }
                    }
                }, {
                    _fieldsProto: {
                        name: {
                            stringValue: 'spell 2'
                        }
                    }
                }, {
                    _fieldsProto: {
                        name: {
                            stringValue: 'spell 3'
                        }
                    }
                }, {
                    _fieldsProto: {
                        name: {
                            stringValue: 'spell 4'
                        }
                    }
                }, {
                    _fieldsProto: {
                        name: {
                            stringValue: 'spell 5'
                        }
                    }
                }, {
                    _fieldsProto: {
                        name: {
                            stringValue: 'spell 6'
                        }
                    }
                }]
            }, true);

            expect(output.speech.substr(0, 72)).to.equal('There are 6 level 2 necromancy spells, <break time=\'350ms\' /> including ');
        });
    });
});
