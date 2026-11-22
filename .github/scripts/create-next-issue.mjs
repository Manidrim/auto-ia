import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { chatJson } from "./mistral.js";
import { loadPrompt } from "./prompts.js";
import { makeGh } from "./lib/gh.js";

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const { gh } = makeGh({ owner, repo, token: process.env.GITHUB_TOKEN });

const pr = JSON.parse(
  gh("pr", "view", process.env.PR_NUMBER, "--json", "title,body,labels"),
);
const openIssues = JSON.parse(
  gh(
    "issue",
    "list",
    "--state",
    "open",
    "--json",
    "number,title",
    "--limit",
    "50",
  ),
);

let currentContent = "(aucun fichier src/lib trouvé)";
const libDir = "src/lib";
if (existsSync(libDir)) {
  const parts = [];
  for (const f of readdirSync(libDir)) {
    if (/\.jsx?$/.test(f)) {
      const path = `${libDir}/${f}`;
      const content = readFileSync(path, "utf8");
      if (content.length < 4000) parts.push(`--- ${path} ---\n${content}`);
    }
  }
  if (parts.length > 0) currentContent = parts.join("\n\n");
}

const next = await chatJson([
  { role: "system", content: loadPrompt("create-next-issue.system") },
  {
    role: "user",
    content: loadPrompt("create-next-issue.user", {
      prTitle: pr.title,
      prBody: pr.body,
      currentContent,
      openIssues: JSON.stringify(openIssues),
    }),
  },
]);

const bodyFile = "/tmp/issue-body.md";
writeFileSync(bodyFile, next.body);

gh(
  "issue",
  "create",
  "--title",
  next.title,
  "--body-file",
  bodyFile,
  "--label",
  "enhancement",
  { stdio: "inherit" },
);
