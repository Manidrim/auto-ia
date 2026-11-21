import { makeExercise } from "../domain/exercice.js";

export const TOTAL_QUESTIONS = 10;
export const POINTS_CORRECT = 10;
export const POINTS_INCORRECT = -5;

export function isCorrect(exercise, value) {
  return typeof exercise.answer === "number"
    ? Number(value) === exercise.answer
    : value.trim() === String(exercise.answer);
}

export function createSession({
  matiere,
  niveau,
  rand = Math.random,
  total = TOTAL_QUESTIONS,
  points = 0,
}) {
  return {
    matiere,
    niveau,
    rand,
    total,
    points,
    count: 0,
    score: 0,
    answers: [],
    lastResult: null,
    exercise: makeExercise(matiere, niveau, rand),
  };
}

export function applyAnswer(session, value) {
  const ok = isCorrect(session.exercise, value);
  return {
    ...session,
    score: ok ? session.score + 1 : session.score,
    points: ok
      ? session.points + POINTS_CORRECT
      : session.points + POINTS_INCORRECT,
    answers: [...session.answers, ok],
    lastResult: ok,
  };
}

export function nextQuestion(session) {
  const count = session.count + 1;
  return {
    ...session,
    count,
    lastResult: null,
    exercise:
      count < session.total
        ? makeExercise(session.matiere, session.niveau, session.rand)
        : session.exercise,
  };
}
