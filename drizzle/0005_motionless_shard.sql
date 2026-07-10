ALTER TABLE "competences" ADD COLUMN "level" integer;--> statement-breakpoint
ALTER TABLE "competences" ADD COLUMN "confidence" integer;--> statement-breakpoint
ALTER TABLE "competences" ADD COLUMN "years_of_experience" integer;--> statement-breakpoint
ALTER TABLE "competences" ADD COLUMN "wants_to_improve" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "competences" ADD COLUMN "manual_last_used_at" date;