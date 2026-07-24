CREATE EXTENSION IF NOT EXISTS pgcrypto;--> statement-breakpoint
CREATE TABLE "hackathon_faceoff_matchups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"left_id" uuid NOT NULL,
	"right_id" uuid NOT NULL,
	"voter_fingerprint" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"skipped_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hackathon_faceoff_matchups_distinct_pair" CHECK ("hackathon_faceoff_matchups"."left_id" <> "hackathon_faceoff_matchups"."right_id")
);
--> statement-breakpoint
CREATE TABLE "hackathon_faceoff_ratings" (
	"hackathon_id" uuid PRIMARY KEY NOT NULL,
	"elo_rating" integer DEFAULT 1500 NOT NULL,
	"faceoff_wins" integer DEFAULT 0 NOT NULL,
	"faceoff_losses" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hackathon_faceoff_ratings_wins_nonnegative" CHECK ("hackathon_faceoff_ratings"."faceoff_wins" >= 0),
	CONSTRAINT "hackathon_faceoff_ratings_losses_nonnegative" CHECK ("hackathon_faceoff_ratings"."faceoff_losses" >= 0),
	CONSTRAINT "hackathon_faceoff_ratings_version_nonnegative" CHECK ("hackathon_faceoff_ratings"."version" >= 0)
);
--> statement-breakpoint
INSERT INTO "hackathon_faceoff_ratings" (
	"hackathon_id",
	"elo_rating",
	"faceoff_wins",
	"faceoff_losses",
	"version",
	"updated_at"
)
SELECT
	"id",
	"elo_rating",
	"faceoff_wins",
	"faceoff_losses",
	"faceoff_wins" + "faceoff_losses",
	"updated_at"
FROM "hackathons";--> statement-breakpoint
UPDATE "hackathon_faceoff_ratings"
SET "elo_rating" = 1500
WHERE "faceoff_wins" + "faceoff_losses" = 0;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" DROP CONSTRAINT "hackathon_faceoff_votes_winner_id_hackathons_id_fk";
--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" DROP CONSTRAINT "hackathon_faceoff_votes_loser_id_hackathons_id_fk";
--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD COLUMN "request_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD COLUMN "matchup_id" uuid;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD COLUMN "left_id" uuid;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD COLUMN "right_id" uuid;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD COLUMN "pair_low_id" uuid;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD COLUMN "pair_high_id" uuid;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD COLUMN "algorithm_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
UPDATE "hackathon_faceoff_votes"
SET
	"left_id" = "winner_id",
	"right_id" = "loser_id",
	"pair_low_id" = LEAST("winner_id", "loser_id"),
	"pair_high_id" = GREATEST("winner_id", "loser_id");--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ALTER COLUMN "left_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ALTER COLUMN "right_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ALTER COLUMN "pair_low_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ALTER COLUMN "pair_high_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ALTER COLUMN "algorithm_version" SET DEFAULT 2;--> statement-breakpoint
UPDATE "hackathon_faceoff_votes"
SET "voter_fingerprint" = CASE
	WHEN "voter_fingerprint" LIKE 'anon:%' THEN
		'a:' || rtrim(
			translate(
				encode(digest(substring("voter_fingerprint" from 6), 'sha256'), 'base64'),
				'+/',
				'-_'
			),
			'='
		)
	WHEN "voter_fingerprint" LIKE 'user:%' THEN
		'u:' || substring("voter_fingerprint" from 6)
	ELSE "voter_fingerprint"
END;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_matchups" ADD CONSTRAINT "hackathon_faceoff_matchups_left_id_hackathons_id_fk" FOREIGN KEY ("left_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_matchups" ADD CONSTRAINT "hackathon_faceoff_matchups_right_id_hackathons_id_fk" FOREIGN KEY ("right_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_ratings" ADD CONSTRAINT "hackathon_faceoff_ratings_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hackathon_faceoff_matchups_voter_created_idx" ON "hackathon_faceoff_matchups" USING btree ("voter_fingerprint","created_at");--> statement-breakpoint
CREATE INDEX "hackathon_faceoff_matchups_expires_idx" ON "hackathon_faceoff_matchups" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "hackathon_faceoff_ratings_elo_idx" ON "hackathon_faceoff_ratings" USING btree ("elo_rating","hackathon_id");--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD CONSTRAINT "hackathon_faceoff_votes_matchup_id_hackathon_faceoff_matchups_id_fk" FOREIGN KEY ("matchup_id") REFERENCES "public"."hackathon_faceoff_matchups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD CONSTRAINT "hackathon_faceoff_votes_left_id_hackathons_id_fk" FOREIGN KEY ("left_id") REFERENCES "public"."hackathons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD CONSTRAINT "hackathon_faceoff_votes_right_id_hackathons_id_fk" FOREIGN KEY ("right_id") REFERENCES "public"."hackathons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD CONSTRAINT "hackathon_faceoff_votes_winner_id_hackathons_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."hackathons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD CONSTRAINT "hackathon_faceoff_votes_loser_id_hackathons_id_fk" FOREIGN KEY ("loser_id") REFERENCES "public"."hackathons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hackathon_faceoff_votes_request_idx" ON "hackathon_faceoff_votes" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "hackathon_faceoff_votes_voter_pair_idx" ON "hackathon_faceoff_votes" USING btree ("voter_fingerprint","pair_low_id","pair_high_id","created_at");--> statement-breakpoint
ALTER TABLE "hackathons" DROP COLUMN "elo_rating";--> statement-breakpoint
ALTER TABLE "hackathons" DROP COLUMN "faceoff_wins";--> statement-breakpoint
ALTER TABLE "hackathons" DROP COLUMN "faceoff_losses";--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD CONSTRAINT "hackathon_faceoff_votes_distinct_pair" CHECK ("hackathon_faceoff_votes"."winner_id" <> "hackathon_faceoff_votes"."loser_id");--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD CONSTRAINT "hackathon_faceoff_votes_distinct_positions" CHECK ("hackathon_faceoff_votes"."left_id" <> "hackathon_faceoff_votes"."right_id");--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD CONSTRAINT "hackathon_faceoff_votes_canonical_pair" CHECK ("hackathon_faceoff_votes"."pair_low_id" < "hackathon_faceoff_votes"."pair_high_id");--> statement-breakpoint

CREATE OR REPLACE FUNCTION ensure_hackathon_faceoff_rating()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	INSERT INTO hackathon_faceoff_ratings (hackathon_id)
	VALUES (NEW.id)
	ON CONFLICT (hackathon_id) DO NOTHING;
	RETURN NEW;
END;
$$;--> statement-breakpoint

CREATE TRIGGER hackathons_create_faceoff_rating
AFTER INSERT ON hackathons
FOR EACH ROW
EXECUTE FUNCTION ensure_hackathon_faceoff_rating();--> statement-breakpoint

CREATE OR REPLACE FUNCTION record_hackathon_faceoff_vote(
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
DECLARE
	v_left_id uuid;
	v_right_id uuid;
	v_loser_id uuid;
	v_matchup_fingerprint varchar(64);
	v_expires_at timestamptz;
	v_consumed_at timestamptz;
	v_skipped_at timestamptz;
	v_last_vote_at timestamptz;
	v_pair_last_vote_at timestamptz;
	v_daily_votes integer;
	v_eligible_count integer;
	v_winner_wins integer;
	v_winner_losses integer;
	v_loser_wins integer;
	v_loser_losses integer;
	v_k integer;
	v_winner_expected double precision;
BEGIN
	/* Serializes all requests for one identity, including different pairs. */
	PERFORM pg_advisory_xact_lock(hashtextextended('faceoff-voter:' || p_voter_fingerprint, 0));

	SELECT
		v.id,
		v.winner_id,
		v.loser_id,
		v.winner_elo_before,
		v.winner_elo_after,
		v.loser_elo_before,
		v.loser_elo_after,
		(v.loser_elo_before - v.winner_elo_before >= 150)
	INTO
		vote_id,
		winner_id,
		loser_id,
		winner_elo_before,
		winner_elo_after,
		loser_elo_before,
		loser_elo_after,
		upset
	FROM hackathon_faceoff_votes v
	WHERE v.request_id = p_request_id
	  AND v.voter_fingerprint = p_voter_fingerprint;

	IF FOUND THEN
		outcome := 'ok';
		retry_after_ms := 0;
		RETURN NEXT;
		RETURN;
	END IF;

	SELECT
		m.left_id,
		m.right_id,
		m.voter_fingerprint,
		m.expires_at,
		m.consumed_at,
		m.skipped_at
	INTO
		v_left_id,
		v_right_id,
		v_matchup_fingerprint,
		v_expires_at,
		v_consumed_at,
		v_skipped_at
	FROM hackathon_faceoff_matchups m
	WHERE m.id = p_matchup_id
	FOR UPDATE;

	IF NOT FOUND OR v_matchup_fingerprint <> p_voter_fingerprint THEN
		outcome := 'invalid_matchup';
		retry_after_ms := 0;
		RETURN NEXT;
		RETURN;
	END IF;

	IF v_consumed_at IS NOT NULL OR v_skipped_at IS NOT NULL THEN
		outcome := 'matchup_closed';
		retry_after_ms := 0;
		RETURN NEXT;
		RETURN;
	END IF;

	IF v_expires_at <= clock_timestamp() THEN
		outcome := 'matchup_expired';
		retry_after_ms := 0;
		RETURN NEXT;
		RETURN;
	END IF;

	IF p_winner_id <> v_left_id AND p_winner_id <> v_right_id THEN
		outcome := 'invalid_winner';
		retry_after_ms := 0;
		RETURN NEXT;
		RETURN;
	END IF;

	v_loser_id := CASE WHEN p_winner_id = v_left_id THEN v_right_id ELSE v_left_id END;

	SELECT count(*)::integer
	INTO v_eligible_count
	FROM hackathons h
	WHERE h.id IN (p_winner_id, v_loser_id)
	  AND h.published_at IS NOT NULL
	  AND h.status IN ('upcoming', 'live', 'completed');

	IF v_eligible_count <> 2 THEN
		outcome := 'ineligible_pair';
		retry_after_ms := 0;
		RETURN NEXT;
		RETURN;
	END IF;

	SELECT v.created_at
	INTO v_last_vote_at
	FROM hackathon_faceoff_votes v
	WHERE v.voter_fingerprint = p_voter_fingerprint
	ORDER BY v.created_at DESC
	LIMIT 1;

	IF v_last_vote_at IS NOT NULL
	   AND v_last_vote_at > clock_timestamp() - interval '600 milliseconds' THEN
		outcome := 'slow_down';
		retry_after_ms := GREATEST(
			1,
			CEIL(EXTRACT(epoch FROM (
				v_last_vote_at + interval '600 milliseconds' - clock_timestamp()
			)) * 1000)::integer
		);
		RETURN NEXT;
		RETURN;
	END IF;

	SELECT count(*)::integer
	INTO v_daily_votes
	FROM hackathon_faceoff_votes v
	WHERE v.voter_fingerprint = p_voter_fingerprint
	  AND v.created_at >= clock_timestamp() - interval '24 hours';

	IF v_daily_votes >= 50 THEN
		outcome := 'daily_limit';
		retry_after_ms := 24 * 60 * 60 * 1000;
		RETURN NEXT;
		RETURN;
	END IF;

	SELECT v.created_at
	INTO v_pair_last_vote_at
	FROM hackathon_faceoff_votes v
	WHERE v.voter_fingerprint = p_voter_fingerprint
	  AND v.pair_low_id = LEAST(p_winner_id, v_loser_id)
	  AND v.pair_high_id = GREATEST(p_winner_id, v_loser_id)
	  AND v.created_at >= clock_timestamp() - interval '1 hour'
	ORDER BY v.created_at DESC
	LIMIT 1;

	IF v_pair_last_vote_at IS NOT NULL THEN
		outcome := 'duplicate_pair';
		retry_after_ms := GREATEST(
			1,
			CEIL(EXTRACT(epoch FROM (
				v_pair_last_vote_at + interval '1 hour' - clock_timestamp()
			)) * 1000)::integer
		);
		RETURN NEXT;
		RETURN;
	END IF;

	/* Deterministic lock order prevents deadlocks between overlapping pairs. */
	PERFORM r.hackathon_id
	FROM hackathon_faceoff_ratings r
	WHERE r.hackathon_id IN (p_winner_id, v_loser_id)
	ORDER BY r.hackathon_id
	FOR UPDATE;

	SELECT r.elo_rating, r.faceoff_wins, r.faceoff_losses
	INTO winner_elo_before, v_winner_wins, v_winner_losses
	FROM hackathon_faceoff_ratings r
	WHERE r.hackathon_id = p_winner_id;

	SELECT r.elo_rating, r.faceoff_wins, r.faceoff_losses
	INTO loser_elo_before, v_loser_wins, v_loser_losses
	FROM hackathon_faceoff_ratings r
	WHERE r.hackathon_id = v_loser_id;

	IF winner_elo_before IS NULL OR loser_elo_before IS NULL THEN
		outcome := 'missing_rating';
		retry_after_ms := 0;
		RETURN NEXT;
		RETURN;
	END IF;

	/* Shared K keeps every matchup zero-sum and protects established ratings. */
	v_k := LEAST(
		CASE
			WHEN v_winner_wins + v_winner_losses < 10 THEN 40
			WHEN v_winner_wins + v_winner_losses < 30 THEN 24
			ELSE 16
		END,
		CASE
			WHEN v_loser_wins + v_loser_losses < 10 THEN 40
			WHEN v_loser_wins + v_loser_losses < 30 THEN 24
			ELSE 16
		END
	);
	v_winner_expected := 1.0 / (
		1.0 + power(10.0, (loser_elo_before - winner_elo_before) / 400.0)
	);
	winner_elo_after := round(winner_elo_before + v_k * (1.0 - v_winner_expected))::integer;
	loser_elo_after := loser_elo_before - (winner_elo_after - winner_elo_before);
	upset := loser_elo_before - winner_elo_before >= 150;

	UPDATE hackathon_faceoff_ratings
	SET
		elo_rating = winner_elo_after,
		faceoff_wins = faceoff_wins + 1,
		version = version + 1,
		updated_at = clock_timestamp()
	WHERE hackathon_id = p_winner_id;

	UPDATE hackathon_faceoff_ratings
	SET
		elo_rating = loser_elo_after,
		faceoff_losses = faceoff_losses + 1,
		version = version + 1,
		updated_at = clock_timestamp()
	WHERE hackathon_id = v_loser_id;

	INSERT INTO hackathon_faceoff_votes (
		request_id,
		matchup_id,
		winner_id,
		loser_id,
		left_id,
		right_id,
		pair_low_id,
		pair_high_id,
		voter_user_id,
		voter_fingerprint,
		winner_elo_before,
		winner_elo_after,
		loser_elo_before,
		loser_elo_after,
		algorithm_version
	)
	VALUES (
		p_request_id,
		p_matchup_id,
		p_winner_id,
		v_loser_id,
		v_left_id,
		v_right_id,
		LEAST(p_winner_id, v_loser_id),
		GREATEST(p_winner_id, v_loser_id),
		p_voter_user_id,
		p_voter_fingerprint,
		winner_elo_before,
		winner_elo_after,
		loser_elo_before,
		loser_elo_after,
		2
	)
	RETURNING id INTO vote_id;

	UPDATE hackathon_faceoff_matchups
	SET consumed_at = clock_timestamp()
	WHERE id = p_matchup_id;

	outcome := 'ok';
	winner_id := p_winner_id;
	loser_id := v_loser_id;
	retry_after_ms := 0;
	RETURN NEXT;
END;
$$;
