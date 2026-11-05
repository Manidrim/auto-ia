import { describe, it, expect } from "vitest";
import {
  ADDITIONS,
  SOUSTRACTIONS,
  MULTIPLICATIONS,
  DIVISIONS,
  makeExercise,
  randomInt,
  DIFFICULTY_LEVELS,
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

  it("génère une division correcte", () => {
    const ex = makeExercise(DIVISIONS);
    const [a, b] = ex.question.split(" ÷ ").map(Number);
    expect(ex.answer).toBe(a / b);
    expect(Number.isInteger(ex.answer)).toBe(true);
  });

  it("rejette un mode inconnu", () => {
    expect(() => makeExercise("inconnu")).toThrow();
  });

  describe("niveaux de difficulté", () => {
    it("facile limite les nombres à 1-10 pour additions", () => {
      const ex = makeExercise(ADDITIONS, DIFFICULTY_LEVELS.EASY);
      const [a, b] = ex.question.split(" + ").map(Number);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(10);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(10);
    });

    it("moyen limite les nombres à 1-50 pour additions", () => {
      const ex = makeExercise(ADDITIONS, DIFFICULTY_LEVELS.MEDIUM);
      const [a, b] = ex.question.split(" + ").map(Number);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(50);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(50);
    });

    it("difficile limite les nombres à 1-100 pour additions", () => {
      const ex = makeExercise(ADDITIONS, DIFFICULTY_LEVELS.HARD);
      const [a, b] = ex.question.split(" + ").map(Number);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(100);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(100);
    });

    it("respecte les limites de mode pour multiplications", () => {
      const exEasy = makeExercise(MULTIPLICATIONS, DIFFICULTY_LEVELS.EASY);
      const [aEasy, bEasy] = exEasy.question.split(" × ").map(Number);
      expect(aEasy).toBeGreaterThanOrEqual(1);
      expect(aEasy).toBeLessThanOrEqual(10);
      expect(bEasy).toBeGreaterThanOrEqual(1);
      expect(bEasy).toBeLessThanOrEqual(10);

      const exHard = makeExercise(MULTIPLICATIONS, DIFFICULTY_LEVELS.HARD);
      const [aHard, bHard] = exHard.question.split(" × ").map(Number);
      expect(aHard).toBeGreaterThanOrEqual(1);
      expect(aHard).toBeLessThanOrEqual(10);
      expect(bHard).toBeGreaterThanOrEqual(1);
      expect(bHard).toBeLessThanOrEqual(10);
    });

    it("respecte les limites de mode pour divisions", () => {
      const exEasy = makeExercise(DIVISIONS, DIFFICULTY_LEVELS.EASY);
      const [aEasy, bEasy] = exEasy.question.split(" ÷ ").map(Number);
      expect(bEasy).toBeGreaterThanOrEqual(1);
      expect(bEasy).toBeLessThanOrEqual(10);
      expect(aEasy / bEasy).toBeGreaterThanOrEqual(1);
      expect(aEasy / bEasy).toBeLessThanOrEqual(10);

      const exHard = makeExercise(DIVISIONS, DIFFICULTY_LEVELS.HARD);
      const [aHard, bHard] = exHard.question.split(" ÷ ").map(Number);
      expect(bHard).toBeGreaterThanOrEqual(1);
      expect(bHard).toBeLessThanOrEqual(20);
      expect(aHard / bHard).toBeGreaterThanOrEqual(1);
      expect(aHard / bHard).toBeLessThanOrEqual(20);
    });
  });
});