import { useState } from "react";
import Quiz from "./components/Quiz";
import { ADDITIONS, SOUSTRACTIONS, MULTIPLICATIONS, LEVELS } from "./lib/exercises";

const MODES = [ADDITIONS, SOUSTRACTIONS, MULTIPLICATIONS];

export default function App() {
  const [mode, setMode] = useState(null);

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

  return (
    <main className="menu">
      <Quiz mode={mode} onExit={() => setMode(null)} />
    </main>
  );
}
