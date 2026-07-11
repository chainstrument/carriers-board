"use server";

import { revalidatePath } from "next/cache";
import { getDocumentProxy, extractText } from "unpdf";
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

export type ParseCvState =
  | {
      error?: string;
      email?: string | null;
      phone?: string | null;
      dateRanges?: DetectedDateRange[];
      skills?: string[];
    }
  | undefined;

export async function parseCv(
  _prevState: ParseCvState,
  formData: FormData,
): Promise<ParseCvState> {
  await requireUserId();

  const file = formData.get("cv");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Sélectionne un fichier PDF." };
  }
  if (file.type !== "application/pdf") {
    return { error: "Le fichier doit être un PDF." };
  }

  let text: string;
  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const result = await extractText(pdf, { mergePages: true });
    text = result.text;
  } catch {
    return {
      error: "Impossible de lire ce PDF (fichier corrompu ou protégé).",
    };
  }

  if (!text.trim()) {
    return {
      error:
        "Aucun texte trouvé dans ce PDF (peut-être un scan sans texte réel).",
    };
  }

  const existingCompetences = await db.query.competences.findMany({
    columns: { name: true },
  });
  const dictionary = [
    ...new Set([...COMMON_SKILLS, ...existingCompetences.map((c) => c.name)]),
  ];

  return {
    email: extractEmail(text),
    phone: extractPhone(text),
    dateRanges: extractDateRanges(text),
    skills: extractSkills(text, dictionary),
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
