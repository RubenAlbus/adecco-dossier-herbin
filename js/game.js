/**
 * game.js — « Le Dossier Herbin »
 * =================================
 * State machine du jeu : accueil, 3 épreuves de 7 cartes chronométrées,
 * bilan final. Calcule le score selon le barème du document de scoring
 * validé et transmet le résultat à Bubble via ACCGP.sendScore.
 *
 * Chaque écran reproduit à l'identique les écrans de la page Figma
 * « Mini Jeu 1_Développement_V2 » (textes, options, couleurs, mise en page).
 */
'use strict';

(function () {
  var DATA = window.GAME_DATA;
  var app = document.getElementById('app');

  var state = {
    epreuveIndex: 0,
    cardIndex: 0,
    score: 0,
    streak: 0,
    totalCorrect: 0,
    cardStartTime: 0,
    rafId: null,
    answered: false,
  };

  function render(html) {
    app.innerHTML = html;
  }

  function currentEpreuve() {
    return DATA.epreuves[state.epreuveIndex];
  }

  function currentCard() {
    return currentEpreuve().cards[state.cardIndex];
  }

  function pointsLabel(n) {
    return n <= 1 ? n + ' point' : n + ' points';
  }

  // ---------- Petits composants réutilisés sur plusieurs écrans ----------

  function bracketCorners() {
    return (
      '<img class="corner corner--tl" src="images/corner-tl.svg" alt="" aria-hidden="true">' +
      '<img class="corner corner--tr" src="images/corner-tr.svg" alt="" aria-hidden="true">' +
      '<img class="corner corner--bl" src="images/corner-tl.svg" alt="" aria-hidden="true">' +
      '<img class="corner corner--br" src="images/corner-tr.svg" alt="" aria-hidden="true">'
    );
  }

  function hudHtml(stepLabel, title, cardsLabel, options) {
    options = options || {};
    var left = options.logo
      ? '<img class="hud__logo" src="images/adecco-logo.webp" alt="Adecco">'
      : '<span class="hud__step">' + stepLabel + '</span>';
    var right = options.logo
      ? '<img class="hud__logo hud__logo--spacer" src="images/adecco-logo.webp" alt="" aria-hidden="true">'
      : '<span class="hud__score" id="hud-score">' + pointsLabel(state.score) + '</span>';
    return (
      '<header class="hud">' +
        left +
        '<div class="hud__center">' +
          '<h2 class="hud__title">' + title + '</h2>' +
          (cardsLabel ? '<span class="hud__cards">' + cardsLabel + '</span>' : '') +
        '</div>' +
        right +
      '</header>'
    );
  }

  function epreuveCardsLabel(ep) {
    return 'Cartes : ' + (state.cardIndex + 1) + ' / ' + ep.cards.length;
  }

  // Bandeau de rappel affiché en haut des écrans de carte : reprend
  // l'enjeu + le texte condensé défini pour chaque épreuve.
  function reminderBoxHtml(ep) {
    var r = ep.reminder;
    var inner = '<h3>' + r.enjeu + '</h3>' + r.lead.map(function (p) { return '<p>' + p + '</p>'; }).join('');
    return '<div class="bracket-panel reminder-box">' + bracketCorners() + inner + '</div>';
  }

  function capsuleHtml(col) {
    var rotateClass = col.rotate === 'neg' ? ' capsule--rotate-neg' : col.rotate === 'pos' ? ' capsule--rotate-pos' : '';
    return '<span class="capsule capsule--' + col.capsule + rotateClass + '" aria-hidden="true"></span>';
  }

  function mascotHtml(ep) {
    return '<div class="mascot-pose mascot-pose--pose' + (state.epreuveIndex % 3) + '"></div>';
  }

  // ---------- Écran d'accueil ----------

  function showWelcome() {
    var d = DATA.intro;
    render(
      '<section class="screen screen--narrative bg-light">' +
        '<div class="bracket-panel panel panel--welcome">' +
          bracketCorners() +
          '<div class="avatar-circle"><img src="images/char-morpheus.webp" alt=""></div>' +
          '<p class="eyebrow">' + d.eyebrow + '</p>' +
          '<h1>' + d.title + '</h1>' +
          d.paragraphs.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
          d.closingParagraphs.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
          '<button class="btn btn--primary" id="btn-start">' + d.cta + '</button>' +
        '</div>' +
      '</section>'
    );
    document.getElementById('btn-start').addEventListener('click', function () {
      state.epreuveIndex = 0;
      showEpreuveIntro();
    });
  }

  // ---------- Intro d'épreuve ----------

  function showEpreuveIntro() {
    var ep = currentEpreuve();
    state.cardIndex = 0;

    render(
      '<section class="screen screen--narrative bg-pink">' +
        hudHtml(ep.stepLabel, ep.title, epreuveCardsLabel(ep)) +
        '<div class="bracket-panel panel">' +
          bracketCorners() +
          '<h3>' + ep.intro.enjeu + '</h3>' +
          ep.intro.lead.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
          (ep.intro.details
            ? '<p class="intro-details">' + ep.intro.details.join('<br>') + '</p>'
            : '') +
          '<button class="btn btn--primary" id="btn-epreuve-start">' + ep.intro.cta + '</button>' +
        '</div>' +
      '</section>'
    );
    document.getElementById('btn-epreuve-start').addEventListener('click', showCard);
  }

  // ---------- Carte (question chronométrée) ----------

  function showCard() {
    var ep = currentEpreuve();
    var card = currentCard();
    state.answered = false;

    var columnsHtml = ep.columns
      .map(function (col) {
        return (
          '<button class="column-btn" data-col="' + col.id + '">' +
            capsuleHtml(col) +
            '<span>' + col.label + '</span>' +
          '</button>'
        );
      })
      .join('');

    var promptText = ep.cardLabel.quoted ? '« ' + card.prompt + ' »' : card.prompt;

    render(
      '<section class="screen screen--card bg-pink">' +
        hudHtml(ep.stepLabel, ep.title, epreuveCardsLabel(ep)) +
        '<div class="card-stage">' +
          reminderBoxHtml(ep) +
          '<img class="character character--' + ep.character + '" src="images/char-' + ep.character + '.webp" alt="">' +
          '<div class="statement-box">' +
            '<p class="statement-prefix">' + ep.cardLabel.prefix + '</p>' +
            '<p class="statement-text' + (ep.cardLabel.quoted ? ' statement-text--quoted' : '') + '">' + promptText + '</p>' +
          '</div>' +
          '<div class="columns columns--' + ep.columns.length + '">' + columnsHtml + '</div>' +
          '<div class="timer" id="timer">' + formatTime(ep.timerSeconds) + '</div>' +
        '</div>' +
        '<div class="feedback-bar" id="feedback-bar" hidden></div>' +
      '</section>'
    );

    Array.prototype.forEach.call(document.querySelectorAll('.column-btn'), function (btn) {
      btn.addEventListener('click', function () {
        onAnswer(btn.getAttribute('data-col'));
      });
    });

    startTimer(ep.timerSeconds);
  }

  function formatTime(seconds) {
    var s = Math.max(0, Math.ceil(seconds));
    var mm = Math.floor(s / 60);
    var ss = s % 60;
    return (mm < 10 ? '0' + mm : mm) + ' : ' + (ss < 10 ? '0' + ss : ss);
  }

  function startTimer(totalSeconds) {
    state.cardStartTime = performance.now();
    var timerEl = document.getElementById('timer');

    function tick() {
      if (state.answered) return;
      var elapsed = (performance.now() - state.cardStartTime) / 1000;
      var remaining = totalSeconds - elapsed;
      if (remaining <= 0) {
        if (timerEl) timerEl.textContent = formatTime(0);
        onAnswer(null); // temps écoulé
        return;
      }
      if (timerEl) timerEl.textContent = formatTime(remaining);
      state.rafId = requestAnimationFrame(tick);
    }

    state.rafId = requestAnimationFrame(tick);
  }

  function stopTimer() {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
  }

  // ---------- Réponse & scoring ----------

  function computeBonus(elapsedSeconds, bonusThirds) {
    if (elapsedSeconds < bonusThirds[0]) return 3;
    if (elapsedSeconds < bonusThirds[1]) return 2;
    return 1;
  }

  function onAnswer(columnId) {
    if (state.answered) return;
    state.answered = true;
    stopTimer();

    var ep = currentEpreuve();
    var card = currentCard();
    var elapsed = (performance.now() - state.cardStartTime) / 1000;
    var isTimeout = columnId === null;
    var isCorrect = !isTimeout && columnId === card.correct;

    var points = 0;
    if (isCorrect) {
      var bonus = computeBonus(elapsed, ep.bonusThirds);
      points = 7 + bonus;
      state.streak += 1;
      state.totalCorrect += 1;
    } else {
      state.streak = 0;
    }
    state.score += points;

    markColumnButtons(card, isCorrect);
    updateHudScore();
    showFeedback(ep, card, isCorrect, isTimeout, points);
  }

  function updateHudScore() {
    var scoreEl = document.getElementById('hud-score');
    if (scoreEl) scoreEl.textContent = pointsLabel(state.score);
  }

  // Révèle la bonne réponse (vert) et, en cas d'erreur ou de temps écoulé,
  // toutes les colonnes fausses (rouge).
  function markColumnButtons(card, isCorrect) {
    Array.prototype.forEach.call(document.querySelectorAll('.column-btn'), function (btn) {
      var colId = btn.getAttribute('data-col');
      btn.disabled = true;
      if (colId === card.correct) {
        btn.classList.add('column-btn--correct');
      } else if (!isCorrect) {
        btn.classList.add('column-btn--incorrect');
      }
    });
  }

  function showFeedback(ep, card, isCorrect, isTimeout, points) {
    var bar = document.getElementById('feedback-bar');
    bar.hidden = false;

    if (isCorrect) {
      bar.className = 'feedback-bar feedback-bar--correct';
      bar.innerHTML = '<p><span class="feedback-points">+' + points + ' pts. </span>' + card.explanation + '</p>';
      setTimeout(advanceAfterFeedback, DATA.correctAutoAdvanceMs);
      return;
    }

    var label = isTimeout ? DATA.timeoutLabel : DATA.wrongLabel;
    bar.className = 'feedback-bar feedback-bar--wrong';
    bar.innerHTML =
      '<p><strong>' + label + '</strong> ' + card.explanation + '</p>' +
      '<button class="btn btn--continue" id="btn-continue"><span>' + DATA.continueLabel + '</span>' + chevronSvg() + '</button>' +
      mascotHtml(ep);
    document.getElementById('btn-continue').addEventListener('click', advanceAfterFeedback);
  }

  function chevronSvg() {
    return '<svg viewBox="0 0 9 17" width="9" height="17" aria-hidden="true"><path d="M1 1l6.5 7.5L1 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function advanceAfterFeedback() {
    var ep = currentEpreuve();
    state.cardIndex += 1;
    if (state.cardIndex >= ep.cards.length) {
      if (state.epreuveIndex >= DATA.epreuves.length - 1) {
        showBilan();
      } else {
        state.epreuveIndex += 1;
        showEpreuveIntro();
      }
    } else {
      showCard();
    }
  }

  // ---------- Bilan final ----------

  function pickTier(successRate) {
    var tiers = DATA.bilan.tiers;
    for (var i = 0; i < tiers.length; i++) {
      if (successRate >= tiers[i].min) return tiers[i];
    }
    return tiers[tiers.length - 1];
  }

  function totalCards() {
    return DATA.epreuves.reduce(function (sum, ep) { return sum + ep.cards.length; }, 0);
  }

  function showBilan() {
    var maxScore = DATA.meta.maxScore;
    var finalScore = Math.min(maxScore, state.score);
    // Règle obligatoire : un joueur qui termine le jeu a au minimum 1 point.
    if (finalScore <= 0) finalScore = 1;

    var successRate = state.totalCorrect / totalCards();
    var tier = pickTier(successRate);
    var d = DATA.bilan;

    render(
      '<section class="screen screen--narrative bg-light screen--bilan">' +
        hudHtml(null, d.title, 'Étapes terminées : ' + DATA.epreuves.length + ' / ' + DATA.epreuves.length, { logo: true }) +
        '<img class="group-photo" src="images/group-photo.webp" alt="">' +
        '<div class="bracket-panel panel panel--bilan">' +
          bracketCorners() +
          '<p class="bilan-score">Score : ' + finalScore + ' / ' + maxScore + ' pts</p>' +
          '<p>' + tier.message + '</p>' +
          d.closing.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
          '<button class="btn btn--primary btn--chevron" id="btn-classement">' +
            '<span>' + d.cta + '</span>' + chevronSvg() +
          '</button>' +
        '</div>' +
      '</section>'
    );

    window.ACCGP.sendScore(finalScore, maxScore, {
      gameId: DATA.meta.gameId,
      correctCount: state.totalCorrect,
      totalCards: totalCards(),
    });

    document.getElementById('btn-classement').addEventListener('click', function (e) {
      var btn = e.currentTarget;
      btn.disabled = true;
      btn.querySelector('span').textContent = 'Score envoyé ✓';
    });
  }

  document.addEventListener('DOMContentLoaded', showWelcome);
})();
