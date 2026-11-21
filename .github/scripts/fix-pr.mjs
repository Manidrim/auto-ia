import { execSync } from "node:child_process";
import { chatJson } from "./mistral.js";
import { loadConfig, loadPrompt } from "./prompts.js";
import { makeGh } from "./lib/gh.js";
import { collectRepoSnapshot } from "./lib/repo-snapshot.js";
import { obtainPlan, applyPlanFiles } from "./lib/plan.js";

const config = loadConfig();

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const prNumber = process.env.PR_NUMBER;
const { gh, ghApi } = makeGh({ owner, repo, token: process.env.GITHUB_TOKEN });

const pr = JSON.parse(
  gh(`pr view ${prNumber} --json title,body,headRefName,baseRefName,state`),
);
if (pr.state !== "OPEN") {
  console.log("PR non ouverte, arrêt.");
  process.exit(0);
}

const comments = JSON.parse(
  ghApi(`repos/${owner}/${repo}/issues/${prNumber}/comments --paginate`),
)
  .map((c) => `${c.user.login} : ${c.body}`)
  .join("\n");

const reviewComments = JSON.parse(
  ghApi(`repos/${owner}/${repo}/pulls/${prNumber}/comments --paginate`),
)
  .map((c) => `${c.user.login} sur ${c.path} : ${c.body}`)
  .join("\n");

execSync(`git checkout ${pr.headRefName}`, { stdio: "inherit" });
execSync(`git pull origin ${pr.headRefName}`, { stdio: "inherit" });

const { repoFiles, fileContents } = collectRepoSnapshot(config.file_filters);

const systemMessage = {
  role: "system",
  content: loadPrompt("fix-pr.system"),
};

const userMessage = {
  role: "user",
  content: loadPrompt("fix-pr.user", {
    prTitle: pr.title,
    prBody: pr.body,
    comments,
    reviewComments,
    repoFiles,
    fileContents: JSON.stringify(fileContents),
  }),
};

const plan = await obtainPlan(
  [systemMessage, userMessage],
  chatJson,
  fileContents,
);

applyPlanFiles(plan.files);

execSync("git add -A", { stdio: "inherit" });
const dirty = execSync("git status --porcelain", { encoding: "utf8" }).trim();
if (!dirty) {
  console.log("Aucun changement à committer, arrêt.");
  process.exit(0);
}
execSync(`git commit -m "fix: retours sur ${prNumber}"`, { stdio: "inherit" });
execSync(`git push origin ${pr.headRefName}`, { stdio: "inherit" });

console.log(`Retours appliqués sur ${pr.headRefName}.`);
