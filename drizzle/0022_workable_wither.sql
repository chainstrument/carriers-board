ALTER TABLE "experiences" DROP COLUMN "remote_type";--> statement-breakpoint
ALTER TABLE "job_applications" DROP COLUMN "remote_type";--> statement-breakpoint
DROP TYPE "public"."remote_type";