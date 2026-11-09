import { describe, it, expect } from "vitest";
import {
  ADDITIONS,
  SOUSTRACTIONS,
  MULTIPLICATIONS,
  DIVISIONS,
  makeExercise,
  randomInt,
  CLASSES,
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
  describe("CP", () => {
    it("autorise uniquement additions et soustractions", () => {
      expect(() => makeExercise(MULTIPLICATIONS, CLASSES.CP)).toThrow();
      expect(() => makeExercise(DIVISIONS, CLASSES.CP)).toThrow();
      expect(() => makeExercise(ADDITIONS, CLASSES.CP)).not.toThrow();
      expect(() => makeExercise(SOUSTRACTIONS, CLASSES.CP)).not.toThrow();
    });

    it("génère une addition correcte avec nombres jusqu'à 100", () => {
      const ex = makeExercise(ADDITIONS, CLASSES.CP);
      const [a, b] = ex.question.split(" + ").map(Number);
      expect(ex.answer).toBe(a + b);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(100);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(100);
    });

    it("génère une soustraction avec un résultat positif", () => {
      const ex = makeExercise(SOUSTRACTIONS, CLASSES.CP);
      const [a, b] = ex.question.split(" - ").map(Number);
      expect(ex.answer).toBe(a - b);
      expect(ex.answer).toBeGreaterThanOrEqual(0);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(100);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(a);
    });
  });

  describe("CE1", () => {
    it("autorise additions, soustractions et multiplications", () => {
      expect(() => makeExercise(ADDITIONS, CLASSES.CE1)).not.toThrow();
      expect(() => makeExercise(SOUSTRACTIONS, CLASSES.CE1)).not.toThrow();
      expect(() => makeExercise(MULTIPLICATIONS, CLASSES.CE1)).not.toThrow();
      expect(() => makeExercise(DIVISIONS, CLASSES.CE1)).toThrow();
    });

    it("génère une multiplication avec tables de 1 à 10", () => {
      const ex = makeExercise(MULTIPLICATIONS, CLASSES.CE1);
      const [a, b] = ex.question.split(" × ").map(Number);
      expect(ex.answer).toBe(a * b);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(10);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(100);
    });
  });

  describe("CE2", () => {
    it("autorise toutes les opérations", () => {
      expect(() => makeExercise(ADDITIONS, CLASSES.CE2)).not.toThrow();
      expect(() => makeExercise(SOUSTRACTIONS, CLASSES.CE2)).not.toThrow();
      expect(() => makeExercise(MULTIPLICATIONS, CLASSES.CE2)).not.toThrow();
      expect(() => makeExercise(DIVISIONS, CLASSES.CE2)).not.toThrow();
    });

    it("génère une division simple", () => {
      const ex = makeExercise(DIVISIONS, CLASSES.CE2);
      const [a, b] = ex.question.split(" ÷ ").map(Number);
      expect(ex.answer).toBe(a / b);
      expect(Number.isInteger(ex.answer)).toBe(true);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(1000);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThanOrEqual(20);
    });
  });

  describe("CM1", () => {
    it("autorise toutes les opérations avec nombres jusqu'à 10000", () => {
      const exAdd = makeExercise(ADDITIONS, CLASSES.CM1);
      const [aAdd, bAdd] = exAdd.question.split(" + ").map(Number);
      expect(aAdd).toBeGreaterThanOrEqual(1);
      expect(aAdd).toBeLessThanOrEqual(10000);
      expect(bAdd).toBeGreaterThanOrEqual(1);
      expect(bAdd).toBeLessThanOrEqual(10000);

      const exMul = makeExercise(MULTIPLICATIONS, CLASSES.CM1);
      const [aMul, bMul] = exMul.question.split(" × ").map(Number);
      expect(aMul).toBeGreaterThanOrEqual(1);
      expect(aMul).toBeLessThanOrEqual(10000);
      expect(bMul).toBeGreaterThanOrEqual(1);
      expect(bMul).toBeLessThanOrEqual(10000);
    });
  });

  describe("CM2", () => {
    it("autorise toutes les opérations avec grands nombres", () => {
      const exAdd = makeExercise(ADDITIONS, CLASSES.CM2);
      const [aAdd, bAdd] = exAdd.question.split(" + ").map(Number);
      expect(aAdd).toBeGreaterThanOrEqual(1);
      expect(aAdd).toBeLessThanOrEqual(1000000);
      expect(bAdd).toBeGreaterThanOrEqual(1);
      expect(bAdd).toBeLessThanOrEqual(1000000);

      const exDiv = makeExercise(DIVISIONS, CLASSES.CM2);
      const [aDiv, bDiv] = exDiv.question.split(" ÷ ").map(Number);
      expect(aDiv).toBeGreaterThanOrEqual(1);
      expect(aDiv).toBeLessThanOrEqual(1000000);
      expect(bDiv).toBeGreaterThanOrEqual(1);
      expect(bDiv).toBeLessThanOrEqual(20);
    });
  });

  it("rejette un mode non autorisé pour une classe", () => {
    expect(() => makeExercise(MULTIPLICATIONS, CLASSES.CP)).toThrow();
    expect(() => makeExercise(DIVISIONS, CLASSES.CE1)).toThrow();
  });
});