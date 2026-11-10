import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
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

const next = await chatJson([
  {
    role: "system",
    content:
      "Tu es un product owner pour un site éducatif React destiné à des élèves de primaire (maths). " +
      "Tu réponds UNIQUEMENT avec un bloc JSON : {\"title\": \"...\", \"body\": \"...\"}. " +
      "Les issues sont TOUJOURS petites (une seule fonctionnalité, faisable en une PR). " +
      "Le body suit le format user story : \"En tant que [élève], je veux [action], afin de [bénéfice].\" " +
      "suivi de critères d'acceptation en liste à puces. Écris en français.",
  },
  {
    role: "user",
    content:
      `PR qui vient d'être mergée :\n${pr.title}\n\n${pr.body}\n\n` +
      `Issues déjà ouvertes (ne pas dupliquer) :\n${JSON.stringify(openIssues)}\n\n` +
      "Propose la PROCHAINE petite issue la plus logique pour faire avancer le projet par itérations.",
  },
]);

const bodyFile = "/tmp/issue-body.md";
writeFileSync(bodyFile, next.body);

execSync(
  `gh issue create --repo ${owner}/${repo} --title ${JSON.stringify(next.title)} --body-file ${bodyFile} --label enhancement`,
  { stdio: "inherit", env: { ...process.env, GH_TOKEN: token } }
);
