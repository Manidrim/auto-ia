import { randomInt } from "./random.js";
import {
  PERIODES,
  DATES,
  EVENEMENTS,
  CARACTERISTIQUES,
  HISTORY_MATIERES,
  makeHistoryExercise,
} from "./content/histoire.js";

export const ADDITIONS = "additions";
export const SOUSTRACTIONS = "soustractions";
export const MULTIPLICATIONS = "multiplications";
export const DIVISIONS = "divisions";

export { PERIODES, DATES, EVENEMENTS, CARACTERISTIQUES };

export const MATIERES = {
  [ADDITIONS]: {
    label: "Additions",
    generate: (niveau, rand) => {
      const a = randomInt(niveau.min, niveau.max, rand);
      const b = randomInt(niveau.min, niveau.max, rand);
      return { question: `${a} + ${b}`, answer: a + b };
    },
  },
  [SOUSTRACTIONS]: {
    label: "Soustractions",
    generate: (niveau, rand) => {
      const a = randomInt(niveau.min, niveau.max, rand);
      const b = randomInt(niveau.min, a, rand);
      return { question: `${a} - ${b}`, answer: a - b };
    },
  },
  [MULTIPLICATIONS]: {
    label: "Multiplications",
    generate: (niveau, rand) => {
      const a = randomInt(niveau.min, niveau.max, rand);
      const b = randomInt(1, 10, rand);
      return { question: `${a} × ${b}`, answer: a * b };
    },
  },
  [DIVISIONS]: {
    label: "Divisions",
    generate: (niveau, rand) => {
      const b = randomInt(1, Math.min(20, Math.floor(niveau.max / 2)), rand);
      const result = randomInt(
        1,
        Math.min(20, Math.floor(niveau.max / b)),
        rand,
      );
      const a = b * result;
      return { question: `${a} ÷ ${b}`, answer: result };
    },
  },
  [PERIODES]: {
    label: HISTORY_MATIERES[PERIODES].label,
    generate: (niveau, rand) => makeHistoryExercise(PERIODES, niveau, rand),
  },
  [DATES]: {
    label: HISTORY_MATIERES[DATES].label,
    generate: (niveau, rand) => makeHistoryExercise(DATES, niveau, rand),
  },
  [EVENEMENTS]: {
    label: HISTORY_MATIERES[EVENEMENTS].label,
    generate: (niveau, rand) => makeHistoryExercise(EVENEMENTS, niveau, rand),
  },
  [CARACTERISTIQUES]: {
    label: HISTORY_MATIERES[CARACTERISTIQUES].label,
    generate: (niveau, rand) => makeHistoryExercise(CARACTERISTIQUES, niveau, rand),
  },
};