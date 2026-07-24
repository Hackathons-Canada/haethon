ALTER TABLE "hackathon_faceoff_ratings"
ADD COLUMN "rank_tier" varchar(1) DEFAULT 'D' NOT NULL;--> statement-breakpoint

ALTER TABLE "hackathon_faceoff_ratings"
ADD CONSTRAINT "hackathon_faceoff_ratings_tier_valid"
CHECK ("rank_tier" IN ('S', 'A', 'B', 'C', 'D'));--> statement-breakpoint

CREATE INDEX "hackathon_faceoff_ratings_tier_idx"
ON "hackathon_faceoff_ratings" USING btree ("rank_tier", "elo_rating", "hackathon_id");--> statement-breakpoint

/* Recalculate the global population from persisted Face Off state. The same
   confidence adjustment used by the public leaderboard prevents a one-game
   rating spike from outranking an established result. */
CREATE OR REPLACE FUNCTION refresh_hackathon_faceoff_rank_tiers()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
	/* Ratings outside the published Face Off population do not retain a stale
	   tier if a hackathon is archived or unpublished. */
	UPDATE hackathon_faceoff_ratings r
	SET
		rank_tier = 'D',
		updated_at = clock_timestamp()
	WHERE r.rank_tier <> 'D'
	  AND NOT EXISTS (
		SELECT 1
		FROM hackathons h
		WHERE h.id = r.hackathon_id
		  AND h.published_at IS NOT NULL
		  AND h.status IN ('upcoming', 'live', 'completed')
	  );

	WITH ranked AS (
		SELECT
			r.hackathon_id,
			row_number() OVER (
				ORDER BY
					round(
						1500
						+ (r.faceoff_wins + r.faceoff_losses)::numeric
							/ (r.faceoff_wins + r.faceoff_losses + 10)
							* (r.elo_rating - 1500)
					) DESC,
					r.hackathon_id
			) AS position,
			count(*) OVER () AS population
		FROM hackathon_faceoff_ratings r
		INNER JOIN hackathons h ON h.id = r.hackathon_id
		WHERE h.published_at IS NOT NULL
		  AND h.status IN ('upcoming', 'live', 'completed')
	),
	assigned AS (
		SELECT
			hackathon_id,
			CASE
				WHEN position <= ceil(population * 0.01) THEN 'S'
				WHEN position <= ceil(population * 0.11) THEN 'A'
				WHEN position <= ceil(population * 0.31) THEN 'B'
				WHEN position <= ceil(population * 0.61) THEN 'C'
				ELSE 'D'
			END AS rank_tier
		FROM ranked
	)
	UPDATE hackathon_faceoff_ratings r
	SET
		rank_tier = assigned.rank_tier,
		updated_at = clock_timestamp()
	FROM assigned
	WHERE r.hackathon_id = assigned.hackathon_id
	  AND r.rank_tier IS DISTINCT FROM assigned.rank_tier;
END;
$$;--> statement-breakpoint

/* A statement-level lock is acquired before any Elo rows are touched. This
   prevents two votes from taking rating-row locks in opposite order while
   their tier refreshes update the global population. */
CREATE OR REPLACE FUNCTION lock_hackathon_faceoff_rank_refresh()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	PERFORM pg_advisory_xact_lock(hashtextextended('hackathon-faceoff-rank-tiers', 0));
	RETURN NULL;
END;
$$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION trigger_hackathon_faceoff_rank_refresh()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	PERFORM refresh_hackathon_faceoff_rank_tiers();
	RETURN NULL;
END;
$$;--> statement-breakpoint

/* The existing vote function locks its two rating rows before updating them.
   Wrap it so concurrent votes serialize before either transaction owns rating
   rows that the global refresh may need. */
ALTER FUNCTION record_hackathon_faceoff_vote(uuid, uuid, uuid, varchar, uuid)
RENAME TO record_hackathon_faceoff_vote_without_rank_lock;--> statement-breakpoint

CREATE FUNCTION record_hackathon_faceoff_vote(
	p_matchup_id uuid,
	p_winner_id uuid,
	p_voter_user_id uuid,
	p_voter_fingerprint varchar,
	p_request_id uuid
)
RETURNS TABLE (
	outcome text,
	vote_id uuid,
	winner_id uuid,
	loser_id uuid,
	winner_elo_before integer,
	winner_elo_after integer,
	loser_elo_before integer,
	loser_elo_after integer,
	upset boolean,
	retry_after_ms integer
)
LANGUAGE plpgsql
AS $$
BEGIN
	PERFORM pg_advisory_xact_lock(hashtextextended('hackathon-faceoff-rank-tiers', 0));

	RETURN QUERY
	SELECT *
	FROM record_hackathon_faceoff_vote_without_rank_lock(
		p_matchup_id,
		p_winner_id,
		p_voter_user_id,
		p_voter_fingerprint,
		p_request_id
	);
END;
$$;--> statement-breakpoint

/* Backfill before installing triggers so deployment performs one refresh. */
SELECT refresh_hackathon_faceoff_rank_tiers();--> statement-breakpoint

CREATE TRIGGER hackathon_faceoff_rank_lock_on_elo
BEFORE UPDATE OF elo_rating ON hackathon_faceoff_ratings
FOR EACH STATEMENT
EXECUTE FUNCTION lock_hackathon_faceoff_rank_refresh();--> statement-breakpoint

CREATE TRIGGER hackathon_faceoff_rank_refresh_on_elo
AFTER UPDATE OF elo_rating ON hackathon_faceoff_ratings
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_hackathon_faceoff_rank_refresh();--> statement-breakpoint

CREATE TRIGGER hackathon_faceoff_rank_lock_on_membership
BEFORE INSERT OR DELETE ON hackathon_faceoff_ratings
FOR EACH STATEMENT
EXECUTE FUNCTION lock_hackathon_faceoff_rank_refresh();--> statement-breakpoint

CREATE TRIGGER hackathon_faceoff_rank_refresh_on_membership
AFTER INSERT OR DELETE ON hackathon_faceoff_ratings
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_hackathon_faceoff_rank_refresh();--> statement-breakpoint

CREATE TRIGGER hackathon_faceoff_rank_lock_on_visibility
BEFORE UPDATE OF published_at, status ON hackathons
FOR EACH STATEMENT
EXECUTE FUNCTION lock_hackathon_faceoff_rank_refresh();--> statement-breakpoint

CREATE TRIGGER hackathon_faceoff_rank_refresh_on_visibility
AFTER UPDATE OF published_at, status ON hackathons
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_hackathon_faceoff_rank_refresh();
