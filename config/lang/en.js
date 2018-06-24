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
                "hasProperty": "<spellName> is a <res>"
            },
            "damage": {
                "hasProperty": "<spellName> does <res>",
                "doesntHaveProperty": "<spellName> doesn't cause any damage"
            },
            "casting_time": {
                "hasProperty": "<spellName> takes <res> to cast"
            },
            "class": {
                "hasProperty": "<spellName> can be cast by <res>",
                "doesntHaveProperty": "<spellName> can't be cast by players"
            },
            "duration": {
                "hasProperty": "<spellName> <connector> <res>",
                "doesntHaveProperty": "<spellName> has no duration",
            },
            "description": {
                "hasProperty": "<res>",
                "doesntHaveProperty": "Sorry, I don't know that spell"
            },
            "level": {
                "hasProperty": "<spellName> is <res>",
                "doesntHaveProperty": [
                	"Mmm, I'm not sure what level <spellName> is",
                	"Sorry, I don't know the level of <spellName>"
                ]
            },
            "school": {
                "hasProperty": [
                	"<spellName> belongs to the School of <res>",
                	"<spellName> is from the School of <res>"
                ],
                "doesntHaveProperty": "Sorry, I don't know which school <spellName> belongs to"
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
