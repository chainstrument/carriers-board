import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

export type CvTemplate = "classique" | "deux_colonnes";

export type CvExperienceData = {
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  remoteDaysPerWeek: number | null;
  missions: string | null;
  technologies: string[];
};

export type CvFormationData = {
  title: string;
  institution: string | null;
  startYear: number;
  endYear: number | null;
};

export type CvData = {
  template: CvTemplate;
  title: string;
  userName: string;
  email: string;
  phone: string | null;
  address: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  summary: string | null;
  languages: string | null;
  competences: string[];
  experiences: CvExperienceData[];
  formations: CvFormationData[];
};

const ACCENT_COLOR = "1F4E79";
const MUTED_COLOR = "595959";
const SIDEBAR_FILL = "EAF1FB";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" });

function formatDateRange(startDate: string, endDate: string | null): string {
  const start = dateFormatter.format(new Date(startDate));
  const end = endDate ? dateFormatter.format(new Date(endDate)) : "présent";
  return `${start} — ${end}`;
}

function remoteLabel(days: number | null): string | null {
  if (days === null) return null;
  return days === 0 ? "présentiel" : `${days} j télétravail/sem.`;
}

function experienceMetaLine(exp: CvExperienceData): string {
  const parts = [formatDateRange(exp.startDate, exp.endDate)];
  if (exp.location) parts.push(exp.location);
  const remote = remoteLabel(exp.remoteDaysPerWeek);
  if (remote) parts.push(remote);
  return parts.join(" · ");
}

function formationYearLabel(f: CvFormationData): string {
  return f.endYear && f.endYear !== f.startYear ? `${f.startYear}-${f.endYear}` : String(f.startYear);
}

// En-tête de section colorée avec un filet en dessous — répété sur les
// deux templates pour une identité visuelle cohérente (sidebar plus
// compacte : filet plus fin, moins d'espace avant/après).
function sectionHeading(
  text: string,
  {
    level = HeadingLevel.HEADING_2,
    compact = false,
  }: { level?: (typeof HeadingLevel)[keyof typeof HeadingLevel]; compact?: boolean } = {},
): Paragraph {
  return new Paragraph({
    heading: level,
    spacing: { before: compact ? 220 : 320, after: compact ? 80 : 140 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: compact ? 4 : 6, color: ACCENT_COLOR, space: 4 },
    },
    children: [new TextRun({ text, bold: true, color: ACCENT_COLOR })],
  });
}

function experienceParagraphs(exp: CvExperienceData): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      spacing: { before: 220 },
      children: [new TextRun({ text: `${exp.title} — ${exp.company}`, bold: true })],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: experienceMetaLine(exp), italics: true, size: 20, color: ACCENT_COLOR }),
      ],
    }),
  ];
  if (exp.missions) {
    for (const line of exp.missions.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed) paragraphs.push(new Paragraph({ text: trimmed, bullet: { level: 0 } }));
    }
  }
  if (exp.technologies.length > 0) {
    paragraphs.push(
      new Paragraph({
        spacing: { before: 80 },
        children: [
          new TextRun({ text: "Technologies : ", bold: true, size: 20, color: MUTED_COLOR }),
          new TextRun({ text: exp.technologies.join(", "), size: 20, color: MUTED_COLOR }),
        ],
      }),
    );
  }
  return paragraphs;
}

function headerParagraphs(data: CvData): Paragraph[] {
  const contactParts = [
    data.email,
    data.phone,
    data.address,
    data.linkedinUrl,
    data.websiteUrl,
  ].filter((v): v is string => Boolean(v));

  const children = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 40 },
      children: [new TextRun({ text: data.userName, bold: true, color: ACCENT_COLOR, size: 36 })],
    }),
    new Paragraph({
      spacing: { after: contactParts.length > 0 ? 160 : 280 },
      children: [new TextRun({ text: data.title, italics: true, size: 26, color: MUTED_COLOR })],
    }),
  ];

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        spacing: { after: 280 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT_COLOR, space: 6 } },
        children: [new TextRun({ text: contactParts.join("  ·  "), size: 20, color: MUTED_COLOR })],
      }),
    );
  }

  return children;
}

function buildClassicDocument(data: CvData): Document {
  const children: Paragraph[] = [...headerParagraphs(data)];

  if (data.summary) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: data.summary, italics: true })],
      }),
    );
  }

  if (data.competences.length > 0) {
    children.push(
      sectionHeading("Compétences"),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: data.competences.join("  •  ") })],
      }),
    );
  }

  if (data.experiences.length > 0) {
    children.push(sectionHeading("Expériences professionnelles"));
    for (const exp of data.experiences) children.push(...experienceParagraphs(exp));
  }

  if (data.formations.length > 0) {
    children.push(sectionHeading("Formation"));
    for (const f of data.formations) {
      const label = f.institution ? `${f.title} — ${f.institution}` : f.title;
      children.push(
        new Paragraph({
          spacing: { before: 80 },
          children: [
            new TextRun({ text: label, bold: true }),
            new TextRun({ text: `  (${formationYearLabel(f)})`, size: 20, color: MUTED_COLOR }),
          ],
        }),
      );
    }
  }

  if (data.languages) {
    children.push(sectionHeading("Langues"), new Paragraph({ text: data.languages }));
  }

  return new Document({
    sections: [{ properties: {}, children }],
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
    },
  });
}

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = {
  top: NO_BORDER,
  bottom: NO_BORDER,
  left: NO_BORDER,
  right: NO_BORDER,
  insideHorizontal: NO_BORDER,
  insideVertical: NO_BORDER,
};

function buildTwoColumnDocument(data: CvData): Document {
  const headerChildren = headerParagraphs(data);

  const sidebarChildren: Paragraph[] = [];
  const contactParts = [
    data.email,
    data.phone,
    data.address,
    data.linkedinUrl,
    data.websiteUrl,
  ].filter((v): v is string => Boolean(v));
  for (const part of contactParts) {
    sidebarChildren.push(new Paragraph({ text: part, spacing: { after: 80 }, run: { size: 20 } }));
  }

  if (data.competences.length > 0) {
    sidebarChildren.push(sectionHeading("Compétences", { level: HeadingLevel.HEADING_3, compact: true }));
    for (const c of data.competences) {
      sidebarChildren.push(new Paragraph({ text: c, bullet: { level: 0 } }));
    }
  }

  if (data.languages) {
    sidebarChildren.push(
      sectionHeading("Langues", { level: HeadingLevel.HEADING_3, compact: true }),
      new Paragraph({ text: data.languages }),
    );
  }

  if (data.formations.length > 0) {
    sidebarChildren.push(sectionHeading("Formation", { level: HeadingLevel.HEADING_3, compact: true }));
    for (const f of data.formations) {
      sidebarChildren.push(
        new Paragraph({
          children: [new TextRun({ text: f.title, bold: true, size: 20 })],
        }),
      );
      if (f.institution) {
        sidebarChildren.push(new Paragraph({ text: f.institution, run: { size: 18, color: MUTED_COLOR } }));
      }
      sidebarChildren.push(
        new Paragraph({
          spacing: { after: 160 },
          children: [new TextRun({ text: formationYearLabel(f), size: 18, color: MUTED_COLOR })],
        }),
      );
    }
  }

  const mainChildren: Paragraph[] = [];
  if (data.summary) {
    mainChildren.push(
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: data.summary, italics: true })] }),
    );
  }
  if (data.experiences.length > 0) {
    mainChildren.push(sectionHeading("Expériences professionnelles"));
    for (const exp of data.experiences) mainChildren.push(...experienceParagraphs(exp));
  }

  // "autofit" (le défaut) laisse Word recalculer la largeur des colonnes à
  // partir du contenu, ce qui peut écraser la mise en page deux-colonnes —
  // "fixed" + des largeurs explicites (en dxa) force le rendu voulu.
  const SIDEBAR_WIDTH_DXA = 2992;
  const MAIN_WIDTH_DXA = 6358;

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [SIDEBAR_WIDTH_DXA, MAIN_WIDTH_DXA],
    layout: TableLayoutType.FIXED,
    borders: NO_BORDERS,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: SIDEBAR_WIDTH_DXA, type: WidthType.DXA },
            shading: { fill: SIDEBAR_FILL },
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
            children: sidebarChildren.length > 0 ? sidebarChildren : [new Paragraph({ text: "" })],
          }),
          new TableCell({
            width: { size: MAIN_WIDTH_DXA, type: WidthType.DXA },
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
            children: mainChildren.length > 0 ? mainChildren : [new Paragraph({ text: "" })],
          }),
        ],
      }),
    ],
  });

  return new Document({
    sections: [{ properties: {}, children: [...headerChildren, table] }],
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
    },
  });
}

export async function generateCvDocx(data: CvData): Promise<Buffer> {
  const doc = data.template === "deux_colonnes" ? buildTwoColumnDocument(data) : buildClassicDocument(data);
  return Packer.toBuffer(doc);
}
