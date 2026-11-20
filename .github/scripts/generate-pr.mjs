import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { chatJson } from "./mistral.js";

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

const existingPrs = JSON.parse(gh(`pr list --head ${branch} --state open --json number`));
if (existingPrs.length > 0) {
  console.log(`Une PR existe déjà pour l'issue #${issueNumber} (PR #${existingPrs[0].number}), arrêt.`);
  process.exit(0);
}

execSync(`git checkout -B ${branch} origin/main`, { stdio: "inherit" });

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

const systemMessage = {
  role: "system",
  content:
    "Tu es un développeur React senior. Tu réponds UNIQUEMENT avec un seul objet JSON valide : " +
    "aucune balise markdown, aucun texte avant ou après, aucune explication. " +
    "Cet objet a exactement deux clés : \"files\" (tableau d'objets ayant chacun \"path\" et \"content\") " +
    "et \"summary\" (courte description des modifications en français). " +
    "Chaque \"path\" doit être un chemin relatif d'un fichier existant du projet (voir la liste fournie) " +
    "ou d'un nouveau fichier à créer sous src/. NE recopie aucun exemple, ne mets jamais de valeur fictive. " +
    "Chaque \"content\" contient le contenu COMPLET du fichier (jamais un diff). " +
    "Le projet est un site Vite+React pour des élèves de primaire, en français. " +
    "Les tests utilisent vitest (fichiers *.test.js). Ne casse jamais les tests existants.",
};

const userMessage = {
  role: "user",
  content:
    `Fichiers du projet :\n${repoFiles}\n\n` +
    `Contenus actuels :\n${JSON.stringify(fileContents)}\n\n` +
    `Issue à implémenter :\n# ${issue.title}\n\n${issue.body}\n\n` +
    `Commentaires (précisions du product owner) :\n${issue.comments.map((c) => `${c.author.login} : ${c.body}`).join("\n")}\n\n` +
    "Implémente cette issue de façon minimale et propre. Réponds uniquement avec l'objet JSON demandé.",
};

function validatePlan(plan) {
  if (!plan || typeof plan !== "object" || !Array.isArray(plan.files) || plan.files.length === 0) {
    throw new Error('Le JSON reçu doit contenir un tableau "files" non vide');
  }
  for (const file of plan.files) {
    if (!file || typeof file.path !== "string" || typeof file.content !== "string") {
      throw new Error('Chaque entrée de "files" doit avoir "path" et "content" (chaînes de caractères)');
    }
    if (
      file.path.startsWith("/") ||
      file.path.split("/").includes("..") ||
      /chemin|exemple|placeholder|fichier\.ext/i.test(file.path)
    ) {
      throw new Error(`Chemin de fichier invalide : ${JSON.stringify(file.path)}`);
    }
  }
  return plan;
}

const conversation = [systemMessage, userMessage];
let plan;
let lastError;
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    plan = validatePlan(await chatJson(conversation));
    break;
  } catch (err) {
    lastError = err;
    console.log(`Plan invalide (tentative ${attempt}/3) : ${err.message}`);
    conversation.push({
      role: "user",
      content:
        `Ta réponse précédente n'a pas pu être utilisée : ${err.message}. ` +
        "Réponds à nouveau UNIQUEMENT avec l'objet JSON demandé, avec de vrais chemins de fichiers du projet.",
    });
  }
}
if (!plan) throw lastError;

for (const file of plan.files) {
  mkdirSync(dirname(file.path), { recursive: true });
  writeFileSync(file.path, file.content);
}

execSync("git add -A", { stdio: "inherit" });
execSync(`git commit -m "feat: ${issue.title.replace(/"/g, "'")}"`, { stdio: "inherit" });
execSync(`git push origin ${branch} --force`, { stdio: "inherit" });

const bodyFile = "/tmp/pr-body.md";
writeFileSync(
  bodyFile,
  `## Summary\n- ${plan.summary || `Implémentation automatique de l'issue #${issueNumber}`}\n\nGénéré automatiquement par l'IA à partir de l'issue validée.\n\nCloses #${issueNumber}\n`
);

execSync(
  `gh pr create --repo ${owner}/${repo} --head ${branch} --title "feat: ${issue.title.replace(/"/g, "'")}" --body-file ${bodyFile}`,
  { stdio: "inherit", env: { ...process.env, GH_TOKEN: token } }
);
