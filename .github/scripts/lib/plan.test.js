import { describe, it, expect, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validatePlan, obtainPlan, applyPlanFiles } from "./plan.js";
import { buildExtensionRegex } from "./repo-snapshot.js";

const fileContents = { "src/a.js": "ancien contenu" };

describe("validatePlan", () => {
  it("accepte un plan valide avec un vrai changement", () => {
    const plan = { files: [{ path: "src/a.js", content: "nouveau contenu" }] };
    expect(validatePlan(plan, fileContents).files).toHaveLength(1);
  });

  it("rejette un plan sans tableau files", () => {
    expect(() => validatePlan({}, fileContents)).toThrow(/files/);
    expect(() => validatePlan({ files: [] }, fileContents)).toThrow(/files/);
  });

  it("retire les fichiers .github/workflows/ du plan", () => {
    const plan = {
      files: [
        { path: ".github/workflows/ci.yml", content: "x" },
        { path: "src/a.js", content: "nouveau contenu" },
      ],
    };
    const result = validatePlan(plan, fileContents);
    expect(result.files.map((f) => f.path)).toEqual(["src/a.js"]);
  });

  it("rejette un plan ne contenant que des workflows", () => {
    const plan = {
      files: [{ path: ".github/workflows/ci.yml", content: "x" }],
    };
    expect(() => validatePlan(plan, fileContents)).toThrow(/interdits/);
  });

  it("rejette les chemins dangereux ou fictifs", () => {
    expect(() =>
      validatePlan(
        { files: [{ path: "/etc/passwd", content: "x" }] },
        fileContents,
      ),
    ).toThrow(/invalide/);
    expect(() =>
      validatePlan(
        { files: [{ path: "src/../secret", content: "x" }] },
        fileContents,
      ),
    ).toThrow(/invalide/);
    expect(() =>
      validatePlan(
        { files: [{ path: "chemin/exemple.js", content: "x" }] },
        fileContents,
      ),
    ).toThrow(/invalide/);
  });

  it("rejette un plan sans aucun changement réel", () => {
    const plan = { files: [{ path: "src/a.js", content: "ancien contenu" }] };
    expect(() => validatePlan(plan, fileContents)).toThrow(/réellement modifi/);
  });
});

describe("obtainPlan", () => {
  it("réessaie jusqu'à obtenir un plan valide", async () => {
    const chatJson = vi
      .fn()
      .mockRejectedValueOnce(new Error("pas de JSON"))
      .mockResolvedValueOnce({
        files: [{ path: "src/a.js", content: "nouveau contenu" }],
      });
    const conversation = [{ role: "user", content: "go" }];
    const plan = await obtainPlan(conversation, chatJson, fileContents);
    expect(plan.files).toHaveLength(1);
    expect(chatJson).toHaveBeenCalledTimes(2);
    expect(conversation).toHaveLength(2);
  });

  it("lève la dernière erreur après épuisement des tentatives", async () => {
    const chatJson = vi.fn().mockRejectedValue(new Error("toujours faux"));
    await expect(obtainPlan([], chatJson, fileContents, 2)).rejects.toThrow(
      "toujours faux",
    );
    expect(chatJson).toHaveBeenCalledTimes(2);
  });
});

describe("applyPlanFiles", () => {
  it("écrit les fichiers du plan dans un répertoire temporaire", () => {
    const dir = mkdtempSync(join(tmpdir(), "plan-"));
    const prev = process.cwd();
    process.chdir(dir);
    try {
      applyPlanFiles([{ path: "src/nouveau.js", content: "const x = 1;\n" }]);
      expect(readFileSync(join(dir, "src/nouveau.js"), "utf8")).toBe(
        "const x = 1;\n",
      );
    } finally {
      process.chdir(prev);
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("buildExtensionRegex", () => {
  it("filtre les extensions de config.json", () => {
    const re = buildExtensionRegex([".jsx", ".js", ".css", ".html", ".json"]);
    expect(re.test("src/App.jsx")).toBe(true);
    expect(re.test("src/lib/exercises.js")).toBe(true);
    expect(re.test("README.md")).toBe(false);
    expect(re.test("archive.jsx.bak")).toBe(false);
  });
});
