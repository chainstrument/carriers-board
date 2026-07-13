import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { academicFormations, competences, cvs, experiences, users } from "@/lib/db/schema";
import type { CvData } from "@/lib/cv-docx";
import { formatDateRange } from "@/app/(app)/experiences/date-range";

export type CvOption = { id: string; label: string; sublabel?: string };

export async function listCvs(userId: string) {
  return db.query.cvs.findMany({
    where: eq(cvs.userId, userId),
    orderBy: [desc(cvs.updatedAt)],
  });
}

export async function listCvOptions(userId: string) {
  const [exps, comps, formations] = await Promise.all([
    db.query.experiences.findMany({
      where: eq(experiences.userId, userId),
      orderBy: [desc(experiences.startDate)],
    }),
    db.query.competences.findMany({ orderBy: [asc(competences.name)] }),
    db.query.academicFormations.findMany({
      where: eq(academicFormations.userId, userId),
      orderBy: [desc(academicFormations.startYear)],
    }),
  ]);

  const experienceOptions: CvOption[] = exps.map((e) => ({
    id: e.id,
    label: `${e.title} — ${e.company}`,
    sublabel: formatDateRange(e.startDate, e.endDate),
  }));
  const competenceOptions: CvOption[] = comps.map((c) => ({ id: c.id, label: c.name }));
  const formationOptions: CvOption[] = formations.map((f) => ({
    id: f.id,
    label: f.title,
    sublabel: f.institution ?? undefined,
  }));

  return { experienceOptions, competenceOptions, formationOptions };
}

export async function getCvWithSelections(userId: string, cvId: string) {
  const cv = await db.query.cvs.findFirst({
    where: and(eq(cvs.id, cvId), eq(cvs.userId, userId)),
    with: {
      cvExperiences: true,
      cvCompetences: true,
      cvAcademicFormations: true,
    },
  });
  if (!cv) return null;

  return {
    ...cv,
    experienceIds: cv.cvExperiences.map((e) => e.experienceId),
    competenceIds: cv.cvCompetences.map((c) => c.competenceId),
    academicFormationIds: cv.cvAcademicFormations.map((f) => f.academicFormationId),
  };
}

export async function buildCvData(userId: string, cvId: string): Promise<CvData | null> {
  const cv = await db.query.cvs.findFirst({
    where: and(eq(cvs.id, cvId), eq(cvs.userId, userId)),
    with: {
      cvExperiences: {
        with: { experience: { with: { experienceCompetences: { with: { competence: true } } } } },
      },
      cvCompetences: { with: { competence: true } },
      cvAcademicFormations: { with: { academicFormation: true } },
    },
  });
  if (!cv) return null;

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return null;

  const experiencesData = cv.cvExperiences
    .map((ce) => ce.experience)
    .sort((a, b) => (a.startDate < b.startDate ? 1 : -1))
    .map((exp) => ({
      title: exp.title,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate,
      location: exp.location,
      remoteDaysPerWeek: exp.remoteDaysPerWeek,
      missions: exp.missions,
      technologies: exp.experienceCompetences.map((ec) => ec.competence.name),
    }));

  const formationsData = cv.cvAcademicFormations
    .map((cf) => cf.academicFormation)
    .sort((a, b) => b.startYear - a.startYear)
    .map((f) => ({
      title: f.title,
      institution: f.institution,
      startYear: f.startYear,
      endYear: f.endYear,
    }));

  return {
    title: cv.title,
    userName: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    linkedinUrl: user.linkedinUrl,
    websiteUrl: user.websiteUrl,
    summary: cv.summary,
    languages: cv.languages,
    competences: cv.cvCompetences.map((cc) => cc.competence.name),
    experiences: experiencesData,
    formations: formationsData,
  };
}

export function cvDownloadFilename(cvName: string): string {
  const slug = cvName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${slug || "cv"}.docx`;
}
