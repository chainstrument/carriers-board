CREATE TABLE "project_competences" (
	"project_id" uuid NOT NULL,
	"competence_id" uuid NOT NULL,
	CONSTRAINT "project_competences_project_id_competence_id_pk" PRIMARY KEY("project_id","competence_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"client" text,
	"duration" text,
	"difficulty" integer,
	"impact" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_competences" ADD CONSTRAINT "project_competences_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_competences" ADD CONSTRAINT "project_competences_competence_id_competences_id_fk" FOREIGN KEY ("competence_id") REFERENCES "public"."competences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;