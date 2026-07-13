import type { CvData, CvExperienceData, CvFormationData } from "@/lib/cv-docx";
import { formatDateRange } from "../../experiences/date-range";

function remoteLabel(days: number | null): string | null {
  if (days === null) return null;
  return days === 0 ? "présentiel" : `${days} j télétravail/sem.`;
}

function formationYearLabel(f: CvFormationData): string {
  return f.endYear && f.endYear !== f.startYear ? `${f.startYear}-${f.endYear}` : String(f.startYear);
}

function ExperienceBlock({ exp }: { exp: CvExperienceData }) {
  return (
    <div>
      <p className="font-medium text-neutral-900 dark:text-neutral-100">
        {exp.title} — {exp.company}
      </p>
      <p className="text-xs text-neutral-500">
        {[formatDateRange(exp.startDate, exp.endDate), exp.location, remoteLabel(exp.remoteDaysPerWeek)]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {exp.missions && (
        <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
          {exp.missions}
        </p>
      )}
      {exp.technologies.length > 0 && (
        <p className="mt-1 text-xs text-neutral-500">Technologies : {exp.technologies.join(", ")}</p>
      )}
    </div>
  );
}

function FormationBlock({ f, compact }: { f: CvFormationData; compact?: boolean }) {
  return (
    <div className="text-sm">
      <p className="font-medium text-neutral-900 dark:text-neutral-100">{f.title}</p>
      {f.institution && !compact && <span className="text-neutral-500"> — {f.institution}</span>}
      {f.institution && compact && <p className="text-xs text-neutral-500">{f.institution}</p>}
      <p className="text-xs text-neutral-500">{formationYearLabel(f)}</p>
    </div>
  );
}

function Header({ data }: { data: CvData }) {
  const contactParts = [data.email, data.phone, data.address, data.linkedinUrl, data.websiteUrl].filter(
    Boolean,
  );
  return (
    <div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{data.userName}</h3>
      <p className="text-sm italic text-neutral-600 dark:text-neutral-400">{data.title}</p>
      <p className="mt-1 text-xs text-neutral-500">{contactParts.join(" · ")}</p>
    </div>
  );
}

function ClassicPreview({ data }: { data: CvData }) {
  return (
    <div className="space-y-6">
      <Header data={data} />

      {data.summary && (
        <p className="text-sm text-neutral-800 dark:text-neutral-200">{data.summary}</p>
      )}

      {data.competences.length > 0 && (
        <div>
          <h4 className="mb-1 text-sm font-medium text-neutral-500">Compétences</h4>
          <p className="text-sm text-neutral-800 dark:text-neutral-200">
            {data.competences.join(", ")}
          </p>
        </div>
      )}

      {data.experiences.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-neutral-500">Expériences professionnelles</h4>
          <div className="space-y-4">
            {data.experiences.map((exp, i) => (
              <ExperienceBlock key={i} exp={exp} />
            ))}
          </div>
        </div>
      )}

      {data.formations.length > 0 && (
        <div>
          <h4 className="mb-1 text-sm font-medium text-neutral-500">Formation</h4>
          <div className="space-y-2">
            {data.formations.map((f, i) => (
              <FormationBlock key={i} f={f} />
            ))}
          </div>
        </div>
      )}

      {data.languages && (
        <div>
          <h4 className="mb-1 text-sm font-medium text-neutral-500">Langues</h4>
          <p className="text-sm text-neutral-800 dark:text-neutral-200">{data.languages}</p>
        </div>
      )}
    </div>
  );
}

function TwoColumnPreview({ data }: { data: CvData }) {
  const contactParts = [data.email, data.phone, data.address, data.linkedinUrl, data.websiteUrl].filter(
    (v): v is string => Boolean(v),
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">{data.userName}</h3>
        <p className="text-sm italic text-blue-800 dark:text-blue-400">{data.title}</p>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="space-y-4 rounded-md bg-blue-50 p-4 text-sm sm:w-[32%] sm:shrink-0 dark:bg-blue-950/30">
          {contactParts.length > 0 && (
            <div className="space-y-0.5 text-xs text-neutral-600 dark:text-neutral-400">
              {contactParts.map((part) => (
                <p key={part}>{part}</p>
              ))}
            </div>
          )}

          {data.competences.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Compétences
              </h4>
              <ul className="space-y-0.5 text-sm text-neutral-800 dark:text-neutral-200">
                {data.competences.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {data.languages && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Langues
              </h4>
              <p className="text-sm text-neutral-800 dark:text-neutral-200">{data.languages}</p>
            </div>
          )}

          {data.formations.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Formation
              </h4>
              <div className="space-y-2">
                {data.formations.map((f, i) => (
                  <FormationBlock key={i} f={f} compact />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          {data.summary && (
            <p className="text-sm text-neutral-800 dark:text-neutral-200">{data.summary}</p>
          )}

          {data.experiences.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-neutral-500">
                Expériences professionnelles
              </h4>
              <div className="space-y-4">
                {data.experiences.map((exp, i) => (
                  <ExperienceBlock key={i} exp={exp} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CvPreview({ data }: { data: CvData }) {
  return data.template === "deux_colonnes" ? <TwoColumnPreview data={data} /> : <ClassicPreview data={data} />;
}
