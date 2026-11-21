import { describe, it, expect } from "vitest";
import { loadConfig, loadPrompt } from "./prompts.js";

const PROMPTS = [
  "generate-pr.system",
  "generate-pr.user",
  "fix-pr.system",
  "fix-pr.user",
  "answer-pr.system",
  "answer-pr.user",
  "create-next-issue.system",
  "create-next-issue.user",
];

describe("prompts IA (.github/ai)", () => {
  it("charge config.json avec les clés attendues", () => {
    const config = loadConfig();
    expect(config.project.language).toBe("fr");
    expect(config.labels.validated).toBe("validated");
    expect(config.commands.fix).toBe("/corrige");
  });

  it("tous les prompts utilisés existent et sont non vides", () => {
    for (const name of PROMPTS) {
      expect(loadPrompt(name).trim().length).toBeGreaterThan(20);
    }
  });

  it("loadPrompt remplace les variables {{...}}", () => {
    const out = loadPrompt("answer-pr.user", {
      prTitle: "Mon titre",
      prBody: "B",
      comments: "C",
    });
    expect(out).toContain("Mon titre");
    expect(out).not.toContain("{{prTitle}}");
  });

  it("le prompt create-next-issue oriente vers les matières du programme (CP à CM2)", () => {
    const sys = loadPrompt("create-next-issue.system");
    expect(sys).toContain("matières du programme");
    expect(sys).toContain("CP");
    expect(sys).toContain("CM2");
  });
});
