const { Configuration, OpenAIApi } = require('openai');
const { OPENAI_API_KEY } = require('../config');

async function handleUserMessage(userQuestion) {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: `Пользователь задал вопрос о истории деревни: "${userQuestion}". Пожалуйста, дайте информированный ответ на основе доступных данных.`,
        max_tokens: 150,
    });

    return response.data.choices[0].text.trim();
}

module.exports = {
    handleUserMessage,
};