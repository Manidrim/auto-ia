import { useEffect, useState } from "react";
import { CLASSES } from "../lib/exercises";

const LEVELS_ORDER = ["CP", "CE1", "CE2", "CM1", "CM2"];

export default function ProgressionBar({ currentLevel, onLevelSelect }) {
  const [completedLevels, setCompletedLevels] = useState(() => {
    const saved = localStorage.getItem('completedLevels');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
  }, [completedLevels]);

  const handleLevelClick = (levelKey) => {
    if (completedLevels.includes(levelKey) || levelKey === currentLevel.label) {
      onLevelSelect(CLASSES[levelKey]);
    }
  };

  const updateCompletedLevels = (newLevel) => {
    const newLevelIndex = LEVELS_ORDER.indexOf(newLevel.label);
    const completed = LEVELS_ORDER.slice(0, newLevelIndex + 1);
    setCompletedLevels(completed);
  };

  return (
    <div className="progression-bar-container">
      {LEVELS_ORDER.map((levelKey) => {
        const level = CLASSES[levelKey];
        const isCurrent = level.label === currentLevel?.label;
        const isCompleted = completedLevels.includes(levelKey);
        const isUnlocked = completedLevels.includes(LEVELS_ORDER[LEVELS_ORDER.indexOf(levelKey) - 1]) || isCurrent;

        return (
          <div
            key={levelKey}
            className={`progression-level ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`}
            onClick={() => isUnlocked && handleLevelClick(levelKey)}
            aria-label={`Niveau ${level.label}${isCompleted ? ' terminé' : isCurrent ? ' en cours' : ''}`}
          >
            <span className="level-label">{level.label}</span>
            {isCompleted && <span className="level-check">✓</span>}
          </div>
        );
      })}
    </div>
  );
}