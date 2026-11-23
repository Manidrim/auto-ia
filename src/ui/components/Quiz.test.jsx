import { describe, it, expect, beforeEach, vi } from "vitest";
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

function answerCurrentQuestionCorrectly() {
  const [a, b] = questionText().split(" + ").map(Number);
  fireEvent.change(screen.getByLabelText("Ta réponse"), {
    target: { value: String(a + b) },
  });
  fireEvent.click(screen.getByRole("button", { name: "Valider" }));
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
    answerCurrentQuestionCorrectly();
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

  it("ne compte pas une réponse vide comme correcte", () => {
    render(
      <Quiz
        matiere={ADDITIONS}
        niveau={NIVEAUX.CP}
        onExit={() => {}}
        rand={createRand(7)}
        progress={memoryProgress()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Valider" }));
    const [a, b] = questionText().split(" + ").map(Number);
    expect(
      screen.getByText(`❌ La réponse était ${a + b}`),
    ).toBeInTheDocument();
  });

  it("affiche l'écran de résultat après 10 questions", () => {
    const progress = memoryProgress();
    render(
      <Quiz
        matiere={ADDITIONS}
        niveau={NIVEAUX.CP}
        onExit={() => {}}
        rand={createRand(11)}
        progress={progress}
      />,
    );
    for (let i = 0; i < 10; i++) {
      answerCurrentQuestionCorrectly();
      fireEvent.click(
        screen.getByRole("button", { name: "Question suivante" }),
      );
    }
    expect(screen.getByText(/10 bonnes réponses sur 10/)).toBeInTheDocument();
    expect(progress.getPoints()).toBe(100);
  });

  it("appelle onExit directement sur Annuler sans réponse en cours", () => {
    const onExit = vi.fn();
    render(
      <Quiz
        matiere={ADDITIONS}
        niveau={NIVEAUX.CP}
        onExit={onExit}
        rand={createRand(7)}
        progress={memoryProgress()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("demande confirmation sur Annuler après une réponse", () => {
    const onExit = vi.fn();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(
      <Quiz
        matiere={ADDITIONS}
        niveau={NIVEAUX.CP}
        onExit={onExit}
        rand={createRand(7)}
        progress={memoryProgress()}
      />,
    );
    answerCurrentQuestionCorrectly();
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(confirmSpy).toHaveBeenCalled();
    expect(onExit).not.toHaveBeenCalled();
    confirmSpy.mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(onExit).toHaveBeenCalledTimes(1);
    confirmSpy.mockRestore();
  });

  it("persiste les points via l'adaptateur localStorage par défaut", () => {
    const { unmount } = render(
      <Quiz
        matiere={ADDITIONS}
        niveau={NIVEAUX.CP}
        onExit={() => {}}
        rand={createRand(7)}
      />,
    );
    answerCurrentQuestionCorrectly();
    expect(localStorage.getItem("quizPoints")).toBe("10");
    unmount();
    render(
      <Quiz
        matiere={ADDITIONS}
        niveau={NIVEAUX.CP}
        onExit={() => {}}
        rand={createRand(7)}
      />,
    );
    expect(screen.getByText(/Points : 10/)).toBeInTheDocument();
  });
});
