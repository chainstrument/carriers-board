# CareerBoard

**Un ERP personnel pour piloter sa carrière de développeur.**

CareerBoard n'est pas un générateur de CV. C'est un outil de gestion et de
pilotage : il centralise l'historique professionnel, la rémunération, les
compétences, les candidatures, les objectifs, la formation continue et le
ressenti au quotidien (journal, satisfaction) pour permettre de prendre des
décisions de carrière avec des données plutôt qu'à l'instinct.

## Pourquoi

La plupart des outils existants couvrent un seul aspect de la carrière : un
CV, un tracker de candidatures, un carnet de notes. Aucun ne relie les
signaux entre eux — stress en hausse + salaire stagnant + compétence
clé vieillissante, par exemple, sont trois faits qui pris isolément ne
disent pas grand-chose mais qui, mis bout à bout, racontent une histoire.
CareerBoard existe pour capturer ces signaux dans un seul modèle de données
et les faire parler.

## Ce que couvre l'application

| Domaine | Ce que ça fait |
|---|---|
| **Parcours** | Historique complet des expériences (poste, missions, techno, manager, points +/-, raison de départ) avec timeline |
| **Rémunération** | Calcul du package complet (fixe, primes, avantages), net estimé, historique et évolution |
| **Compétences** | Catalogue avec niveau, ancienneté, dernière utilisation, envie de progresser |
| **Projets** | Historique des réalisations (client, techno, difficulté, impact) |
| **Journal** | Notes libres datées, taguées, avec humeur — le cœur émotionnel de l'app |
| **Satisfaction** | Auto-évaluation mensuelle multi-critères (stress, équipe, management, autonomie...) |
| **Objectifs** | Suivi d'objectifs personnels avec priorité et avancement |
| **Formation** | Veille, livres, cours, temps investi |
| **Recherche d'emploi** | Job board personnel (pipeline de candidature) + CRM recruteurs |
| **Marché** | Comparaison du profil et de la rémunération avec le marché |
| **Documents** | CV versionné, lettres, portfolio, certifications (stockage interne, pas d'export généré) |
| **Analyse & alertes** | Tableaux de bord analytiques et détection automatique de signaux faibles |
| **Roadmap** | Projection vers un objectif de carrière et écart de compétences |

Le détail complet, epic par epic, avec les choix techniques associés, est
dans [`docs/EPICS.md`](docs/EPICS.md).

## Stack technique

| Couche | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript**, un seul projet full-stack | Permet un hébergement 100% gratuit sur Vercel (frontend + API dans la même app, pas de serveur à gérer à part) |
| Base de données | **PostgreSQL géré par Neon** (free tier) | Postgres serverless, tier gratuit généreux, se marie bien avec le déploiement serverless de Vercel |
| ORM | **Drizzle ORM** + `drizzle-kit` pour les migrations | Léger, adapté au serverless (pas de couche de connexion lourde comme Prisma en environnement edge/serverless), types générés directement depuis le schema |
| Auth | **Auth.js (NextAuth v5)**, provider Credentials + adapter Drizzle | Gère sessions/cookies sécurisés nativement, évite de coder un système JWT maison pour une app mono-utilisateur |
| UI | **Tailwind CSS + shadcn/ui** | Composants accessibles, cohérent avec un unique projet React |
| Graphiques | **Recharts** | Dashboards et courbes d'évolution (salaire, satisfaction, stress) |
| Validation | **Zod** | Validation des formulaires et des Server Actions |
| Stockage fichiers | **Vercel Blob** (free tier) | Pour l'upload de documents (Epic 15) — pas de génération de fichiers, juste du stockage |
| Hébergement | **Vercel (plan Hobby, gratuit)** | Déploiement direct depuis le repo Git, zéro coût pour un usage personnel |
| Dev local | **Docker Compose** (Postgres local) | La base tourne en local pendant le développement, Neon uniquement en production — aucun coût lié au dev |
| Tests | **Vitest** | Un seul runtime de test pour tout le projet (TypeScript) |

Ce choix remplace une première option Symfony/PHP + Vue envisagée initialement :
elle collait mieux aux compétences existantes mais impliquait un hébergement
backend payant (Vercel ne supporte pas PHP). Priorité donnée ici à un
hébergement réellement gratuit de bout en bout.

Rationale complète et alternatives écartées : voir `docs/EPICS.md`.

## Statut

Scaffolding en cours. Voir la section *Phasage* de `docs/EPICS.md` pour
l'ordre de développement prévu.

## Démarrage

```bash
docker compose up -d        # Postgres local
npm install
npm run db:migrate
npm run dev
```
