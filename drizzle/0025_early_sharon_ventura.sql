CREATE TYPE "public"."cv_template" AS ENUM('classique', 'deux_colonnes');--> statement-breakpoint
ALTER TABLE "cvs" ADD COLUMN "template" "cv_template" DEFAULT 'classique' NOT NULL;