CREATE TABLE "rate_limit_buckets" (
	"key" varchar(240) PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"window_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hackathon_submissions" ADD COLUMN "review_claimed_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "rate_limit_buckets_expires_idx" ON "rate_limit_buckets" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "user_hackathon_attendance_event_user_day_idx" ON "user_hackathon_attendance_days" USING btree ("hackathon_id","user_id","attended_on");--> statement-breakpoint
CREATE INDEX "user_hackathons_event_status_user_idx" ON "user_hackathons" USING btree ("hackathon_id","application_status","user_id");