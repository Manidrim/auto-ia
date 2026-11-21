import { execSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  statSync,
} from "node:fs";
import { join } from "node:path";
import { chatJson } from "./mistral.js";
import { loadPrompt } from "./prompts.js";
import { makeGh } from "./lib/gh.js";

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
const { gh } = makeGh({ owner, repo, token: process.env.GITHUB_TOKEN });

const pr = JSON.parse(
  gh(`pr view ${process.env.PR_NUMBER} --json title,body,labels`),
);
const openIssues = JSON.parse(
  gh("issue list --state open --json number,title --limit 50"),
);

function collectJsFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      out.push(...collectJsFiles(path));
    } else if (/\.jsx?$/.test(entry)) {
      out.push(path);
    }
  }
  return out;
}

let currentContent = "(aucun fichier src/ trouvé)";
const srcFiles = collectJsFiles("src");
if (srcFiles.length > 0) {
  const parts = [];
  for (const path of srcFiles) {
    const content = readFileSync(path, "utf8");
    if (content.length < 4000) parts.push(`--- ${path} ---\n${content}`);
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

execSync(
  `gh issue create --repo ${owner}/${repo} --title ${JSON.stringify(next.title)} --body-file ${bodyFile} --label enhancement`,
  {
    stdio: "inherit",
    env: { ...process.env, GH_TOKEN: process.env.GITHUB_TOKEN },
  },
);
