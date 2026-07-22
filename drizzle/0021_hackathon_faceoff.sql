CREATE TABLE "hackathon_faceoff_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"winner_id" uuid NOT NULL,
	"loser_id" uuid NOT NULL,
	"voter_user_id" uuid,
	"voter_fingerprint" varchar(64) NOT NULL,
	"winner_elo_before" integer NOT NULL,
	"winner_elo_after" integer NOT NULL,
	"loser_elo_before" integer NOT NULL,
	"loser_elo_after" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "elo_rating" integer DEFAULT 1500 NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "faceoff_wins" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "faceoff_losses" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD CONSTRAINT "hackathon_faceoff_votes_winner_id_hackathons_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD CONSTRAINT "hackathon_faceoff_votes_loser_id_hackathons_id_fk" FOREIGN KEY ("loser_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hackathon_faceoff_votes" ADD CONSTRAINT "hackathon_faceoff_votes_voter_user_id_users_id_fk" FOREIGN KEY ("voter_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hackathon_faceoff_votes_winner_idx" ON "hackathon_faceoff_votes" USING btree ("winner_id");--> statement-breakpoint
CREATE INDEX "hackathon_faceoff_votes_loser_idx" ON "hackathon_faceoff_votes" USING btree ("loser_id");--> statement-breakpoint
CREATE INDEX "hackathon_faceoff_votes_voter_idx" ON "hackathon_faceoff_votes" USING btree ("voter_fingerprint","created_at");