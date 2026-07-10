CREATE TYPE "public"."remote_type" AS ENUM('presentiel', 'hybride', 'full_remote');--> statement-breakpoint
CREATE TABLE "competences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "competences_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "experience_competences" (
	"experience_id" uuid NOT NULL,
	"competence_id" uuid NOT NULL,
	CONSTRAINT "experience_competences_experience_id_competence_id_pk" PRIMARY KEY("experience_id","competence_id")
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company" text NOT NULL,
	"title" text NOT NULL,
	"location" text,
	"remote_type" "remote_type",
	"start_date" date NOT NULL,
	"end_date" date,
	"manager" text,
	"missions" text,
	"positives" text,
	"negatives" text,
	"departure_reason" text,
	"learnings" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experience_competences" ADD CONSTRAINT "experience_competences_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_competences" ADD CONSTRAINT "experience_competences_competence_id_competences_id_fk" FOREIGN KEY ("competence_id") REFERENCES "public"."competences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;