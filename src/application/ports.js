/**
 * Port : persistance de la progression de l'élève.
 * Le domaine/application ne dépendent que de ce contrat ;
 * l'implémentation concrète vit dans src/infrastructure/.
 *
 * @typedef {Object} ProgressRepository
 * @property {() => number} getPoints - points actuels de l'élève
 * @property {(points: number) => void} savePoints - persiste les points
 */
export {};
