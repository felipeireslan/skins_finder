# skins_finder


- Script developed with Node JS and using Telegram Bot.

### First Steps

After you clonning or download this repository you have to enter on folder using Terminal or Command Prompt 
and run the following command.

```
    npm install
```

This command will install all `nodejs` dependencies.

- After that you have to create a file with a name `envConfig.js` like below.

```javascript
    const envConfig = {
        url: 'STREAM ELEMENTS URL STORE',
        token: 'YOUR TELEGRAM BOT TOKEN',
        items_path: 'STREAM ELEMENTS PATH TO FIND ITENS (URL THAT RETURNS A JSON WITH THE ITEMS)',
        points_path: 'STREAM ELEMENTS PATH TO FIND YOUR POINTS (URL THAT RETURNS A JSON WITH YOU POINTS)',
        chatId: 'YOU TELEGRAM CHAT ID'
    };

    module.exports = envConfig;
```

- This project was developed with purpose to works like a robot.

He will stay searching every 15 minutes on stream elements store finding for new products (csgo skins),
when he find something he will send a message on Telegram (usign Telegram Bot).
Was created 2  commands on Telegram Bot that you can use to check how many points you have and to check 
if there is a new item for sale on Store.


Telegram Bot commands available:

```
    /checkpoints [nickName] -- Will show you your points on streamer store
    /checkitems -- Will show itens availables on streamer store
```