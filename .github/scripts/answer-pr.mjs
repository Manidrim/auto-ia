import { execSync } from "node:child_process";
import { chat } from "./mistral.js";

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const prNumber = process.env.PR_NUMBER;
const token = process.env.GITHUB_TOKEN;

function gh(args) {
  return execSync(`gh ${args} --repo ${owner}/${repo}`, {
    env: { ...process.env, GH_TOKEN: token },
    encoding: "utf8",
  }).trim();
}

function ghApi(endpoint) {
  return execSync(`gh api ${endpoint}`, {
    env: { ...process.env, GH_TOKEN: token },
    encoding: "utf8",
  }).trim();
}

const pr = JSON.parse(
  gh(`pr view ${prNumber} --json title,body,state`)
);

const comments = JSON.parse(
  ghApi(`repos/${owner}/${repo}/issues/${prNumber}/comments --paginate`)
).map((c) => `${c.user.login} : ${c.body}`).join("\n");

const answer = await chat([
  {
    role: "system",
    content:
      "Tu es un développeur React senior qui répond au product owner sur une pull request. " +
      "Le projet est un site Vite+React pour des élèves de primaire, en français. " +
      "Réponds en français, de façon concise et pédagogique, en Markdown. " +
      "Tu ne modifies AUCUN code : tu réponds uniquement par texte. " +
      "Si la question suggère qu'un changement de code est nécessaire, explique-le et termine par : " +
      "\"Pour appliquer ces changements, commente /corrige suivi de tes retours.\"",
  },
  {
    role: "user",
    content:
      `PR : ${pr.title}\n\n${pr.body}\n\n` +
      `Fil de commentaires :\n${comments}\n\n` +
      "Réponds à la dernière question du product owner.",
  },
]);

execSync(`gh pr comment ${prNumber} --repo ${owner}/${repo} --body ${JSON.stringify(answer)}`, {
  env: { ...process.env, GH_TOKEN: token },
  stdio: "inherit",
});
