import { useEffect, useState } from "react";
import {
  TOTAL_QUESTIONS,
  POINTS_CORRECT,
  POINTS_INCORRECT,
  createSession,
  applyAnswer,
  nextQuestion,
} from "../../application/quizSession";
import { createLocalStorageProgress } from "../../infrastructure/localStorageProgress";

const CONFIRMATION_MESSAGE =
  "Toutes tes réponses seront perdues. Es-tu sûr de vouloir annuler ?";

const defaultProgress = createLocalStorageProgress();

export default function Quiz({
  matiere,
  niveau,
  onExit,
  rand = Math.random,
  progress = defaultProgress,
}) {
  const [session, setSession] = useState(() =>
    createSession({ matiere, niveau, rand, points: progress.getPoints() }),
  );
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    setValue("");
    setFeedback(null);
    setShowFeedback(false);
  }, [session.count]);

  useEffect(() => {
    progress.savePoints(session.points);
  }, [session.points, progress]);

  function submit(e) {
    e.preventDefault();
    if (feedback !== null) return;
    const next = applyAnswer(session, value);
    setSession(next);
    setFeedback(next.lastResult);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
    }, 1000);
  }

  function next() {
    setSession((s) => nextQuestion(s));
  }

  function handleCancel() {
    if (feedback !== null) {
      if (window.confirm(CONFIRMATION_MESSAGE)) {
        onExit();
      }
    } else {
      onExit();
    }
  }

  const { exercise, count, score, answers, points } = session;

  if (count >= TOTAL_QUESTIONS) {
    return (
      <div className="card result">
        <h2>🎉 Bravo !</h2>
        <p>
          Tu as {score} bonne{score > 1 ? "s" : ""} réponse
          {score > 1 ? "s" : ""} sur {TOTAL_QUESTIONS}.
        </p>
        <div className="stars">
          {answers.map((ok, i) => (
            <span key={i} role="img" aria-label="étoile">
              {ok ? "⭐" : "❌"}
            </span>
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
        <div
          className="progress-bar"
          style={{ width: `${(count / TOTAL_QUESTIONS) * 100}%` }}
        ></div>
        <span className="progress-text">
          {count + 1} / {TOTAL_QUESTIONS}
        </span>
      </div>
      <p className="question">{exercise.question} = ?</p>
      {feedback === null ? (
        <form onSubmit={submit}>
          <input
            autoFocus
            type={typeof exercise.answer === "number" ? "number" : "text"}
            inputMode={typeof exercise.answer === "number" ? "numeric" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Ta réponse"
          />
          <button type="submit">Valider</button>
        </form>
      ) : (
        <div>
          <div
            className={`feedback ${showFeedback ? (feedback ? "feedback-ok" : "feedback-ko") : ""}`}
          >
            {feedback ? "✅ Bravo !" : `❌ La réponse était ${exercise.answer}`}
          </div>
          <div className="points-feedback">
            {feedback
              ? `+${POINTS_CORRECT} points`
              : `-${Math.abs(POINTS_INCORRECT)} points`}
          </div>
          <button onClick={next}>Question suivante</button>
        </div>
      )}
      <button onClick={handleCancel} style={{ marginTop: "1rem" }}>
        Annuler
      </button>
    </div>
  );
}
