import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { chat, extractJson } from "./mistral.js";

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const issueNumber = process.env.ISSUE_NUMBER;
const token = process.env.GITHUB_TOKEN;

function gh(args) {
  return execSync(`gh ${args} --repo ${owner}/${repo}`, {
    env: { ...process.env, GH_TOKEN: token },
    encoding: "utf8",
  }).trim();
}

const issue = JSON.parse(gh(`issue view ${issueNumber} --json title,body,labels,comments`));
if (!issue.labels.some((l) => l.name === "validated")) {
  console.log("Issue non validée, arrêt.");
  process.exit(0);
}

const branch = `auto/pr-issue-${issueNumber}`;
execSync(`git checkout -b ${branch}`, { stdio: "inherit" });

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

const response = await chat([
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
      `Fichiers du projet :\n${repoFiles}\n\n` +
      `Contenus actuels :\n${JSON.stringify(fileContents)}\n\n` +
      `Issue à implémenter :\n# ${issue.title}\n\n${issue.body}\n\n` +
      `Commentaires (précisions du product owner) :\n${issue.comments.map((c) => `${c.author.login} : ${c.body}`).join("\n")}\n\n` +
      "Implémente cette issue de façon minimale et propre. Rends uniquement le JSON.",
  },
]);

const plan = extractJson(response);
for (const file of plan.files) {
  writeFileSync(file.path, file.content);
}

execSync("git add -A", { stdio: "inherit" });
execSync(`git commit -m "feat: ${issue.title.replace(/"/g, "'")}"`, { stdio: "inherit" });
execSync(`git push origin ${branch}`, { stdio: "inherit" });

const bodyFile = "/tmp/pr-body.md";
writeFileSync(
  bodyFile,
  `## Summary\n- ${plan.summary || `Implémentation automatique de l'issue #${issueNumber}`}\n\nGénéré automatiquement par l'IA à partir de l'issue validée.\n\nCloses #${issueNumber}\n`
);

execSync(
  `gh pr create --repo ${owner}/${repo} --head ${branch} --title "feat: ${issue.title.replace(/"/g, "'")}" --body-file ${bodyFile}`,
  { stdio: "inherit", env: { ...process.env, GH_TOKEN: token } }
);
