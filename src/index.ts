import { config } from 'dotenv'
import * as TelegramBot from 'node-telegram-bot-api'
import * as express from 'express'
import * as bodyParser from 'body-parser'

config() // Load environment variables from .env file

console.log('starting');

// eslint-disable-next-line no-process-env
const token = process.env.TELEGRAM_BOT_TOKEN
const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL

if (!token || !webhookUrl) {
  throw new Error('TELEGRAM_BOT_TOKEN or WEBHOOK_URL is not defined in the environment variables')
}

const bot = new TelegramBot(token)
bot
  .setWebHook(`https://c86e-31-187-78-43.ngrok-free.app/bot7035379281:AAF4_DtybdfGF_kR1TSg004XbfpTjbtr1g0`)
  .then(() => print(`Webhook set to ${webhookUrl}/bot${token}`))
  .catch(() => {
    throw new Error(`Failed to set webhook to ${webhookUrl}/bot${token}`)
  })

const app = express()
app.use(bodyParser.json())

app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body)
  res.sendStatus(200)
})

bot.on('message', async msg => {
  const chatId = msg.chat.id
  const chatImageId = msg.chat.photo?.big_file_id
  let chatImage
  if (chatImageId) {
    chatImage = await bot.getFile(chatImageId)
    if (chatImage) {
      await bot.sendPhoto(chatId, chatImage.file_id)
    }
  }

  if (msg.text !== undefined) {
    const chatInfo = await bot.getChat(chatId)

    await bot.sendMessage(chatId, `Chat info:\nName: ${chatInfo.title}\nID: ${chatInfo.id}\nType: ${chatInfo.type}`)
  }
})

// eslint-disable-next-line no-process-env
const PORT = process.env.PORT || 9000
print(`Starting server on port ${PORT}`)
app.listen(PORT, () => {
  print(`Express server is listening on port ${PORT}`)
})

function print(message: string) {
  // eslint-disable-next-line no-console
  console.log(message)
}
