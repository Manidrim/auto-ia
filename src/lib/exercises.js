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

const DIFFICULTY_LEVELS = {
  EASY: { min: 1, max: 10, label: "Facile" },
  MEDIUM: { min: 1, max: 50, label: "Moyen" },
  HARD: { min: 1, max: 100, label: "Difficile" },
};

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeExercise(mode, difficulty = DIFFICULTY_LEVELS.MEDIUM) {
  const { min, max } = LEVELS[mode];
  const { min: diffMin, max: diffMax } = difficulty;
  
  // Appliquer les bornes de difficulté
  const effectiveMin = Math.max(min, diffMin);
  const effectiveMax = Math.min(max, diffMax);
  
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
    const b = randomInt(effectiveMin, effectiveMax);
    return { question: `${a} × ${b}`, answer: a * b };
  }
  if (mode === DIVISIONS) {
    const b = randomInt(effectiveMin, effectiveMax);
    const result = randomInt(effectiveMin, effectiveMax);
    const a = b * result;
    return { question: `${a} ÷ ${b}`, answer: result };
  }
  throw new Error(`Mode inconnu : ${mode}`);
}

export { ADDITIONS, SOUSTRACTIONS, MULTIPLICATIONS, DIVISIONS, LEVELS, DIFFICULTY_LEVELS, makeExercise, randomInt };