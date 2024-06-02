import { Context, Scenes, Telegraf, session } from "telegraf";
import { settings } from './controllers/settings';
import { account } from './controllers/account';
import { collections } from './controllers/collection';
import { client } from "./helpers/redis";
import { MenuButtonCommands } from "telegraf/typings/core/types/typegram";
import config from "./config";

// Define your own context type
export interface MyContext extends Context {
    // will be available under `ctx.props`
    props: any;

    // declare scene type
    scene: Scenes.SceneContextScene<MyContext, Scenes.SceneSessionData>;
}

export let username: string;

const currentUser = () => {
    if (username == null || username.length == 0) {
        return false;
    }

    return true;
};
const bot = new Telegraf<MyContext>(config.bot_token);
const stage = new Scenes.Stage([account, collections, settings], {
    ttl: 600,
});

bot.use(session());
bot.use(stage.middleware());

bot.command("account", async ctx => {
    if (currentUser()) {
        return ctx.scene.enter("account");
    }
    return ctx.reply(`Welcome onboard. Try /start to get started`);
});

bot.command("collections", async ctx => {
    if (currentUser()) {
        return ctx.scene.enter("collections");
    }
    return ctx.reply(`Welcome onboard. Try /start to get started`);
});

bot.command("tokens", async ctx => {
    if (currentUser()) {
        return ctx.scene.enter("tokens");
    }
    return ctx.reply(`Welcome onboard. Try /start to get started`);
});

bot.command("settings", async ctx => {
    if (currentUser()) {
        return ctx.scene.enter("settings");
    }
    return ctx.reply(`Welcome onboard. Try /start to get started`);
});

bot.use(async (ctx, next) => {
    return next(); // pass control to next middleware
});

bot.start(async ctx => {
    username = ctx.update.message.from.username!;
    if (!client.isReady) {
        await client.connect();
    }
    return ctx.reply(`Hello ${ctx.update.message.from.first_name}!. Try /account or /collections or /settings to get started`);
});


const menuButton: MenuButtonCommands = {
    type: "commands",
}
bot.telegram.setChatMenuButton({ menuButton });
bot.catch((err) => console.log(err));
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))