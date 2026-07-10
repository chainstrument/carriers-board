import { relations } from "drizzle-orm";
import { boolean, date, integer, pgEnum, pgTable, primaryKey, real, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const themeEnum = pgEnum("theme", ["light", "dark", "dev"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  image: text("image"),
  theme: themeEnum("theme").notNull().default("light"),
  // Coefficient approximatif net/brut pour l'estimation du net (Epic 4) —
  // pas un vrai moteur de paie, juste un ordre de grandeur ajustable par
  // l'utilisateur dans les paramètres.
  netEstimateRatio: real("net_estimate_ratio").notNull().default(0.78),
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
  // Niveau et confiance sur une échelle 1-5 (débutant à expert), plutôt
  // que 1-10 comme la satisfaction (Epic 8) : c'est l'usage courant pour
  // une auto-évaluation de compétence, plus intuitif que 10 crans.
  level: integer("level"),
  confidence: integer("confidence"),
  yearsOfExperience: integer("years_of_experience"),
  wantsToImprove: boolean("wants_to_improve").notNull().default(false),
  // Fallback manuel utilisé uniquement quand la compétence n'est reliée à
  // aucune expérience : sinon la "dernière utilisation" est dérivée des
  // expériences liées (voir src/lib/competences.ts).
  manualLastUsedAt: date("manual_last_used_at"),
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

export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  entryDate: date("entry_date").notNull(),
  content: text("content").notNull(),
  // Échelle 1-5 (très mauvaise à très bonne humeur), cohérent avec les
  // autres échelles courtes de l'app (compétences). Nullable : noter son
  // humeur reste optionnel, l'essentiel est d'écrire la note.
  mood: integer("mood"),
  // "set null" plutôt que "cascade" : supprimer une expérience ne doit pas
  // effacer les notes de journal qui y faisaient référence, juste délier.
  experienceId: uuid("experience_id").references(() => experiences.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;

// Tags libres du journal, distincts du catalogue de compétences : autre
// domaine (ressenti/contexte plutôt que techno), pas de raison de les
// mélanger dans un même référentiel.
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export const journalEntryTags = pgTable(
  "journal_entry_tags",
  {
    journalEntryId: uuid("journal_entry_id")
      .notNull()
      .references(() => journalEntries.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.journalEntryId, table.tagId] })],
);

export const journalEntriesRelations = relations(journalEntries, ({ many, one }) => ({
  journalEntryTags: many(journalEntryTags),
  experience: one(experiences, {
    fields: [journalEntries.experienceId],
    references: [experiences.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  journalEntryTags: many(journalEntryTags),
}));

export const journalEntryTagsRelations = relations(journalEntryTags, ({ one }) => ({
  journalEntry: one(journalEntries, {
    fields: [journalEntryTags.journalEntryId],
    references: [journalEntries.id],
  }),
  tag: one(tags, {
    fields: [journalEntryTags.tagId],
    references: [tags.id],
  }),
}));

// Une ligne par mois et par utilisateur (contrainte unique userId+month),
// chaque critère noté 1-10 : plus de granularité que l'échelle 1-5 des
// compétences, cohérent avec un usage type "auto-évaluation mensuelle".
export const satisfactionEntries = pgTable(
  "satisfaction_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    month: date("month").notNull(),
    stress: integer("stress").notNull(),
    salary: integer("salary").notNull(),
    team: integer("team").notNull(),
    management: integer("management").notNull(),
    remoteWork: integer("remote_work").notNull(),
    workplace: integer("workplace").notNull(),
    workLifeBalance: integer("work_life_balance").notNull(),
    technicalInterest: integer("technical_interest").notNull(),
    autonomy: integer("autonomy").notNull(),
    companyVision: integer("company_vision").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.userId, table.month)],
);

export type SatisfactionEntry = typeof satisfactionEntries.$inferSelect;
export type NewSatisfactionEntry = typeof satisfactionEntries.$inferInsert;

export const goalPriorityEnum = pgEnum("goal_priority", ["low", "medium", "high"]);
export const goalStatusEnum = pgEnum("goal_status", ["todo", "in_progress", "done", "abandoned"]);

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  deadline: date("deadline"),
  priority: goalPriorityEnum("priority").notNull().default("medium"),
  status: goalStatusEnum("status").notNull().default("todo"),
  progress: integer("progress").notNull().default(0),
  // Lien faible optionnel quand l'objectif est un objectif d'apprentissage
  // (ex. "Apprendre Docker") — pas de cascade forte, juste un rattachement.
  competenceId: uuid("competence_id").references(() => competences.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;

export const goalsRelations = relations(goals, ({ one }) => ({
  competence: one(competences, {
    fields: [goals.competenceId],
    references: [competences.id],
  }),
}));

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  client: text("client"),
  duration: text("duration"),
  // 1-5, même échelle que le niveau/la confiance des compétences.
  difficulty: integer("difficulty"),
  impact: text("impact"),
  // Nullable : un projet réalisé dans le cadre d'un poste (fields), ou un
  // side project autonome (null) — un seul modèle plutôt que deux.
  experienceId: uuid("experience_id").references(() => experiences.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const projectCompetences = pgTable(
  "project_competences",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    competenceId: uuid("competence_id")
      .notNull()
      .references(() => competences.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.competenceId] })],
);

// Pas de vrai stockage de fichiers pour l'instant (réservé à l'epic
// Documents) : un lien (label + URL) vers un screenshot ou une doc
// hébergée ailleurs. Suffisant en v1, upgradable plus tard sans casser
// ce modèle (un upload pourrait remplir `url` avec un lien Vercel Blob).
export const projectAttachments = pgTable("project_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProjectAttachment = typeof projectAttachments.$inferSelect;
export type NewProjectAttachment = typeof projectAttachments.$inferInsert;

export const projectsRelations = relations(projects, ({ many, one }) => ({
  projectCompetences: many(projectCompetences),
  attachments: many(projectAttachments),
  experience: one(experiences, {
    fields: [projects.experienceId],
    references: [experiences.id],
  }),
}));

export const projectCompetencesRelations = relations(projectCompetences, ({ one }) => ({
  project: one(projects, {
    fields: [projectCompetences.projectId],
    references: [projects.id],
  }),
  competence: one(competences, {
    fields: [projectCompetences.competenceId],
    references: [competences.id],
  }),
}));

export const projectAttachmentsRelations = relations(projectAttachments, ({ one }) => ({
  project: one(projects, {
    fields: [projectAttachments.projectId],
    references: [projects.id],
  }),
}));

export const trainingTypeEnum = pgEnum("training_type", ["book", "course", "video", "article", "watch"]);
export const trainingStatusEnum = pgEnum("training_status", ["todo", "in_progress", "done"]);

export const trainingItems = pgTable("training_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: trainingTypeEnum("type").notNull(),
  title: text("title").notNull(),
  source: text("source"),
  status: trainingStatusEnum("status").notNull().default("todo"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TrainingItem = typeof trainingItems.$inferSelect;
export type NewTrainingItem = typeof trainingItems.$inferInsert;
