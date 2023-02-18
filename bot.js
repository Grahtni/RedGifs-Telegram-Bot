require("dotenv").config();
const { Bot, InputFile } = require("grammy");
const regex = /https?:\/\/(www\.)?redgifs\.com\/watch\/[a-zA-Z]+/g;
const url = require("url");
const fs = require("fs");

// Bot

const bot = new Bot(process.env.BOT_TOKEN);

// Commands

bot.command("start", async (ctx) => {
  await ctx
    .reply("*Welcome!* ✨ Send a RedGifs link.", {
      parse_mode: "Markdown",
    })
    .then(console.log(ctx.from))
    .catch((e) => console.error(e));
});

bot.command("help", async (ctx) => {
  await ctx
    .reply(
      "*@anzubo Project.*\n\n_This bot uses the RedGifs API to download gifs.\nSend a link to a post to try it out._",
      { parse_mode: "Markdown" }
    )
    .then(console.log("Help command sent to", ctx.from.id))
    .catch((e) => console.error(e));
});

// Messages

bot.on("msg", async (ctx) => {
  if (!regex.test(ctx.msg.text)) {
    await ctx.reply("*Send a valid RedGifs link.*", {
      parse_mode: "Markdown",
      reply_to_message_id: ctx.msg.message_id,
    });
  } else {
    const red = url.parse(ctx.msg.text).pathname;
    const id = red.split("/")[2];
    const htm = "red.html";
    const html = `<iframe src='https://redgifs.com/ifr/${id}' frameborder='0' scrolling='no'  allowfullscreen width='1080' height='1920'></iframe><p><a href='https://redgifs.com/watch/${id}'>via RedGIFs</a></p>`;

    fs.writeFileSync(htm, html);
    await ctx.replyWithDocument(new InputFile("red.html"));
    try {
      fs.unlinkSync("red.html");
    } catch (e) {
      console.error(e.message);
    }
    return;
  }
});

// Run

bot.start();
