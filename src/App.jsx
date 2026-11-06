import { useState } from "react";
import Quiz from "./components/Quiz";
import { ADDITIONS, SOUSTRACTIONS, MULTIPLICATIONS, DIVISIONS, LEVELS, DIFFICULTY_LEVELS } from "./lib/exercises";

const MODES = [ADDITIONS, SOUSTRACTIONS, MULTIPLICATIONS, DIVISIONS];

export default function App() {
  const [mode, setMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);

  if (mode === null) {
    return (
      <main className="menu">
        <h1>🧮 Auto-Maths</h1>
        <p>Choisis ton jeu et apprends tout seul !</p>
        <ul>
          {MODES.map((m) => (
            <li key={m}>
              <button onClick={() => setMode(m)}>{LEVELS[m].label}</button>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  if (difficulty === null) {
    return (
      <main className="menu">
        <h1>🧮 Auto-Maths</h1>
        <p>Choisis ton niveau de difficulté pour {LEVELS[mode].label}</p>
        <ul>
          {Object.values(DIFFICULTY_LEVELS).map((d) => (
            <li key={d.label}>
              <button onClick={() => setDifficulty(d)}>{d.label}</button>
            </li>
          ))}
        </ul>
        <button onClick={() => setMode(null)} style={{ marginTop: '1rem' }}>Retour</button>
      </main>
    );
  }

  return (
    <main className="menu">
      <Quiz mode={mode} difficulty={difficulty} onExit={() => setDifficulty(null)} />
    </main>
  );
}