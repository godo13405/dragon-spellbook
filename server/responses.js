'use strict';

const responses = {
  welcome: () => {
    let talk = tools.setResponse({
      input: sak.i18n(i18n.welcome.say),
      suggestions: tools.getSuggestions([
        `what is Acid Splash`,
        `what damage does Harm do`
      ], undefined, 'You can ask me stuff like ')
    });
    return response.json(talk);
  },
  fallback: () => {
    let talk = tools.setResponse({
      input: sak.i18n(i18n.fallback.say)
    });
    return response.json(talk);
  },
  condition: (params = global.params) => {
    return tools.getCollection({
        collection: 'conditions',
        param: 'condition',
        customParams: {
          condition: [params.condition[0]]
        }
      })
      .then(data => {
        let condition = data,
          sugg = [],
          talk = sak.i18n(i18n.condition.notFound);
        if (condition) {
          talk = {
            speech: `With ${params['condition'][0]} ${condition.description}`,
            card: {
              title: params['condition'][0],
              text: condition.description
            }
          };

          // if the condition is exhaustion, suggest there's more detail
          if (condition.levels && condition.levels.length) {
            // if the condition is exhaustion, check if a level is being asked for
            if (params.level) {
              delete talk.card;
              // check if the level exists
              if (condition.levels[parseInt(params.level) - 1]) {
                talk.speech = `Level ${params.level} Exhaustion results in ${condition.levels[params.level - 1].toLowerCase()}`;
                talk.text = `${condition.levels[params.level - 1]}`;
              } else {
                talk.speech = `Exhaustions levels only go up to 6`;
              }
            }
            sugg.push(`what's level ${sak.rng(6)} exhaustion`);
          }

          if (condition.long_description) {
            sugg.push('Tell me more');
          }
        } else {
          talk = sak.i18n(i18n.server.timeOut);
        }

        return response.json(tools.setResponse({
          input: talk,
          sugg
        }));
      }).catch(err => {
        if (process.env.DEBUG) console.log(err);
      });
  },
  query: {
    spellComplex: () => {
      let q = tools.getQuery();
      if (q) {
        tools.querySpell(q).then(list => {
          // set suggestions
          let sugg = {
            text: [
              `which are level ${sak.rng()}`
            ],
            speech: [
              `tell you which are level ${sak.rng()}`
            ]
          };

          // if they are a manageable number, offer to read them out loud
          if (list.size <= 10) {
            sugg.text.push('read them all out');
            sugg.speech.push('read them all out');
          }


          let output = tools.setResponse({
            input: tools.listComplex(list, 'summary'),
            suggestions: tools.getSuggestions(sugg),
            pause: 2
          });
          response.json(output);
        }).catch(err => {
          if (process.env.DEBUG) console.log(err);
        });
      }
    },
    countComplex: () => {
      let q = tools.getQuery(true);
      if (q) {
        tools.querySpell(q).then(list => {
          // set suggestions
          let sugg = {
            text: [
              `which are level ${sak.rng()}`
            ],
            speech: [
              `tell you which are level ${sak.rng()}`
            ]
          };

          // if they are a manageable number, offer to read them out loud
          if (list.size <= 10) {
            sugg.text.push('read them all out');
            sugg.speech.push('read them all out');
          }


          let output = tools.setResponse({
            input: tools.listComplex(list),
            suggestions: tools.getSuggestions(sugg),
            pause: 2
          });
          response.json(output);
        }).catch(err => {
          if (process.env.DEBUG) console.log(err);
        });
      }
    }
  },
  whatProperty: ({
    intention = global.intention,
    params = global.params,
    responses = ['speech', 'text'],
    target = 'spell',
    suggest = [
      'description',
      'materials',
      'higher_levels'
    ]
  } = {}) => {
    if (Array.isArray(params[target]) && params[target].length > 1) {
      return response.json(tools.setResponse({
        input: sak.i18n(i18n.tools.oneAtATime)
      }));
    } else {
      return tools.getCollection({
          collection: target,
          param: target
        })
        .then(data => {
          let talk;
          if (data) {
            talk = {
              speech: sak.i18n(i18n[target].what[intention].doesntHaveProperty ?
                i18n[target].what[intention].doesntHaveProperty :
                i18n[target].notFound, {
                  targetName: data.name
                })
            };

            if (data[intention] || intention === 'init') {
              let args = tools.formatWhatData({
                data: data,
                intnt: intention,
                collection: target
              });
              args.targetName = sak.titleCase(data.name);
              talk.speech = sak.i18n(i18n[target].what[intention].hasProperty, args);
            }

            if (responses) {
              if (responses.includes('card')) {
                talk.card = {
                  title: sak.titleCase(data.name),
                  subtitle: data.type,
                  text: tools.getDescription({
                    data: data
                  })
                };
              }
            }

            let sugg = suggestions[intention] || suggest;

            for (var i = sugg.length - 1; i >= 0; i--) {
              sugg[i] = sak.i18n(sugg[i]);
            }
            talk = tools.setResponse({
              input: talk,
              suggestions: tools.getSuggestions(sugg, data, 'Would you like to know ')
            });
          } else if (!params.length) {
            talk = tools.setResponse({
              input: sak.i18n(i18n[target].contextNotFound)
            });
          } else {
            talk = tools.setResponse({
              input: sak.i18n(i18n[target].notFound)
            });
          }
          return response.json(talk);
        }).catch(err => {
          if (process.env.DEBUG) console.log(err);
        });
    }
  },
  checkProperty: ({
    intention = global.intention,
    collection = global.collection,
    params = global.params,
    responses = ['speech', 'text'],
    target = 'spell',
    checks = 'class',
    suggest = [
      'description',
      'materials',
      'higher_levels'
    ]
  } = {}) => {
    return tools.getCollection({
        collection: target,
        param: target,
        customParams: {
          name: params.spell
        }
      })
      .then(data => {
        let talk = tools.setResponse({
          input: sak.i18n(i18n[target].notFound)
        });
        if (data) {
          console.log(params, checks);
          let conf = {
            spell: {
              use: {
                passive: 'cast',
                active: 'cast'
              }
            },
            weapon: {
              use: {
                passive: 'weilded',
                active: 'weild'
              }
            }
          };
          let args = {
              targetName: sak.titleCase(Array.isArray(params[target])? params[target][0] : params[target]),
              usePassive: conf[target].use.passive,
              useActive: conf[target].use.active
            },
            targetString = 'doesntHaveProperty';
          // check if it's one of many or just a yes no question
          if (params[checks]) {
            // check if all the checks came back positive
            let checksMatch = [...data[checks]].filter(x => params[checks].includes(x)),
              checksNotMatch = [...params[checks]].filter(x => !data[checks].includes(x));
            if (checksMatch.length) {
              args.match = sak.combinePhrase({
                input: checksMatch,
                makePlural: true,
                lowerCase: true,
              });
            }
            if (checksNotMatch.length) {
              args.notMatch = sak.combinePhrase({
                input: checksNotMatch,
                makePlural: true,
                lowerCase: true,
                concat: 'or'
              });
            }
            if (checksMatch.length && !checksNotMatch.length) {
              targetString = 'hasProperty'
            } else if (checksMatch.length && checksNotMatch.length) {
              targetString = 'mixedProperty'
            }
          } else {
            // just checking for a yes or no question, that's easy then
            if (data[checks]) {
              targetString = 'hasProperty';
            }
          }
          talk = {
            speech: sak.sentenceCase(sak.i18n(i18n[target].check[intention][targetString], args))
          };
          let sugg = suggestions[intention] || suggest;

          for (var i = sugg.length - 1; i >= 0; i--) {
            sugg[i] = sak.i18n(sugg[i]);
          }
          talk = tools.setResponse({
            input: talk,
            suggestions: tools.getSuggestions(sugg, data, 'Would you like to know ')
          });
        }
        return response.json(talk);
      }).catch(err => {
        if (process.env.DEBUG) console.log(err);
      });
  }
};
exports = module.exports = responses;
