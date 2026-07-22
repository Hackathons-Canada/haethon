"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Flame, SkipForward, Swords, Trophy } from "lucide-react";

import { pickMatchup, pushRecentIds } from "@/lib/hackathons/faceoff-pairing";
import { sortByEloDescending } from "@/lib/hackathons/ranking";

export type FaceoffHackathon = {
  id: string;
  name: string;
  slug: string | null;
  image: string | null;
  eloRating: number;
  faceoffWins: number;
  faceoffLosses: number;
  location: string;
  date: string;
  country: string | null;
};

type VoteResult = {
  winnerId: string;
  loserId: string;
  winnerDelta: number;
  loserDelta: number;
  upset: boolean;
};

type Phase = "idle" | "voting" | "result";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

const springTransition = { type: "spring" as const, stiffness: 300, damping: 30 };

/* Deterministic per-index jitter (no Math.random) so the burst layout stays
   stable across re-renders — twelve particles is plenty for the spread to
   still read as "confetti" rather than a perfect ring. */
function ConfettiBurst({ burstId }: { burstId: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        id: `${burstId}-${index}`,
        angle: (index / 12) * Math.PI * 2 + ((index * 37) % 10) * 0.04,
        distance: 60 + ((index * 53) % 50),
        color: ["#721C24", "#D9A441", "#5A6CFF", "#18785C"][index % 4],
      })),
    [burstId]
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 overflow-visible">
      {particles.map((particle) => (
        <motion.span
          animate={{
            x: Math.cos(particle.angle) * particle.distance,
            y: Math.sin(particle.angle) * particle.distance,
            opacity: 0,
            scale: 0.4,
          }}
          className="absolute left-1/2 top-1/2 size-2 rounded-full"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          key={particle.id}
          style={{ backgroundColor: particle.color }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function FaceoffCardFace({
  hackathon,
  outcome,
  reduceMotion,
}: {
  hackathon: FaceoffHackathon;
  outcome: "winner" | "loser" | null;
  reduceMotion: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
      <div className="relative grid size-24 place-items-center overflow-hidden rounded-2xl bg-[radial-gradient(120%_120%_at_30%_20%,#d9c3a5_0%,#c4a882_55%,#b0946a_100%)] text-2xl font-semibold text-white sm:size-28">
        {hackathon.image ? (
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="112px"
            src={`/api/hackathons/${encodeURIComponent(hackathon.id)}/logo`}
          />
        ) : (
          getInitials(hackathon.name) || "HN"
        )}
      </div>
      <div>
        <h3 className="line-clamp-2 font-serif text-xl font-semibold leading-6 text-navy dark:text-wheat sm:text-2xl">
          {hackathon.name}
        </h3>
        <p className="mt-2 text-sm font-semibold text-navy/55 dark:text-wheat/55">{hackathon.date}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-navy/55 dark:text-wheat/55">{hackathon.location}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-navy/15 bg-navy/[0.03] px-2.5 py-1 font-mono text-[11px] font-semibold text-navy/60 dark:border-white/15 dark:bg-white/[0.04] dark:text-wheat/60">
          {hackathon.eloRating} Elo
        </span>
        <span className="font-mono text-[11px] text-navy/40 dark:text-wheat/40">
          {hackathon.faceoffWins}W&ndash;{hackathon.faceoffLosses}L
        </span>
      </div>

      <AnimatePresence>
        {outcome ? (
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className={`font-mono text-lg font-bold ${
              outcome === "winner" ? "text-[#18785C]" : "text-navy/35 dark:text-wheat/35"
            }`}
            exit={{ opacity: 0 }}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          >
            {outcome === "winner" ? "▲" : "▼"}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function FaceoffArena({ pool }: { pool: FaceoffHackathon[] }) {
  const reduceMotion = Boolean(useReducedMotion());
  // Lazy initializers run exactly once, on mount — the sanctioned place for
  // one-time randomness, and it seeds the first matchup without needing a
  // set-state-in-effect round trip.
  const [matchup, setMatchup] = useState<[FaceoffHackathon, FaceoffHackathon] | null>(() => pickMatchup(pool, []));
  const [recentIds, setRecentIds] = useState<string[]>(() =>
    matchup ? [matchup[0].id, matchup[1].id] : []
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<VoteResult | null>(null);
  const [sessionVotes, setSessionVotes] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [burstId, setBurstId] = useState(0);

  const advanceMatchup = useCallback(
    (justShownIds: string[]) => {
      const nextRecent = pushRecentIds(recentIds, ...justShownIds);

      setRecentIds(nextRecent);
      setMatchup(pickMatchup(pool, nextRecent));
      setResult(null);
      setPhase("idle");
    },
    [pool, recentIds]
  );

  const castVote = useCallback(
    async (winner: FaceoffHackathon, loser: FaceoffHackathon) => {
      if (phase !== "idle") {
        return;
      }

      setPhase("voting");

      try {
        const response = await fetch("/api/faceoff/vote", {
          body: JSON.stringify({ winnerId: winner.id, loserId: loser.id }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        if (response.status === 409 || response.status === 429) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          setNotice(body?.error ?? "Give it a second.");
          setPhase("idle");
          setTimeout(() => setNotice(null), 2200);
          return;
        }

        if (!response.ok) {
          throw new Error("Vote failed");
        }

        const body = (await response.json()) as {
          data: {
            winner: { id: string; eloBefore: number; eloAfter: number };
            loser: { id: string; eloBefore: number; eloAfter: number };
            upset: boolean;
          };
        };

        setResult({
          winnerId: winner.id,
          loserId: loser.id,
          winnerDelta: body.data.winner.eloAfter - body.data.winner.eloBefore,
          loserDelta: body.data.loser.eloAfter - body.data.loser.eloBefore,
          upset: body.data.upset,
        });
        setSessionVotes((count) => count + 1);
        setBurstId((id) => id + 1);
        setPhase("result");

        setTimeout(() => advanceMatchup([winner.id, loser.id]), reduceMotion ? 500 : 1400);
      } catch {
        setNotice("Couldn't record that vote — check your connection.");
        setPhase("idle");
        setTimeout(() => setNotice(null), 2200);
      }
    },
    [advanceMatchup, phase, reduceMotion]
  );

  function skipMatchup() {
    if (phase !== "idle" || !matchup) {
      return;
    }

    advanceMatchup([matchup[0].id, matchup[1].id]);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!matchup || phase !== "idle") {
        return;
      }

      if (event.key === "ArrowLeft") {
        void castVote(matchup[0], matchup[1]);
      } else if (event.key === "ArrowRight") {
        void castVote(matchup[1], matchup[0]);
      } else if (event.key === " " || event.key.toLowerCase() === "s") {
        event.preventDefault();
        skipMatchup();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchup, phase, castVote]);

  const leaderboard = useMemo(() => sortByEloDescending(pool).slice(0, 5), [pool]);

  if (pool.length < 2) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-navy/10 bg-ivory p-8 text-center dark:border-white/10 dark:bg-white/5">
        <p className="text-navy dark:text-wheat">Not enough hackathons published yet to face off. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1080px] flex-col gap-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cabernet/20 bg-cabernet/5 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-cabernet dark:border-[#e4a3ab]/30 dark:bg-[#e4a3ab]/10 dark:text-[#e4a3ab]">
          <Swords aria-hidden="true" className="size-3.5" />
          Face Off
        </span>
        <h1 className="font-serif text-3xl font-semibold tracking-[-0.02em] text-navy dark:text-wheat sm:text-4xl">
          Which hackathon wins?
        </h1>
        <p className="max-w-md text-sm leading-6 text-navy/55 dark:text-wheat/55">
          Pick a winner, watch the Elo shift, repeat. Every vote reorders the tier list and rankings for everyone.
        </p>
        {sessionVotes > 0 ? (
          <p className="font-mono text-xs font-semibold text-navy/40 dark:text-wheat/40">
            {sessionVotes} matchup{sessionVotes === 1 ? "" : "s"} judged this session
          </p>
        ) : null}
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {matchup ? (
            <motion.div
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-0"
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
              key={`${matchup[0].id}-${matchup[1].id}`}
              transition={reduceMotion ? { duration: 0.15 } : springTransition}
            >
              {(["left", "right"] as const).map((side) => {
                const hackathon = side === "left" ? matchup[0] : matchup[1];
                const opponent = side === "left" ? matchup[1] : matchup[0];
                const outcome =
                  result?.winnerId === hackathon.id ? "winner" : result?.loserId === hackathon.id ? "loser" : null;

                return (
                  <motion.button
                    animate={
                      outcome === "winner"
                        ? { scale: 1.03 }
                        : outcome === "loser"
                          ? { scale: 0.97, opacity: 0.6 }
                          : { scale: 1, opacity: 1 }
                    }
                    className={`relative overflow-visible rounded-3xl border bg-white shadow-[0_18px_45px_rgb(0_0_0/0.08)] transition-colors dark:bg-[#1b1b1b] dark:shadow-[0_18px_45px_rgb(0_0_0/0.5)] ${
                      outcome === "winner"
                        ? "border-[#18785C] ring-2 ring-[#18785C]/40"
                        : "border-navy/10 dark:border-white/10"
                    } ${
                      side === "left"
                        ? "sm:col-start-1 sm:rounded-r-none sm:border-r-0"
                        : "sm:col-start-3 sm:rounded-l-none sm:border-l-0"
                    }`}
                    disabled={phase !== "idle"}
                    key={hackathon.id}
                    onClick={() => void castVote(hackathon, opponent)}
                    transition={springTransition}
                    type="button"
                    whileTap={phase === "idle" ? { scale: 0.97 } : undefined}
                  >
                    <FaceoffCardFace hackathon={hackathon} outcome={outcome} reduceMotion={reduceMotion} />
                    {outcome === "winner" && result && !reduceMotion ? <ConfettiBurst burstId={burstId} /> : null}
                    <AnimatePresence>
                      {outcome ? (
                        <motion.span
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`absolute -top-3 right-4 rounded-full px-2.5 py-1 font-mono text-xs font-bold shadow-md ${
                            outcome === "winner" ? "bg-[#18785C] text-white" : "bg-navy/70 text-white dark:bg-white/20"
                          }`}
                          exit={{ opacity: 0 }}
                          initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.8 }}
                        >
                          {outcome === "winner" ? `+${result?.winnerDelta}` : `${result?.loserDelta}`}
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </motion.button>
                );
              })}

              <div className="pointer-events-none relative z-20 mx-auto -my-4 grid size-14 shrink-0 place-items-center rounded-full border-4 border-ivory bg-cabernet font-serif text-sm font-bold text-wheat shadow-lg dark:border-[#141414] dark:bg-wheat dark:text-[#141414] sm:my-0">
                VS
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {result?.upset ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-none absolute -top-4 left-1/2 z-40 -translate-x-1/2"
              exit={{ opacity: 0 }}
              initial={reduceMotion ? false : { opacity: 0, y: -10 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D9A441] px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.1em] text-[#2a1c04] shadow-lg">
                <Flame aria-hidden="true" className="size-3.5" />
                Upset!
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-navy/15 px-5 text-sm font-semibold text-navy transition-colors hover:border-navy disabled:opacity-40 dark:border-white/15 dark:text-wheat dark:hover:border-white/60"
          disabled={phase !== "idle"}
          onClick={skipMatchup}
          type="button"
        >
          <SkipForward aria-hidden="true" className="size-4" />
          Skip this one
        </button>
        <p className="font-mono text-[11px] text-navy/35 dark:text-wheat/35">
          ← / → to vote &middot; space to skip
        </p>
        <AnimatePresence>
          {notice ? (
            <motion.p
              animate={{ opacity: 1 }}
              className="text-xs font-semibold text-cabernet dark:text-[#e4a3ab]"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
            >
              {notice}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mx-auto w-full max-w-xl rounded-2xl border border-navy/10 bg-ivory/60 p-5 dark:border-white/10 dark:bg-white/5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 font-serif text-lg font-semibold text-navy dark:text-wheat">
            <Trophy aria-hidden="true" className="size-4 text-[#D9A441]" />
            Current top 5
          </h2>
          <Link
            className="text-xs font-semibold text-cabernet hover:underline dark:text-[#e4a3ab]"
            href="/hackathons?view=ranking"
          >
            Full rankings →
          </Link>
        </div>
        <ol className="flex flex-col gap-2">
          {leaderboard.map((hackathon, index) => (
            <li className="flex items-center justify-between gap-3 text-sm" key={hackathon.id}>
              <span className="flex min-w-0 items-center gap-2">
                <span className="w-4 shrink-0 font-mono text-xs text-navy/40 dark:text-wheat/40">{index + 1}</span>
                <span className="truncate font-semibold text-navy dark:text-wheat">{hackathon.name}</span>
              </span>
              <span className="shrink-0 font-mono text-xs text-navy/50 dark:text-wheat/50">
                {hackathon.eloRating}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
