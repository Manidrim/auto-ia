const PERIODES = "periodes";
const DATES = "dates";
const EVENEMENTS = "evenements";

const HISTORY_LEVELS = {
  [PERIODES]: { label: "Périodes historiques" },
  [DATES]: { label: "Dates clés" },
  [EVENEMENTS]: { label: "Événements historiques" },
};

function makeHistoryExercise(mode, classe) {
  if (mode === PERIODES) {
    return makeHistoryPeriodExercise(classe);
  }
  if (mode === DATES) {
    return makeHistoryDateExercise(classe);
  }
  if (mode === EVENEMENTS) {
    return makeHistoryEventExercise(classe);
  }
  throw new Error(`Mode inconnu : ${mode}`);
}

function makeHistoryPeriodExercise(classe) {
  const periods = getPeriodsForClass(classe);
  const period = periods[Math.floor(Math.random() * periods.length)];
  return { question: period.name, answer: period.date };
}

function makeHistoryDateExercise(classe) {
  const events = getEventsForClass(classe);
  const event = events[Math.floor(Math.random() * events.length)];
  return { question: event.name, answer: event.date };
}

function makeHistoryEventExercise(classe) {
  const events = getEventsForClass(classe);
  const event = events[Math.floor(Math.random() * events.length)];
  return { question: event.description, answer: event.date };
}

function getPeriodsForClass(classe) {
  const periods = [
    { name: "Préhistoire", date: "Il y a plus de 2 millions d'années" },
    { name: "Antiquité", date: "Vers 3000 av. J.-C. à 476" },
    { name: "Moyen Âge", date: "476 à 1492" },
    { name: "Temps modernes", date: "1492 à 1789" },
    { name: "Époque contemporaine", date: "1789 à aujourd'hui" },
  ];

  if (classe.label === "CP") {
    return periods.filter(
      (p) => p.name === "Préhistoire" || p.name === "Antiquité",
    );
  }
  if (classe.label === "CE1") {
    return periods.filter(
      (p) => p.name === "Moyen Âge" || p.name === "Temps modernes",
    );
  }
  return periods;
}

function getEventsForClass(classe) {
  const events = [
    {
      name: "Invention de l'écriture",
      date: "Vers 3300 av. J.-C.",
      description: "Les humains commencent à écrire pour la première fois.",
    },
    {
      name: "Construction des pyramides de Gizeh",
      date: "Vers 2560 av. J.-C.",
      description: "Les Égyptiens construisent la Grande Pyramide.",
    },
    {
      name: "Fondation de Rome",
      date: "753 av. J.-C.",
      description: "Selon la légende, Romulus fonde Rome.",
    },
    {
      name: "Bataille de Marathon",
      date: "490 av. J.-C.",
      description: "Les Grecs battent les Perses lors d'une bataille célèbre.",
    },
    {
      name: "Chute de l'Empire romain d'Occident",
      date: "476",
      description: "Fin de l'Antiquité et début du Moyen Âge.",
    },
    {
      name: "Charlemagne est couronné empereur",
      date: "800",
      description: "Il unifie une grande partie de l'Europe.",
    },
    {
      name: "Découverte de l'Amérique par Christophe Colomb",
      date: "1492",
      description: "Un nouveau continent est découvert.",
    },
    {
      name: "Révolution française",
      date: "1789",
      description: "Le peuple se révolte contre le roi.",
    },
    {
      name: "Déclaration des droits de l'homme et du citoyen",
      date: "1789",
      description: "Un texte important pour les libertés.",
    },
    {
      name: "Napoléon devient empereur",
      date: "1804",
      description: "Il dirige la France et fait la guerre en Europe.",
    },
    {
      name: "Première Guerre mondiale",
      date: "1914-1918",
      description: "Un conflit mondial entre plusieurs pays.",
    },
    {
      name: "Seconde Guerre mondiale",
      date: "1939-1945",
      description: "Un autre grand conflit mondial.",
    },
    {
      name: "Débarquement en Normandie",
      date: "6 juin 1944",
      description:
        "Les Alliés libèrent la France pendant la Seconde Guerre mondiale.",
    },
    {
      name: "Fin de la Seconde Guerre mondiale en Europe",
      date: "8 mai 1945",
      description: "L'Allemagne capitule.",
    },
    {
      name: "Décolonisation de l'Algérie",
      date: "1962",
      description: "L'Algérie devient indépendante après une longue guerre.",
    },
  ];

  if (classe.label === "CP") {
    return events.filter(
      (e) =>
        e.date.includes("av. J.-C.") ||
        e.name === "Chute de l'Empire romain d'Occident",
    );
  }
  if (classe.label === "CE1") {
    return events.filter(
      (e) =>
        e.date.includes("av. J.-C.") ||
        e.date.includes("476") ||
        e.date.includes("1492") ||
        e.date.includes("1789"),
    );
  }
  if (classe.label === "CE2") {
    return events.filter(
      (e) =>
        e.date.includes("1789") ||
        e.date.includes("1804") ||
        e.date.includes("1914") ||
        e.date.includes("1939"),
    );
  }
  return events;
}

export { PERIODES, DATES, EVENEMENTS, HISTORY_LEVELS, makeHistoryExercise };
