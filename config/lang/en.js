exports = module.exports = {
  "welcome": {
    "say": [
      "Hi! What do you want to know about?",
      "Hello. What can I help you with today?",
      "<emphasis level='low'>Well,</emphasis> hello there!",
      "Hi! Is there a spell on your mind?"
    ],
    "help_intro": "I can",
    "help": [
      "lookup spells",
      "describe conditions"
    ]
  },
  "fallback": {
    "say": [
      "Sorry, I didn't get that",
      "Sorry, could you say again?",
      "mmh? Sorry, I wasn't paying attention"
    ]
  },
  "tools": {
    "oneAtATime": "Sorry, can we do this one <param> at a time?",
    "contextNotFound": "Sorry, what were we talking about? Can you ask the question more explicitly please?"
  },
  "help": {
    "oneAtATime": "Sorry, can we do this one <param> at a time?",
    "contextNotFound": "Sorry, what were we talking about? Can you ask the question more explicitly please?",
    "magic": {
      "school": {
        "hasProperty": [
          "The School of <targetName> is about <res>",
          "<targetName> School regards <res>",
          "<targetName> is all about <res>"
        ],
        "doesntHaveProperty": [
          "<targetName> isn't a School of Magic"
        ]
      }
    }
  },
  "spell": {
    "notFound": [
      "Sorry, I don't know that spell",
      "Mmm, that spell's not in my book",
      "I haven't heard of that spell"
    ],
    "what": {
      "init": {
        "hasProperty": ["<targetName> is a <res>"]
      },
      "components": {
        "hasProperty": [
          "<targetName> is cast using <res> <component>",
          "<targetName> needs <res> <component>",
          "You need to cast <targetName> with <res> <component>"
        ],
        "doesntHaveProperty": ["<targetName> doesn't have any components"]
      },
      "materials": {
        "hasProperty": [
          "<targetName> is cast using <materials>",
          "<targetName> needs <materials>",
          "You need to have <materials> to cast <targetName>"
        ],
        "doesntHaveProperty": ["<targetName> doesn't need any material components"]
      },
      "damage": {
        "hasProperty": ["<targetName> does <res>"],
        "doesntHaveProperty": ["<targetName> doesn't cause any damage"]
      },
      "casting_time": {
        "hasProperty": ["<targetName> takes <res> to cast"]
      },
      "class": {
        "hasProperty": ["<targetName> can be cast by <res>"],
        "doesntHaveProperty": ["<targetName> can't be cast by players"]
      },
      "duration": {
        "hasProperty": ["<targetName> <connector> <res>"],
        "doesntHaveProperty": ["<targetName> has no duration"],
      },
      "description": {
        "hasProperty": ["<res>"],
        "doesntHaveProperty": ["Sorry, I don't know that spell"]
      },
      "level": {
        "hasProperty": ["<targetName> is <res>"],
        "doesntHaveProperty": [
          "Mmm, I'm not sure what level <targetName> is",
          "Sorry, I don't know the level of <targetName>"
        ]
      },
      "school": {
        "hasProperty": [
          "<targetName> belongs to the School of <res>",
          "<targetName> is from the School of <res>"
        ],
        "doesntHaveProperty": ["Sorry, I don't know which school <targetName> belongs to"]
      },
      "range": {
        "hasProperty": [
          "<targetName>'s range is <res><shapePhrase>",
          "<targetName> can reach <res><shapePhrase>"
        ],
        "doesntHaveProperty": ["Sorry, I don't know which school <targetName> belongs to"]
      },
      "heal": {
        "hasProperty": ["<targetName> heals for <res>"],
        "doesntHaveProperty": ["<targetName> doesn't heal"]
      },
      "concentration": {
        "hasProperty": [
          "Yes, <targetName> needs concentration",
          "<targetName> does need you to keep focusing on it"
        ],
        "doesntHaveProperty": [
          "No, <targetName> doesn't need concentration",
          "No, you don't need to keep focusing on <targetName>",
          "No, you can just cast <targetName>"
        ]
      },
      "higher_levels": {
        "hasProperty": [
          "<res>"
        ],
        "doesntHaveProperty": [
          "You can't cast <targetName> at a higher level",
          "<targetName> can't be cast with a <emphasis level='low'>higher level spell slot</emphasis>"
        ]
      }
    },
    "check": {
      "class": {
        "doesntHaveProperty": [
          "No, <targetName> can't be <usePassive> by <notMatch>"
        ],
        "hasProperty": [
          "Yes, <targetName> can be <usePassive> by <match>"
        ],
        "mixedProperty": [
          "<match> can <useActive> <targetName>, but <notMatch> can't"
        ]
      },
      "ritual": {
        "doesntHaveProperty": [
          "No, <targetName> can't be <usePassive> as a ritual",
          "No, <targetName> isn't a ritual",
          "Nope, <targetName> is no ritual"
        ],
        "hasProperty": [
          "Yes, <targetName> can be <usePassive> as a ritual",
          "Yes, <targetName> is a ritual",
          "Yeah, <targetName> works as a ritual"
        ]
      }
    }
  },
  "weapon": {
    "notFound": [
      "Sorry, I don't know about any <targetName>",
      "Mmm, that weapon's not in stock",
      "I haven't heard of <targetName>"
    ],
    "what": {
      "init": {
        "hasProperty": ["<targetName> is a <res>"]
      },
      "damage": {
        "hasProperty": ["<targetName> does <res>"],
        "doesntHaveProperty": ["<targetName> doesn't cause any damage"]
      },
      "cost": {
        "hasProperty": [
          "A <targetName> costs <res>",
          "A <targetName> goes for <res>",
          "<res> for a <targetName>",
        ],
        "doesntHaveProperty": [
          "A <targetName> doesn't have a price",
          "A <targetName> is free!",
          "Just take the <targetName>, no charge"
        ]
      }
    }
  },
  "condition": {
    "notFound": [
      "Sorry, I don't know that spell",
      "Mmm, that spell's not in my book",
      "I haven't heard of that spell"
    ]
  },
  "server": {
    "timeOut": [
      "Sorry, the I took too long to find it",
      "Ups, the this doesn't seem to be in the book"
    ]
  }
};
