import {
  PERIODES,
  DATES,
  EVENEMENTS,
  HISTORY_LEVELS,
  makeHistoryExercise,
} from "./exercises/history";

const ADDITIONS = "additions";
const SOUSTRACTIONS = "soustractions";
const MULTIPLICATIONS = "multiplications";
const DIVISIONS = "divisions";

const MATIERES = {
  [ADDITIONS]: { label: "Additions" },
  [SOUSTRACTIONS]: { label: "Soustractions" },
  [MULTIPLICATIONS]: { label: "Multiplications" },
  [DIVISIONS]: { label: "Divisions" },
  ...HISTORY_LEVELS,
};

const NIVEAUX = {
  CP: {
    min: 1,
    max: 100,
    matieres: [ADDITIONS, SOUSTRACTIONS, PERIODES],
    label: "CP",
  },
  CE1: {
    min: 1,
    max: 100,
    matieres: [ADDITIONS, SOUSTRACTIONS, MULTIPLICATIONS, PERIODES, DATES],
    label: "CE1",
  },
  CE2: {
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
    label: "CE2",
  },
  CM1: {
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
    label: "CM1",
  },
  CM2: {
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
    label: "CM2",
  },
};

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const GENERATEURS = {
  [ADDITIONS]: (niveau) => {
    const a = randomInt(niveau.min, niveau.max);
    const b = randomInt(niveau.min, niveau.max);
    return { question: `${a} + ${b}`, answer: a + b };
  },
  [SOUSTRACTIONS]: (niveau) => {
    const a = randomInt(niveau.min, niveau.max);
    const b = randomInt(niveau.min, a);
    return { question: `${a} - ${b}`, answer: a - b };
  },
  [MULTIPLICATIONS]: (niveau) => {
    const a = randomInt(niveau.min, niveau.max);
    const b = randomInt(1, 10);
    return { question: `${a} × ${b}`, answer: a * b };
  },
  [DIVISIONS]: (niveau) => {
    const b = randomInt(1, Math.min(20, Math.floor(niveau.max / 2)));
    const result = randomInt(1, Math.min(20, Math.floor(niveau.max / b)));
    const a = b * result;
    return { question: `${a} ÷ ${b}`, answer: result };
  },
  [PERIODES]: (niveau) => makeHistoryExercise(PERIODES, niveau),
  [DATES]: (niveau) => makeHistoryExercise(DATES, niveau),
  [EVENEMENTS]: (niveau) => makeHistoryExercise(EVENEMENTS, niveau),
};

function makeExercise(matiere, niveau = NIVEAUX.CE2) {
  if (!niveau.matieres.includes(matiere)) {
    throw new Error(
      `La matière ${matiere} n'est pas autorisée pour le niveau ${niveau.label}`,
    );
  }
  const generate = GENERATEURS[matiere];
  if (!generate) {
    throw new Error(`Matière inconnue : ${matiere}`);
  }
  return generate(niveau);
}

export {
  ADDITIONS,
  SOUSTRACTIONS,
  MULTIPLICATIONS,
  DIVISIONS,
  PERIODES,
  DATES,
  EVENEMENTS,
  MATIERES,
  NIVEAUX,
  makeExercise,
  randomInt,
};
