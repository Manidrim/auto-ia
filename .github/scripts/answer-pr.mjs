import { writeFileSync } from "node:fs";
import { chat } from "./mistral.js";
import { loadPrompt } from "./prompts.js";
import { makeGh } from "./lib/gh.js";

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const prNumber = process.env.PR_NUMBER;
const token = process.env.GITHUB_TOKEN;
const { gh, ghApi } = makeGh({ owner, repo, token });

const pr = JSON.parse(gh("pr", "view", prNumber, "--json", "title,body,state"));

const comments = JSON.parse(
  ghApi(`repos/${owner}/${repo}/issues/${prNumber}/comments`, "--paginate"),
)
  .map((c) => `${c.user.login} : ${c.body}`)
  .join("\n");

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
gh("pr", "comment", prNumber, "--body-file", bodyFile, {
  stdio: "inherit",
});
