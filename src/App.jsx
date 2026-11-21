import { useState } from "react";
import Quiz from "./components/Quiz";
import { LEVELS, CLASSES } from "./lib/exercises";

export default function App() {
  const [classe, setClasse] = useState(null);
  const [mode, setMode] = useState(null);

  if (classe === null) {
    return (
      <main className="menu">
        <h1>🧮 Auto-Maths</h1>
        <p>Choisis ton niveau !</p>
        <ul>
          {Object.values(CLASSES).map((c) => (
            <li key={c.label}>
              <button onClick={() => setClasse(c)}>{c.label}</button>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  if (mode === null) {
    return (
      <main className="menu">
        <h1>🧮 Auto-Maths</h1>
        <p>
          Niveau : <strong>{classe.label}</strong>
        </p>
        <p>Choisis ta matière</p>
        <ul>
          {classe.allowedModes.map((m) => (
            <li key={m}>
              <button onClick={() => setMode(m)}>{LEVELS[m].label}</button>
            </li>
          ))}
        </ul>
        <button onClick={() => setClasse(null)} style={{ marginTop: "1rem" }}>
          Changer de niveau
        </button>
      </main>
    );
  }

  return (
    <main className="menu">
      <Quiz mode={mode} classe={classe} onExit={() => setMode(null)} />
    </main>
  );
}
