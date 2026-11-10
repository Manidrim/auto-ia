import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { chatJson } from "./mistral.js";

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
  gh(`pr view ${prNumber} --json title,body,headRefName,baseRefName,state`)
);
if (pr.state !== "OPEN") {
  console.log("PR non ouverte, arrêt.");
  process.exit(0);
}

const comments = JSON.parse(
  ghApi(`repos/${owner}/${repo}/issues/${prNumber}/comments --paginate`)
).map((c) => `${c.user.login} : ${c.body}`).join("\n");

const reviewComments = JSON.parse(
  ghApi(`repos/${owner}/${repo}/pulls/${prNumber}/comments --paginate`)
).map((c) => `${c.user.login} sur ${c.path} : ${c.body}`).join("\n");

execSync(`git checkout ${pr.headRefName}`, { stdio: "inherit" });
execSync(`git pull origin ${pr.headRefName}`, { stdio: "inherit" });

const repoFiles = execSync("git ls-files", { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter((f) => /\.(jsx?|css|html|json)$/.test(f) && !f.startsWith(".github/scripts"))
  .join("\n");

const fileContents = {};
for (const f of repoFiles.split("\n")) {
  if (existsSync(f) && readFileSync(f, "utf8").length < 8000) {
    fileContents[f] = readFileSync(f, "utf8");
  }
}

const plan = await chatJson([
  {
    role: "system",
    content:
      "Tu es un développeur React senior. Tu réponds UNIQUEMENT avec un bloc JSON, sans texte autour. " +
      "Le JSON a la forme : {\"files\": [{\"path\": \"...\", \"content\": \"...\"}], \"summary\": \"...\"}. " +
      "Chaque file contient le contenu COMPLET du fichier (jamais de diff). " +
      "Le projet est un site Vite+React pour des élèves de primaire, en français. " +
      "Les tests utilisent vitest (fichiers *.test.js). Ne casse jamais les tests existants.",
  },
  {
    role: "user",
    content:
      `PR : ${pr.title}\n\n${pr.body}\n\n` +
      `Retours à appliquer (commentaires) :\n${comments}\n\n` +
      `Retours sur le code (reviews) :\n${reviewComments}\n\n` +
      `Fichiers du projet :\n${repoFiles}\n\n` +
      `Contenus actuels :\n${JSON.stringify(fileContents)}\n\n` +
      "Applique uniquement les retours demandés, de façon minimale. Rends uniquement le JSON.",
  },
]);

for (const file of plan.files) {
  writeFileSync(file.path, file.content);
}

execSync("git add -A", { stdio: "inherit" });
execSync(`git commit -m "fix: retours sur ${prNumber}"`, { stdio: "inherit" });
execSync(`git push origin ${pr.headRefName}`, { stdio: "inherit" });

console.log(`Retours appliqués sur ${pr.headRefName}.`);
