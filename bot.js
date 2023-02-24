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
  console.log("Query:", ctx.msg.text, "sent by", ctx.from.id);
  try {
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
          request.get(videoUrl).on("response", function (res) {
            const fileName = "video.mp4";
            const file = fs.createWriteStream(fileName);
            res.pipe(file);
            file.on("finish", function () {
              ctx.replyWithVideo(new InputFile({ source: fileName }));
              fs.unlinkSync(fileName);
              console.log(`Download complete: ${fileName}`);
            });
          });
        }
      });
    }
  } catch (error) {
    console.error(error);
    await ctx.reply("An error occurred");
  }
});

// Error

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(
    "Error while handling update",
    ctx.update.update_id,
    "\nQuery:",
    ctx.msg.text
  );
  ctx.reply("An error occurred");
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

// Run

bot.start();
