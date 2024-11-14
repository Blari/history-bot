import TelegramBot from 'node-telegram-bot-api';
import {addMessage, checkingStatus, findOrCreateThread, getMessagesList, runAssistant} from './assistant.js';
import dotenv from 'dotenv';

dotenv.config();

const telegramToken = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(telegramToken, { polling: true });

let treadId;
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Привет! Я постараюсь ответить на ваши вопросы касающиеся истории поселка " +
      "Октябрьский Смолевичского района и деревни Плисса. Задайте ваш вопрос!");
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (msg.text && !msg.text.startsWith('/start')) {
        console.log("treadId: ", treadId);
        console.log("msg: ", msg.text);
        try {
            await bot.sendMessage(chatId, "Ваш запрос в обработке. Это может занять несколько секунд...");

            let thread = await findOrCreateThread(treadId);
            treadId = thread.id;
            
            await addMessage(thread.id, msg.text);
            const run = await runAssistant(thread.id);

            let status = "running";
            while (status !== "completed") {
                const runObject = await checkingStatus(thread.id, run.id);
                status = runObject.status;
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const messagesList = await getMessagesList(thread.id);

            const messages = messagesList[0].flat().map(item => item.text.value).join("\n");


            if (messages.length > 0) {
                console.log("Ответ: ", messages);
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