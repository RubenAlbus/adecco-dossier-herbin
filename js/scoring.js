/**
 * scoring.js : barème du jeu, en fonctions pures (testées dans tests/).
 * Règles : document « Scoring explication » de la page Figma V2, validé le 21/10/2026.
 */
(function (root) {
  'use strict';

  /**
   * Points d'une carte : 0 si faux ou temps écoulé, sinon 7 + bonus de rapidité
   * (+3 / +2 / +1 selon le tiers du chrono dans lequel le joueur a répondu).
   * @param {boolean} isCorrect
   * @param {number} elapsedMs   temps entre l'apparition de la carte et la réponse
   * @param {number} timerSeconds durée du chrono de l'épreuve
   * @param {{ basePoints: number, speedBonus: number[] }} rules
   */
  function cardPoints(isCorrect, elapsedMs, timerSeconds, rules) {
    if (!isCorrect) return 0;
    const third = (timerSeconds * 1000) / 3;
    const index = Math.min(2, Math.max(0, Math.floor(elapsedMs / third)));
    return rules.basePoints + rules.speedBonus[index];
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
