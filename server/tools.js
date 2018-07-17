'use strict';

const MongoClient = require('mongodb').MongoClient,
  keysSetup = {
    class: {
      deep: true,
        phrase: false
    },
    level: {
      deep: false,
      phrase: 'level ',
      phraseLevel: 0
    },
    school: {
      deep: false,
      phrase: 'school of ',
      phraseLevel: 1
    }
  };

// Connection URL
const url = `mongodb://Godo:Lollipop12@cluster0-shard-00-00-g9w91.mongodb.net:27017,cluster0-shard-00-01-g9w91.mongodb.net:27017,cluster0-shard-00-02-g9w91.mongodb.net:27017/test`,
  mongo_options = {
    ssl: true,
    sslValidate: true,
    useNewUrlParser: true,
    poolSize: 10,
    replicaSet: 'Cluster0-shard-0',
    authSource: 'admin',
    retryWrites: true
  },
  dbName = 'dragon';

const tools = {
  getQuery: (multipleAllowed = false, request = global.request) => {
    // check how many parameters are defined
    let output = [];

    for (let kParam in request.body.queryResult.parameters) {
      let thisParam = request.body.queryResult.parameters[kParam];

      if (!multipleAllowed) {
        if (thisParam.length > 1) {
          response.json(tools.setResponse({
            input: i18n.tools.oneAtATime.replace(/<param>/g, kParam.toLowerCase())
          }));
          return false;
        }
      }
      for (var i = thisParam.length - 1; i >= 0; i--) {
        output.push(tools.queryArgumentBuild(thisParam[i], kParam));
      }
    }

    return output;
  },
  queryArgumentBuild: (input, className) => {
    className = `${className.toLowerCase()}`;
    let output = className;
    // is it a direct comparison, or do I need to look in an object?
    if (keysSetup[className].deep) {
      output = `${className}.${input.toLowerCase()}`;
    }

    output = [
      output,
      '==',
      keysSetup[className].deep ? true : input.toLowerCase()
    ];

    return output;
  },
  getCollection: ({
    collection = actionArr[1],
    param = 'name',
    allowMultiple = false,
    params = global.params,
    action = global.actionArr,
    limit = 20,
    fields = [],
    query = sak.queryBuilder({
      params: params
    })
  } = {}) => {
    // setup fields to return
    let return_fields = {};
    // is this a help query? Those are processed a little diffrently
    if (collection === 'help') {
      query = {
        '_id': action[1]
      };
      let deep = 'description';
      // if no slot value has been passed, the user wants to know about the thing itself, get the description
      if (params[intention]) {
        deep = `data.${params[intention]}`;
      }
      fields.push(`${intention}.${deep.toLowerCase()}`);
    }

    // fields need to be an object, but it's easier to manage up to now as an array
    if (!fields.includes('name')) fields.push('name');
    for (var i = fields.length - 1; i >= 0; i--) {
      return_fields[fields[i]] = 1;
    }
    if (process.env.DEBUG) console.log("\x1b[36m", `${collection} query: `, query);
    if (process.env.DEBUG && Object.keys(fields).length) console.log(`fields: `, return_fields, "\x1b[0m");
    let serve = new Promise((resolve, reject) => {
      if (query) {
        return MongoClient.connect(url, mongo_options, (err, client) => {
          if (err) throw err;
          return client.db(dbName).collection(collection).aggregate([{
              $match: query
            },
            {
              $project: return_fields
            },
            {
              $sample: {
                size: limit
              }
            }
          ]).toArray((err, docs) => {
            if (err) throw err;
            if (docs.length === 1 || !allowMultiple) {
              docs = docs[0];
            }

            client.close();
            return resolve(docs);
          });
        });
      } else {
        return resolve(false);
      }
    });
    //timeout gracefully
    let time = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(false);
      }, 5000);
    })
    return Promise.race([
      serve,
      time
    ]);
  },
  getCount: ({
    collection = actionArr[1],
    param = 'name',
    params = global.params,
    action = global.actionArr,
    query = sak.queryBuilder({
      params: params
    })
  } = {}) => {
    return new Promise((resolve, reject) => {
      return MongoClient.connect(url, mongo_options, (err, client) => {
        if (err) throw err;
        // return client.db(dbName).collection(collection).find(query).count().then(x => {
        return client.db(dbName).collection(collection).find(query).count().then(x => {
          resolve(x);
        });
      });
    });
  },
  querySpell: ({
    where,
    limit,
    order = 'name',
    method = 'get'
  } = {}) => {
    let output = db.collection('spells');
    for (var i = where.length - 1; i >= 0; i--) {
      output = output.where(where[i][0], where[i][1], where[i][2]);
    }

    if (limit) output = output.limit(limit);
    if (method === 'count') {
      output = output.count();
    } else if (method === 'get') {
      output = output.get();
    }
    return output;
  },
  /*
      buildRow: data => {
          let output = {
              "cells": [],
              "dividerAfter": true
          };

          for (var i = data.length - 1; i >= 0; i--) {
              output.cells.unshift({
                  text: data[i]
              });
          }

          return output;
      },
  */
  getSuggestions: ({input = [], spell = {
    name: () => {
      return global.params.spell
    }
  }, suggestionIntro = 'I can also tell you', capabilities = global.capabilities}={}) => {
    let output = spell ? [] : input;

    let speaker = !capabilities.includes('screen') && capabilities.includes('audio');
    if (capabilities.includes('screen') || capabilities.includes('audio')) {
        if (input.includes('description') && spell.description && intention !== 'description' && intention !== 'init') {
          output.push(speaker ? `what it is` : `what is ${spell.name}?`);
        }
        if (input.includes('damage') && spell.damage && intention !== 'damage') {
          output.push(speaker ? `what damage it does` : `what damage does it do?`);
        }
        if (input.includes('heal') && spell.heal && intention !== 'heal') {
          output.push(speaker ? `how much it heals` : `how much does it heal?`);
        }
        if (input.includes('level') && spell.level && intention !== 'level') {
          output.push(speaker ? `the level it is` : `what level is it?`);
        }
        if (input.includes('duration') && spell.duration && intention !== 'duration') {
          output.push(speaker ? `how long it lasts` : `how long does it last?`);
        }
        if (input.includes('cast_time') && spell.cast_time && intention !== 'cast_time') {
          output.push(speaker ? `how long it takes to cast` : `how long does it take to cast?`);
        }
        if (input.includes('range') && spell.range && intention !== 'range') {
          output.push(speaker ? `how far it reaches` : `what's its range?`);
        }
        if (input.includes('school') && spell.school && intention !== 'school') {
          output.push(speaker ? `which school it beongs to` : `which school is it?`);
        }
        if (input.includes('materials') && spell.components && spell.components.material && intention !== 'materials') {
          output.push(speaker ? `what materials it needs` : `what materials do I need`);
        }
        if (input.includes('higher_levels') && spell.higher_levels && intention !== 'higher_levels') {
          output.push(speaker ? `how it levels up` : `how does it level up`);
        }
    }

    if (output.length) {
      // prevent too many suggestions
      output = sak.shuffleArray(output, 3);
      // structure voice suggestions
      if (speaker) {
        if (suggestionIntro) suggestionIntro = suggestionIntro + ' ';
        output = suggestionIntro + sak.combinePhrase({
          input: output,
          concat: 'or'
        });
      } else if (capabilities.includes('screen') && source === 'google') {
        input.forEach(sugg => {
          output.push({
            "title": sugg
          });
        });
      }
    }
    return output;
  },
  setResponse: ({
    input = null,
    suggestions = [],
    pause = 5,
    followUp = true,
    source = global.source,
    capabilities = global.capabilities
  }) => {
    let output,
      speak = !capabilities.includes('screen') && capabilities.includes('audio');
    if (input) {
      if (typeof input === 'string') {
        input = {
          speech: input
        };
      }

      // get rid of leading and trailing whitespaces
      if(input.text) input.text = input.text.trim();
      if(input.speech) input.speech = input.speech.trim();

      // check if the text is too big to output
      // if there's also a card, the text should be trimmed
      if (input.card && input.text && input.text.length > 200) {
        input.trimText = input.text.substr(0, 199) + '...';
      }

      // if it doesn't have a screen, read out the suggestions
      if (suggestions.length && speak) {
        input.speech = `${input.speech}.<break time='${pause}s'/>${suggestions}`;
      }
      // no text? take the speech
      if (!input.text && input.speech)
        input.text = sak.clearSpeech(input.speech).trim();
      // no speech? take the text
      if (!input.speech && input.text)
        input.speech = input.text;

      output = {
        fulfillmentText: '',
        fulfillmentMessages: [],
        payload: {}
      };

      let speech = `<speech>${sak.cleanText(input.speech)}</speech>`;

      if (source === 'web') {
        output.fulfillmentText = speak ? speech : sak.formatText(input.text, 'web');
        output.payload.fulfillmentSpeech = speech;
        if (!speak && suggestions.length && capabilities.includes('screen')) {
          output.payload.suggestions = suggestions;
        }
      } else if (source === 'google') {
        output.payload = {
          google: {
            expectUserResponse: true,
            is_ssml: true,
            richResponse: {
              items: [{
                simpleResponse: {
                  textToSpeech: speech,
                  displayText: sak.cleanText(sak.clearSpeech(input.trimText ? input.trimText : input.text))
                }
              }]
            }
          }
        };
        if (suggestions.length && capabilities.includes('screen')) {
          output.payload.google.richResponse.suggestions = [];
          for (var i = 0; i < suggestions.length; i++) {
            output.payload.google.richResponse.suggestions.push({
              title: suggestions[i]
            });
          }
        }
      } else if (source === 'alexa') {
        output.payload = {
          alexa: {
            text: sak.formatText(input.text, 'alexa'),
            SSML: speech
          }
        };
      } else if (source === 'slack') {
        output.payload = {
          slack: {
            text: sak.formatText(input.text, 'slack')
          }
        };
      }
      if (input.card) {
        output = tools.buildCard(output, input.card);
      }

      if (!process.env.SILENT) console.log("\x1b[32m", speak ? speech : input.text, "\x1b[0m");
    }
    if (!process.env.SILENT && process.env.DEBUG) console.timeEnd('total response time');
    return output;
  },
  buildButtons: (input, platform = 'google') => {
    let buttons = [],
      output = false,
      button;
    switch (platform) {
      case ('dialogflow'):
        buttons = [];
        input.forEach(btn => {
          button = {};
          input.title ? button.title = input.title : null;
          input.url ? button.postback = input.url : null;
          buttons.push(button);
        });
        output = buttons;
        break;
      case ('google'):
        buttons = [];
        input.forEach(btn => {
          button = {};
          input.title ? button.title = input.title : null;
          input.url ? button.openUrlAction = {
            url: input.url
          } : null;
          buttons.push(button);
        });
        output = buttons;
        break;
      case ('slack'):
        actions = [];
        input.forEach(btn => {
          button = {};
          if (input.title) {
            button.text = input.title;
            button.type = input.title;
            button.value = input.title;
          }
          actions.push(button);
        });
        output = actions;
        break;
    }
    return output;
  },
  buildCard: (output, input, platforms = global.source) => {
    let card;
    if (platforms === 'web' || platforms === 'dialogflow') {
      card = {};
      if (input.title) card.title = input.title;
      if (input.text) card.subtitle = sak.formatText(input.text, source);
      if (input.image) card.imageUri = input.imageUri;
      if (input.buttons && input.buttons.length) card.buildButtons(input.buttons, 'dialogflow');
      output.fulfillmentMessages.push({
        card
      });
    }
    if (platforms === 'google') {
      card = {};
      if (input.title) card.title = input.title;
      if (input.subtitle) card.subtitle = input.subtitle;
      if (input.text) card.formattedText = input.text;
      if (input.image) card.image_url = input.image;
      output.payload.google.richResponse.items.push({
        basicCard: card
      });
    }
    if (platforms === 'slack') {
      card = {};
      if (input.title) card.title = input.title;
      if (input.subtitle) card.author_name = input.subtitle;
      if (input.text) card.text = input.text;
      if (input.image) card.image = {
        url: input.image,
        accessibilityText: input.title ? input.title : null
      };
      if (input.buttons && input.buttons.length) card.actions = buildButtons(input.buttons, 'slack');
      if (input.suggestions && input.suggestions.length) card.push(buildButtons(input.suggestions, 'slack'));
      if (!output.payload.slack.attachments || !output.payload.slack.attachments.length) {
        output.payload.slack.attachments = [];
      }
      output.payload.slack.attachments.push(card);
    }

    return output;
  },
  addPhrase: (level = 0) => {
    let output = '';
    for (let k in params) {
      if (params[k].length) {
        let out = params[k];
        if (keysSetup[k] && keysSetup[k].phrase && keysSetup[k].phrase.length && keysSetup[k].phraseLevel === level) {
          out = keysSetup[k].phrase + out;
        }
        output = output + ' ' + out;
      }
    }
    output = sak.cleanText(output);

    return output;
  },
  listComplex: ({
    list,
    verboseLevel = true,
    count = 0
  } = {}) => {
    let keyPhrase = tools.addPhrase();

    let output = {
      speech: `I don't know any ${keyPhrase} spells.`
    };

    if (count === 1) {
      output.speech = `There is only 1 ${keyPhrase} spell.`;
    } else if (count > 1) {
      output.speech = `There are ${count} ${keyPhrase} spells.`;
    }

    if (verboseLevel && count > 0) {
      let pause = '';
      if (!capabilities.includes('screen') && capabilities.includes('audio')) pause = '<break time=\'350ms\'/>';
      let className = count > 1 ? `There are ${count} ${keyPhrase} spells, ${pause}including` : `The only ${keyPhrase} spell is`;
      let listed = [];
      const loop = list.length <= 4 ? list.length : 4;
      for (var i = 0; i < loop; i++) {
        listed.push(list[i].name);
      }
      listed = sak.combinePhrase({
        input: listed
      });
      output.speech = `${className} ${listed}`;
    }

    output.size = count;
    output.keyPhrase = keyPhrase;

    return output;
  },
  formatWhatData: ({
    data = {},
    intnt = 'init',
    collection = 'spell'
  }) => {
    let output;
    switch (collection) {
      case ('spell'):
        output = tools.format.spellData({
          data: data,
          intnt: intnt
        });
        break;
      case ('weapon'):
        output = tools.format.weaponData({
          data: data,
          intnt: intnt
        });
        break;
    }
    return output;
  },
  format: {
    spellData: ({
      data = {},
      intnt = 'init'
    } = {}) => {
      let output = {
          res: ''
        },
        arr = [];
      switch (intnt) {
        case ('init'):
          output.res = data.type;
          let int = 'damage';
          if (data.heal) {
            int = 'heal';
          }
          if (data.damage) output.res = `${output.res} that does ${tools.format.spellData({data:data, intnt:int}).res}`;
          break;
        case ('damage'):
          arr = []
          for (var da = data.damage.length - 1; da >= 0; da--) {
            let o = `${data.damage[da].amount ? data.damage[da].amount : ''}${data.damage[da].dice ? data.damage[da].dice : ''}${data.damage[da].type ? ' ' + data.damage[da].type : ''} damage${data.damage[da].extra ? ' and ' + data.damage[da].extra : ''}`;
            arr.push(o);
          }
          output.res = sak.combinePhrase({
            input: arr
          });
          break;
        case ('heal'):
          output.res = `${data.heal.amount ? data.heal.amount : ''}${data.heal.dice ? data.heal.dice : ''}${data.heal.extra ? ' <emphasis level="low">and ' + data.heal.extra + '</emphasis>' : ''}${data.heal.temporary ? 'temporary' : ''}`;
          break;
        case ('casting_time'):
          arr = [];
          for (var ct = data.casting_time.length - 1; ct >= 0; ct--) {
            let o = `${data.casting_time[ct].amount} ${data.casting_time[ct].amount > 1 ? sak.plural(data.casting_time[ct].unit) : data.casting_time[ct].unit}`;
            if (data.casting_time.description) {
              o = `${o} You can take it ${data.casting_time.description}`;
            }
            arr.push(o);
          }
          output.res = sak.combinePhrase({
            input: arr
          });
          break;
        case ('class'):
          arr = [];
          for (let classy in data.class) {
            arr.push(sak.plural(classy));
          }
          if (data.class.length > 1) {
            arr = sak.combinePhrase({
              input: arr
            });
          } else {
            arr = `${arr} only`;
          }
          output.res = arr;
          break;
        case ('duration'):
          output.connector = data.duration === 'instantaneous' ? 'is' : 'lasts for';
          output.res = data.duration;
          break;
        case ('level'):
          if (parseInt(data.level) === 0) {
            output.res = 'a Cantrip';
          } else {
            output.res = 'Level ' + data.level;
          }
          break;
        case ('range'):
          output.res = sak.unit({
            input: data.range
          });
          if (data.shape) {
            output.shapePhrase = [
              ' as a ' + data.shape,
              ' in a ' + data.shape,
              ' in the shape of a ' + data.shape
            ];
            output.shapePhrase = sak.shuffleArray(output.shapePhrase, 1);
          }
          break;
        case ('components'):
          output.res = i18n.spell.what.components.doesntHaveProperty;
          if (data.components) {
            output.res = [];
            output.component = (data.components.length > 1) ? sak.plural('component') : 'component';
            if (Array.isArray(data.components)) {
              data.components.forEach(c => {
                output.res.push((data.components.length > 1) ? c : sak.preposition(c));
              });
              output.res = sak.combinePhrase({
                input: output.res
              });
            } else {
              output.res = data.components;
            }
          }
          break;
        case ('materials'):
          output.res = i18n.spell.what.components.doesntHaveProperty;
          if (data.materials) {
            output.res = [];
            output.materials = data.materials;
          }
          break;
        default:
          let forbidden = ['_id', 'name'];
          output.res = Object.keys(data)
            .filter(x => {
              return !forbidden.includes(x);
            })
            .reduce((obj, key) => {
              obj = data[key];
              return obj;
            }, {});
      }
      return output;
    },
    weaponData: ({
      data = {},
      intnt = 'init',
      concat = 'or'
    } = {}) => {
      let output = {
          res: ''
        },
        arr = [];
      switch (intnt) {
        case ('init'):
          output.res = `${sak.preposition(data.tier)} ${data.type} weapon`;
          if (data.damage) output.res = `${output.res} that does ${tools.format.weaponData({data:data, intnt:'damage'}).res}`;
          break;
        case ('damage'):
          arr = [];
          for (var da = data.damage.length - 1; da >= 0; da--) {
            let o = `${data.damage[da].amount ? data.damage[da].amount : ''}${data.damage[da].dice ? data.damage[da].dice : ''} ${data.damage[da].type ? data.damage[da].type : ''} damage${data.damage[da].extra ? ' and ' + data.damage[da].extra : ''}`;
            arr.push(o);
          }
          output.res = sak.combinePhrase({
            input: arr,
            concat: 'or'
          });
          break;
        case ('cost'):
          output.res = `${data.cost.amount} ${data.cost.unit} pieces`;
          break;
      }
      return output;
    }
  },
  getDescription: ({
    data = {},
    collection = global.collection
  }) => {
    let output;
    if (data.description) {
      output = data.description;
    } else if (collection === 'weapon') {
      output = `${data.tier} ${data.type} weapon\n${tools.format.weaponData({data:data, intnt:'damage'}).res}`;
    }
    return output;
  }
}
exports = module.exports = tools;
