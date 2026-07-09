ALTER TABLE "user_hackathons" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_hackathons" ADD COLUMN "award_name" varchar(180);