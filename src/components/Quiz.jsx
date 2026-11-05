import { useEffect, useMemo, useState } from "react";
import { makeExercise } from "../lib/exercises";

const TOTAL = 10;

export default function Quiz({ mode, difficulty, onExit }) {
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(0);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const exercise = useMemo(() => makeExercise(mode, difficulty), [mode, difficulty, count]);

  useEffect(() => {
    setValue("");
    setFeedback(null);
    setShowFeedback(false);
  }, [count]);

  function submit(e) {
    e.preventDefault();
    if (feedback !== null) return;
    const ok = Number(value) === exercise.answer;
    setFeedback(ok);
    setShowFeedback(true);
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
      <p className="progress">
        Question {count + 1} / {TOTAL} — Score : {score}
      </p>
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
          <button onClick={next}>Question suivante</button>
        </div>
      )}
    </div>
  );
}