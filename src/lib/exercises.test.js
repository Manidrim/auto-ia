import { describe, it, expect } from "vitest";
import {
  ADDITIONS,
  SOUSTRACTIONS,
  MULTIPLICATIONS,
  makeExercise,
  randomInt,
} from "./exercises";

describe("randomInt", () => {
  it("reste dans les bornes", () => {
    for (let i = 0; i < 100; i++) {
      const n = randomInt(1, 10);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(10);
    }
  });
});

describe("makeExercise", () => {
  it("génère une addition correcte", () => {
    const ex = makeExercise(ADDITIONS);
    const [a, b] = ex.question.split(" + ").map(Number);
    expect(ex.answer).toBe(a + b);
  });

  it("génère une soustraction avec un résultat positif", () => {
    const ex = makeExercise(SOUSTRACTIONS);
    const [a, b] = ex.question.split(" - ").map(Number);
    expect(ex.answer).toBe(a - b);
    expect(ex.answer).toBeGreaterThanOrEqual(0);
  });

  it("génère une multiplication correcte", () => {
    const ex = makeExercise(MULTIPLICATIONS);
    const [a, b] = ex.question.split(" × ").map(Number);
    expect(ex.answer).toBe(a * b);
  });

  it("rejette un mode inconnu", () => {
    expect(() => makeExercise("inconnu")).toThrow();
  });
});
