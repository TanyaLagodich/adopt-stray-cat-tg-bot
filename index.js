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

bot.on('polling_error', (error) => {
    console.error('Ошибка опроса:', error.code, error);
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === 'Создать объявление') {
        createAd(chatId);
    }
//     } else if (text === 'Редактировать объявление') {
//         editAd(chatId);
//     } else if (text === 'Закрыть объявление') {
//         closeAd(chatId);
//     } else if (text === 'Мои объявления') {
//         listAds(chatId);
//     }
});

function createAd(chatId) {
    const mediaQueue = [];
    let isMediaQueueProcessing = false;
    const media = [];

    const maxMedia = 5;
    bot.sendMessage(chatId, `Пожалуйста, отправьте фото и/или видео кошки (до ${maxMedia} шт.). Когда закончите, напишите 'Готово'.`, doneButton);

    const processingQueue = async () => {
        isMediaQueueProcessing = true;
        while (mediaQueue.length) {
            const msg = mediaQueue.shift();
            if (media.length < maxMedia) {
                if (msg.photo) {
                    const photo = msg.photo[msg.photo.length - 1].file_id;
                    const photoUrl = await bot.getFileLink(photo);
                    media.push({ type: 'photo', url: photoUrl });
                    bot.sendMessage(chatId, `Фото добавлено (${media.length}/${maxMedia}).`);
                } else if (msg.video) {
                    const video = msg.video.file_id;
                    const videoUrl = await bot.getFileLink(video);
                    media.push({ type: 'video', url: videoUrl });
                    bot.sendMessage(chatId, `Видео добавлено (${media.length}/${maxMedia}).`);
                }
            }

            if (media.length === maxMedia) {
                // TODO add the media to database ??
                mediaQueue.length = 0;
                bot.removeListener('message', mediaHandler);
                proceedToDescription(chatId, media);
            }

            if (msg.text && msg.text.toLowerCase() === 'готово') {
                if (media.length === 0) {
                    bot.sendMessage(chatId, "Пожалуйста, загрузите хотя бы одно фото или видео кошки.");
                } else {
                    // TODO add the media to database ??
                    mediaQueue.length = 0;
                    bot.removeListener('message', mediaHandler);
                    proceedToDescription(chatId, media);
                }
            }
        }
        isMediaQueueProcessing = false;
    }

    const mediaHandler = async (msg) => {
        mediaQueue.push(msg);
        if (!isMediaQueueProcessing) processingQueue();
    }

    bot.on('message', mediaHandler);
};

function proceedToDescription(chatId, media) {
    bot.sendMessage(chatId, 'Что дальше?')
}
