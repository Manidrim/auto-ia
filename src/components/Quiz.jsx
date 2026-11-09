import { useEffect, useMemo, useState } from "react";
import { makeExercise } from "../lib/exercises";

const TOTAL = 10;
const POINTS_CORRECT = 10;
const POINTS_INCORRECT = -5;

const CONFIRMATION_MESSAGE = "Toutes tes réponses seront perdues. Es-tu sûr de vouloir annuler ?";

export default function Quiz({ mode, classe, onExit }) {
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(0);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [points, setPoints] = useState(() => {
    const savedPoints = localStorage.getItem('quizPoints');
    return savedPoints ? parseInt(savedPoints, 10) : 0;
  });
  const [hasAnswered, setHasAnswered] = useState(false);
  const exercise = useMemo(() => makeExercise(mode, classe), [mode, classe, count]);

  useEffect(() => {
    setValue("");
    setFeedback(null);
    setShowFeedback(false);
    setHasAnswered(false);
  }, [count]);

  useEffect(() => {
    localStorage.setItem('quizPoints', points.toString());
  }, [points]);

  function submit(e) {
    e.preventDefault();
    if (feedback !== null) return;
    const ok = Number(value) === exercise.answer;
    setFeedback(ok);
    setShowFeedback(true);
    setHasAnswered(true);
    
    // Mettre à jour les points
    const newPoints = ok ? points + POINTS_CORRECT : points + POINTS_INCORRECT;
    setPoints(newPoints);
    
    if (ok) setScore((s) => s + 1);
    setAnswers((a) => [...a, ok]);
    
    // Masquer le feedback après 1 seconde
    setTimeout(() => {
      setShowFeedback(false);
    }, 1000);
  }

  function next() {
    if (count + 1 >= TOTAL) {
      setCount(TOTAL);
    } else {
      setCount((c) => c + 1);
    }
  }

  function handleCancel() {
    if (hasAnswered) {
      if (window.confirm(CONFIRMATION_MESSAGE)) {
        onExit();
      }
    } else {
      onExit();
    }
  }

  if (count >= TOTAL) {
    return (
      <div className="card result">
        <h2>🎉 Bravo !</h2>
        <p>
          Tu as {score} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""} sur {TOTAL}.
        </p>
        <div className="stars">
          {answers.map((ok, i) => (
            <span key={i} role="img" aria-label="étoile">{ok ? "⭐" : "❌"}</span>
          ))}
        </div>
        <button onClick={onExit}>Rejouer</button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="points-display">
        <p>🏆 Points : {points}</p>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(count / TOTAL) * 100}%` }}></div>
        <span className="progress-text">{count + 1} / {TOTAL}</span>
      </div>
      <p className="question">{exercise.question} = ?</p>
      {feedback === null ? (
        <form onSubmit={submit}>
          <input
            autoFocus
            type="number"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Ta réponse"
          />
          <button type="submit">Valider</button>
        </form>
      ) : (
        <div>
          <div className={`feedback ${showFeedback ? (feedback ? 'feedback-ok' : 'feedback-ko') : ''}`}>
            {feedback ? "✅ Bravo !" : `❌ La réponse était ${exercise.answer}`}
          </div>
          <div className="points-feedback">
            {feedback ? `+${POINTS_CORRECT} points` : `-${Math.abs(POINTS_INCORRECT)} points`}
          </div>
          <button onClick={next}>Question suivante</button>
        </div>
      )}
      <button onClick={handleCancel} style={{ marginTop: '1rem' }}>
        Annuler
      </button>
    </div>
  );
}