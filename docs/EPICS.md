# CareerBoard — Epics, issues et choix techniques

Ce document reprend les epics du brief produit, avec pour chacun : mon
découpage des issues, les entités/données impliquées, les décisions
techniques et une estimation d'effort indicative (S / M / L / XL). L'objectif
est de passer d'un brief fonctionnel à quelque chose d'implémentable dans
l'ordre.

**Scope confirmé** : pas de module IA, pas de génération d'export (PDF, CSV,
JSON de sortie...) — l'app reste volontairement un outil de saisie,
comparaison et pilotage, où toute la valeur vient de ce que l'utilisateur y
entre. L'Epic 15 (IA) et l'Epic 19 (Export) du brief initial sont retirés du
scope ; les mentions d'assistant IA dans les autres epics ont été remplacées
par des mécanismes déterministes (règles, calculs).

## Phasage général

Les epics ne sont pas égaux : certains sont le socle sur lequel tout le reste
s'appuie (une expérience professionnelle, c'est le nœud central du graphe de
données), d'autres sont des couches d'analyse qui n'ont de sens qu'une fois
qu'il y a de la donnée à comparer. Je propose 6 phases :

| Phase | Epics | Objectif |
|---|---|---|
| **0 — Socle** | 1 (Auth), 20 (Paramètres — thème) | Avoir une appli déployable, sécurisée, vide |
| **1 — Backbone carrière** | 3 (Parcours), 4 (Package), 5 (Compétences), 7 (Journal), 8 (Satisfaction) | Le cœur du modèle de données. Sans ça, rien d'autre n'a de contenu à afficher ni à comparer |
| **2 — Pilotage** | 2 (Dashboard), 9 (Objectifs), 6 (Projets), 10 (Formation) | Rendre visible ce qui a été saisi en phase 1 |
| **3 — Recherche d'emploi** | 11 (Job board), 12 (CRM recruteurs), 13 (Marché) | Module activable seulement en phase de recherche active |
| **4 — Documents** | 14 (Documents) | Stockage des fichiers (CV, certifs) rattachés au profil |
| **5 — Analyse & alertes** | 16 (Analyse), 17 (Alertes) | Nécessite un historique réel pour être pertinent — inutile sur une base vide |
| **6 — Vision** | 18 (Roadmap) | Projection, s'appuie sur toutes les couches précédentes |
| **V2** | Career Score | Synthèse pondérée de *tous* les modules — dernier bloc, par construction |

Une expérience utilisateur solide dès la phase 1 vaut mieux que 20 epics
esquissés à moitié : je recommande de livrer 3 → 7 → 8 → 4 → 5 en continu
avant même de commencer le Dashboard, pour avoir un vrai jeu de données à
afficher plutôt que des placeholders.

---

## Epic 1 — Authentification

**Issues**
- Login (email + mot de passe)
- Logout
- Gestion du mot de passe (reset par email, changement)
- Session sécurisée (JWT + refresh token, expiration courte)
- Profil utilisateur (nom, avatar, préférences)

**Choix techniques**
- **Auth.js (NextAuth v5)** avec provider Credentials (email + mot de passe)
  et adapter Drizzle. Sessions en cookie `httpOnly` + `Secure` gérées
  nativement par Auth.js — pas de gestion JWT manuelle côté client.
- Appli conçue mono-utilisateur au départ mais le schema `users` reste une
  vraie table (pas de hardcode) : ouvre la porte à un mode "famille/couple"
  ou à une version multi-comptes plus tard sans migration lourde.
- Pas de social login en v1 — inutile pour un outil strictement personnel,
  ajoute de la surface d'attaque pour peu de valeur.

**Effort** : S

---

## Epic 2 — Dashboard

**Widgets** (repris du brief) : entreprise actuelle, poste, ancienneté,
salaire, package total, satisfaction, niveau de risque, dernières notes,
objectifs en cours, compétences principales.

**Choix techniques**
- Le dashboard est un agrégateur en lecture seule : un seul endpoint
  `GET /api/dashboard` qui compose les données des autres modules plutôt que
  17 appels frontend séparés — évite le waterfall de requêtes.
- "Niveau de risque" est calculé côté backend à partir de règles simples
  dès cette phase (ancienneté, absence de mise à jour de compétences,
  tendance satisfaction) — c'est un prototype léger de ce que l'Epic 17
  (Alertes) formalisera plus tard. Pas de duplication de logique : le moteur
  de règles est écrit une fois et réutilisé par les deux epics.
- Vue construite en dernier dans sa phase malgré son numéro d'epic : sans
  données de la phase 1, ce n'est qu'une coquille visuelle.

**Effort** : M (le vrai travail est le endpoint d'agrégation, pas l'UI)

---

## Epic 3 — Parcours professionnel

**Issues**
- CRUD Expérience (entreprise, dates, poste, salaire, package, localisation,
  télétravail, missions, technologies, manager, points +/-, raison du départ,
  ce que j'ai appris)
- Timeline graphique

**Choix techniques**
- `Experience` est l'entité pivot du domaine. `technologies` est une relation
  many-to-many vers `Competence` (Epic 5) plutôt qu'un champ texte libre —
  c'est ce qui permet ensuite de croiser "compétences utilisées" avec
  "compétences déclarées" dans les analyses (Epic 16).
- Champs longs (missions, points +/-, ce que j'ai appris) en texte riche
  minimal (Markdown stocké tel quel, rendu côté front) — pas d'éditeur WYSIWYG
  complexe pour une v1.
- Timeline : composant frontend simple (liste triée par date avec rendu en
  frise) plutôt qu'une lib de gantt dédiée — le besoin réel est de visualiser
  chronologie + chevauchements, pas de la planification.
- Pas d'import CV automatisé (aurait nécessité un parsing IA) : la saisie
  d'une expérience passée reste manuelle, via le même formulaire CRUD.

**Effort** : M (CRUD = M, timeline = S)

---

## Epic 4 — Package salarial

**Issues** : composants du package (fixe, primes, participation,
intéressement, avantages en nature...), calcul package annuel, net estimé,
évolution, historique, comparaison.

**Choix techniques**
- `PackageSalarial` en relation 1-1 avec `Experience` (pas une entité
  indépendante) : un package n'a de sens que rattaché à un poste et une
  période.
- Calcul du "net estimé" : barème simplifié et **explicitement documenté
  comme approximatif** dans l'UI (pas de simulation fiscale complète — ce
  n'est pas l'objet de l'app, et donner un faux sentiment de précision sur
  du net serait trompeur). Un coefficient configurable dans les paramètres
  (Epic 20) plutôt qu'un moteur de paie.
- "Comparaison" et "Evolution" sont des vues, pas des données stockées à
  part : calculées à la volée à partir de l'historique des `PackageSalarial`.

**Effort** : M

---

## Epic 5 — Compétences

**Issues** : catalogue (catégorie, niveau, années d'expérience, dernière
utilisation, envie de progresser, confiance).

**Choix techniques**
- `Competence` = catalogue global (référentiel), avec une table de liaison
  `CompetenceUsage` qui porte les attributs contextuels (niveau, confiance,
  dernière utilisation) — parce qu'une compétence est réutilisée par
  plusieurs expériences/projets et que son niveau évolue dans le temps. Sans
  cette séparation, on duplique le référentiel à chaque expérience.
- Catégories en table de référence (pas un enum figé dans le code) pour
  pouvoir en ajouter sans déploiement : Langage, Framework, Infra/DevOps,
  Cloud, Base de données, Soft skill, Management...
- `dernière utilisation` peut être dérivée automatiquement (dernière
  `Experience`/`Projet` liée à cette compétence) plutôt que saisie
  manuellement — évite la désynchronisation. Champ manuel seulement en
  fallback si aucune liaison n'existe.

**Effort** : M

---

## Epic 6 — Projets

**Issues** : client, technologies, durée, difficulté, impact, screenshots,
documentation.

**Choix techniques**
- Même relation many-to-many vers `Competence` que l'Epic 3.
- `Projet` peut être rattaché à une `Experience` (projet réalisé dans le
  cadre d'un poste) ou être autonome (side project, freelance) — clé
  étrangère nullable, pas deux modèles séparés.
- Screenshots/documentation → délégué au module Documents (Epic 14) en
  stockage, `Projet` ne fait que référencer des fichiers.

**Effort** : S/M

---

## Epic 7 — Journal professionnel

Identifié par le brief comme le plus important — je suis d'accord : c'est la
donnée la plus riche en signal qualitatif et la moins structurée, celle qui
donne le plus de contexte aux comparaisons (Epic 16) et aux alertes
(Epic 17).

**Issues** : entrées libres datées, tags, humeur, entreprise liée, note.

**Choix techniques**
- `JournalEntry` : contenu en Markdown, `mood` en échelle numérique fixe
  (ex. 1-5) plutôt que texte libre — nécessaire pour pouvoir tracer une
  courbe d'humeur dans le temps (Epic 16).
- Tags en table libre avec autocomplete (pas un enum fermé) : l'utilisateur
  doit pouvoir inventer ses propres tags ("rachat", "conflit", "fierté").
- Liaison optionnelle à une `Experience` pour contextualiser l'entrée sans
  forcer une saisie à chaque fois.

**Effort** : S (le modèle est simple, la valeur vient de l'usage dans le temps)

---

## Epic 8 — Satisfaction

**Issues** : évaluation mensuelle multi-critères (stress, salaire, équipe,
management, télétravail, locaux, équilibre vie perso, intérêt technique,
autonomie, vision entreprise), graphiques, évolution.

**Choix techniques**
- `SatisfactionEntry` : un enregistrement par mois, chaque critère noté sur
  une échelle fixe (1-5 ou 1-10, à trancher tôt car ça conditionne l'échelle
  du futur Career Score). Je recommande **1-10** pour avoir assez de
  granularité sur l'évolution mensuelle.
- Rappel mensuel : un **Vercel Cron Job** (gratuit sur le plan Hobby, limité
  en fréquence mais suffisant pour un rappel mensuel) qui appelle une route
  API créant une entrée à compléter, plutôt qu'un système de notification
  push complexe en v1.
- Ces données alimentent directement le "niveau de risque" du Dashboard
  (Epic 2) et seront une des composantes pondérées du Career Score (V2).

**Effort** : M

---

## Epic 9 — Objectifs

**Issues** : date, priorité, état, avancement.

**Choix techniques**
- `Goal` simple : titre, description, `deadline` nullable, `priority`
  (enum Basse/Moyenne/Haute), `status` (À faire/En cours/Atteint/Abandonné),
  `progress` (0-100, mis à jour manuellement en v1 — un calcul automatique
  d'avancement n'a de sens que pour certains types d'objectifs mesurables,
  ex. "lire 12 livres" pourrait s'auto-incrémenter si lié à l'Epic 10).
- Optionnel : lien faible vers `Competence` quand l'objectif est
  d'apprentissage ("Apprendre Docker") — permet de nourrir l'Epic 18
  (Roadmap) en croisant objectifs et écart de compétences.

**Effort** : S

---

## Epic 10 — Formation

**Issues** : catalogue (livres, Udemy, Youtube, articles, veille), notes,
temps passé.

**Choix techniques**
- `TrainingItem` : `type` (enum), `title`, `source`/URL, `status`
  (À faire/En cours/Terminé), `timeSpentMinutes`, `notes`, et une relation
  optionnelle vers `Competence` (ce que la formation fait progresser) et vers
  `Goal` (si elle sert un objectif précis, ex. l'objectif "Lire 12 livres").
- Le "temps passé" est déclaratif (saisi par l'utilisateur), pas de tracking
  automatique — hors scope, complexité disproportionnée pour la valeur.

**Effort** : S

---

## Epic 11 — Job board personnel

**Issues** : entreprise, ville, salaire, télétravail, lien, notes, statut,
pipeline (À regarder → Contact RH → Test technique → Offre → Refus/Accepté).

**Choix techniques**
- `JobApplication` avec un `status` en enum ordonné, et un historique de
  transitions (`JobApplicationStatusHistory`) plutôt qu'un simple champ
  statut écrasé à chaque changement — indispensable pour mesurer plus tard
  "temps moyen par étape du pipeline" (Epic 16).
- Vue Kanban par statut en frontend (drag & drop) — pattern UI naturel pour
  un pipeline, et familier si l'utilisateur a déjà vu des ATS.

**Effort** : M

---

## Epic 12 — CRM recruteurs

**Issues** : nom, entreprise, LinkedIn, email, dernier contact, notes,
historique.

**Choix techniques**
- `Recruiter`, avec relation optionnelle vers `JobApplication`/`Company` —
  un recruteur peut être rattaché à plusieurs candidatures dans le temps
  (chasseur de têtes qui revient tous les ans).
- `Interaction` en sous-entité (date, canal, résumé) plutôt qu'un champ
  `notes` unique en texte libre qui grossit indéfiniment — permet une vraie
  timeline de contact.

**Effort** : S/M

---

## Epic 13 — Marché

**Issues** : salaire moyen par ville/remote, technologies demandées,
compétences recherchées, évolution du marché.

**Choix techniques — c'est l'epic le plus incertain du projet.**
Il n'existe pas d'API publique fiable et gratuite de données salariales
françaises en temps réel, et le scope exclut tout scraping/IA. Je propose
donc une **saisie manuelle** en entité `MarketDataPoint` (source, poste,
ville/remote, fourchette, date) : l'utilisateur alimente lui-même ses points
de comparaison (annonces vues, retours de recruteurs, études salariales
publiques type INSEE/APEC lues manuellement) et l'app se contente de les
stocker et de les confronter à son propre `PackageSalarial` (Epic 4). Simple,
fiable, sans dépendance externe — cohérent avec le reste de l'app qui est
piloté par ce que l'utilisateur y saisit.

**Effort** : S

---

## Epic 14 — Documents

**Issues** : CV (versions), lettres, portfolio, certifications, diplômes.

**Choix techniques**
- `documents` générique : `type` (enum), fichier (stockage **Vercel Blob**),
  métadonnées (date, tags), et **versioning natif** — un CV n'est jamais un
  fichier unique mais une suite de versions dans le temps. Table
  `document_versions` plutôt qu'un champ `file` réécrit à chaque upload.
- Antivirus/scan à l'upload si l'app est un jour exposée publiquement au-delà
  d'un usage strictement local — à garder en tête, pas bloquant en v1
  mono-utilisateur.

**Effort** : M

---

## Epic 16 — Analyse

**Issues** : temps par techno, évolution salaire, durée moyenne des emplois,
compétences les plus utilisées, évolution satisfaction/stress, valeur du
package.

**Choix techniques**
- Toutes ces vues sont des agrégations SQL sur des données déjà en base
  (Epics 3, 4, 5, 8) — pas de nouvelle donnée à saisir, uniquement des
  requêtes et des graphiques. C'est un epic "cheap" une fois le socle en
  place : la vraie complexité est en amont (avoir des données propres à
  agréger), pas dans les requêtes elles-mêmes.
- Pas de moteur BI externe (Metabase etc.) — la volumétrie est celle d'un
  usage personnel, des requêtes Drizzle + Recharts suffisent largement et
  gardent tout dans l'app.

**Effort** : M

---

## Epic 17 — Alertes

**Issues** : salaire stagnant, stress en hausse, peu de formations,
compétence obsolète, package sous le marché, ancienneté importante.

**Choix techniques**
- Moteur de règles simple, exécuté par un **Vercel Cron Job**, chaque règle
  étant une fonction respectant une interface commune
  (`evaluateRule(user): Alert | null`) — permet d'ajouter des règles sans
  toucher au moteur, et réutilise exactement la logique déjà esquissée pour
  le "niveau de risque" du Dashboard (Epic 2) au lieu de la dupliquer.
- Notification en v1 : affichage in-app uniquement (liste d'alertes actives)
  ; email/push seulement si le besoin se confirme à l'usage — éviter de
  construire un système de notification multi-canal avant d'en avoir besoin.

**Effort** : M

---

## Epic 18 — Roadmap

**Issues** : objectif de carrière cible (Lead/Architecte/Freelance/Manager),
estimation des compétences manquantes.

**Choix techniques**
- `CareerTarget` : rôle visé, horizon temporel, et une liste de
  `RequiredCompetence` (référentiel simple, éventuellement pré-rempli par
  rôle type, saisi manuellement par l'utilisateur). L'écart est calculé en
  comparant ce référentiel aux `CompetenceUsage` actuelles de l'utilisateur
  (Epic 5) — encore une fois, aucune nouvelle donnée structurante, une vue
  calculée sur l'existant (liste des compétences manquantes ou en dessous du
  niveau requis).

**Effort** : M, fortement dépendant de la qualité des données Compétences en
amont

---

## Epic 20 — Paramètres

**Issues** : thème (dark/dev).

*Hors scope* : sauvegarde, import, export (retirés — voir note de scope en
tête de document).

**Choix techniques**
- Thème : dark mode standard + un thème "dev" plus ludique (police mono,
  esthétique terminal) mentionné dans le brief — simple variante CSS/Tailwind,
  pas de moteur de theming complexe.
- Préférences utilisateur simples (thème, devise si besoin de multi-devise,
  échelle de notation satisfaction) stockées sur l'entité `User`.

**Effort** : S

---

## V2 — Career Score

Le brief le présente comme la fonctionnalité différenciante de la V2, et je
suis d'accord avec le séquencement : c'est structurellement une synthèse
pondérée de *toutes* les autres briques (satisfaction, package vs marché,
employabilité, équilibre vie pro/perso, stabilité entreprise, perspectives,
apprentissage continu), donc elle ne peut être construite proprement qu'une
fois ces briques posées et peuplées de données réelles — la faire trop tôt
donnerait un score arbitraire sur une base vide.

**Choix techniques anticipés**
- Score calculé côté backend par un service dédié (`CareerScoreCalculator`)
  qui agrège des sous-scores par dimension, chacun avec un poids
  configurable (les poids par défaut peuvent être ceux du brief, mais
  exposés en paramètre plutôt qu'en dur — la pondération "bonne" est
  personnelle et discutable).
- Le score est stocké en snapshot mensuel (comme `SatisfactionEntry`) plutôt
  que recalculé uniquement à la volée — permet une courbe d'évolution du
  score dans le temps, qui est probablement plus intéressante que le chiffre
  instantané.
- Sans IA, la partie qualitative ("points forts / points de vigilance /
  actions suggérées") du brief est produite par le **même moteur de règles
  que l'Epic 17** (Alertes) plutôt que par une génération de texte libre :
  chaque sous-score déclenche un message pré-écrit quand il franchit un
  seuil (ex. sous-score "employabilité" bas + aucune formation depuis 12
  mois → "Renforcer les compétences X/Y" apparaît automatiquement dans les
  actions suggérées). C'est moins riche qu'un texte généré à la volée, mais
  reste déterministe, gratuit à faire tourner, et cohérent avec le principe
  du projet : tout est piloté par les règles et les données que
  l'utilisateur saisit, rien n'est généré.

**Effort** : L, et dépend de la maturité des données de toutes les phases
précédentes — pas de raccourci possible.

---

## Risques transverses à garder en tête

- **Confidentialité des données** : c'est un des projets les plus sensibles
  qu'on puisse construire (salaire, santé mentale au travail, opinions sur
  employeurs/managers). Chiffrement au repos à minima pour les champs les
  plus sensibles (notes de journal, salaire) si l'app est un jour hébergée
  hors d'une machine strictement personnelle.
- **Sur-ingénierie précoce** : plusieurs epics (13-Marché, 17-Alertes,
  18-Roadmap, Career Score) peuvent facilement se transformer en projets de
  moteur de règles trop ambitieux si on essaie de tout couvrir dès la
  première version. Je recommande de démarrer avec un petit nombre de règles
  simples et d'en ajouter au fil de l'usage réel plutôt que d'anticiper
  toutes les règles possibles dès la conception.
- **Fatigue de saisie** : c'est le risque numéro un d'un ERP personnel — s'il
  est pénible à alimenter (Epic 7 Journal, Epic 8 Satisfaction en
  particulier), il sera abandonné en un mois. Prioriser l'ergonomie de
  saisie (formulaires rapides, rappels doux) au moins autant que les
  tableaux de bord qui en consomment les données.
