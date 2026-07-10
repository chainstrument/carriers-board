CREATE TYPE "public"."goal_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."goal_status" AS ENUM('todo', 'in_progress', 'done', 'abandoned');--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"deadline" date,
	"priority" "goal_priority" DEFAULT 'medium' NOT NULL,
	"status" "goal_status" DEFAULT 'todo' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"competence_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_competence_id_competences_id_fk" FOREIGN KEY ("competence_id") REFERENCES "public"."competences"("id") ON DELETE set null ON UPDATE no action;