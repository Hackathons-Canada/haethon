/**
 * Audits denormalized Face Off state against the immutable vote log.
 * Pass --repair to restore counters and each played hackathon's latest logged
 * rating. The default mode is read-only.
 */
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

async function main() {
  const { sql } = await import("drizzle-orm");
  const { db } = await import("../lib/db");
  const repair = process.argv.includes("--repair");
  const audit = await db.execute<{
    current_rating_mismatches: number;
    history_discontinuities: number;
    loss_counter_mismatches: number;
    win_counter_mismatches: number;
  }>(sql`
    with events as (
      select
        id as vote_id,
        winner_id as hackathon_id,
        created_at,
        winner_elo_before as elo_before,
        winner_elo_after as elo_after,
        true as won
      from hackathon_faceoff_votes
      union all
      select
        id,
        loser_id,
        created_at,
        loser_elo_before,
        loser_elo_after,
        false
      from hackathon_faceoff_votes
    ),
    chained as (
      select
        *,
        lag(elo_after) over (partition by hackathon_id order by created_at, vote_id) as prior_after
      from events
    ),
    logged as (
      select
        hackathon_id,
        count(*) filter (where won)::integer as wins,
        count(*) filter (where not won)::integer as losses
      from events
      group by hackathon_id
    ),
    latest as (
      select distinct on (hackathon_id) hackathon_id, elo_after
      from events
      order by hackathon_id, created_at desc, vote_id desc
    )
    select
      (select count(*)::integer from chained where prior_after is not null and prior_after <> elo_before)
        as history_discontinuities,
      (select count(*)::integer
       from hackathon_faceoff_ratings r
       join logged l on l.hackathon_id = r.hackathon_id
       where r.faceoff_wins <> l.wins)
        as win_counter_mismatches,
      (select count(*)::integer
       from hackathon_faceoff_ratings r
       join logged l on l.hackathon_id = r.hackathon_id
       where r.faceoff_losses <> l.losses)
        as loss_counter_mismatches,
      (select count(*)::integer
       from hackathon_faceoff_ratings r
       join latest l on l.hackathon_id = r.hackathon_id
       where r.elo_rating <> l.elo_after)
        as current_rating_mismatches
  `);
  const result = audit.rows[0];

  console.log(JSON.stringify(result, null, 2));

  if (!repair) {
    return;
  }

  await db.execute(sql`
    with events as (
      select id as vote_id, winner_id as hackathon_id, created_at, winner_elo_after as elo_after, true as won
      from hackathon_faceoff_votes
      union all
      select id, loser_id, created_at, loser_elo_after, false
      from hackathon_faceoff_votes
    ),
    aggregate as (
      select
        hackathon_id,
        count(*) filter (where won)::integer as wins,
        count(*) filter (where not won)::integer as losses
      from events
      group by hackathon_id
    ),
    latest as (
      select distinct on (hackathon_id) hackathon_id, elo_after
      from events
      order by hackathon_id, created_at desc, vote_id desc
    )
    update hackathon_faceoff_ratings r
    set
      elo_rating = l.elo_after,
      faceoff_wins = a.wins,
      faceoff_losses = a.losses,
      version = a.wins + a.losses,
      updated_at = now()
    from aggregate a
    join latest l on l.hackathon_id = a.hackathon_id
    where r.hackathon_id = a.hackathon_id
  `);
  console.log("Face Off rating state repaired from the vote log.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
