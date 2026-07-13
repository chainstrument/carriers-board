"use client";

import { useActionState } from "react";
import Link from "next/link";
import { parseCv, addSkillsToCatalog } from "./actions";

function yearToDate(year: number, endOfYear: boolean): string {
  return endOfYear ? `${year}-12-31` : `${year}-01-01`;
}

export function ImportForm() {
  const [state, formAction, pending] = useActionState(parseCv, undefined);
  const [skillsState, skillsFormAction, skillsPending] = useActionState(
    addSkillsToCatalog,
    undefined,
  );

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label
            htmlFor="cv"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Fichier PDF ou Word (.docx)
          </label>
          <input
            id="cv"
            name="cv"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white dark:text-neutral-400 dark:file:bg-neutral-100 dark:file:text-neutral-900"
          />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {pending ? "Analyse en cours..." : "Analyser le CV"}
        </button>
        <p className="text-xs text-neutral-400">
          Extraction par règles (dates, mots-clés de compétences, email,
          téléphone, et sections FORMATIONS / COMPÉTENCES / EXPÉRIENCES si le
          CV est structuré) — pas d&apos;IA. Le fichier n&apos;est pas
          conservé, seules les informations détectées ci-dessous le sont, et
          uniquement après ta validation.
        </p>
      </form>

      {state && !state.error && (
        <div className="space-y-8 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          {(state.email || state.phone) && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-neutral-500">
                Coordonnées détectées
              </h3>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {state.email && <span>{state.email}</span>}
                {state.email && state.phone && <span> · </span>}
                {state.phone && <span>{state.phone}</span>}
              </p>
            </div>
          )}

          <div>
            <h3 className="mb-2 text-sm font-medium text-neutral-500">
              Compétences détectées ({state.skills?.length ?? 0})
            </h3>
            {state.skills && state.skills.length > 0 ? (
              <form action={skillsFormAction} className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {state.skills.map((skill) => (
                    <label
                      key={skill}
                      className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1 text-sm dark:border-neutral-700"
                    >
                      <input
                        type="checkbox"
                        name="skill"
                        value={skill}
                        defaultChecked
                      />
                      {skill}
                    </label>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={skillsPending}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
                >
                  {skillsPending
                    ? "Ajout..."
                    : "Ajouter au catalogue de compétences"}
                </button>
                {skillsState?.success && (
                  <p className="text-sm text-green-600">
                    {skillsState.success}
                  </p>
                )}
              </form>
            ) : (
              <p className="text-sm text-neutral-500">
                Aucune compétence reconnue.
              </p>
            )}
          </div>

          {state.formations && state.formations.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-neutral-500">
                Diplômes détectés ({state.formations.length})
              </h3>
              <ul className="space-y-2">
                {state.formations.map((formation) => {
                  const params = new URLSearchParams({
                    title: formation.title,
                    startYear: String(formation.startYear),
                  });
                  if (formation.institution) params.set("institution", formation.institution);
                  if (formation.endYear) params.set("endYear", String(formation.endYear));

                  return (
                    <li
                      key={formation.raw}
                      className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
                    >
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {formation.raw}
                      </p>
                      <Link
                        href={`/diplomes/new?${params.toString()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs underline"
                      >
                        Créer un diplôme (nouvel onglet) →
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <h3 className="mb-2 text-sm font-medium text-neutral-500">
              Expériences détectées (
              {state.structuredExperiences && state.structuredExperiences.length > 0
                ? state.structuredExperiences.length
                : (state.dateRanges?.length ?? 0)}
              )
            </h3>
            {state.structuredExperiences && state.structuredExperiences.length > 0 ? (
              <ul className="space-y-2">
                {state.structuredExperiences.map((exp, i) => {
                  const params = new URLSearchParams();
                  if (exp.startDate) params.set("startDate", exp.startDate);
                  if (exp.isCurrent) params.set("isCurrent", "1");
                  else if (exp.endDate) params.set("endDate", exp.endDate);
                  if (exp.company) params.set("company", exp.company);
                  if (exp.title) params.set("title", exp.title);
                  if (exp.missions) params.set("missions", exp.missions);
                  if (exp.technologies.length > 0)
                    params.set("technologies", exp.technologies.join(","));

                  return (
                    <li
                      key={`${exp.rawPeriod}-${i}`}
                      className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
                    >
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {exp.title ?? "Poste non détecté"}
                        {exp.company && ` — ${exp.company}`}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {exp.rawPeriod}
                      </p>
                      {exp.technologies.length > 0 && (
                        <p className="mt-1 text-xs text-neutral-400">
                          {exp.technologies.join(", ")}
                        </p>
                      )}
                      {exp.startDate && (
                        <Link
                          href={`/experiences/new?${params.toString()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs underline"
                        >
                          Créer une expérience avec ces infos (nouvel onglet) →
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : state.dateRanges && state.dateRanges.length > 0 ? (
              <ul className="space-y-2">
                {state.dateRanges.map((range) => {
                  const params = new URLSearchParams({
                    startDate: yearToDate(range.startYear, false),
                  });
                  if (range.endYear)
                    params.set("endDate", yearToDate(range.endYear, true));
                  else params.set("isCurrent", "1");

                  return (
                    <li
                      key={range.raw}
                      className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
                    >
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {range.raw}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {range.context}
                      </p>
                      <Link
                        href={`/experiences/new?${params.toString()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs underline"
                      >
                        Créer une expérience avec ces dates (nouvel onglet) →
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">
                Aucune période reconnue.
              </p>
            )}
            <p className="mt-3 text-xs text-neutral-400">
              {state.structuredExperiences && state.structuredExperiences.length > 0
                ? "Entreprise, poste, dates et technologies sont pré-remplis depuis les libellés détectés sur le CV — relis-les avant de valider."
                : "L'entreprise et le poste ne sont pas devinés automatiquement — relis le contexte affiché et complète-les toi-même sur la fiche."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
