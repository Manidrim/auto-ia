import { useState } from "react";
import Quiz from "./components/Quiz";
import { ADDITIONS, SOUSTRACTIONS, MULTIPLICATIONS, DIVISIONS, LEVELS, CLASSES } from "./lib/exercises";

const MODES = [ADDITIONS, SOUSTRACTIONS, MULTIPLICATIONS, DIVISIONS];

export default function App() {
  const [mode, setMode] = useState(null);
  const [classe, setClasse] = useState(null);

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

  if (classe === null) {
    return (
      <main className="menu">
        <h1>🧮 Auto-Maths</h1>
        <p>Choisis ta classe pour {LEVELS[mode].label}</p>
        <ul>
          {Object.values(CLASSES).map((c) => (
            <li key={c.label}>
              <button
                onClick={() => setClasse(c)}
                className={classe?.label === c.label ? 'selected' : ''}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
        <button onClick={() => setMode(null)} style={{ marginTop: '1rem' }}>
          Retour
        </button>
      </main>
    );
  }

  return (
    <main className="menu">
      <Quiz mode={mode} classe={classe} onExit={() => setClasse(null)} />
    </main>
  );
}