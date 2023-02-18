require("dotenv").config();
const { Bot, InputFile } = require("grammy");
const regex = /https?:\/\/(www\.)?redgifs\.com\/watch\/[a-zA-Z]+/g;
const cheerio = require("cheerio");
const request = require("request");
const fs = require("fs");
const https = require("https");

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
      "*@anzubo Project.*\n\n_This bot uses download gifs from RedGifs.\nSend a link to a post to try it out._",
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
    request(ctx.msg.text, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        const videoUrl = $('meta[property="og:video"]').attr("content");
        console.log(videoUrl);
        https.get(videoUrl, function (res) {
          const fileName = "video.mp4";
          const file = fs.createWriteStream(fileName);
          res.pipe(file);
          file.on("finish", function () {
            ctx.replyWithVideo(new InputFile({ url: videoUrl }));
            fs.unlinkSync("video.mp4");
            file.close();
            console.log(`Download complete: ${fileName}`);
          });
        });
      }
    });
  }
});

// Run

bot.start();
