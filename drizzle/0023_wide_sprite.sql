CREATE TABLE "cv_academic_formations" (
	"cv_id" uuid NOT NULL,
	"academic_formation_id" uuid NOT NULL,
	CONSTRAINT "cv_academic_formations_cv_id_academic_formation_id_pk" PRIMARY KEY("cv_id","academic_formation_id")
);
--> statement-breakpoint
CREATE TABLE "cv_competences" (
	"cv_id" uuid NOT NULL,
	"competence_id" uuid NOT NULL,
	CONSTRAINT "cv_competences_cv_id_competence_id_pk" PRIMARY KEY("cv_id","competence_id")
);
--> statement-breakpoint
CREATE TABLE "cv_experiences" (
	"cv_id" uuid NOT NULL,
	"experience_id" uuid NOT NULL,
	CONSTRAINT "cv_experiences_cv_id_experience_id_pk" PRIMARY KEY("cv_id","experience_id")
);
--> statement-breakpoint
CREATE TABLE "cvs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"languages" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "linkedin_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "cv_academic_formations" ADD CONSTRAINT "cv_academic_formations_cv_id_cvs_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."cvs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_academic_formations" ADD CONSTRAINT "cv_academic_formations_academic_formation_id_academic_formations_id_fk" FOREIGN KEY ("academic_formation_id") REFERENCES "public"."academic_formations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_competences" ADD CONSTRAINT "cv_competences_cv_id_cvs_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."cvs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_competences" ADD CONSTRAINT "cv_competences_competence_id_competences_id_fk" FOREIGN KEY ("competence_id") REFERENCES "public"."competences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_experiences" ADD CONSTRAINT "cv_experiences_cv_id_cvs_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."cvs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cv_experiences" ADD CONSTRAINT "cv_experiences_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;