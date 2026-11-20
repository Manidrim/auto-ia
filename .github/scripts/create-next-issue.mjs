import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { chatJson } from "./mistral.js";

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const token = process.env.GITHUB_TOKEN;

function gh(args) {
  return execSync(`gh ${args} --repo ${owner}/${repo}`, {
    env: { ...process.env, GH_TOKEN: token },
    encoding: "utf8",
  }).trim();
}

const pr = JSON.parse(gh(`pr view ${process.env.PR_NUMBER} --json title,body,labels`));
const openIssues = JSON.parse(gh("issue list --state open --json number,title --limit 50"));

let currentContent = "(aucun fichier src/lib trouvé)";
const libDir = "src/lib";
if (existsSync(libDir)) {
  const parts = [];
  for (const f of readdirSync(libDir)) {
    if (/\.jsx?$/.test(f)) {
      const path = `${libDir}/${f}`;
      const content = readFileSync(path, "utf8");
      if (content.length < 4000) parts.push(`--- ${path} ---\n${content}`);
    }
  }
  if (parts.length > 0) currentContent = parts.join("\n\n");
}

const next = await chatJson([
  {
    role: "system",
    content:
      "Tu es un product owner pour un site éducatif React destiné aux élèves de l'école primaire française (CP, CE1, CE2, CM1, CM2). " +
      "Le site doit couvrir TOUTES les matières du programme de l'école primaire : français (lecture, grammaire, conjugaison, vocabulaire, orthographe), " +
      "mathématiques, histoire, géographie, sciences, anglais, enseignement moral et civique (EMC). " +
      "Tu réponds UNIQUEMENT avec un bloc JSON : {\"title\": \"...\", \"body\": \"...\"}. " +
      "Les issues sont TOUJOURS petites (une seule notion ou une seule matière, faisable en une PR). " +
      "PRIORITÉ ABSOLUE : chaque nouvelle issue doit apporter du CONTENU PÉDAGOGIQUE de niveau, conforme au programme : " +
      "ajouter une matière manquante, ou une notion d'une matière existante, en précisant les classes concernées (CP à CM2). " +
      "Évite les issues purement techniques ou d'interface (feedback visuel/sonore, timer, score, chargement, etc.) " +
      "tant que des matières du programme ne sont pas encore proposées sur le site. " +
      "Le body suit le format user story : \"En tant que [élève de <classe>], je veux [action], afin de [bénéfice].\" " +
      "suivi de critères d'acceptation en liste à puces, en indiquant les niveaux (classes) concernés. Écris en français.",
  },
  {
    role: "user",
    content:
      `PR qui vient d'être mergée :\n${pr.title}\n\n${pr.body}\n\n` +
      `Contenu pédagogique actuel du site (src/lib) :\n${currentContent}\n\n` +
      `Issues déjà ouvertes (ne pas dupliquer) :\n${JSON.stringify(openIssues)}\n\n` +
      "Propose la PROCHAINE petite issue la plus logique : en priorité une matière ou une notion du programme de primaire " +
      "(avec ses niveaux CP à CM2) qui manque encore au site, pour faire avancer le projet par itérations.",
  },
]);

const bodyFile = "/tmp/issue-body.md";
writeFileSync(bodyFile, next.body);

execSync(
  `gh issue create --repo ${owner}/${repo} --title ${JSON.stringify(next.title)} --body-file ${bodyFile} --label enhancement`,
  { stdio: "inherit", env: { ...process.env, GH_TOKEN: token } }
);
