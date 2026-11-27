import { randomInt } from "../random.js";

export const PERIODES = "periodes";
export const DATES = "dates";
export const EVENEMENTS = "evenements";
export const CARACTERISTIQUES = "caracteristiques";

export const HISTORY_MATIERES = {
  [PERIODES]: { label: "Périodes historiques" },
  [DATES]: { label: "Dates clés" },
  [EVENEMENTS]: { label: "Événements historiques" },
  [CARACTERISTIQUES]: { label: "Caractéristiques des périodes" },
};

const PERIODS = [
  {
    name: "Préhistoire",
    date: "Il y a plus de 2 millions d'années",
    duree: "Très longue période",
    caracteristiques: [
      "Apparition des premiers humains",
      "Invention de l'outil",
      "Découverte du feu",
      "Début de l'art (peintures rupestres)",
    ],
    niveaux: ["CP", "CE1", "CE2", "CM1", "CM2"],
  },
  {
    name: "Antiquité",
    date: "Vers 3000 av. J.-C. à 476",
    duree: "Environ 3500 ans",
    caracteristiques: [
      "Naissance des premières civilisations (Égypte, Mésopotamie)",
      "Développement de l'écriture",
      "Construction des pyramides",
      "Guerres entre cités-États (Rome, Carthage)",
      "Naissance de la démocratie à Athènes",
    ],
    niveaux: ["CP", "CE1", "CE2", "CM1", "CM2"],
  },
  {
    name: "Moyen Âge",
    date: "476 à 1492",
    duree: "Environ 1000 ans",
    caracteristiques: [
      "Chute de l'Empire romain d'Occident",
      "Développement du christianisme",
      "Système féodal",
      "Construction des châteaux forts",
      "Invasions vikings et arabes",
      "Fin marquée par la découverte de l'Amérique",
    ],
    niveaux: ["CP", "CE1", "CE2", "CM1", "CM2"],
  },
  {
    name: "Temps modernes",
    date: "1492 à 1789",
    duree: "Environ 300 ans",
    caracteristiques: [
      "Découverte de l'Amérique par Christophe Colomb",
      "Développement des grandes explorations",
      "Réforme protestante",
      "Début de la monarchie absolue en France",
      "Invention de l'imprimerie",
      "Fin marquée par la Révolution française",
    ],
    niveaux: ["CE1", "CE2", "CM1", "CM2"],
  },
  {
    name: "Époque contemporaine",
    date: "1789 à aujourd'hui",
    duree: "Environ 230 ans",
    caracteristiques: [
      "Révolution française et Déclaration des droits de l'homme",
      "Industrialisation",
      "Guerres mondiales",
      "Décolonisation",
      "Construction de l'Union européenne",
      "Développement des technologies numériques",
    ],
    niveaux: ["CE2", "CM1", "CM2"],
  },
];

const EVENTS = [
  {
    name: "Invention de l'écriture",
    date: "Vers 3300 av. J.-C.",
    niveau: "CP",
    description: "Les humains commencent à écrire pour la première fois.",
    periode: "Antiquité",
  },
  {
    name: "Construction des pyramides de Gizeh",
    date: "Vers 2560 av. J.-C.",
    niveau: "CP",
    description: "Les Égyptiens construisent la Grande Pyramide.",
    periode: "Antiquité",
  },
  {
    name: "Fondation de Rome",
    date: "753 av. J.-C.",
    niveau: "CP",
    description: "Selon la légende, Romulus fonde Rome.",
    periode: "Antiquité",
  },
  {
    name: "Bataille de Marathon",
    date: "490 av. J.-C.",
    niveau: "CP",
    description: "Les Grecs battent les Perses lors d'une bataille célèbre.",
    periode: "Antiquité",
  },
  {
    name: "Chute de l'Empire romain d'Occident",
    date: "476",
    niveau: "CE1",
    description: "Fin de l'Antiquité et début du Moyen Âge.",
    periode: "Moyen Âge",
  },
  {
    name: "Charlemagne est couronné empereur",
    date: "800",
    niveau: "CE1",
    description: "Il unifie une grande partie de l'Europe.",
    periode: "Moyen Âge",
  },
  {
    name: "Découverte de l'Amérique par Christophe Colomb",
    date: "1492",
    niveau: "CE1",
    description: "Un nouveau continent est découvert.",
    periode: "Temps modernes",
  },
  {
    name: "Révolution française",
    date: "1789",
    niveau: "CE2",
    description: "Le peuple se révolte contre le roi.",
    periode: "Époque contemporaine",
  },
  {
    name: "Déclaration des droits de l'homme et du citoyen",
    date: "1789",
    niveau: "CE2",
    description: "Un texte important pour les libertés.",
    periode: "Époque contemporaine",
  },
  {
    name: "Napoléon devient empereur",
    date: "1804",
    niveau: "CE2",
    description: "Il dirige la France et fait la guerre en Europe.",
    periode: "Époque contemporaine",
  },
  {
    name: "Première Guerre mondiale",
    date: "1914-1918",
    niveau: "CM1",
    description: "Un conflit mondial entre plusieurs pays.",
    periode: "Époque contemporaine",
  },
  {
    name: "Seconde Guerre mondiale",
    date: "1939-1945",
    niveau: "CM1",
    description: "Un autre grand conflit mondial.",
    periode: "Époque contemporaine",
  },
  {
    name: "Débarquement en Normandie",
    date: "6 juin 1944",
    niveau: "CM2",
    description: "Les Alliés libèrent la France pendant la Seconde Guerre mondiale.",
    periode: "Époque contemporaine",
  },
  {
    name: "Fin de la Seconde Guerre mondiale en Europe",
    date: "8 mai 1945",
    niveau: "CM2",
    description: "L'Allemagne capitule.",
    periode: "Époque contemporaine",
  },
  {
    name: "Décolonisation de l'Algérie",
    date: "1962",
    niveau: "CM2",
    description: "L'Algérie devient indépendante après une longue guerre.",
    periode: "Époque contemporaine",
  },
];

const CHARACTERISTICS = [
  {
    question: "Quelle période a vu l'invention de l'écriture ?",
    answer: "Antiquité",
    niveau: "CP",
    periode: "Antiquité",
  },
  {
    question: "Quelle période a vu la construction des pyramides ?",
    answer: "Antiquité",
    niveau: "CP",
    periode: "Antiquité",
  },
  {
    question: "Quelle période a vu la chute de l'Empire romain d'Occident ?",
    answer: "Moyen Âge",
    niveau: "CE1",
    periode: "Moyen Âge",
  },
  {
    question: "Quelle période a vu la découverte de l'Amérique ?",
    answer: "Temps modernes",
    niveau: "CE1",
    periode: "Temps modernes",
  },
  {
    question: "Quelle période a vu la Révolution française ?",
    answer: "Époque contemporaine",
    niveau: "CE2",
    periode: "Époque contemporaine",
  },
  {
    question: "Quelle période a vu les châteaux forts ?",
    answer: "Moyen Âge",
    niveau: "CP",
    periode: "Moyen Âge",
  },
  {
    question: "Quelle période a vu les grandes explorations ?",
    answer: "Temps modernes",
    niveau: "CE1",
    periode: "Temps modernes",
  },
  {
    question: "Quelle période a vu les guerres mondiales ?",
    answer: "Époque contemporaine",
    niveau: "CM1",
    periode: "Époque contemporaine",
  },
  {
    question: "Quelle période a vu l'industrialisation ?",
    answer: "Époque contemporaine",
    niveau: "CM1",
    periode: "Époque contemporaine",
  },
  {
    question: "Quelle période a duré le plus longtemps ?",
    answer: "Préhistoire",
    niveau: "CM2",
    periode: "Préhistoire",
  },
  {
    question: "Quelle période a vu la fin de la monarchie absolue en France ?",
    answer: "Époque contemporaine",
    niveau: "CM2",
    periode: "Époque contemporaine",
  },
  {
    question: "Quelle période a vu la construction de l'Union européenne ?",
    answer: "Époque contemporaine",
    niveau: "CM2",
    periode: "Époque contemporaine",
  },
];

function getPeriodsForNiveau(niveau) {
  return PERIODS.filter((p) => p.niveaux.includes(niveau.label));
}

function getEventsForNiveau(niveau) {
  return EVENTS.filter((e) => e.niveau === niveau.label);
}

function getCharacteristicsForNiveau(niveau) {
  return CHARACTERISTICS.filter((c) => c.niveau === niveau.label);
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
  if (matiere === CARACTERISTIQUES) {
    const characteristics = getCharacteristicsForNiveau(niveau);
    const characteristic = characteristics[randomInt(0, characteristics.length - 1, rand)];
    return { question: characteristic.question, answer: characteristic.answer };
  }
  throw new Error(`Matière histoire inconnue : ${matiere}`);
}

export { PERIODS as HISTORY_PERIODS, EVENTS as HISTORY_EVENTS, CHARACTERISTICS as HISTORY_CHARACTERISTICS };