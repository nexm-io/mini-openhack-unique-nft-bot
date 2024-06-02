import * as dotenv from "dotenv";

dotenv.config();

const env: string = process.env.ENV!;

const getConfig = (): any => {
  switch (env) {
    case "testnet":
      return {
        env,
        bot_token: process.env.BOT_TOKEN,
        base_url: "https://rest.unique.network/opal/v1"
      };

    case "mainnet":
      return {
        env,
        bot_token: process.env.BOT_TOKEN,
        base_url: ""
      };

    default:
      return {
        env,
        bot_token: "",
        base_url: ""
      };
  }
};

const config = getConfig();

export default config;