import Sdk from "@unique-nft/sdk";
import { KeyringAccount } from '@unique-nft/accounts/keyring';
import config from "../config";

// Creating an SDK client
const createSdk = async (signer: KeyringAccount) => {
    const options = {
        baseUrl: config.base_url,
        signer,
    }
    return new Sdk(options);
};

// Creating a sample collection
// The signer specified in the SDK constructor is used to sign an extrinsic
const createCollection = async (sdk: Sdk, address: string, name: string, description: string, tokenPrefix: string) => {
    const { parsed, error } = await sdk.collection.create.submitWaitResult({
        address,
        name,
        description,
        tokenPrefix,
    });

    if (error) {
        throw error;
    }

    const { collectionId } = parsed!;

    return sdk.collection.get({ collectionId });
}

const mintToken = async (sdk: Sdk, collectionId: number, address: string, ipfsCid: string, name: string, description: string) => {
    const result = await sdk.token.create.submitWaitResult({
        address,
        collectionId,
        data: {
            image: {
                ipfsCid,
            },
            name: {
                _: name,
            },
            description: {
                _: description,
            },
        },
    })

    if (result.error) {
        throw result.error;
    }

    const tokenId = result.parsed?.tokenId as number

    console.log(`Minted token ID ${tokenId} of 1 in collection ID ${collectionId}`)
    console.log(`View this minted token at https://uniquescan.io/opal/tokens/${collectionId}/${tokenId}`)

    return tokenId;
}

export { createSdk, createCollection, mintToken };