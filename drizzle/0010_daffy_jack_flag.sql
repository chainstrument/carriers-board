CREATE TABLE "satisfaction_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"month" date NOT NULL,
	"stress" integer NOT NULL,
	"salary" integer NOT NULL,
	"team" integer NOT NULL,
	"management" integer NOT NULL,
	"remote_work" integer NOT NULL,
	"workplace" integer NOT NULL,
	"work_life_balance" integer NOT NULL,
	"technical_interest" integer NOT NULL,
	"autonomy" integer NOT NULL,
	"company_vision" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "satisfaction_entries_user_id_month_unique" UNIQUE("user_id","month")
);
--> statement-breakpoint
ALTER TABLE "satisfaction_entries" ADD CONSTRAINT "satisfaction_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;