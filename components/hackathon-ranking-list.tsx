"use client";

import Image from "next/image";
import Link from "next/link";

import type { HackathonCardData } from "@/components/hackathon-card";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function HackathonRankingList({
  hackathons,
  localCountryCode,
}: {
  hackathons: (HackathonCardData & { eloRating: number })[];
  localCountryCode: string | null;
}) {
  return (
    <ol className="flex flex-col divide-y divide-navy/10 overflow-hidden rounded-2xl border border-navy/10 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-[#1b1b1b]">
      {hackathons.map((hackathon, index) => {
        const isLocal =
          Boolean(localCountryCode) && hackathon.countryCode?.toUpperCase() === localCountryCode?.toUpperCase();
        const wins = hackathon.faceoffWins ?? 0;
        const losses = hackathon.faceoffLosses ?? 0;

        return (
          <li key={hackathon.id}>
            <Link
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-ivory dark:hover:bg-white/10"
              href={hackathon.slug ? `/hackathons/${hackathon.slug}` : "#"}
            >
              <span className="w-8 shrink-0 text-center font-mono text-sm font-semibold text-navy/40 dark:text-wheat/40">
                {index + 1}
              </span>
              <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-navy/5 text-xs font-semibold text-navy dark:bg-white/10 dark:text-wheat">
                {hackathon.image ? (
                  <Image
                    alt=""
                    className="size-full object-cover"
                    height={40}
                    src={`/api/hackathons/${encodeURIComponent(hackathon.id)}/logo`}
                    width={40}
                  />
                ) : (
                  getInitials(hackathon.name) || "HN"
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-semibold text-navy dark:text-wheat">
                  <span className="truncate">{hackathon.name}</span>
                  {isLocal ? (
                    <span className="shrink-0 rounded-full bg-cabernet/10 px-2 py-0.5 text-[10px] font-semibold text-cabernet dark:bg-[#e4a3ab]/10 dark:text-[#e4a3ab]">
                      Near you
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-navy/50 dark:text-wheat/50">{hackathon.location}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-sm font-semibold text-navy dark:text-wheat">{hackathon.eloRating}</p>
                <p className="font-mono text-[10px] text-navy/40 dark:text-wheat/40">
                  {wins}W&ndash;{losses}L
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
