'use strict';

const Discord = require('discord.js'),
	  client = new Discord.Client();

let apiai = require('apiai'),
    config = require('./config'),
    app = apiai(config.Dialogflow);

client.on('ready', () => {
    console.log("I am ready");
    //console.log(client.user.username);
});

client.on('message', (message) => {
    if((message.cleanContent.startsWith("@" + client.user.username) || message.channel.type === 'dm') && client.user.id !== message.author.id){
        // var mess = remove(client.user.username, message.cleanContent);
        let mess = client.user.username.replace("@" + message.cleanContent + " ", "");
        const user = message.author.id;
        return new Promise((resolve, reject) => {
            let request = app.textRequest(mess, {
                sessionId: user
            });
            request.on('response', (response) => {
                console.log(response);
                let rep = response.result.fulfillment.speech;
                resolve(rep);
            });

            request.on('error', (error) => {
                resolve(null);
            });

            request.end();
        }).then((data) =>{
            message.reply(data);
            return true;
        });
    }
    return true;
});


client.login(config.Discord);