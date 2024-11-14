const TelegramBot = require('node-telegram-bot-api');
const querystring = require('querystring');

// Replace 'process.env.BOT_TOKEN' with the environment variable for Heroku
const BOT_TOKEN = process.env.BOT_TOKEN;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    const welcomeMessage = `Hello! This bot was created by @hyperosislove.
It is updated every week and will not be operational on Fridays due to maintenance.
Please send me an encoded URL, and I will process it for you.`;

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

            // Handle different types of URL parameters
            if (params.tgWebAppData) {
                tgWebAppData = params.tgWebAppData;
            } else if (params.query) {
                tgWebAppData = params.query;
            } else if (params.user) {
                tgWebAppData = params.user;
            }

            if (tgWebAppData) {
                const decodedParams = querystring.parse(decodeURIComponent(tgWebAppData));

                let processedString = '';

                // Check for 'user' or 'query' and format accordingly
                if (decodedParams.user) {
                    processedString = `user=${encodeURIComponent(decodedParams.user)}&auth_date=${decodedParams.auth_date}&hash=${decodedParams.hash}`;
                } else if (decodedParams.query_id) {
                    processedString = `query_id=${decodedParams.query_id}&user=${encodeURIComponent(decodedParams.user)}&auth_date=${decodedParams.auth_date}&hash=${decodedParams.hash}`;
                } else {
                    bot.sendMessage(chatId, 'Invalid URL format: Missing required parameters.');
                    return;
                }

                // Send the formatted output in mono code block format with Copy button
                const copyButton = {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "Copy",
                                    callback_data: "copy_output",
                                }
                            ]
                        ]
                    }
                };

                bot.sendMessage(chatId, `\`\`\`${processedString}\`\`\``, { parse_mode: 'MarkdownV2', reply_markup: copyButton });
            } else {
                bot.sendMessage(chatId, 'Invalid URL format: Missing tgWebAppData, query, or user.');
            }
        } catch (error) {
            bot.sendMessage(chatId, 'Error processing URL: ' + error.message);
        }
    }
});

// Handle the callback for the Copy button
bot.on('callback_query', (callbackQuery) => {
    const messageId = callbackQuery.message.message_id;
    const chatId = callbackQuery.message.chat.id;

    if (callbackQuery.data === 'copy_output') {
        bot.answerCallbackQuery(callbackQuery.id, {
            text: "The output is ready for you to copy!",
            show_alert: true
        });

        // Optionally, delete the copy button after it is clicked (to avoid it being redundant)
        bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: messageId });
    }
});
