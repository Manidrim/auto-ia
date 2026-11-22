import { randomInt } from "../random.js";

export const PERIODES = "periodes";
export const DATES = "dates";
export const EVENEMENTS = "evenements";

export const HISTORY_MATIERES = {
  [PERIODES]: { label: "Périodes historiques" },
  [DATES]: { label: "Dates clés" },
  [EVENEMENTS]: { label: "Événements historiques" },
};

const PERIODS = [
  {
    name: "Préhistoire",
    date: "Il y a plus de 2 millions d'années",
    niveaux: ["CP", "CE2", "CM1", "CM2"],
  },
  {
    name: "Antiquité",
    date: "Vers 3000 av. J.-C. à 476",
    niveaux: ["CP", "CE2", "CM1", "CM2"],
  },
  {
    name: "Moyen Âge",
    date: "476 à 1492",
    niveaux: ["CE1", "CE2", "CM1", "CM2"],
  },
  {
    name: "Temps modernes",
    date: "1492 à 1789",
    niveaux: ["CE1", "CE2", "CM1", "CM2"],
  },
  {
    name: "Époque contemporaine",
    date: "1789 à aujourd'hui",
    niveaux: ["CE2", "CM1", "CM2"],
  },
];

const EVENTS = [
  {
    name: "Invention de l'écriture",
    date: "Vers 3300 av. J.-C.",
    niveaux: ["CP", "CE1", "CM1", "CM2"],
    description: "Les humains commencent à écrire pour la première fois.",
  },
  {
    name: "Construction des pyramides de Gizeh",
    date: "Vers 2560 av. J.-C.",
    niveaux: ["CP", "CE1", "CM1", "CM2"],
    description: "Les Égyptiens construisent la Grande Pyramide.",
  },
  {
    name: "Fondation de Rome",
    date: "753 av. J.-C.",
    niveaux: ["CP", "CE1", "CM1", "CM2"],
    description: "Selon la légende, Romulus fonde Rome.",
  },
  {
    name: "Bataille de Marathon",
    date: "490 av. J.-C.",
    niveaux: ["CP", "CE1", "CM1", "CM2"],
    description: "Les Grecs battent les Perses lors d'une bataille célèbre.",
  },
  {
    name: "Chute de l'Empire romain d'Occident",
    date: "476",
    niveaux: ["CP", "CE1", "CM1", "CM2"],
    description: "Fin de l'Antiquité et début du Moyen Âge.",
  },
  {
    name: "Charlemagne est couronné empereur",
    date: "800",
    niveaux: ["CM1", "CM2"],
    description: "Il unifie une grande partie de l'Europe.",
  },
  {
    name: "Découverte de l'Amérique par Christophe Colomb",
    date: "1492",
    niveaux: ["CE1", "CM1", "CM2"],
    description: "Un nouveau continent est découvert.",
  },
  {
    name: "Révolution française",
    date: "1789",
    niveaux: ["CE1", "CE2", "CM1", "CM2"],
    description: "Le peuple se révolte contre le roi.",
  },
  {
    name: "Déclaration des droits de l'homme et du citoyen",
    date: "1789",
    niveaux: ["CE1", "CE2", "CM1", "CM2"],
    description: "Un texte important pour les libertés.",
  },
  {
    name: "Napoléon devient empereur",
    date: "1804",
    niveaux: ["CE2", "CM1", "CM2"],
    description: "Il dirige la France et fait la guerre en Europe.",
  },
  {
    name: "Première Guerre mondiale",
    date: "1914-1918",
    niveaux: ["CE2", "CM1", "CM2"],
    description: "Un conflit mondial entre plusieurs pays.",
  },
  {
    name: "Seconde Guerre mondiale",
    date: "1939-1945",
    niveaux: ["CE2", "CM1", "CM2"],
    description: "Un autre grand conflit mondial.",
  },
  {
    name: "Débarquement en Normandie",
    date: "6 juin 1944",
    niveaux: ["CM1", "CM2"],
    description:
      "Les Alliés libèrent la France pendant la Seconde Guerre mondiale.",
  },
  {
    name: "Fin de la Seconde Guerre mondiale en Europe",
    date: "8 mai 1945",
    niveaux: ["CM1", "CM2"],
    description: "L'Allemagne capitule.",
  },
  {
    name: "Décolonisation de l'Algérie",
    date: "1962",
    niveaux: ["CM1", "CM2"],
    description: "L'Algérie devient indépendante après une longue guerre.",
  },
];

function getPeriodsForNiveau(niveau) {
  return PERIODS.filter((p) => p.niveaux.includes(niveau.label));
}

function getEventsForNiveau(niveau) {
  return EVENTS.filter((e) => e.niveaux.includes(niveau.label));
}

export function makeHistoryExercise(matiere, niveau, rand = Math.random) {
  if (matiere === PERIODES) {
    const periods = getPeriodsForNiveau(niveau);
    const period = periods[randomInt(0, periods.length - 1, rand)];
    return { question: period.name, answer: period.date };
  }
  if (matiere === DATES) {
    const events = getEventsForNiveau(niveau);
    const event = events[randomInt(0, events.length - 1, rand)];
    return { question: event.name, answer: event.date };
  }
  if (matiere === EVENEMENTS) {
    const events = getEventsForNiveau(niveau);
    const event = events[randomInt(0, events.length - 1, rand)];
    return { question: event.description, answer: event.date };
  }
  throw new Error(`Matière histoire inconnue : ${matiere}`);
}

export { PERIODS as HISTORY_PERIODS, EVENTS as HISTORY_EVENTS };
