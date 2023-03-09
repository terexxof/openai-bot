const TelegramApi = require('node-telegram-bot-api');
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const bot = new TelegramApi(process.env.TELEGRAM_API_TOKEN, {polling: true});

const start = () => {
  bot.setMyCommands ([
    {command: '/start', description: 'Начальное приветствие'},
    {command: '/info', description: 'Получить информацию о пользователе'},
  ])

  bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;
    //console.log(msg);

    try {
      if (text === '/start') {
        //await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/cdb/d29/cdbd2943-5c75-34c3-a339-bf6e9b524b53/7.webp')
        return bot.sendMessage(chatId, `Джарвис приветствует тебя, ${msg.from.first_name}.
Чтобы задать вопрос, начни писать с //.
Пример: //бот как дела
Чтобы попросить меня сгенерировать изображение 1024x1024, напиши /image перед фразой.
Пример: /image мишки в лесу`);
      }
      if (text === '/info') {
        return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`);
      }
      if (text.startsWith('//')) {
        const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: text.slice(2),
          temperature: 0.9,
          max_tokens: 1000,
          top_p: 1,
          frequency_penalty: 0.0,
          presence_penalty: 0.6,
          stop: ["You:"],
        });
        //console.log(response.data.choices);
        return bot.sendMessage(chatId, response.data.choices[0].text);
      }
      if (text.startsWith('/image')) {
        const response = await openai.createImage({
          prompt: text.slice(7),
          n: 1,
          size: "1024x1024",
        });
        image_url = response.data.data[0].url;
        //console.log(image_url);
        return bot.sendPhoto(chatId, image_url);
      }

      return bot.sendMessage(chatId, `Я тебя не понимаю.
Чтобы задать вопрос, начни писать с //.
Пример: //бот как дела
Чтобы попросить меня сгенерировать изображение 1024x1024, напиши /image перед фразой.
Пример: /image мишки в лесу`);
    } catch (e) {
      return bot.sendMessage(chatId, 'Произошла ошибка');
    }
  });
};

start();
