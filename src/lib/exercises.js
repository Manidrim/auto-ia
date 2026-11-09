const ADDITIONS = "additions";
const SOUSTRACTIONS = "soustractions";
const MULTIPLICATIONS = "multiplications";
const DIVISIONS = "divisions";

const LEVELS = {
  [ADDITIONS]: { min: 1, max: 20, label: "Additions" },
  [SOUSTRACTIONS]: { min: 1, max: 20, label: "Soustractions" },
  [MULTIPLICATIONS]: { min: 1, max: 10, label: "Multiplications" },
  [DIVISIONS]: { min: 1, max: 20, label: "Divisions" },
};

const CLASSES = {
  CP: {
    min: 1,
    max: 100,
    allowedModes: [ADDITIONS, SOUSTRACTIONS],
    label: "CP",
  },
  CE1: {
    min: 1,
    max: 100,
    allowedModes: [ADDITIONS, SOUSTRACTIONS, MULTIPLICATIONS],
    label: "CE1",
  },
  CE2: {
    min: 1,
    max: 1000,
    allowedModes: [ADDITIONS, SOUSTRACTIONS, MULTIPLICATIONS, DIVISIONS],
    label: "CE2",
  },
  CM1: {
    min: 1,
    max: 10000,
    allowedModes: [ADDITIONS, SOUSTRACTIONS, MULTIPLICATIONS, DIVISIONS],
    label: "CM1",
  },
  CM2: {
    min: 1,
    max: 1000000,
    allowedModes: [ADDITIONS, SOUSTRACTIONS, MULTIPLICATIONS, DIVISIONS],
    label: "CM2",
  },
};

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeExercise(mode, classe = CLASSES.CE2) {
  const { min, max, allowedModes } = classe;

  if (!allowedModes.includes(mode)) {
    throw new Error(`Le mode ${mode} n'est pas autorisé pour la classe ${classe.label}`);
  }

  const effectiveMin = min;
  const effectiveMax = max;

  if (mode === ADDITIONS) {
    const a = randomInt(effectiveMin, effectiveMax);
    const b = randomInt(effectiveMin, effectiveMax);
    return { question: `${a} + ${b}`, answer: a + b };
  }
  if (mode === SOUSTRACTIONS) {
    const a = randomInt(effectiveMin, effectiveMax);
    const b = randomInt(effectiveMin, a);
    return { question: `${a} - ${b}`, answer: a - b };
  }
  if (mode === MULTIPLICATIONS) {
    const a = randomInt(effectiveMin, effectiveMax);
    const b = randomInt(1, 10); // Tables de multiplication de 1 à 10
    return { question: `${a} × ${b}`, answer: a * b };
  }
  if (mode === DIVISIONS) {
    const b = randomInt(1, Math.min(20, Math.floor(effectiveMax / 2)));
    const result = randomInt(1, Math.min(20, Math.floor(effectiveMax / b)));
    const a = b * result;
    return { question: `${a} ÷ ${b}`, answer: result };
  }
  throw new Error(`Mode inconnu : ${mode}`);
}

export { ADDITIONS, SOUSTRACTIONS, MULTIPLICATIONS, DIVISIONS, LEVELS, CLASSES, makeExercise, randomInt };