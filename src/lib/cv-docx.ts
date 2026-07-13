import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";

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

export async function generateCvDocx(data: CvData): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: data.userName, bold: true })],
    }),
    new Paragraph({
      children: [new TextRun({ text: data.title, italics: true, size: 26 })],
    }),
  );

  const contactParts = [
    data.email,
    data.phone,
    data.address,
    data.linkedinUrl,
    data.websiteUrl,
  ].filter((v): v is string => Boolean(v));
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: contactParts.join(" · "), size: 20, color: "555555" })],
      }),
    );
  }

  if (data.summary) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: data.summary })],
      }),
    );
  }

  if (data.competences.length > 0) {
    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, text: "Compétences" }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: data.competences.join(", ") })],
      }),
    );
  }

  if (data.experiences.length > 0) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: "Expériences professionnelles" }));
    for (const exp of data.experiences) {
      children.push(
        new Paragraph({
          spacing: { before: 200 },
          children: [new TextRun({ text: `${exp.title} — ${exp.company}`, bold: true })],
        }),
        new Paragraph({
          children: [new TextRun({ text: experienceMetaLine(exp), italics: true, size: 20, color: "555555" })],
        }),
      );
      if (exp.missions) {
        for (const line of exp.missions.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (trimmed) children.push(new Paragraph({ text: trimmed, bullet: { level: 0 } }));
        }
      }
      if (exp.technologies.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Technologies : ", bold: true, size: 20 }),
              new TextRun({ text: exp.technologies.join(", "), size: 20 }),
            ],
          }),
        );
      }
    }
  }

  if (data.formations.length > 0) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: "Formation", spacing: { before: 200 } }));
    for (const f of data.formations) {
      const label = f.institution ? `${f.title} — ${f.institution}` : f.title;
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: label, bold: true }),
            new TextRun({ text: `  (${formationYearLabel(f)})`, size: 20, color: "555555" }),
          ],
        }),
      );
    }
  }

  if (data.languages) {
    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, text: "Langues", spacing: { before: 200 } }),
      new Paragraph({ text: data.languages }),
    );
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
  });

  return Packer.toBuffer(doc);
}
