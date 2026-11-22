import { describe, it, expect, beforeEach } from "vitest";
import { createLocalStorageProgress } from "./localStorageProgress";

beforeEach(() => {
  localStorage.clear();
});

describe("createLocalStorageProgress", () => {
  it("retourne 0 quand rien n'est stocké", () => {
    expect(createLocalStorageProgress().getPoints()).toBe(0);
  });

  it("persiste et relit les points via localStorage", () => {
    const progress = createLocalStorageProgress();
    progress.savePoints(42);
    expect(localStorage.getItem("quizPoints")).toBe("42");
    expect(createLocalStorageProgress().getPoints()).toBe(42);
  });

  it("accepte un storage injecté", () => {
    const store = new Map();
    const storage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, v),
    };
    const progress = createLocalStorageProgress(storage);
    progress.savePoints(7);
    expect(progress.getPoints()).toBe(7);
  });
});
