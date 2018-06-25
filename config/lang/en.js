exports = module.exports = {
    "welcome": {
        "say": [
            "Hi! What do you want to know about?",
            "Hello. What can I help you with today?"
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
        "oneAtATime": "Sorry, can we do this one <param> at a time?"
    },
    "spell": {
        "notFound": [
            "Sorry, I don't know that spell",
            "Mmm, that spell's not in my book",
            "I haven't heard of that spell"
        ],
        "what": {
            "init": {
                "hasProperty": "<targetName> is a <res>"
            },
            "damage": {
                "hasProperty": "<targetName> does <res>",
                "doesntHaveProperty": "<targetName> doesn't cause any damage"
            },
            "casting_time": {
                "hasProperty": "<targetName> takes <res> to cast"
            },
            "class": {
                "hasProperty": "<targetName> can be cast by <res>",
                "doesntHaveProperty": "<targetName> can't be cast by players"
            },
            "duration": {
                "hasProperty": "<targetName> <connector> <res>",
                "doesntHaveProperty": "<targetName> has no duration",
            },
            "description": {
                "hasProperty": "<res>",
                "doesntHaveProperty": "Sorry, I don't know that spell"
            },
            "level": {
                "hasProperty": "<targetName> is <res>",
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
                "doesntHaveProperty": "Sorry, I don't know which school <targetName> belongs to"
            }
        }
    },
    "weapon":  {
      "notFound": [
            "Sorry, I don't know about any <targetName>",
            "Mmm, that weapon's not in stock",
            "I haven't heard of <targetName>"
        ],
        "what": {
              "init": {
                  "hasProperty": "<targetName> is a <res>"
              },
              "damage": {
                  "hasProperty": "<targetName> does <res>",
                  "doesntHaveProperty": "<targetName> doesn't cause any damage"
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