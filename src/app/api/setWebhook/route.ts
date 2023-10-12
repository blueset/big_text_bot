import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const bot = new Telegraf(BOT_TOKEN);
const URL = process.env.NEXT_PUBLIC_VERCEL_URL!;

export async function GET(request: Request) {
    const outcome = await bot.telegram.setWebhook(`https://${URL}/api/webhook`, {
        secret_token: BOT_TOKEN.replace(":", ""),
    });
    return Response.json({outcome, url: `https://${URL}/api/webhook`});
}