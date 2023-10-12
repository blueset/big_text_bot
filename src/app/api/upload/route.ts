import { Telegraf } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const bot = new Telegraf(BOT_TOKEN);
const STICKER_DUMP = parseInt(process.env.STICKER_DUMP as string);

const hexR = 0x52, hexI = 0x49, hexF = 0x46, 
      hexW = 0x57, hexE = 0x45, hexB = 0x42, hexP = 0x50,
      hexV = 0x56, hex8 = 0x38;

export async function POST(request: Request) {
    const data = await request.arrayBuffer();
    const magicNumber = new Uint8Array(data, 0, 16);
    if (
        magicNumber[0] === hexR && 
        magicNumber[1] === hexI && 
        magicNumber[2] === hexF &&
        magicNumber[3] === hexF &&
        magicNumber[8] === hexW &&
        magicNumber[9] === hexE &&
        magicNumber[10] === hexB &&
        magicNumber[11] === hexP &&
        magicNumber[12] === hexV &&
        magicNumber[13] === hexP &&
        magicNumber[14] === hex8
    ) {
        const dataBuffer = Buffer.from(data);
        const msg = await bot.telegram.sendSticker(STICKER_DUMP, { source: dataBuffer });
        return Response.json({ fileId: msg.sticker.file_id });
    } else {
        return Response.json({ error: "Invalid file" }, { status: 400 });
    }       
}