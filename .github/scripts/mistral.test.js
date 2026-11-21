import { describe, it, expect } from "vitest";
import { extractJson } from "./mistral.js";

describe("extractJson", () => {
  it("parse un JSON brut", () => {
    expect(extractJson('{"title": "a", "body": "b"}')).toEqual({
      title: "a",
      body: "b",
    });
  });

  it("parse un bloc ```json", () => {
    const text = 'Voici le résultat :\n```json\n{"files": []}\n```\nFin.';
    expect(extractJson(text)).toEqual({ files: [] });
  });

  it("parse un bloc de code sans étiquette", () => {
    const text = '```\n{"a": 1}\n```';
    expect(extractJson(text)).toEqual({ a: 1 });
  });

  it("parse un bloc de code avec une autre étiquette s'il contient du JSON", () => {
    const text = '```bash\n{"a": 2}\n```';
    expect(extractJson(text)).toEqual({ a: 2 });
  });

  it("ignore les accolades présentes dans les chaînes", () => {
    expect(extractJson('{"a": "}{", "b": "{"}')).toEqual({ a: "}{", b: "{" });
  });

  it("gère le double encodage (chaîne JSON contenant du JSON échappé)", () => {
    const inner = JSON.stringify({
      files: [{ path: "a.js", content: "const x = 1;\n" }],
    });
    expect(extractJson(JSON.stringify(inner))).toEqual({
      files: [{ path: "a.js", content: "const x = 1;\n" }],
    });
  });

  it("gère les échappements littéraux (backslash-n littéral)", () => {
    const text = String.raw`{\n  \"title\": \"a\",\n  \"body\": \"ligne1\\nligne2\"\n}`;
    expect(extractJson(text)).toEqual({ title: "a", body: "ligne1\nligne2" });
  });

  it("extrait le JSON noyé dans du texte", () => {
    const text = 'Réponse : {"ok": true} et voilà.';
    expect(extractJson(text)).toEqual({ ok: true });
  });

  it("lève une erreur quand il n'y a aucun JSON", () => {
    expect(() => extractJson("```bash\nnpm install\nnpm test\n```")).toThrow(
      /Pas de JSON valide/,
    );
  });
});
