const   constants       = require('./constants'),
        fs              = require('fs'),
        TelegramBot     = require('node-telegram-bot-api'),
        envConfig       = fs.existsSync(__dirname + '/envConfig.js') ? require('./envConfig') : null,
        getCurrentDate  = constants.getCurrentDate,
        makeHTTPRequest = constants.makeHTTPRequest;

const   DEFAULT_CICLE_TIMEOUT = 900000,
        baseUrl                 = (process.env.url || envConfig.url),
        token                   = (process.env.token || envConfig.token),
        items_path              = (process.env.items_path || envConfig.items_path),
        points_path             = (process.env.points_path || envConfig.points_path),
        _chatId                 = (process.env.chatId || envConfig._chatId);

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];

    bot.sendMessage(chatId, resp);
});

bot.onText(/\/checkitems/, (msg, match) => {
    const chatId = msg.chat.id;

    findNewProductList(chatId)
});

bot.onText(/\/checkpoints (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    getTotalPoints(chatId, match[1])
});

/**
 * Function to find new Products and send a message for a specific user.
 * 
 * @param {String} chat_id string that represents a user Telegram Chat ID.
 * 
 * @returns {Void}
 */
function findNewProductList(chat_id) {
    makeHTTPRequest(baseUrl + items_path, 'GET', null, null, null)
        .then(result_data => {
            if (result_data.status === 200) {
                let skins_list = result_data.data,
                    skins_found = [];

                skins_found = skins_list.filter(current_skin => current_skin.enabled === true && current_skin.quantity.current > 0);

                if (skins_found.length > 0) {
                    for (let i = 0; i < skins_found.length; i++) {
                        const current_found_skin = skins_found[i];

                        if (current_found_skin.preview) {
                            bot.sendPhoto(
                                chat_id,
                                current_found_skin.preview,
                                { caption: `Name: ${current_found_skin.name}\n` + 
                                            `Price: ${current_found_skin.cost}.\n` + 
                                            `Available: ${current_found_skin.quantity.current}` }
                            );
                        } else {
                            bot.sendMessage(
                                chat_id,
                                `Found one item on Store.\n` + 
                                `Name: ${current_found_skin.name}\n` + 
                                `Price: ${current_found_skin.cost}.\n` + 
                                `Available: ${current_found_skin.quantity.current}`
                            );
                        }
                    }
                } else {
                    bot.sendMessage(
                        chat_id,
                        `Nothing available.`
                    );
                }
            }
        }).catch(error => {
            bot.sendMessage(
                _chatId,
                `An error was occurred. ${error.message || JSON.stringify(error)}`
            );
        });
};

/**
 * Function to get total of points that user has.
 * 
 * @param {Number} chat_id value that represents a user Telegram Chat ID
 * @param {String} username the name of user that will find Points.
 * 
 * @returns {Void}
 */
function getTotalPoints(chat_id, username) {
    makeHTTPRequest(baseUrl + points_path + username, 'GET', null, null, null)
        .then(result_data => {
            if (result_data.status === 200) {
                let data = result_data.data;

                bot.sendMessage(
                    chat_id,
                    `Name: ${data.username}\n` + 
                    `Points: ${data.points}\n` + 
                    `Current Rank: ${data.rank}`
                );
            } else {
                bot.sendMessage(
                    chat_id,
                    `An error was occurred. StatusCode: ${result_data.status}, Message: ${JSON.stringify(result_data.data)}`
                );
            }
        }).catch(error => {
            if (error.response.data.statusCode === 404) {
                bot.sendMessage(
                    chat_id,
                    `User not found with given username: ${username}`
                );
            } else {
                bot.sendMessage(
                    chat_id,
                    `An error was occurred. StatusCode: ${error.response.data.statusCode}, Message: ${JSON.stringify(error.response.data.message)}`
                );
            }
            bot.sendMessage(
                chat_id,
                `An error was occurred. ${error.message || JSON.stringify(error)}`
            );
        })
};


/**
 * Recursive function that every 15 minutes makes a request on selected web site and find new Products.
 * When found a new Product this function send a new message on Telegram to a Chat ID that was defined before. 
 *  
 * @returns {Void}
 */
async function init() {
    await makeHTTPRequest(baseUrl + items_path, 'GET', null, null, null)
        .then(result_data => {
            if (result_data.status === 200) {
                let skins_list = result_data.data,
                    _skins_list = [];

                _skins_list = skins_list.filter(current_skin => current_skin.enabled === true && current_skin.quantity.current > 0);

                for (let i = 0; i < _skins_list.length; i++) {
                    const current_found_skin = _skins_list[i];

                    if (current_found_skin.preview) {
                        bot.sendPhoto(
                            _chatId,
                            current_found_skin.preview,
                            { caption: `Name: ${current_found_skin.name}\nPrice: ${current_found_skin.cost}.\nAvailable: ${current_found_skin.quantity.current}` }
                        );
                    } else {
                        bot.sendMessage(
                            _chatId,
                            `Found one item on Store.\nName: ${current_found_skin.name}\nPrice: ${current_found_skin.cost}.\nAvailable: ${current_found_skin.quantity.current}`
                        );
                    }
                }
            } else {
                bot.sendMessage(
                    _chatId,
                    `An error was occurred. StatusCode: ${result_data.status}, Data: ${JSON.stringify(result_data.data)}`
                );

                setTimeout(() => {
                    return init()
                }, DEFAULT_CICLE_TIMEOUT);
            }
        }).catch(error => {
            bot.sendMessage(
                _chatId,
                `An error was occurred. ${error.message || JSON.stringify(error)}`
            );

            setTimeout(() => {
                return init()
            }, DEFAULT_CICLE_TIMEOUT);
        });

    console.log(`Finished cicle at: ${getCurrentDate()}`);
    await setTimeout(() => {
        return init()
    }, DEFAULT_CICLE_TIMEOUT);
};

init();