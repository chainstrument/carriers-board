import { relations } from "drizzle-orm";
import { date, integer, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const themeEnum = pgEnum("theme", ["light", "dark", "dev"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  image: text("image"),
  theme: themeEnum("theme").notNull().default("light"),
  resetToken: text("reset_token"),
  resetTokenExpiresAt: timestamp("reset_token_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const remoteTypeEnum = pgEnum("remote_type", ["presentiel", "hybride", "full_remote"]);

// Catalogue minimal des compétences, partagé par plusieurs epics
// (Parcours, Projets...). Les attributs personnels (niveau, confiance,
// envie de progresser) seront ajoutés directement sur cette table par
// l'Epic 5 plutôt que via une table de liaison séparée : dans une appli
// mono-utilisateur, il n'y a pas de référentiel "global" à distinguer de
// l'usage personnel.
export const competences = pgTable("competences", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  category: text("category"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Competence = typeof competences.$inferSelect;
export type NewCompetence = typeof competences.$inferInsert;

export const experiences = pgTable("experiences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  title: text("title").notNull(),
  location: text("location"),
  remoteType: remoteTypeEnum("remote_type"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  manager: text("manager"),
  missions: text("missions"),
  positives: text("positives"),
  negatives: text("negatives"),
  departureReason: text("departure_reason"),
  learnings: text("learnings"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Experience = typeof experiences.$inferSelect;
export type NewExperience = typeof experiences.$inferInsert;

export const experienceCompetences = pgTable(
  "experience_competences",
  {
    experienceId: uuid("experience_id")
      .notNull()
      .references(() => experiences.id, { onDelete: "cascade" }),
    competenceId: uuid("competence_id")
      .notNull()
      .references(() => competences.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.experienceId, table.competenceId] })],
);

// Tous les montants sont annuels et en euros entiers (pas de centimes) :
// suffisant pour des ordres de grandeur de salaire, évite les soucis
// d'arrondi flottant en JS.
export const salaryPackages = pgTable("salary_packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  experienceId: uuid("experience_id")
    .notNull()
    .unique()
    .references(() => experiences.id, { onDelete: "cascade" }),
  baseSalary: integer("base_salary").notNull(),
  bonus: integer("bonus").notNull().default(0),
  profitSharing: integer("profit_sharing").notNull().default(0),
  profitIncentive: integer("profit_incentive").notNull().default(0),
  mealVouchersAnnual: integer("meal_vouchers_annual").notNull().default(0),
  healthInsuranceAnnual: integer("health_insurance_annual").notNull().default(0),
  transportAnnual: integer("transport_annual").notNull().default(0),
  benefitsInKindAnnual: integer("benefits_in_kind_annual").notNull().default(0),
  rttDays: integer("rtt_days").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SalaryPackage = typeof salaryPackages.$inferSelect;
export type NewSalaryPackage = typeof salaryPackages.$inferInsert;

export const experiencesRelations = relations(experiences, ({ many, one }) => ({
  experienceCompetences: many(experienceCompetences),
  salaryPackage: one(salaryPackages, {
    fields: [experiences.id],
    references: [salaryPackages.experienceId],
  }),
}));

export const competencesRelations = relations(competences, ({ many }) => ({
  experienceCompetences: many(experienceCompetences),
}));

export const experienceCompetencesRelations = relations(experienceCompetences, ({ one }) => ({
  experience: one(experiences, {
    fields: [experienceCompetences.experienceId],
    references: [experiences.id],
  }),
  competence: one(competences, {
    fields: [experienceCompetences.competenceId],
    references: [competences.id],
  }),
}));

export const salaryPackagesRelations = relations(salaryPackages, ({ one }) => ({
  experience: one(experiences, {
    fields: [salaryPackages.experienceId],
    references: [experiences.id],
  }),
}));
