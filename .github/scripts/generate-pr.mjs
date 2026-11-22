import { execFileSync, execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { chatJson } from "./mistral.js";
import { loadConfig, loadPrompt } from "./prompts.js";
import { makeGh } from "./lib/gh.js";
import { collectRepoSnapshot } from "./lib/repo-snapshot.js";
import { obtainPlan, applyPlanFiles } from "./lib/plan.js";

const config = loadConfig();

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const issueNumber = process.env.ISSUE_NUMBER;
const token = process.env.GITHUB_TOKEN;
const { gh } = makeGh({ owner, repo, token });

const issue = JSON.parse(
  gh("issue", "view", issueNumber, "--json", "title,body,labels,comments"),
);
if (!issue.labels.some((l) => l.name === "validated")) {
  console.log("Issue non validée, arrêt.");
  process.exit(0);
}

const branch = `auto/pr-issue-${issueNumber}`;

const existingPrs = JSON.parse(
  gh("pr", "list", "--head", branch, "--state", "open", "--json", "number"),
);
if (existingPrs.length > 0) {
  console.log(
    `Une PR existe déjà pour l'issue #${issueNumber} (PR #${existingPrs[0].number}), arrêt.`,
  );
  process.exit(0);
}

execSync(`git checkout -B ${branch} origin/main`, { stdio: "inherit" });

const { repoFiles, fileContents } = collectRepoSnapshot(config.file_filters);

const systemMessage = {
  role: "system",
  content: loadPrompt("generate-pr.system", {
    "project.audience": config.project.audience,
  }),
};

const userMessage = {
  role: "user",
  content: loadPrompt("generate-pr.user", {
    repoFiles,
    fileContents: JSON.stringify(fileContents),
    issueNumber,
    issueTitle: issue.title,
    issueBody: issue.body,
    comments: issue.comments
      .map((c) => `${c.author.login} : ${c.body}`)
      .join("\n"),
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
  console.log("Aucun changement à committer, aucune PR créée.");
  process.exit(0);
}
execFileSync("git", ["commit", "-m", `feat: ${issue.title}`], {
  stdio: "inherit",
});
execSync(`git push origin ${branch} --force`, { stdio: "inherit" });

const bodyFile = "/tmp/pr-body.md";
writeFileSync(
  bodyFile,
  `## Summary\n- ${plan.summary || `Implémentation automatique de l'issue #${issueNumber}`}\n\nGénéré automatiquement par l'IA à partir de l'issue validée.\n\n## Commandes pour tester en local\n- npm install\n- npm run dev\n- npm test\n- npm run build\n- npm run preview\n\nCloses #${issueNumber}\n`,
);

gh(
  "pr",
  "create",
  "--head",
  branch,
  "--title",
  `feat: ${issue.title}`,
  "--body-file",
  bodyFile,
  { stdio: "inherit" },
);
