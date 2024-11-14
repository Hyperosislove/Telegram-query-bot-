const TelegramBot = require('node-telegram-bot-api');
const querystring = require('querystring');

// Replace 'YOUR_BOT_TOKEN' with your actual Telegram bot token
const BOT_TOKEN = process.env.BOT_TOKEN;  // Get bot token from environment variable

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    const welcomeMessage = 'Hello! This bot was created by @hyperosislove. It is updated every week and will not be operational on Fridays due to maintenance. Please send me an encoded URL, and I will process it for you.';
    bot.sendMessage(msg.chat.id, welcomeMessage);
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.trim();

    if (!text.startsWith('/') && text.length > 0) {
        try {
            const urlMatch = text.match(/https?:\/\/[^\s]+/);
            if (!urlMatch) throw new Error('No valid URL found in the text.');

            const url = new URL(urlMatch[0]);
            const fragment = url.hash.substring(1); 
            const params = querystring.parse(fragment);

            let tgWebAppData = params.tgWebAppData || params.query || params.user;

            if (tgWebAppData) {
                const decodedParams = querystring.parse(decodeURIComponent(tgWebAppData));
                let processedString = `user=${encodeURIComponent(decodedParams.user)}&auth_date=${decodedParams.auth_date}&hash=${decodedParams.hash}`;
                bot.sendMessage(chatId, processedString);
            } else {
                bot.sendMessage(chatId, 'Invalid URL format: Missing tgWebAppData, query, or user.');
            }
        } catch (error) {
            bot.sendMessage(chatId, 'Error processing URL: ' + error.message);
        }
    }
});
