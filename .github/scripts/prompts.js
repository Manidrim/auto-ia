import { readFileSync } from "node:fs";
import { join } from "node:path";

const AI_DIR = join(process.cwd(), ".github/ai");

export function loadConfig() {
  return JSON.parse(readFileSync(join(AI_DIR, "config.json"), "utf8"));
}

export function loadPrompt(name, vars = {}) {
  let content = readFileSync(join(AI_DIR, "prompts", `${name}.md`), "utf8");
  for (const [key, value] of Object.entries(vars)) {
    content = content.split(`{{${key}}}`).join(String(value));
  }
  return content;
}
