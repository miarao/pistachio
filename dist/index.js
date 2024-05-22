"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLike = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
// Load environment variables from .env file
dotenv_1.default.config();
// eslint-disable-next-line no-process-env
const token = process.env.TELEGRAM_BOT_TOKEN;
// eslint-disable-next-line no-process-env
const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
if (!token || !webhookUrl) {
    throw new Error('TELEGRAM_BOT_TOKEN or WEBHOOK_URL is not defined in the environment variables');
}
const bot = new node_telegram_bot_api_1.default(token);
bot
    .setWebHook(`${webhookUrl}/bot${token}`)
    .then(() => print(`Webhook set to ${webhookUrl}/bot***`))
    .catch(() => {
    throw new Error(`Failed to set webhook to ${webhookUrl}/bot***`);
});
// bot.on('message', async msg => {
// })
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.post(`/bot${token}`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const body = req.body;
        print(`Received a message: ${JSON.stringify(req.body)}`);
        bot.processUpdate(body);
        const msg = body.channel_post;
        print(`Received a message in chat ${JSON.stringify(msg)}`);
        print(`Received a message in chat ${msg.sender_chat.id}: ${msg.text}`);
        yield bot.sendMessage(msg.chat.id, `Received your message: ${(_a = msg.text) !== null && _a !== void 0 ? _a : 'empty'}`);
        const chatId = msg.chat.id;
        if (msg.text !== undefined) {
            const chatInfo = yield bot.getChat(chatId);
            yield bot.sendMessage(chatId, `Chat info:\nName: ${chatInfo.title}\nID: ${chatInfo.id}\nType: ${chatInfo.type}`);
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
function errorLike(err, fallbackMessage) {
    const { message, stack, reason } = err;
    return {
        message: typeof message === 'string' ? message : fallbackMessage,
        stack: typeof stack === 'string' ? stack : undefined,
        reason: typeof reason === 'string' ? reason : undefined,
    };
}
exports.errorLike = errorLike;
