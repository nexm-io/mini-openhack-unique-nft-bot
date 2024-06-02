import { Scenes, Markup } from 'telegraf'
import { MyContext, username } from '../index';
import { client } from "../helpers/redis";
import { createCollection, mintToken, createSdk } from "../bl";
import { KeyringProvider } from "@unique-nft/accounts/keyring";

export const collections = new Scenes.BaseScene<MyContext>("collections");

let collectionId = 0;
const buttons = Markup.inlineKeyboard([
    [
        Markup.button.callback("⏴ Previous", "previous"),
        Markup.button.callback("Next ⏵", "next"),
    ],
    [
        Markup.button.callback("✨ Create Your Own Collection", "create")
    ],
    [
        Markup.button.callback("✨ Mint Token", "mint")
    ],
    [
        Markup.button.callback("⬅ Back", "back")
    ],
]);

collections.enter(async (ctx) => {
    collectionId = 1;
    try {
        await showCollectionId(ctx, collectionId);
    } catch (error) {
        await ctx.editMessageText(`${error}`,
            {
                parse_mode: 'Markdown',
                ...buttons,
            }
        )
    }
});

collections.action('next', async ctx => {
    console.log('next');
    collectionId = collectionId + 1;

    try {
        await showCollectionId(ctx, collectionId, true);
    } catch (error) {
        await ctx.editMessageText(`${error}`,
            {
                parse_mode: 'Markdown',
                ...buttons,
            }
        )
    }

});

collections.action('previous', async ctx => {
    console.log('previous');
    if (collectionId > 1) {
        collectionId = collectionId - 1;
    }

    try {
        await showCollectionId(ctx, collectionId, true);
    } catch (error) {
        await ctx.editMessageText(`${error}`,
            {
                parse_mode: 'Markdown',
                ...buttons,
            }
        )
    }

});

collections.action('create', async ctx => {
    console.log('create');

    await ctx.reply(`*Input the JSON string as below:*
        { "name": "{collection name}", "description": "{collection description}", "tokenPrefix": "{ticker}" }`, { parse_mode: "Markdown" });

});

collections.action('mint', async ctx => {
    console.log('mint');

    await ctx.reply(`*Input the JSON string as below to mint Token under Collection ID ${collectionId}* 
        { "ipfsCid": "{ipfs url}", "name": "{token name}", "description": "{token description}" }`, { parse_mode: "Markdown" });
});

collections.action('back', async (ctx) => {
    console.log('back');
    await ctx.reply("Try /account or /collections or /settings to get started");
    return ctx.scene.leave();
});

collections.on('message', async (ctx) => {
    console.log('message');

    try {

        try {
            let obj: any = JSON.parse(ctx.text!);
            if (!!obj.tokenPrefix) {
                const sdk = await createSdk(await KeyringProvider.fromMnemonic(await client.get(username) ?? ''));
                const collection = await createCollection(sdk, '', obj.name, obj.description, obj.tokenPrefix);
                collectionId = collection.id;

                await ctx.reply(`*Sucessfully Create Collection: *
                * Collection ID:* ${collection.id}
                * Name:* ${collection.name}
                * Description:* ${collection.description}
                * Owner:* ${collection.owner}
                * Token Prefix:* ${collection.tokenPrefix}
                * Token Limit:* ${collection.limits?.tokenLimit}
                * URL:* [uniquescan.io](https://uniquescan.io/opal/tokens/${collectionId}`,
                    {
                        parse_mode: 'Markdown',
                        ...buttons,
                    }
                );
            } else if (!!obj.ipfsCid) {
                const sdk = await createSdk(await KeyringProvider.fromMnemonic(await client.get(username) ?? ''));
                const tokenId = await mintToken(sdk, collectionId, '', obj.ipfsCid, obj.name, obj.description);
                await ctx.reply(`* Sucessfully Create Token Id ${tokenId} *
                View this minted token at[uniquescan.io](https://uniquescan.io/opal/tokens/${collectionId}/${tokenId})`,
                    {
                        parse_mode: 'Markdown',
                        ...buttons,
                    }
                );
            } else {
                await ctx.reply(`Are u missing something?`,
                    {
                        parse_mode: 'Markdown',
                        ...buttons,
                    }
                );

            }

        } catch (error) {
            await ctx.editMessageText(`${error}`,
                {
                    parse_mode: 'Markdown',
                    ...buttons,
                }
            )
        }
    } catch (e) {
        await ctx.reply(`${e}. Try /account or /collections or /settings to get started`, {
            parse_mode: 'Markdown'
        });
        return ctx.scene.leave();
    }
});

const showCollectionId = async (ctx: MyContext, collectionId: number, isEdit: boolean = false) => {

    try {
        const sdk = await createSdk(await KeyringProvider.fromMnemonic(await client.get(username) ?? ''));
        const collection = await sdk.collection.get({ collectionId });
        const message = `
        * Collection ID:* ${collectionId}
        * Name:* ${collection.name}
        * Description:* ${collection.description}
        * Owner:* ${collection.owner}
        * Token Prefix:* ${collection.tokenPrefix}
        * Token Limit:* ${collection.limits?.tokenLimit}
        * URL:* [uniquescan.io](https://uniquescan.io/opal/tokens/${collectionId}`;

        if (isEdit) {
            await ctx.editMessageText(message,
                {
                    parse_mode: 'Markdown',
                    ...buttons,
                }
            )
        } else {
            await ctx.reply(message,
                {
                    parse_mode: 'Markdown',
                    ...buttons,
                }
            )
        }
    } catch (error) {
        throw error;
    }
};
