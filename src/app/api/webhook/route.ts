import { Telegraf } from "telegraf";
import { setupBot } from "./bot";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const bot = new Telegraf(BOT_TOKEN);
setupBot(bot);

export async function POST(request: Request) {
    if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") === BOT_TOKEN.replace(":", "")) {
        const data = await request.json();
        await bot.handleUpdate(data);
        return Response.json(true);
    }
}
