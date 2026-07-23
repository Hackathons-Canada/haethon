DROP TABLE "user_hackathon_votes" CASCADE;--> statement-breakpoint
ALTER TABLE "hackathons" DROP COLUMN "vote_score";--> statement-breakpoint
ALTER TABLE "hackathons" DROP COLUMN "vote_display_offset";