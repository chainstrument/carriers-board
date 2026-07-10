CREATE TABLE "salary_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"experience_id" uuid NOT NULL,
	"base_salary" integer NOT NULL,
	"bonus" integer DEFAULT 0 NOT NULL,
	"profit_sharing" integer DEFAULT 0 NOT NULL,
	"profit_incentive" integer DEFAULT 0 NOT NULL,
	"meal_vouchers_annual" integer DEFAULT 0 NOT NULL,
	"health_insurance_annual" integer DEFAULT 0 NOT NULL,
	"transport_annual" integer DEFAULT 0 NOT NULL,
	"benefits_in_kind_annual" integer DEFAULT 0 NOT NULL,
	"rtt_days" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "salary_packages_experience_id_unique" UNIQUE("experience_id")
);
--> statement-breakpoint
ALTER TABLE "salary_packages" ADD CONSTRAINT "salary_packages_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;