import {
  ADDITIONS,
  SOUSTRACTIONS,
  MULTIPLICATIONS,
  DIVISIONS,
  PERIODES,
  DATES,
  EVENEMENTS,
} from "./matiere.js";

export const NIVEAUX = {
  CP: {
    label: "CP",
    min: 1,
    max: 100,
    matieres: [ADDITIONS, SOUSTRACTIONS, PERIODES],
  },
  CE1: {
    label: "CE1",
    min: 1,
    max: 100,
    matieres: [ADDITIONS, SOUSTRACTIONS, MULTIPLICATIONS, PERIODES, DATES],
  },
  CE2: {
    label: "CE2",
    min: 1,
    max: 1000,
    matieres: [
      ADDITIONS,
      SOUSTRACTIONS,
      MULTIPLICATIONS,
      DIVISIONS,
      PERIODES,
      DATES,
      EVENEMENTS,
    ],
  },
  CM1: {
    label: "CM1",
    min: 1,
    max: 10000,
    matieres: [
      ADDITIONS,
      SOUSTRACTIONS,
      MULTIPLICATIONS,
      DIVISIONS,
      PERIODES,
      DATES,
      EVENEMENTS,
    ],
  },
  CM2: {
    label: "CM2",
    min: 1,
    max: 1000000,
    matieres: [
      ADDITIONS,
      SOUSTRACTIONS,
      MULTIPLICATIONS,
      DIVISIONS,
      PERIODES,
      DATES,
      EVENEMENTS,
    ],
  },
};

export const NIVEAUX_LIST = Object.values(NIVEAUX);
