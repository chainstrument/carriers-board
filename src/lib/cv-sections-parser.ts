// Parsing par règles d'un CV structuré en sections nommées (FORMATIONS,
// COMPÉTENCES INFORMATIQUES, EXPÉRIENCES PROFESSIONNELLES...), typique des
// CV Word. Contrairement à cv-parser.ts (texte libre), ici les champs sont
// explicitement labellisés donc on peut les attribuer avec confiance
// (société, poste...) sans avoir à deviner.

function normalizeLine(line: string): string {
  return line
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .toUpperCase()
    .trim();
}

const SECTION_HEADERS = {
  formations: "FORMATIONS",
  competencesInformatiques: "COMPETENCES INFORMATIQUES",
  langues: "LANGUES",
  experiencesProfessionnelles: "EXPERIENCES PROFESSIONNELLES",
} as const;

type SectionKey = keyof typeof SECTION_HEADERS;

export function splitSections(text: string): Partial<Record<SectionKey, string>> {
  const lines = text.split(/\r?\n/);
  const boundaries: { key: SectionKey; lineIndex: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const normalized = normalizeLine(lines[i]);
    const entry = (Object.entries(SECTION_HEADERS) as [SectionKey, string][]).find(
      ([, header]) => header === normalized,
    );
    if (entry) boundaries.push({ key: entry[0], lineIndex: i });
  }

  const sections: Partial<Record<SectionKey, string>> = {};
  for (let i = 0; i < boundaries.length; i++) {
    const { key, lineIndex } = boundaries[i];
    const endLine = i + 1 < boundaries.length ? boundaries[i + 1].lineIndex : lines.length;
    sections[key] = lines.slice(lineIndex + 1, endLine).join("\n").trim();
  }

  return sections;
}

// "PHP5/7/8" -> "PHP", "Symfony 4/5" -> "Symfony", "NodeJS(notions)" -> "NodeJS"
export function normalizeSkillToken(raw: string): string {
  let token = raw.trim().replace(/\.$/, "");
  token = token.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const versionStripped = token.match(/^([A-Za-zÀ-ÿ+#.\s]+?)\s*\d[\d/.\s]*$/);
  if (versionStripped) token = versionStripped[1].trim();
  return token;
}

export type FormationEntry = {
  raw: string;
  startYear: number;
  endYear: number | null;
  title: string;
};

const FORMATION_LINE_REGEX = /^(\d{4})(?:\s*[-–]\s*(\d{4}))?\s*:\s*(.+)$/;

export function parseFormations(sectionText: string): FormationEntry[] {
  const results: FormationEntry[] = [];
  for (const line of sectionText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(FORMATION_LINE_REGEX);
    if (!match) continue;
    results.push({
      raw: trimmed,
      startYear: Number(match[1]),
      endYear: match[2] ? Number(match[2]) : null,
      title: match[3].trim(),
    });
  }
  return results.sort((a, b) => b.startYear - a.startYear);
}

export type SkillCategory = { typology: string; skills: string[] };

export function parseCompetencesInformatiques(sectionText: string): SkillCategory[] {
  const results: SkillCategory[] = [];
  for (const line of sectionText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;
    const typology = trimmed.slice(0, colonIndex).trim();
    const skills = trimmed
      .slice(colonIndex + 1)
      .split(",")
      .map(normalizeSkillToken)
      .filter(Boolean);
    if (skills.length > 0) results.push({ typology, skills });
  }
  return results;
}

export function flattenSkillCategories(categories: SkillCategory[]): string[] {
  const seen = new Map<string, string>();
  for (const category of categories) {
    for (const skill of category.skills) {
      const key = skill.toLowerCase();
      if (!seen.has(key)) seen.set(key, skill);
    }
  }
  return [...seen.values()];
}

const MONTHS: Record<string, number> = {
  janvier: 1,
  janv: 1,
  jan: 1,
  fevrier: 2,
  fev: 2,
  fevr: 2,
  mars: 3,
  avril: 4,
  avr: 4,
  mai: 5,
  juin: 6,
  juillet: 7,
  juil: 7,
  aout: 8,
  septembre: 9,
  sept: 9,
  sep: 9,
  octobre: 10,
  oct: 10,
  novembre: 11,
  nov: 11,
  decembre: 12,
  dec: 12,
};

const CURRENT_MARKERS_NORMALIZED = [
  "present",
  "aujourdhui",
  "now",
  "actuel",
  "actuelle",
  "en cours",
];

function normalizeWord(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .toLowerCase()
    .trim();
}

function parseMonthYear(part: string): { year: number; month: number } | null {
  const match = part.trim().match(/^([A-Za-zÀ-ÿ]+)\.?\s+(\d{4})$/);
  if (!match) return null;
  const month = MONTHS[normalizeWord(match[1])];
  if (!month) return null;
  return { year: Number(match[2]), month };
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export type ParsedPeriode = {
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
};

// "De janv. 2010 à juin 2011", "Octobre 2022 à aujourd'hui (1 an)"...
export function parsePeriode(raw: string): ParsedPeriode | null {
  if (!raw) return null;

  let cleaned = raw.trim().replace(/^D['’]\s*/i, "").replace(/^De\s+/i, "");
  cleaned = cleaned.replace(/\([^)]*\)\s*$/, "").trim();

  const parts = cleaned.split(/\s+à\s+/i);
  if (parts.length !== 2) return null;

  const [leftRaw, rightRaw] = parts;
  const left = parseMonthYear(leftRaw);
  if (!left) return null;
  const startDate = `${left.year}-${pad2(left.month)}-01`;

  const rightNormalized = normalizeWord(rightRaw);
  const isCurrent = CURRENT_MARKERS_NORMALIZED.some((m) => rightNormalized.includes(m));
  if (isCurrent) return { startDate, endDate: null, isCurrent: true };

  const right = parseMonthYear(rightRaw);
  if (!right) return { startDate, endDate: null, isCurrent: false };
  const endDate = `${right.year}-${pad2(right.month)}-${pad2(lastDayOfMonth(right.year, right.month))}`;
  return { startDate, endDate, isCurrent: false };
}

export type StructuredExperience = {
  rawPeriod: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  company: string | null;
  title: string | null;
  missions: string | null;
  technologies: string[];
};

const FIELD_LABELS: Record<string, "periode" | "fonction" | "societe" | "missions" | "technologies"> = {
  PERIODE: "periode",
  FONCTION: "fonction",
  SOCIETE: "societe",
  MISSIONS: "missions",
  TECHNOLOGIES: "technologies",
};

function matchLabel(line: string): { field: string; value: string } | null {
  const match = line.match(/^([A-Za-zÀ-ÿ ]+?)\s*:\s*(.*)$/);
  if (!match) return null;
  const field = FIELD_LABELS[normalizeLine(match[1])];
  if (!field) return null;
  return { field, value: match[2].trim() };
}

export function parseExperiencesProfessionnelles(sectionText: string): StructuredExperience[] {
  const blocks = sectionText
    .split(/^_{3,}\s*$/m)
    .map((b) => b.trim())
    .filter(Boolean);

  const results: StructuredExperience[] = [];

  for (const block of blocks) {
    let periode = "";
    let fonction = "";
    let societe = "";
    let technologies: string[] = [];
    const missionLines: string[] = [];
    let collectingMissions = false;

    for (const rawLine of block.split(/\r?\n/)) {
      const line = rawLine.trim();
      const labelMatch = matchLabel(line);
      if (labelMatch) {
        collectingMissions = labelMatch.field === "missions";
        if (labelMatch.field === "periode") periode = labelMatch.value;
        else if (labelMatch.field === "fonction") fonction = labelMatch.value;
        else if (labelMatch.field === "societe") societe = labelMatch.value;
        else if (labelMatch.field === "technologies")
          technologies = labelMatch.value
            .split(",")
            .map(normalizeSkillToken)
            .filter(Boolean);
        else if (labelMatch.field === "missions" && labelMatch.value)
          missionLines.push(labelMatch.value);
        continue;
      }
      if (collectingMissions && line) missionLines.push(line);
    }

    if (!periode && !fonction && !societe && missionLines.length === 0) continue;

    const parsed = parsePeriode(periode);

    results.push({
      rawPeriod: periode || null,
      startDate: parsed?.startDate ?? null,
      endDate: parsed?.endDate ?? null,
      isCurrent: parsed?.isCurrent ?? false,
      company: societe || null,
      title: fonction || null,
      missions: missionLines.length > 0 ? missionLines.join("\n") : null,
      technologies,
    });
  }

  return results;
}
