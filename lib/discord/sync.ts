import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { REST } from "@discordjs/rest";
import { ChannelType, Routes } from "discord-api-types/v10";

import { db } from "@/lib/db";
import { categoryForHackathon, channelNameForHackathon, type DiscordCategoryKey } from "@/lib/discord/channel-rules";
import {
  discordChannels,
  discordGuilds,
  hackathonDates,
  hackathonLocations,
  hackathons,
} from "@/lib/db/schema";
import { env } from "@/lib/env";
import { assignHackathonSeries } from "@/lib/hackathons/series";

type DiscordGuild = {
  id: string;
  name: string;
};

type DiscordChannel = {
  id: string;
  name: string;
  parent_id?: string | null;
  topic?: string | null;
  type: number;
};

export const categoryNames: Record<DiscordCategoryKey, string> = {
  canada: "Canadian Hackathons",
  us: "US Hackathons",
  past: "Past Hackathons",
};

function configuredCategoryId(category: DiscordCategoryKey) {
  const ids: Record<DiscordCategoryKey, string | undefined> = {
    canada: env.DISCORD_CANADA_CATEGORY_ID,
    us: env.DISCORD_US_CATEGORY_ID,
    past: env.DISCORD_PAST_CATEGORY_ID,
  };

  return ids[category];
}

function discordRest() {
  if (!env.DISCORD_BOT_TOKEN || !env.DISCORD_GUILD_ID) {
    return null;
  }

  return new REST({ version: "10" }).setToken(env.DISCORD_BOT_TOKEN);
}

function isUnknownChannelError(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as { code?: unknown }).code === 10003
  );
}

function formatDate(value: Date | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(value);
}

function channelTopic(input: {
  applicationUrl: string | null;
  endsAt: Date | null;
  name: string;
  startsAt: Date | null;
  websiteUrl: string | null;
}) {
  const start = formatDate(input.startsAt);
  const end = formatDate(input.endsAt);
  const dateRange = start && end ? `${start} - ${end}` : start ?? end;
  const url = input.applicationUrl ?? input.websiteUrl;
  const parts = [input.name, dateRange, url].filter(Boolean);

  return parts.join(" | ").slice(0, 1024);
}

async function listGuildChannels(rest: REST, guildSnowflake: string) {
  return (await rest.get(Routes.guildChannels(guildSnowflake))) as DiscordChannel[];
}

async function ensureDiscordGuild(rest: REST, guildSnowflake: string) {
  const guild = (await rest.get(Routes.guild(guildSnowflake))) as DiscordGuild;
  const [upserted] = await db
    .insert(discordGuilds)
    .values({
      guildSnowflake,
      name: guild.name,
    })
    .onConflictDoUpdate({
      target: discordGuilds.guildSnowflake,
      set: { name: guild.name },
    })
    .returning({ id: discordGuilds.id });

  return upserted.id;
}

async function ensureCategory(
  rest: REST,
  guildSnowflake: string,
  category: DiscordCategoryKey
) {
  const channels = await listGuildChannels(rest, guildSnowflake);
  const configuredId = configuredCategoryId(category);
  const name = categoryNames[category];

  if (configuredId) {
    const configured = channels.find((channel) => channel.id === configuredId);

    if (!configured || configured.type !== ChannelType.GuildCategory) {
      throw new Error(
        `The configured Discord category ID for "${name}" was not found in the configured guild.`
      );
    }

    return configured.id;
  }

  const existing = channels.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === name);

  if (existing) {
    return existing.id;
  }

  const created = (await rest.post(Routes.guildChannels(guildSnowflake), {
    body: {
      name,
      type: ChannelType.GuildCategory,
    },
  })) as DiscordChannel;

  return created.id;
}

async function upsertDiscordChannelRecord(input: {
  category: DiscordCategoryKey;
  channelSnowflake: string;
  guildId: string;
  hackathonId: string;
  name: string;
  seriesId: string;
}) {
  const [existing] = await db
    .select({ id: discordChannels.id })
    .from(discordChannels)
    .where(and(eq(discordChannels.guildId, input.guildId), eq(discordChannels.seriesId, input.seriesId)))
    .limit(1);

  if (existing) {
    await db
      .update(discordChannels)
      .set({
        category: input.category,
        channelSnowflake: input.channelSnowflake,
        hackathonId: input.hackathonId,
        name: input.name,
      })
      .where(eq(discordChannels.id, existing.id));
    return;
  }

  await db.insert(discordChannels).values({
    category: input.category,
    channelSnowflake: input.channelSnowflake,
    guildId: input.guildId,
    hackathonId: input.hackathonId,
    name: input.name,
    seriesId: input.seriesId,
  });
}

async function removeIneligibleDiscordChannel(input: {
  rest: REST;
  guildSnowflake: string;
  seriesId: string;
}) {
  const [mapped] = await db
    .select({
      channelId: discordChannels.id,
      channelSnowflake: discordChannels.channelSnowflake,
    })
    .from(discordChannels)
    .innerJoin(discordGuilds, eq(discordGuilds.id, discordChannels.guildId))
    .where(
      and(
        eq(discordGuilds.guildSnowflake, input.guildSnowflake),
        eq(discordChannels.seriesId, input.seriesId)
      )
    )
    .limit(1);

  if (!mapped) {
    return;
  }

  try {
    await input.rest.delete(Routes.channel(mapped.channelSnowflake));
  } catch (error) {
    if (!isUnknownChannelError(error)) {
      throw error;
    }
  }

  await db.delete(discordChannels).where(eq(discordChannels.id, mapped.channelId));
}

export async function syncHackathonDiscordChannel(hackathonId: string) {
  const rest = discordRest();

  if (!rest || !env.DISCORD_GUILD_ID) {
    return { status: "skipped" as const, reason: "Discord bot credentials are not configured." };
  }

  const [row] = await db
    .select({
      applicationUrl: hackathons.applicationUrl,
      country: hackathonLocations.country,
      endsAt: hackathonDates.endsAt,
      hackathonId: hackathons.id,
      name: hackathons.name,
      seriesId: hackathons.seriesId,
      startsAt: hackathonDates.startsAt,
      status: hackathons.status,
      websiteUrl: hackathons.websiteUrl,
    })
    .from(hackathons)
    .leftJoin(hackathonLocations, eq(hackathonLocations.hackathonId, hackathons.id))
    .leftJoin(hackathonDates, eq(hackathonDates.hackathonId, hackathons.id))
    .where(eq(hackathons.id, hackathonId))
    .limit(1);

  if (!row) {
    throw new Error("Hackathon not found.");
  }

  const seriesId =
    row.seriesId ??
    (await assignHackathonSeries(row.hackathonId, {
      name: row.name,
      websiteUrl: row.websiteUrl ?? "",
    }));
  const category = categoryForHackathon({
    country: row.country,
    endsAt: row.endsAt,
    status: row.status,
  });

  if (!category) {
    await removeIneligibleDiscordChannel({
      rest,
      guildSnowflake: env.DISCORD_GUILD_ID,
      seriesId,
    });
    return {
      status: "skipped" as const,
      reason: "Only Canadian and US hackathons are synced to Discord.",
    };
  }

  const guildId = await ensureDiscordGuild(rest, env.DISCORD_GUILD_ID);
  const parentId = await ensureCategory(rest, env.DISCORD_GUILD_ID, category);
  const name = channelNameForHackathon({
    name: row.name,
    startsAt: row.startsAt,
  });
  const topic = channelTopic({
    applicationUrl: row.applicationUrl,
    endsAt: row.endsAt,
    name: row.name,
    startsAt: row.startsAt,
    websiteUrl: row.websiteUrl,
  });

  const [mapped] = await db
    .select({ channelSnowflake: discordChannels.channelSnowflake })
    .from(discordChannels)
    .where(and(eq(discordChannels.guildId, guildId), eq(discordChannels.seriesId, seriesId)))
    .limit(1);

  let channelSnowflake: string | undefined = mapped?.channelSnowflake;
  // "recycled" = we reused the series' existing channel and just moved/renamed it;
  // "created" = no usable channel existed, so a brand new one was made.
  let action: "created" | "recycled" = "created";

  if (channelSnowflake) {
    try {
      await rest.patch(Routes.channel(channelSnowflake), {
        body: {
          name,
          parent_id: parentId,
          topic,
        },
      });
      action = "recycled";
    } catch (error) {
      if (!isUnknownChannelError(error)) {
        throw error;
      }

      channelSnowflake = undefined;
    }
  }

  if (!channelSnowflake) {
    const created = (await rest.post(Routes.guildChannels(env.DISCORD_GUILD_ID), {
      body: {
        name,
        parent_id: parentId,
        topic,
        type: ChannelType.GuildText,
      },
    })) as DiscordChannel;
    channelSnowflake = created.id;
    action = "created";
  }

  await upsertDiscordChannelRecord({
    category,
    channelSnowflake,
    guildId,
    hackathonId: row.hackathonId,
    name,
    seriesId,
  });

  return {
    action,
    category,
    categoryName: categoryNames[category],
    channelSnowflake,
    name,
    status: "synced" as const,
  };
}

/**
 * Works out what syncing this hackathon *would* do, using only the database and
 * the channel rules — it makes no Discord API calls. Used to show an admin, before
 * they confirm, whether approving will create a new channel or recycle the series'
 * existing one, and which category it lands in.
 */
export async function previewHackathonDiscordChannel(hackathonId: string) {
  const [row] = await db
    .select({
      country: hackathonLocations.country,
      endsAt: hackathonDates.endsAt,
      name: hackathons.name,
      seriesId: hackathons.seriesId,
      startsAt: hackathonDates.startsAt,
      status: hackathons.status,
    })
    .from(hackathons)
    .leftJoin(hackathonLocations, eq(hackathonLocations.hackathonId, hackathons.id))
    .leftJoin(hackathonDates, eq(hackathonDates.hackathonId, hackathons.id))
    .where(eq(hackathons.id, hackathonId))
    .limit(1);

  if (!row) {
    throw new Error("Hackathon not found.");
  }

  const category = categoryForHackathon({
    country: row.country,
    endsAt: row.endsAt,
    status: row.status,
  });

  if (!category) {
    return { eligible: false as const };
  }

  const name = channelNameForHackathon({ name: row.name, startsAt: row.startsAt });

  let action: "create" | "recycle" = "create";
  let existingChannelName: string | null = null;

  if (row.seriesId && env.DISCORD_GUILD_ID) {
    const [existing] = await db
      .select({ name: discordChannels.name })
      .from(discordChannels)
      .innerJoin(discordGuilds, eq(discordGuilds.id, discordChannels.guildId))
      .where(
        and(
          eq(discordGuilds.guildSnowflake, env.DISCORD_GUILD_ID),
          eq(discordChannels.seriesId, row.seriesId)
        )
      )
      .limit(1);

    if (existing) {
      action = "recycle";
      existingChannelName = existing.name;
    }
  }

  return {
    action,
    category,
    categoryName: categoryNames[category],
    eligible: true as const,
    existingChannelName,
    name,
  };
}

export async function syncHackathonDiscordChannelSafely(hackathonId: string) {
  try {
    return await syncHackathonDiscordChannel(hackathonId);
  } catch (error) {
    console.error("Unable to sync Discord channel for hackathon.", { error, hackathonId });
    return { status: "failed" as const };
  }
}

export async function syncPublishedHackathonDiscordChannels() {
  const rows = await db
    .select({ id: hackathons.id })
    .from(hackathons)
    .where(and(isNotNull(hackathons.publishedAt), inArray(hackathons.status, ["upcoming", "live", "completed", "archived"])));

  let synced = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const result = await syncHackathonDiscordChannelSafely(row.id);

    if (result.status === "synced") {
      synced += 1;
    } else if (result.status === "skipped") {
      skipped += 1;
    } else {
      failed += 1;
    }
  }

  return {
    failed,
    skipped,
    synced,
    total: rows.length,
  };
}
