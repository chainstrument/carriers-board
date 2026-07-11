CREATE TYPE "public"."job_application_status" AS ENUM('to_review', 'hr_contact', 'technical_test', 'offer', 'rejected', 'accepted');--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company" text NOT NULL,
	"city" text,
	"salary" integer,
	"remote_type" "remote_type",
	"link" text,
	"notes" text,
	"status" "job_application_status" DEFAULT 'to_review' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;