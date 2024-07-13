require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });


const mainMenu = {
    reply_markup: {
        keyboard: [
            [{ text: 'Создать объявление' }],
            [{ text: 'Редактировать объявление' }],
            [{ text: 'Закрыть объявление' }],
            [{ text: 'Мои объявления' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
    },
};

const doneButton = {
    reply_markup: {
        keyboard: [
            [{ text: 'Готово' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
    },
};

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Добро пожаловать в CatAdoptTbilisiBot! Выберите одно из следующих действий:", mainMenu);
});

