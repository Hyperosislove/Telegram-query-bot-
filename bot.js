const TelegramBot = require('node-telegram-bot-api');
const querystring = require('querystring');

// Replace 'YOUR_BOT_TOKEN' with your actual Telegram bot token
const BOT_TOKEN = '7669981514:AAFcvjb1xbdG4if9ZXYj-R58FKrdMLVzXQ0';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    const welcomeMessage = 
Hello! This bot was created by @hyperosislove.
It is updated every week and will not be operational on Fridays due to maintenance.
Please send me an encoded URL, and I will process it for you.
;

    const startButton = {
        reply_markup: {
            keyboard: [[{ text: '/start' }]],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    };

    bot.sendMessage(msg.chat.id, welcomeMessage, startButton);
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (!text.startsWith('/') && text.length > 0) { // Skip if it's a command
        try {
            // Extract the URL from the text
            const urlMatch = text.match(/https?:\/\/[^\s]+/);
            if (!urlMatch) throw new Error('No valid URL found in the text.');

            let urlText = urlMatch[0];

            const url = new URL(urlText);
            const fragment = url.hash.substring(1); // Remove the leading '#'
            const params = querystring.parse(fragment);

            let tgWebAppData;

            if (params.tgWebAppData) {
                tgWebAppData = params.tgWebAppData;
            } else if (params.query) {
                tgWebAppData = params.query;
            } else if (params.user) {
                tgWebAppData = user=${params.user};
            }

            if (tgWebAppData) {
                const decodedParams = querystring.parse(decodeURIComponent(tgWebAppData));

                let processedString;
                if (decodedParams.query_id) {
                    processedString = query_id=${decodedParams.query_id}&user=${encodeURIComponent(decodedParams.user)}&auth_date=${decodedParams.auth_date}&hash=${decodedParams.hash};
                } else if (decodedParams.user && decodedParams.auth_date && decodedParams.hash) {
                    processedString = user=${encodeURIComponent(decodedParams.user)}&auth_date=${decodedParams.auth_date}&hash=${decodedParams.hash};
                } else {
                    bot.sendMessage(chatId, 'Invalid URL format: Missing required parameters.');
                    return;
                }

                bot.sendMessage(chatId, \\\${processedString}\\\``, { parse_mode: 'Markdown' });
            } else {
                bot.sendMessage(chatId, 'Invalid URL format: Missing tgWebAppData, query, or user.');
            }
        } catch (error) {
            bot.sendMessage(chatId, 'Error processing URL: ' + error.message);
        }
    }
});