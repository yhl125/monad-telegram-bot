import { Composer } from "grammy";
import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["private", "group", "supergroup"]);

feature.command("q", logHandle("command-question"), async (ctx) => {
  const text = ctx.message.text.slice(2).trim();
  // fetch post with text body
  const response = await fetch("https://monad-chatbot.yhl125.com/api/chat", {
    method: "POST",
    body: JSON.stringify({
      messages: [
        {
          content: text,
        },
      ],
    }),
    headers: {
      "Content-type": "application/json",
    },
  });
  const data = await response.json();

  return ctx.reply(data.result, { reply_to_message_id: ctx.msg.message_id });
});

export { composer as questionFeature };
