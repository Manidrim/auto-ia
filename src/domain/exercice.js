import { MATIERES } from "./matiere.js";
import { NIVEAUX } from "./niveau.js";

export function makeExercise(
  matiere,
  niveau = NIVEAUX.CE2,
  rand = Math.random,
) {
  if (!niveau.matieres.includes(matiere)) {
    throw new Error(
      `La matière ${matiere} n'est pas autorisée pour le niveau ${niveau.label}`,
    );
  }
  const subject = MATIERES[matiere];
  if (!subject) {
    throw new Error(`Matière inconnue : ${matiere}`);
  }
  return subject.generate(niveau, rand);
}
