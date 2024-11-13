import TelegramBot from 'node-telegram-bot-api';
import {addMessage, checkingStatus, createThread, getMessagesList, runAssistant} from './assistant.js';
import dotenv from 'dotenv';

dotenv.config();

const telegramToken = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(telegramToken, { polling: true });

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Привет! Я бот, созданный для помощи с историей. Задайте ваш вопрос!");
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (msg.text && !msg.text.startsWith('/start')) {
        try {
            const thread = await createThread();
            await addMessage(thread.id, msg.text);
            const run = await runAssistant(thread.id);

            let status = "running";
            while (status !== "completed") {
                const runObject = await checkingStatus(thread.id, run.id);
                status = runObject.status;
                console.log(status);

                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const messagesList = await getMessagesList(thread.id);

            const messages = messagesList[0].flat().map(item => item.text.value).join("\n");


            if (messages.length > 0) {
                await bot.sendMessage(chatId, messages);
            } else {
                await bot.sendMessage(chatId, "Не удалось получить значимую информацию из сервиса.");
            }

        } catch (error) {
            console.error("Ошибка: ", error);
            bot.sendMessage(chatId, "Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.");
        }
    }
});