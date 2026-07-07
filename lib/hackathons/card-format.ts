const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDateRange(startsAt: Date | null, endsAt: Date | null) {
  if (!startsAt) {
    return "Dates TBA";
  }

  const start = {
    day: startsAt.getUTCDate(),
    month: monthNames[startsAt.getUTCMonth()],
    year: startsAt.getUTCFullYear(),
  };

  if (!endsAt) {
    return `${start.month} ${start.day}, ${start.year}`;
  }

  const end = {
    day: endsAt.getUTCDate(),
    month: monthNames[endsAt.getUTCMonth()],
    year: endsAt.getUTCFullYear(),
  };

  if (start.year === end.year && start.month === end.month && start.day === end.day) {
    return `${start.month} ${start.day}, ${start.year}`;
  }

  if (start.year === end.year && start.month === end.month) {
    return `${start.month} ${start.day}-${end.day}, ${start.year}`;
  }

  if (start.year === end.year) {
    return `${start.month} ${start.day}-${end.month} ${end.day}, ${start.year}`;
  }

  return `${start.month} ${start.day}, ${start.year}-${end.month} ${end.day}, ${end.year}`;
}

export function formatDuration(startsAt: Date | null, endsAt: Date | null, format: string) {
  const formatLabel = format.replace("_", " ");

  if (!startsAt || !endsAt) {
    return `Duration TBA · ${formatLabel}`;
  }

  const hours = Math.max(1, Math.round((endsAt.getTime() - startsAt.getTime()) / 3_600_000));
  const duration = hours <= 96 ? `${hours} hours` : `${Math.ceil(hours / 24)} days`;

  return `${duration} · ${formatLabel}`;
}

export function formatLocation({
  city,
  country,
  format,
  region,
  venue,
}: {
  city: string | null;
  country: string | null;
  format: string;
  region: string | null;
  venue: string | null;
}) {
  if (format === "online") {
    return "Online";
  }

  const locality = [city, region].filter(Boolean).join(", ");

  return locality || venue || country || "Location TBA";
}

export function buildBadges({
  beginnerFriendly,
  format,
  status,
  travelReimbursement,
}: {
  beginnerFriendly: boolean;
  format: string;
  status: string;
  travelReimbursement: boolean;
}) {
  return [
    status === "live" ? "Live now" : "Upcoming",
    format.replace("_", " "),
    beginnerFriendly ? "Beginner friendly" : null,
    travelReimbursement ? "Travel support" : null,
  ].filter(Boolean) as string[];
}
