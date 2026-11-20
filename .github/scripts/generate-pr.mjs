import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { chatJson } from "./mistral.js";
import { loadConfig, loadPrompt } from "./prompts.js";

const config = loadConfig();

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
  .filter((f) => /\.(jsx?|css|html|json)$/.test(f) && !f.startsWith(".github/"))
  .join("\n");

const fileContents = {};
for (const f of repoFiles.split("\n")) {
  if (existsSync(f) && readFileSync(f, "utf8").length < 8000) {
    fileContents[f] = readFileSync(f, "utf8");
  }
}

const systemMessage = {
  role: "system",
  content: loadPrompt("generate-pr.system", { "project.audience": config.project.audience }),
};

const userMessage = {
  role: "user",
  content: loadPrompt("generate-pr.user", {
    repoFiles,
    fileContents: JSON.stringify(fileContents),
    issueNumber,
    issueTitle: issue.title,
    issueBody: issue.body,
    comments: issue.comments.map((c) => `${c.author.login} : ${c.body}`).join("\n"),
  }),
};

function validatePlan(plan) {
  if (!plan || typeof plan !== "object" || !Array.isArray(plan.files) || plan.files.length === 0) {
    throw new Error('Le JSON reçu doit contenir un tableau "files" non vide');
  }
  const before = plan.files.length;
  plan.files = plan.files.filter((f) => !(f && typeof f.path === "string" && f.path.startsWith(".github/workflows/")));
  if (plan.files.length < before) {
    console.log(`${before - plan.files.length} fichier(s) .github/workflows/ retiré(s) du plan (permission workflows manquante)`);
  }
  if (plan.files.length === 0) {
    throw new Error('Le plan ne contient que des fichiers .github/workflows/, interdits (permission manquante)');
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
  const changed = plan.files.filter((f) => fileContents[f.path] !== f.content);
  if (changed.length === 0) {
    throw new Error("Aucun fichier ne serait réellement modifié (contenus identiques aux fichiers actuels)");
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
const dirty = execSync("git status --porcelain", { encoding: "utf8" }).trim();
if (!dirty) {
  console.log("Aucun changement à committer, aucune PR créée.");
  process.exit(0);
}
execSync(`git commit -m "feat: ${issue.title.replace(/"/g, "'")}"`, { stdio: "inherit" });
execSync(`git push origin ${branch} --force`, { stdio: "inherit" });

const bodyFile = "/tmp/pr-body.md";
writeFileSync(
  bodyFile,
  `## Summary\n- ${plan.summary || `Implémentation automatique de l'issue #${issueNumber}`}\n\nGénéré automatiquement par l'IA à partir de l'issue validée.\n\n## Commandes pour tester en local\n- npm install\n- npm run dev\n- npm test\n- npm run build\n- npm run preview\n\nCloses #${issueNumber}\n`
);

execSync(
  `gh pr create --repo ${owner}/${repo} --head ${branch} --title "feat: ${issue.title.replace(/"/g, "'")}" --body-file ${bodyFile}`,
  { stdio: "inherit", env: { ...process.env, GH_TOKEN: token } }
);
