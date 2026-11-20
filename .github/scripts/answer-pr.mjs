import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { chat } from "./mistral.js";
import { loadPrompt } from "./prompts.js";

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
  { role: "system", content: loadPrompt("answer-pr.system") },
  {
    role: "user",
    content: loadPrompt("answer-pr.user", {
      prTitle: pr.title,
      prBody: pr.body,
      comments,
    }),
  },
]);


const bodyFile = "/tmp/answer.md";
writeFileSync(bodyFile, answer);
execSync(`gh pr comment ${prNumber} --repo ${owner}/${repo} --body-file ${bodyFile}`, {
  env: { ...process.env, GH_TOKEN: token },
  stdio: "inherit",
});
