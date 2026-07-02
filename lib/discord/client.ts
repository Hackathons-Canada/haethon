import { Client, GatewayIntentBits } from "discord.js";

import { env } from "@/lib/env";

export const discordClient =
  env.DISCORD_BOT_TOKEN
    ? new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
      })
    : null;
