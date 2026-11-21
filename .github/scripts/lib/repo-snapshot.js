import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

export function buildExtensionRegex(extensions) {
  const escaped = extensions.map((e) =>
    e.replace(/^\./, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  return new RegExp(`\\.(?:${escaped.join("|")})$`);
}

export function collectRepoSnapshot(fileFilters) {
  const { extensions, exclude, max_file_size } = fileFilters;
  const extRegex = buildExtensionRegex(extensions);
  const repoFiles = execSync("git ls-files", { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter((f) => extRegex.test(f) && !exclude.some((p) => f.startsWith(p)))
    .join("\n");

  const fileContents = {};
  for (const f of repoFiles.split("\n")) {
    if (existsSync(f) && readFileSync(f, "utf8").length < max_file_size) {
      fileContents[f] = readFileSync(f, "utf8");
    }
  }
  return { repoFiles, fileContents };
}
