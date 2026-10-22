// Tests du barème (node --test). Règles : « Scoring explication », page Figma V2.
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { cardPoints, finalScore, tierFor, shuffle } = require('../js/scoring.js');

const RULES = {
  basePoints: 7,
  speedBonus: [3, 2, 1],
  minimumFinalScore: 1,
  tiers: [
    { id: 'maitrise', minRate: 0.85 },
    { id: 'bon', minRate: 0.60 },
    { id: 'consolider', minRate: 0 },
  ],
};

test('une mauvaise réponse ou un chrono écoulé rapporte 0 point', () => {
  assert.equal(cardPoints(false, 500, 10, RULES), 0);
  assert.equal(cardPoints(false, 10000, 10, RULES), 0);
});

test('bonne réponse : 7 points + bonus selon le tiers du chrono (épreuve 1, 10 s)', () => {
  assert.equal(cardPoints(true, 0, 10, RULES), 10);
  assert.equal(cardPoints(true, 3329, 10, RULES), 10);
  assert.equal(cardPoints(true, 3334, 10, RULES), 9);
  assert.equal(cardPoints(true, 6666, 10, RULES), 9);
  assert.equal(cardPoints(true, 6667, 10, RULES), 8);
  assert.equal(cardPoints(true, 10000, 10, RULES), 8);
});

test('seuils des épreuves 2 (12 s) et 3 (9 s)', () => {
  assert.equal(cardPoints(true, 3999, 12, RULES), 10);
  assert.equal(cardPoints(true, 4000, 12, RULES), 9);
  assert.equal(cardPoints(true, 8000, 12, RULES), 8);
  assert.equal(cardPoints(true, 2999, 9, RULES), 10);
  assert.equal(cardPoints(true, 3000, 9, RULES), 9);
  assert.equal(cardPoints(true, 6000, 9, RULES), 8);
});

test('une carte rapporte toujours 0, 8, 9 ou 10 points', () => {
  for (let ms = 0; ms <= 12000; ms += 250) {
    assert.ok([8, 9, 10].includes(cardPoints(true, ms, 12, RULES)));
  }
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
