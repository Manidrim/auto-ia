import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
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

const systemMessage = {
  role: "system",
  content:
    "Tu es un développeur React senior. Tu réponds UNIQUEMENT avec un seul objet JSON valide : " +
    "aucune balise markdown, aucun texte avant ou après. " +
    "Cet objet a exactement deux clés : \"files\" (tableau d'objets ayant chacun \"path\" et \"content\") " +
    "et \"summary\" (courte description en français). " +
    "Chaque \"path\" doit être un chemin relatif d'un fichier existant du projet ou un nouveau fichier sous src/ ou tests/. " +
    "NE recopie aucun exemple, ne mets jamais de valeur fictive. " +
    "MODIFICATION MINIMALE : conserve la structure, les imports et l'interface des scripts " +
    "(variables d'environnement process.env, appels gh CLI) ; ne réécris pas un fichier entier si une petite modification suffit. " +
    "Ne modifie JAMAIS les fichiers sous .github/workflows/ (permission workflows manquante). " +
    "Chaque \"content\" contient le contenu COMPLET du fichier (jamais un diff). " +
    "Le projet est un site Vite+React pour des élèves de primaire, en français. " +
    "Les tests utilisent vitest (fichiers *.test.js). Ne casse jamais les tests existants.",
};

const userMessage = {
  role: "user",
  content:
    `PR : ${pr.title}\n\n${pr.body}\n\n` +
    `Retours à appliquer (commentaires) :\n${comments}\n\n` +
    `Retours sur le code (reviews) :\n${reviewComments}\n\n` +
    `Fichiers du projet :\n${repoFiles}\n\n` +
    `Contenus actuels :\n${JSON.stringify(fileContents)}\n\n` +
    "Applique uniquement les retours demandés, de façon minimale. Réponds uniquement avec l'objet JSON demandé.",
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
    throw new Error("Le plan ne contient que des fichiers .github/workflows/, interdits (permission manquante)");
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
  console.log("Aucun changement à committer, arrêt.");
  process.exit(0);
}
execSync(`git commit -m "fix: retours sur ${prNumber}"`, { stdio: "inherit" });
execSync(`git push origin ${pr.headRefName}`, { stdio: "inherit" });

console.log(`Retours appliqués sur ${pr.headRefName}.`);
