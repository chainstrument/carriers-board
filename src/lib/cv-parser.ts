// Parsing 100% par règles (regex/heuristiques), pas d'IA : fiable sur les
// champs à format contraint (email, téléphone, années, mots-clés connus),
// volontairement silencieux sur ce qui demande de la compréhension
// (attribution entreprise/poste) — laissé à la relecture de l'utilisateur.

export type DetectedDateRange = {
  raw: string;
  startYear: number;
  endYear: number | null; // null = poste actuel / présent
  context: string;
};

const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+33[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}/;
const CURRENT_MARKERS = [
  "présent",
  "present",
  "aujourd'hui",
  "aujourdhui",
  "now",
  "actuel",
  "actuelle",
  "en cours",
];

const DATE_RANGE_REGEX = new RegExp(
  `\\b(19|20)\\d{2}\\b\\s*(?:-|–|—|à|to)\\s*(\\b(19|20)\\d{2}\\b|${CURRENT_MARKERS.join("|")})`,
  "gi",
);

export function extractEmail(text: string): string | null {
  const match = text.match(EMAIL_REGEX);
  return match ? match[0] : null;
}

export function extractPhone(text: string): string | null {
  const match = text.match(PHONE_REGEX);
  return match ? match[0].trim() : null;
}

export function extractDateRanges(text: string): DetectedDateRange[] {
  const results: DetectedDateRange[] = [];
  const seen = new Set<string>();

  for (const match of text.matchAll(DATE_RANGE_REGEX)) {
    const raw = match[0];
    if (seen.has(raw)) continue;
    seen.add(raw);

    const years = raw.match(/(19|20)\d{2}/g) ?? [];
    const startYear = Number(years[0]);
    const isCurrent = CURRENT_MARKERS.some((m) =>
      raw.toLowerCase().includes(m),
    );
    const endYear = isCurrent ? null : years[1] ? Number(years[1]) : null;

    const start = Math.max(0, (match.index ?? 0) - 40);
    const end = Math.min(text.length, (match.index ?? 0) + raw.length + 60);
    const context = text.slice(start, end).trim();

    results.push({ raw, startYear, endYear, context });
  }

  return results.sort((a, b) => b.startYear - a.startYear);
}

// Dictionnaire de base pour un premier import quand le catalogue de
// compétences de l'utilisateur est encore vide ; le catalogue existant
// (Epic Compétences) est ajouté par-dessus côté appelant.
export const COMMON_SKILLS = [
  "PHP",
  "Symfony",
  "Laravel",
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "Kotlin",
  "Swift",
  "C#",
  "C++",
  "Ruby",
  "Go",
  "Rust",
  "React",
  "Vue",
  "Vue.js",
  "Angular",
  "Next.js",
  "Nuxt",
  "Node.js",
  "Express",
  "NestJS",
  "HTML",
  "CSS",
  "Sass",
  "Tailwind",
  "Bootstrap",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Terraform",
  "Ansible",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "SQLite",
  "Elasticsearch",
  "Git",
  "GitHub",
  "GitLab",
  "CI/CD",
  "Jenkins",
  "REST",
  "GraphQL",
  "gRPC",
  "Linux",
  "Nginx",
  "Apache",
  "Jira",
  "Scrum",
  "Agile",
  "Kanban",
  "WordPress",
  "Drupal",
  "Magento",
  "Figma",
  "Photoshop",
];

export function extractSkills(text: string, dictionary: string[]): string[] {
  const found: string[] = [];
  for (const skill of dictionary) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(
      `(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`,
      "iu",
    );
    if (pattern.test(text)) found.push(skill);
  }
  return found;
}
