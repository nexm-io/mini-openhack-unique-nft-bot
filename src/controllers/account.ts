import Sr25519Account from "@unique-nft/sr25519";
import { Scenes, Markup } from 'telegraf'
import Sdk, { Options } from "@unique-nft/sdk";
import { MyContext, username } from '../index';
import config from "../config";
import { client } from "../helpers/redis";

export const account = new Scenes.BaseScene<MyContext>("account");

const buttons = Markup.inlineKeyboard([
    [
        Markup.button.callback("🗝 Generate Account", "generate_account"),
        Markup.button.callback("🖇 Import Mnemonic", "import_mnemonic"),
    ],
    [
        Markup.button.callback("🔄 Refresh", "refresh")
    ],
    [
        Markup.button.callback("⬅ Back", "back")
    ],
]);

account.enter(async (ctx) => {
    const message = await showAccountInformation();
    await ctx.reply(message,
        {
            parse_mode: 'Markdown',
            ...buttons,
        }
    )
});

account.action('generate_account', async (ctx) => {
    const mnemonic = Sr25519Account.generateMnemonic();
    const account = Sr25519Account.fromUri(mnemonic);
    await client.set(username, mnemonic);

    await ctx.reply(`*Your New Address:* ${account.address}. To get started, deposit some Opal.`, {
        parse_mode: 'Markdown',
        ...buttons,
    })
});

account.action('import_mnemonic', async (ctx) => {
    await ctx.reply(`Input 12 mnemonic words`, {
        parse_mode: 'Markdown'
    });
});

account.action('refresh', async ctx => {
    const message = await showAccountInformation();

    await ctx.editMessageText(message,
        {
            parse_mode: 'Markdown',
            ...buttons,
        }
    )
});

account.on("message", async (ctx) => {
    try {
        const options: Options = {
            baseUrl: config.base_url
        };
        const sdk = new Sdk(options);
        const account = Sr25519Account.fromUri(ctx.text!);
        client.set(username, ctx.text!);

        const { address, availableBalance, lockedBalance, freeBalance } = await sdk.balance.get({ address: account.address });

        await ctx.reply(`*Successfully Imported!*
        *Address*: ${account.address}
        *Balance*: ${availableBalance.amount ?? 0} Opal`,
            {
                parse_mode: 'Markdown',
                ...buttons,
            }
        )
    } catch (e) {
        await ctx.reply(`${e}. Try /account or /collections or /settings to get started`,
            {
                parse_mode: 'Markdown'
            }
        );
        return ctx.scene.leave();
    }
});

account.action("back", async (ctx) => {
    await ctx.reply("Try /account or /collections or /settings to get started");
    return ctx.scene.leave();
});

const current_account = async () => {
    try {
        let mnemonic = await client.get(username);
        if (mnemonic == null) {
            mnemonic = Sr25519Account.generateMnemonic();
            client.set(username, mnemonic);
        }

        const options: Options = {
            baseUrl: config.base_url
        };
        const sdk = new Sdk(options);
        const account = Sr25519Account.fromUri(mnemonic);

        return await sdk.balance.get({ address: account.address });
    } catch (error) {
        throw error;
    }
};

const showAccountInformation = async () => {
    const { address, availableBalance, lockedBalance, freeBalance } = await current_account();

    return `
    *Welcome to UniqueBOT*
    Unique's fastest bot to manage your NFT collection on Unique Network.
                    
    Your address: ${address} have ${availableBalance.amount ?? 0} Opal balance. To get started, deposit some Opal or go to Account to import / create a new one
                    
    Once done tap refresh and your balance will appear here.`;
};