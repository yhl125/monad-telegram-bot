import { autoChatAction } from "@grammyjs/auto-chat-action";
import { hydrate } from "@grammyjs/hydrate";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";
import { BotConfig, StorageAdapter, Bot as TelegramBot, session } from "grammy";
import {
  Context,
  SessionData,
  createContextConstructor,
} from "#root/bot/context.js";
import { errorHandler } from "#root/bot/handlers/index.js";
import { i18n } from "#root/bot/i18n.js";
import { updateLogger } from "#root/bot/middlewares/index.js";
import { config } from "#root/config.js";
import { logger } from "#root/logger.js";
import { questionFeature } from "./features/question.js";

type Options = {
  sessionStorage?: StorageAdapter<SessionData>;
  config?: Omit<BotConfig<Context>, "ContextConstructor">;
};

export function createBot(token: string, options: Options = {}) {
  const { sessionStorage } = options;
  const bot = new TelegramBot(token, {
    ...options.config,
    ContextConstructor: createContextConstructor({ logger }),
  });
  const protectedBot = bot.errorBoundary(errorHandler);

  // Middlewares
  bot.api.config.use(parseMode("HTML"));

  if (config.isDev) {
    protectedBot.use(updateLogger());
  }

  protectedBot.use(autoChatAction(bot.api));
  protectedBot.use(hydrateReply);
  protectedBot.use(hydrate());
  protectedBot.use(
    session({
      initial: () => ({}),
      storage: sessionStorage,
    }),
  );
  protectedBot.use(i18n);

  // Handlers
  // protectedBot.use(welcomeFeature);
  // protectedBot.use(adminFeature);
  protectedBot.use(questionFeature);

  // if (isMultipleLocales) {
  //   protectedBot.use(languageFeature);
  // }

  // // must be the last handler
  // protectedBot.use(unhandledFeature);

  return bot;
}

export type Bot = ReturnType<typeof createBot>;
