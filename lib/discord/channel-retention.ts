export const PAST_DISCORD_CHANNEL_RETENTION_DAYS = 30;

export function discordChannelRetentionCutoff(now: Date) {
  return new Date(now.getTime() - PAST_DISCORD_CHANNEL_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

export function isDiscordChannelPastRetention(
  hackathon: { endsAt: Date | null; isRecurring: boolean },
  now = new Date()
) {
  return (
    !hackathon.isRecurring &&
    hackathon.endsAt !== null &&
    hackathon.endsAt < discordChannelRetentionCutoff(now)
  );
}
