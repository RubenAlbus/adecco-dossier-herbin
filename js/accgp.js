/**
 * ACCGP — Albus Custom Code Game Protocol v1.0
 * =============================================
 *
 * Pont entre un mini-jeu HTML/JS/CSS et la plateforme Bubble d'Albus Factory.
 * Ne PAS modifier ce fichier : il est partagé par tous les jeux custom code.
 *
 * Usage
 * -----
 *   <script src="js/accgp.js"></script>
 *   ...
 *   // À la fin de la partie :
 *   ACCGP.sendScore(finalScore, maxScore);
 *
 * URL params attendus (envoyés par Bubble)
 * ----------------------------------------
 *   ?userId=XXX&challengeId=YYY
 *
 * En mode dev (URL sans challengeId), aucun postMessage n'est envoyé.
 * Les messages sont loggés dans la console pour debug local.
 */
(function () {
  'use strict';

  var params      = new URLSearchParams(window.location.search);
  var userId      = params.get('userId')      || null;
  var challengeId = params.get('challengeId') || null;
  var devMode     = !challengeId;

  function send(type, payload) {
    var message = {
      type:        type,
      userId:      userId,
      challengeId: challengeId,
      protocol:    'ACCGP/1.0',
    };
    if (payload) {
      for (var k in payload) if (Object.prototype.hasOwnProperty.call(payload, k)) message[k] = payload[k];
    }

    if (devMode) {
      console.log('[ACCGP dev]', message);
      return;
    }

    try {
      window.parent.postMessage(message, '*');
    } catch (err) {
      console.error('[ACCGP] postMessage failed:', err);
    }
  }

  window.ACCGP = {
    version:     '1.0',
    userId:      userId,
    challengeId: challengeId,
    devMode:     devMode,

    /**
     * Envoie le score final à Bubble. À appeler UNE SEULE FOIS en fin de partie.
     * @param {number} score    points attribués au joueur (entier, >= 0)
     * @param {number} maxScore score théorique maximum (pour stats)
     * @param {object} [metadata] données libres optionnelles (gameId, details, etc.)
     */
    sendScore: function (score, maxScore, metadata) {
      send('ALBUS_GAME_COMPLETE', {
        score:    Math.max(0, Math.round(Number(score)    || 0)),
        maxScore: Math.max(0, Math.round(Number(maxScore) || 0)),
        metadata: metadata || null,
      });
    },

    /**
     * (optionnel) Envoie une mise à jour de progression intermédiaire.
     * Utile pour les analytics temps réel côté Bubble, non requis par le protocole.
     */
    sendProgress: function (score, maxScore) {
      send('ALBUS_GAME_PROGRESS', {
        score:    Math.max(0, Math.round(Number(score)    || 0)),
        maxScore: Math.max(0, Math.round(Number(maxScore) || 0)),
      });
    },
  };

  // Signal "prêt" au parent, utile pour un éventuel preloader Bubble.
  send('ALBUS_GAME_READY');
})();
