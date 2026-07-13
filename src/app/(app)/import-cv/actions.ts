"use server";

import { revalidatePath } from "next/cache";
import { getDocumentProxy, extractText } from "unpdf";
import mammoth from "mammoth";
import { requireUserId } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { competences } from "@/lib/db/schema";
import {
  extractEmail,
  extractPhone,
  extractDateRanges,
  extractSkills,
  COMMON_SKILLS,
  type DetectedDateRange,
} from "@/lib/cv-parser";
import {
  splitSections,
  parseFormations,
  parseCompetencesInformatiques,
  flattenSkillCategories,
  parseExperiencesProfessionnelles,
  type FormationEntry,
  type StructuredExperience,
} from "@/lib/cv-sections-parser";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type ParseCvState =
  | {
      error?: string;
      email?: string | null;
      phone?: string | null;
      dateRanges?: DetectedDateRange[];
      skills?: string[];
      formations?: FormationEntry[];
      structuredExperiences?: StructuredExperience[];
    }
  | undefined;

export async function parseCv(
  _prevState: ParseCvState,
  formData: FormData,
): Promise<ParseCvState> {
  await requireUserId();

  const file = formData.get("cv");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Sélectionne un fichier PDF ou Word (.docx)." };
  }

  const fileName = file.name.toLowerCase();
  const isPdf = file.type === "application/pdf" || fileName.endsWith(".pdf");
  const isDocx = file.type === DOCX_MIME || fileName.endsWith(".docx");
  if (!isPdf && !isDocx) {
    return { error: "Le fichier doit être un PDF ou un Word (.docx)." };
  }

  let text: string;
  try {
    const arrayBuffer = await file.arrayBuffer();
    if (isDocx) {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
      text = result.value;
    } else {
      const result = await extractText(await getDocumentProxy(new Uint8Array(arrayBuffer)), {
        mergePages: true,
      });
      text = result.text;
    }
  } catch {
    return {
      error: "Impossible de lire ce fichier (corrompu, protégé, ou format non pris en charge).",
    };
  }

  if (!text.trim()) {
    return {
      error:
        "Aucun texte trouvé dans ce fichier (peut-être un scan sans texte réel).",
    };
  }

  const existingCompetences = await db.query.competences.findMany({
    columns: { name: true },
  });
  const dictionary = [
    ...new Set([...COMMON_SKILLS, ...existingCompetences.map((c) => c.name)]),
  ];

  const sections = splitSections(text);
  const formations = sections.formations ? parseFormations(sections.formations) : [];
  const structuredExperiences = sections.experiencesProfessionnelles
    ? parseExperiencesProfessionnelles(sections.experiencesProfessionnelles)
    : [];
  const structuredSkills = sections.competencesInformatiques
    ? flattenSkillCategories(parseCompetencesInformatiques(sections.competencesInformatiques))
    : [];

  const skillsByKey = new Map<string, string>();
  for (const skill of [
    ...structuredSkills,
    ...structuredExperiences.flatMap((e) => e.technologies),
    ...extractSkills(text, dictionary),
  ]) {
    const key = skill.toLowerCase();
    if (!skillsByKey.has(key)) skillsByKey.set(key, skill);
  }

  return {
    email: extractEmail(text),
    phone: extractPhone(text),
    dateRanges: structuredExperiences.length > 0 ? [] : extractDateRanges(text),
    skills: [...skillsByKey.values()],
    formations,
    structuredExperiences,
  };
}

export type AddSkillsState = { success?: string } | undefined;

export async function addSkillsToCatalog(
  _prevState: AddSkillsState,
  formData: FormData,
): Promise<AddSkillsState> {
  await requireUserId();

  const names = formData.getAll("skill").map(String).filter(Boolean);
  if (names.length === 0) return { success: "Aucune compétence sélectionnée." };

  const existing = await db.query.competences.findMany({
    columns: { name: true },
  });
  const existingNames = new Set(existing.map((c) => c.name));
  const toCreate = names.filter((n) => !existingNames.has(n));

  if (toCreate.length > 0) {
    await db.insert(competences).values(toCreate.map((name) => ({ name })));
  }

  revalidatePath("/competences");
  return {
    success: `${toCreate.length} compétence(s) ajoutée(s) au catalogue.`,
  };
}
