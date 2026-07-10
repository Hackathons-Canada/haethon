ALTER TYPE "public"."reminder_type" ADD VALUE 'hackathon_week_before' BEFORE 'check_in';--> statement-breakpoint
ALTER TYPE "public"."reminder_type" ADD VALUE 'hackathon_day_before' BEFORE 'check_in';--> statement-breakpoint
CREATE TABLE "user_hackathon_notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"hackathon_id" uuid NOT NULL,
	"type" "reminder_type" NOT NULL,
	"channel" "notification_channel" DEFAULT 'email' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_hackathon_notification_preferences" ADD CONSTRAINT "user_hackathon_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_hackathon_notification_preferences" ADD CONSTRAINT "user_hackathon_notification_preferences_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_hackathon_notification_preferences_unique_idx" ON "user_hackathon_notification_preferences" USING btree ("user_id","hackathon_id","type","channel");--> statement-breakpoint
CREATE INDEX "user_hackathon_notification_preferences_user_idx" ON "user_hackathon_notification_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_hackathon_notification_preferences_hackathon_idx" ON "user_hackathon_notification_preferences" USING btree ("hackathon_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reminders_pending_delivery_unique_idx" ON "reminders" USING btree ("user_id","hackathon_id","type","channel","scheduled_for") WHERE "reminders"."sent_at" is null;