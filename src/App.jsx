import { useState } from "react";
import Quiz from "./components/Quiz";
import { MATIERES, NIVEAUX } from "./lib/exercises";

export default function App() {
  const [niveau, setNiveau] = useState(null);
  const [matiere, setMatiere] = useState(null);

  if (niveau === null) {
    return (
      <main className="menu">
        <h1>🧮 Auto-Maths</h1>
        <p>Choisis ton niveau !</p>
        <ul>
          {Object.values(NIVEAUX).map((n) => (
            <li key={n.label}>
              <button onClick={() => setNiveau(n)}>{n.label}</button>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  if (matiere === null) {
    return (
      <main className="menu">
        <h1>🧮 Auto-Maths</h1>
        <p>
          Niveau : <strong>{niveau.label}</strong>
        </p>
        <p>Choisis ta matière</p>
        <ul>
          {niveau.matieres.map((m) => (
            <li key={m}>
              <button onClick={() => setMatiere(m)}>{MATIERES[m].label}</button>
            </li>
          ))}
        </ul>
        <button onClick={() => setNiveau(null)} style={{ marginTop: "1rem" }}>
          Changer de niveau
        </button>
      </main>
    );
  }

  return (
    <main className="menu">
      <Quiz matiere={matiere} niveau={niveau} onExit={() => setMatiere(null)} />
    </main>
  );
}
