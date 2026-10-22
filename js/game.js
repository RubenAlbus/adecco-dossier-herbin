/**
 * game.js — « Le Dossier Herbin »
 * =================================
 * State machine du jeu : écran d'accueil, 3 épreuves de 7 cartes chronométrées,
 * récap par épreuve, bilan final. Calcule le score selon le barème du document
 * de scoring validé et transmet le résultat à Bubble via ACCGP.sendScore.
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
    epreuveCorrect: 0,
    cardStartTime: 0,
    timerId: null,
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

  // ---------- Écran d'accueil ----------

  function showWelcome() {
    var d = DATA.intro;
    render(
      '<section class="screen screen--narrative bg-light">' +
        '<div class="panel">' +
          '<p class="eyebrow">' + d.eyebrow + '</p>' +
          '<h1>' + d.title + '</h1>' +
          d.paragraphs.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
          '<ul class="bullet-list">' +
            d.bullets.map(function (b) { return '<li>' + b + '</li>'; }).join('') +
          '</ul>' +
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
    state.epreuveCorrect = 0;

    render(
      '<section class="screen screen--narrative bg-pink">' +
        hudHtml(ep, 0) +
        '<div class="panel">' +
          (ep.intro.title ? '<h2>' + ep.intro.title + '</h2>' : '') +
          ep.intro.paragraphs.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
          (ep.intro.context.length
            ? '<p class="context">' + ep.intro.context.join('<br>') + '</p>'
            : '') +
          '<button class="btn btn--primary" id="btn-epreuve-start">' + ep.intro.cta + '</button>' +
        '</div>' +
      '</section>'
    );
    document.getElementById('btn-epreuve-start').addEventListener('click', showCard);
  }

  function hudHtml(ep, cardCountOverride) {
    var cardCount = typeof cardCountOverride === 'number' ? cardCountOverride : state.cardIndex;
    return (
      '<header class="hud">' +
        '<span class="hud__step">' + ep.stepLabel + '</span>' +
        '<div class="hud__center">' +
          '<h2 class="hud__title">' + ep.title + '</h2>' +
          '<span class="hud__cards">Cartes : ' + cardCount + ' / ' + ep.cards.length + '</span>' +
        '</div>' +
        '<span class="hud__score" id="hud-score">' + state.score + ' points</span>' +
      '</header>'
    );
  }

  // ---------- Carte (question chronométrée) ----------

  function showCard() {
    var ep = currentEpreuve();
    var card = currentCard();
    state.answered = false;

    var columnsHtml = ep.columns
      .map(function (col) {
        return (
          '<button class="column-btn column-btn--' + col.pill + '" data-col="' + col.id + '">' +
            '<img class="column-btn__pill" src="images/pill-' + col.pill + '.webp" alt="">' +
            '<span>' + col.label + '</span>' +
          '</button>'
        );
      })
      .join('');

    render(
      '<section class="screen screen--card bg-pink">' +
        hudHtml(ep) +
        '<div class="card-stage">' +
          '<div class="card-prompt"><p>' + card.prompt + '</p></div>' +
          '<img class="character character--' + ep.character + '" src="images/char-' + ep.character + '.webp" alt="">' +
          '<div class="streak-badge" id="streak-badge">Série : ' + state.streak + '</div>' +
          '<div class="columns">' + columnsHtml + '</div>' +
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
    return (mm < 10 ? '0' + mm : mm) + ':' + (ss < 10 ? '0' + ss : ss);
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
      state.epreuveCorrect += 1;
    } else {
      state.streak = 0;
    }
    state.score += points;

    markColumnButtons(ep, card, columnId, isCorrect);
    updateHudLiveValues();
    showFeedback(ep, card, isCorrect, isTimeout, points);
  }

  function updateHudLiveValues() {
    var scoreEl = document.getElementById('hud-score');
    if (scoreEl) scoreEl.textContent = state.score + ' points';
    var streakEl = document.getElementById('streak-badge');
    if (streakEl) streakEl.textContent = 'Série : ' + state.streak;
  }

  function markColumnButtons(ep, card, chosenColumnId, isCorrect) {
    Array.prototype.forEach.call(document.querySelectorAll('.column-btn'), function (btn) {
      var colId = btn.getAttribute('data-col');
      btn.disabled = true;
      if (colId === card.correct) {
        btn.classList.add('column-btn--correct');
      } else if (colId === chosenColumnId) {
        btn.classList.add('column-btn--incorrect');
      }
    });
  }

  function columnLabel(ep, columnId) {
    var col = ep.columns.filter(function (c) { return c.id === columnId; })[0];
    return col ? col.label : '';
  }

  function showFeedback(ep, card, isCorrect, isTimeout, points) {
    var bar = document.getElementById('feedback-bar');
    bar.hidden = false;

    if (isCorrect) {
      bar.className = 'feedback-bar feedback-bar--correct';
      bar.innerHTML = '<p>+' + points + ' pts. ' + card.explanation + '</p>';
      setTimeout(advanceAfterFeedback, DATA.correctAutoAdvanceMs);
      return;
    }

    var label = isTimeout ? DATA.timeoutLabel : DATA.wrongLabel;
    bar.className = 'feedback-bar feedback-bar--wrong';
    bar.innerHTML =
      '<p><strong>' + label + '.</strong> Réponse : ' + columnLabel(ep, card.correct) + '. ' + card.explanation + '</p>' +
      '<button class="btn btn--continue" id="btn-continue">' + DATA.continueLabel + '</button>';
    document.getElementById('btn-continue').addEventListener('click', advanceAfterFeedback);
  }

  function advanceAfterFeedback() {
    var ep = currentEpreuve();
    state.cardIndex += 1;
    if (state.cardIndex >= ep.cards.length) {
      showEpreuveRecap();
    } else {
      showCard();
    }
  }

  // ---------- Récap d'épreuve ----------

  function showEpreuveRecap() {
    var ep = currentEpreuve();
    var isLastEpreuve = state.epreuveIndex >= DATA.epreuves.length - 1;

    render(
      '<section class="screen screen--narrative bg-pink">' +
        hudHtml(ep, ep.cards.length) +
        '<div class="panel panel--recap">' +
          '<h2>' + state.epreuveCorrect + ' / ' + ep.cards.length + '</h2>' +
          '<p>' + state.epreuveCorrect + ' ' + ep.recapWording.good + '</p>' +
          '<p class="score-total">Score total : ' + state.score + ' points</p>' +
          '<button class="btn btn--primary" id="btn-next">' +
            (isLastEpreuve ? 'Voir le bilan' : 'Épreuve suivante') +
          '</button>' +
        '</div>' +
      '</section>'
    );

    document.getElementById('btn-next').addEventListener('click', function () {
      if (isLastEpreuve) {
        showBilan();
      } else {
        state.epreuveIndex += 1;
        showEpreuveIntro();
      }
    });
  }

  // ---------- Bilan final ----------

  function pickTierMessage(successRate) {
    var tiers = DATA.bilan.tiers;
    for (var i = 0; i < tiers.length; i++) {
      if (successRate >= tiers[i].min) return tiers[i].message;
    }
    return tiers[tiers.length - 1].message;
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
    var message = pickTierMessage(successRate);
    var d = DATA.bilan;

    render(
      '<section class="screen screen--narrative bg-light screen--bilan">' +
        '<header class="hud hud--bilan">' +
          '<span class="hud__step">Adecco</span>' +
          '<h2 class="hud__title">' + d.title + '</h2>' +
          '<span class="hud__cards">Étapes terminées : ' + DATA.epreuves.length + ' / ' + DATA.epreuves.length + '</span>' +
        '</header>' +
        '<img class="group-photo" src="images/group-photo.webp" alt="">' +
        '<div class="panel">' +
          '<h3 class="bilan-score">' + finalScore + ' / ' + maxScore + ' pts</h3>' +
          '<p>' + message + '</p>' +
          '<p>' + d.closing + '</p>' +
          '<button class="btn btn--primary" id="btn-classement">' + d.cta + '</button>' +
        '</div>' +
      '</section>'
    );

    window.ACCGP.sendScore(finalScore, maxScore, {
      gameId: DATA.meta.gameId,
      correctCount: state.totalCorrect,
      totalCards: totalCards(),
    });

    document.getElementById('btn-classement').addEventListener('click', function (e) {
      e.target.disabled = true;
      e.target.textContent = 'Score envoyé ✓';
    });
  }

  document.addEventListener('DOMContentLoaded', showWelcome);
})();
