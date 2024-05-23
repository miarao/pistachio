import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import express from 'express'
import TelegramBot from 'node-telegram-bot-api'
import {mintMotherfucker} from './nft-utils';

// Load environment variables from .env file
dotenv.config()

// eslint-disable-next-line no-process-env
const token = process.env.TELEGRAM_BOT_TOKEN
// eslint-disable-next-line no-process-env
const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL

if (!token || !webhookUrl) {
  throw new Error('TELEGRAM_BOT_TOKEN or WEBHOOK_URL is not defined in the environment variables')
}

const bot = new TelegramBot(token)

bot
  .setWebHook(`${webhookUrl}/bot${token}`)
  .then(() => print(`Webhook set to ${webhookUrl}/bot***`))
  .catch(() => {
    throw new Error(`Failed to set webhook to ${webhookUrl}/bot***`)
  })

// bot.on('message', async msg => {
// })

const app = express()
app.use(bodyParser.json())

// eslint-disable-next-line no-process-env
const PORT = process.env.PORT || 8080
print(`Starting server on port ${PORT}`)
app.listen(PORT, () => {
  print(`Express server is listening on port ${PORT}`)
})

app.post(`/bot${token}`, async (req, res) => {
  try {
    const body = req.body satisfies TelegramBot.Update
    print(`Received a message: ${JSON.stringify(req.body)}`)
    // bot.processUpdate(body)
    if (body.callback_query?.data === 'getFlair') {
      print('get user wallet')
      return
    }

    const msg = body.channel_post satisfies TelegramBot.Message
    print(`Received a message in chat ${JSON.stringify(msg)}`)
    const chatId = msg.chat.id

    if (msg.text !== undefined) {
      await bot.sendMessage(msg.chat.id, `Received your message: ${msg.text}`)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const imageUrl = require('./MintyTON/data/images/img.png')
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Get Flair',
                callback_data: 'getFlair',
              },
            ],
          ],
        },
      }
      await bot.sendPhoto(chatId, imageUrl, {
        ...options,
        caption:
          'Flaunt your community pride with our MarathonRunners flair! Your key to personalized rewards A TON-tastic NFT!',
      })
    }
    res.sendStatus(200)
  } catch (error) {
    print(`Error: ${errorLike(error)}`)
    res.sendStatus(400)
  }
})

mintMotherfucker('runners');
//
// // eslint-disable-next-line no-process-env
// const PORT = process.env.PORT || 8080
// print(`Starting server on port ${PORT}`)
// app.listen(PORT, () => {
//   print(`Express server is listening on port ${PORT}`)
// })
// void mintMotherfucker('runners')

export function print(message: string) {
  // eslint-disable-next-line no-console
  console.log(message)
}

interface ErrorLike {
  message?: string
  stack?: string
  reason?: string
}

export function errorLike(err: unknown, fallbackMessage?: string): ErrorLike {
  const { message, stack, reason } = err as ErrorLike
  return {
    message: typeof message === 'string' ? message : fallbackMessage,
    stack: typeof stack === 'string' ? stack : undefined,
    reason: typeof reason === 'string' ? reason : undefined,
  }
}
