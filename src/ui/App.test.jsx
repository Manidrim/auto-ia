import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
});

describe("App — parcours niveau → matière → quiz", () => {
  it("affiche les cinq niveaux au démarrage", () => {
    render(<App />);
    for (const label of ["CP", "CE1", "CE2", "CM1", "CM2"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("affiche les matières du niveau choisi, dont l'histoire selon le niveau", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "CP" }));
    expect(screen.getByText(/Niveau :/)).toHaveTextContent("CP");
    expect(
      screen.getByRole("button", { name: "Périodes historiques" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Dates clés" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Changer de niveau" }));
    fireEvent.click(screen.getByRole("button", { name: "CE2" }));
    expect(
      screen.getByRole("button", { name: "Événements historiques" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Additions" }),
    ).toBeInTheDocument();
  });

  it("ouvre le quiz après le choix de la matière", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "CM2" }));
    fireEvent.click(screen.getByRole("button", { name: "Additions" }));
    expect(screen.getByText(/= \?$/)).toBeInTheDocument();
    expect(screen.getByLabelText("Ta réponse")).toBeInTheDocument();
  });
});
