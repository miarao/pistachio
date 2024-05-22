"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.print = exports.print = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const nft_utils_1 = require("./nft-utils");
// Load environment variables from .env file
dotenv_1.default.config();
// // eslint-disable-next-line no-process-env
// const token = process.env.TELEGRAM_BOT_TOKEN
// // eslint-disable-next-line no-process-env
// const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL
// if (!token || !webhookUrl) {
//   throw new Error('TELEGRAM_BOT_TOKEN or WEBHOOK_URL is not defined in the environment variables')
// }
// const bot = new TelegramBot(token)
// bot
//   .setWebHook(`${webhookUrl}/bot${token}`)
//   .then(() => print(`Webhook set to ${webhookUrl}/bot***`))
//   .catch(() => {
//     throw new Error(`Failed to set webhook to ${webhookUrl}/bot***`)
//   })
// // bot.on('message', async msg => {
// // })
// const app = express()
// app.use(bodyParser.json())
// app.post(`/bot${token}`, async (req, res) => {
//   try {
//     const body = req.body satisfies TelegramBot.Update
//     print(`Received a message: ${JSON.stringify(req.body)}`)
//     bot.processUpdate(body)
//     const msg = body.channel_post satisfies TelegramBot.Message
//     print(`Received a message in chat ${JSON.stringify(msg)}`)
//     print(`Received a message in chat ${msg.sender_chat.id}: ${msg.text}`)
//     await bot.sendMessage(msg.chat.id, `Received your message: ${msg.text ?? 'empty'}`)
//     const chatId = msg.chat.id
//     if (msg.text !== undefined) {
//       const chatInfo = await bot.getChat(chatId)
//       await bot.sendMessage(chatId, `Chat info:\nName: ${chatInfo.title}\nID: ${chatInfo.id}\nType: ${chatInfo.type}`)
//     }
//     res.sendStatus(200)
//   } catch (error) {
//     print(`Error: ${errorLike(error)}`)
//     res.sendStatus(400)
//   }
// })
// // eslint-disable-next-line no-process-env
// const PORT = process.env.PORT || 8080
// print(`Starting server on port ${PORT}`)
// app.listen(PORT, () => {
//   print(`Express server is listening on port ${PORT}`)
// })
void (0, nft_utils_1.mintMotherfucker)('runners');
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.post(`/bot${token}`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const body = req.body;
        print(`Received a message: ${JSON.stringify(req.body)}`);
        // bot.processUpdate(body)
        if (((_a = body.callback_query) === null || _a === void 0 ? void 0 : _a.data) === 'getFlair') {
            print('get user wallet');
            return;
        }
        const msg = body.channel_post;
        print(`Received a message in chat ${JSON.stringify(msg)}`);
        const chatId = msg.chat.id;
        if (msg.text !== undefined) {
            yield bot.sendMessage(msg.chat.id, `Received your message: ${msg.text}`);
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const imageUrl = require('./MintyTON/data/images/img.png');
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
            };
            yield bot.sendPhoto(chatId, imageUrl, Object.assign(Object.assign({}, options), { caption: 'Flaunt your community pride with our MarathonRunners flair! Your key to personalized rewards A TON-tastic NFT!' }));
        }
        res.sendStatus(200);
    }
    catch (error) {
        print(`Error: ${errorLike(error)}`);
        res.sendStatus(400);
    }
}));
// eslint-disable-next-line no-process-env
const PORT = process.env.PORT || 8080;
print(`Starting server on port ${PORT}`);
app.listen(PORT, () => {
    print(`Express server is listening on port ${PORT}`);
});
function print(message) {
    // eslint-disable-next-line no-console
    console.log(message);
}
exports.print = print;
function errorLike(err, fallbackMessage) {
    const { message, stack, reason } = err;
    return {
        message: typeof message === 'string' ? message : fallbackMessage,
        stack: typeof stack === 'string' ? stack : undefined,
        reason: typeof reason === 'string' ? reason : undefined,
    };
}
