/**
 * scoring.js : barème du jeu, en fonctions pures (testées dans tests/).
 * Règles : document « Scoring explication » de la page Figma V2 (21/10/2026),
 * sans bonus de rapidité à la demande de la cliente (22/10/2026).
 */
(function (root) {
  'use strict';

  /**
   * Points d'une carte : tous les points pour une bonne réponse, quel que soit
   * le temps mis ; 0 si faux ou temps écoulé.
   * @param {boolean} isCorrect
   * @param {{ pointsPerCard: number }} rules
   */
  function cardPoints(isCorrect, rules) {
    return isCorrect ? rules.pointsPerCard : 0;
  }

  /** Score final : somme des cartes, jamais inférieur au minimum (1 point). */
  function finalScore(cardScores, rules) {
    const total = cardScores.reduce((sum, points) => sum + points, 0);
    return Math.max(rules.minimumFinalScore, total);
  }

  /** Palier du bilan, calculé sur le taux de bonnes réponses (et non sur les points). */
  function tierFor(correctCount, totalCards, rules) {
    const rate = totalCards > 0 ? correctCount / totalCards : 0;
    return rules.tiers.find((tier) => rate >= tier.minRate - 1e-9).id;
  }

  /** Mélange de Fisher-Yates, sans modifier le tableau d'origine. */
  function shuffle(items, random = Math.random) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  const api = { cardPoints, finalScore, tierFor, shuffle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Scoring = api;
})(typeof window !== 'undefined' ? window : globalThis);
