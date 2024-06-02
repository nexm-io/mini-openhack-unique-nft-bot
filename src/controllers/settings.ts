import { MyContext } from '../index';
import { Scenes, Markup } from 'telegraf'

export const settings = new Scenes.BaseScene<MyContext>("settings");

settings.enter(async (ctx) => {
    await ctx.reply("Choose Network",
        Markup.inlineKeyboard([
            [
                Markup.button.callback("✅ Opal", "testnet"),
                Markup.button.callback("❌ Quartz", "quartz"),
                Markup.button.callback("❌ Unique", "unique"),
            ],
            [
                Markup.button.callback("⬅ Back", "back")
            ],
        ]));
});

settings.action('testnet', async ctx => {
    await ctx.reply("You are in already!");
});
settings.action('quartz', async ctx => await ctx.answerCbQuery('Coming soon!'));
settings.action('unique', async ctx => await ctx.answerCbQuery('Coming soon!'));
settings.action("back", async (ctx) => {
    await ctx.reply("Try /account or /collection or /settings to get started");
    return ctx.scene.leave();
});