// Tests du barème (node --test). Règles : « Scoring explication », page Figma V2.
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { cardPoints, finalScore, tierFor, shuffle } = require('../js/scoring.js');

const RULES = {
  pointsPerCard: 10,
  minimumFinalScore: 1,
  tiers: [
    { id: 'maitrise', minRate: 0.85 },
    { id: 'bon', minRate: 0.60 },
    { id: 'consolider', minRate: 0 },
  ],
};

test('une mauvaise réponse ou un chrono écoulé rapporte 0 point', () => {
  assert.equal(cardPoints(false, RULES), 0);
});

test('une bonne réponse rapporte tous les points, sans bonus de rapidité', () => {
  assert.equal(cardPoints(true, RULES), 10);
});

test('score final : somme des cartes, 210 au maximum, jamais 0', () => {
  assert.equal(finalScore(Array(21).fill(10), RULES), 210);
  assert.equal(finalScore([10, 8, 0, 9], RULES), 27);
  assert.equal(finalScore(Array(21).fill(0), RULES), 1);
  assert.equal(finalScore([], RULES), 1);
});

test('message du bilan selon le taux de bonnes réponses sur 21', () => {
  assert.equal(tierFor(21, 21, RULES), 'maitrise');
  assert.equal(tierFor(18, 21, RULES), 'maitrise'); // 85,7 %
  assert.equal(tierFor(17, 21, RULES), 'bon');      // 81 %
  assert.equal(tierFor(13, 21, RULES), 'bon');      // 61,9 %
  assert.equal(tierFor(12, 21, RULES), 'consolider'); // 57 %
  assert.equal(tierFor(0, 21, RULES), 'consolider');
});

test('le mélange garde toutes les cartes et ne modifie pas la liste d\'origine', () => {
  const cards = [0, 1, 2, 3, 4, 5, 6];
  const mixed = shuffle(cards);
  assert.deepEqual([...mixed].sort(), cards);
  assert.deepEqual(cards, [0, 1, 2, 3, 4, 5, 6]);
});
