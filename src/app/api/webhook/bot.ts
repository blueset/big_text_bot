import { Telegraf } from "telegraf";

const ERROR_DUMP = parseInt(process.env.ERROR_DUMP!);
const WEB_UI_URL = `https://${process.env.NEXT_PUBLIC_VERCEL_URL!}/editor`;

const helpText = `Text Sticker.

I'm an inline bot. I make stickers with texts. Give me any text, and I will generate stickers for you.

<b>How to use</b>
1. @ me
2. Choose “Create a sticker” in the menu
3. Write anything you want in the editor window
4. Tap “Send”
5. Tap the sticker to send it to the chat

If there's no pop-up showing, try again a few seconds later, or check if it’s in the public anon dump. If it's not anywhere, I'm probably down.

<b>Tips</b>
You have to make line breaks manually, or everything will be squeezed in one line.

You can now choose fonts, weight, italics, and colors in the editor window.

All unique stickers are saved in the <a href="https://t.me/joinchat/AAAAAEJEZ9HK1pmDJMS5ZQ">Public Anonymous Dump of @big_text_bot</a> as a essential component for this bot to work.`

export function setupBot(bot: Telegraf) {
    bot.command("start", async (ctx) => {
        return ctx.reply(helpText, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [[{
                    text: "Try me out!",
                    switch_inline_query: "sticker"
                }]]
            }
        });
    });

    bot.command("help", async (ctx) => {
        return ctx.reply(helpText, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [[{
                    text: "Try me out!",
                    switch_inline_query: "sticker"
                }]]
            }
        });
    });

    bot.catch(async (err, ctx) => {
        if (`${err}`.indexOf("Forbidden: bot was blocked by the user") >= 0) return;
        if (`${err}`.indexOf("Too Many Requests")) return;
        console.error(err);
        await ctx.telegram.sendMessage(
            ERROR_DUMP,
            `Update <pre>${JSON.stringify(ctx.update)}</pre> caused error <pre>${err}</pre>`,
            { parse_mode: "HTML" }
        );
    });

    bot.on("inline_query", async (ctx) => {
        const input: string = ctx.inlineQuery.query;
        const fileId = input.match(/^&([a-zA-Z0-9_-]+)&$/);
        if (!fileId) {
            try {
                const result = await ctx.answerInlineQuery([], {
                    button: {
                        text: "Create a sticker",
                        web_app: {
                            url: WEB_UI_URL,
                        }
                    }
                });
                return result;
            } catch (err) {
                console.error(err);
                return;
            }
        }
        const fid = fileId[1];
        return await ctx.answerInlineQuery([
            {
                type: "sticker",
                id: fid.slice(0, 63),
                sticker_file_id: fid,
            }
        ]);
    });
}