const ADDITIONS = "additions";
const SOUSTRACTIONS = "soustractions";
const MULTIPLICATIONS = "multiplications";

const LEVELS = {
  [ADDITIONS]: { min: 1, max: 20, label: "Additions" },
  [SOUSTRACTIONS]: { min: 1, max: 20, label: "Soustractions" },
  [MULTIPLICATIONS]: { min: 1, max: 10, label: "Multiplications" },
};

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeExercise(mode) {
  const { min, max } = LEVELS[mode];
  if (mode === ADDITIONS) {
    const a = randomInt(min, max);
    const b = randomInt(min, max);
    return { question: `${a} + ${b}`, answer: a + b };
  }
  if (mode === SOUSTRACTIONS) {
    const a = randomInt(min, max);
    const b = randomInt(min, a);
    return { question: `${a} - ${b}`, answer: a - b };
  }
  if (mode === MULTIPLICATIONS) {
    const a = randomInt(min, max);
    const b = randomInt(min, max);
    return { question: `${a} × ${b}`, answer: a * b };
  }
  throw new Error(`Mode inconnu : ${mode}`);
}

export { ADDITIONS, SOUSTRACTIONS, MULTIPLICATIONS, LEVELS, makeExercise, randomInt };
