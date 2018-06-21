exports = module.exports = {
	"welcome": {
		"say": [
				"Hi! What do you want to know about?",
				"Hello. What can I help you with today?"
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
		"noDuration": "This spell has no duration.",
		"what": {
			"damage": {
				"hasProperty": "<spellName> does <res>",
				"doesntHaveProperty": "<spellName> doesn't cause any damage."
			},
			"casting_time": {
				"hasProperty": "<spellName> takes <res> to cast",
				"doesntHaveProperty": "<spellName> has no casting time"
			},
			"class": {
				"hasProperty": "<spellName> can be cast by <res>",
				"doesntHaveProperty": "<spellName> can't be cast by players"
			}
		}
	}
};