import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Quiz from "./Quiz";
import { NIVEAUX } from "../../domain/niveau";
import { ADDITIONS, PERIODES } from "../../domain/matiere";
import { HISTORY_PERIODS } from "../../domain/content/histoire";
import { createRand } from "../../infrastructure/rng";

function memoryProgress() {
  let points = 0;
  return {
    getPoints: () => points,
    savePoints: (p) => {
      points = p;
    },
  };
}

function questionText() {
  return screen.getByText(/= \?$/).textContent.replace(" = ?", "");
}

beforeEach(() => {
  localStorage.clear();
});

describe("Quiz", () => {
  it("valide une bonne réponse numérique et crédite les points via le port", () => {
    const progress = memoryProgress();
    render(
      <Quiz
        matiere={ADDITIONS}
        niveau={NIVEAUX.CP}
        onExit={() => {}}
        rand={createRand(7)}
        progress={progress}
      />,
    );
    const [a, b] = questionText().split(" + ").map(Number);
    fireEvent.change(screen.getByLabelText("Ta réponse"), {
      target: { value: String(a + b) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Valider" }));
    expect(screen.getByText(/Bravo/)).toBeInTheDocument();
    expect(progress.getPoints()).toBe(10);
  });

  it("accepte une réponse textuelle (histoire)", () => {
    render(
      <Quiz
        matiere={PERIODES}
        niveau={NIVEAUX.CP}
        onExit={() => {}}
        rand={createRand(3)}
        progress={memoryProgress()}
      />,
    );
    const period = HISTORY_PERIODS.find((p) => p.name === questionText());
    expect(period).toBeDefined();
    fireEvent.change(screen.getByLabelText("Ta réponse"), {
      target: { value: period.date },
    });
    fireEvent.click(screen.getByRole("button", { name: "Valider" }));
    expect(screen.getByText(/Bravo/)).toBeInTheDocument();
  });

  it("signale une mauvaise réponse en affichant la bonne réponse", () => {
    render(
      <Quiz
        matiere={ADDITIONS}
        niveau={NIVEAUX.CP}
        onExit={() => {}}
        rand={createRand(7)}
        progress={memoryProgress()}
      />,
    );
    const [a, b] = questionText().split(" + ").map(Number);
    fireEvent.change(screen.getByLabelText("Ta réponse"), {
      target: { value: String(a + b + 1) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Valider" }));
    expect(
      screen.getByText(`❌ La réponse était ${a + b}`),
    ).toBeInTheDocument();
  });
});
