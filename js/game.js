/**
 * game.js — « Le Dossier Herbin »
 * =================================
 * State machine du jeu : écran d'accueil, 3 épreuves de 7 cartes chronométrées,
 * récap par épreuve, bilan final. Calcule le score selon le barème du document
 * de scoring validé et transmet le résultat à Bubble via ACCGP.sendScore.
 *
 * La structure de chaque écran (bandeau, cadre à coins rouges, bandeau de
 * rappel du contexte, bulle du collègue Copilot, etc.) reproduit les écrans
 * de la maquette Figma « Mini Jeu 1_Développement_V2 ».
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

  // ---------- Petits composants réutilisés sur plusieurs écrans ----------

  // Cadre avec les 4 coins rouges façon viseur, utilisé pour tous les
  // panneaux narratifs et le bandeau de rappel de contexte.
  function bracketCorners() {
    return (
      '<i class="corner corner--tl" aria-hidden="true"></i>' +
      '<i class="corner corner--tr" aria-hidden="true"></i>' +
      '<i class="corner corner--bl" aria-hidden="true"></i>' +
      '<i class="corner corner--br" aria-hidden="true"></i>'
    );
  }

  function hudHtml(stepLabel, title, cardsLabel, options) {
    options = options || {};
    var logo = options.logo
      ? '<img class="hud__logo" src="images/adecco-logo.webp" alt="Adecco">'
      : '<span class="hud__step">' + stepLabel + '</span>';
    return (
      '<header class="hud' + (options.modifier ? ' ' + options.modifier : '') + '">' +
        logo +
        '<div class="hud__center">' +
          '<h2 class="hud__title">' + title + '</h2>' +
          (cardsLabel ? '<span class="hud__cards">' + cardsLabel + '</span>' : '') +
        '</div>' +
        (options.hideScore ? '<span class="hud__score"></span>' : '<span class="hud__score" id="hud-score">' + state.score + ' points</span>') +
      '</header>'
    );
  }

  // Bandeau de rappel du contexte de l'épreuve, affiché en haut des écrans
  // de carte et de feedback (reprend le titre + contexte de l'intro, ou à
  // défaut les deux paragraphes d'intro tels quels).
  function reminderBoxHtml(ep) {
    var inner;
    if (ep.intro.title) {
      inner =
        '<h3>' + ep.intro.title + '</h3>' +
        '<p>' + ep.intro.context.join('<br>') + '</p>';
    } else {
      inner = ep.intro.lead.map(function (p) { return '<p>' + p + '</p>'; }).join('');
    }
    return '<div class="bracket-panel reminder-box">' + bracketCorners() + inner + '</div>';
  }

  function mascotBubbleHtml(ep, text) {
    return (
      '<div class="mascot-bubble">' +
        '<div class="mascot-bubble__text">' + text + '</div>' +
        '<div class="mascot-bubble__portrait mascot-bubble__portrait--pose' + ep.mascotPose + '"></div>' +
      '</div>'
    );
  }

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  // ---------- Écran d'accueil ----------

  function showWelcome() {
    var d = DATA.intro;
    render(
      '<section class="screen screen--narrative bg-light">' +
        '<div class="bracket-panel panel">' +
          bracketCorners() +
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
        hudHtml(ep.stepLabel, ep.title, 'Cartes : 0 / ' + ep.cards.length) +
        '<div class="bracket-panel panel">' +
          bracketCorners() +
          ep.intro.lead.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
          (ep.intro.title ? '<h3>' + ep.intro.title + '</h3>' : '') +
          (ep.intro.context.length
            ? '<p class="context">' + ep.intro.context.join('<br>') + '</p>'
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
          '<button class="column-btn column-btn--' + col.pill + '" data-col="' + col.id + '">' +
            '<img class="column-btn__pill" src="images/pill-' + col.pill + '.webp" alt="">' +
            '<span>' + col.label + '</span>' +
          '</button>'
        );
      })
      .join('');

    var promptText = ep.cardLabel.quoted ? '“' + card.prompt + '”' : card.prompt;

    render(
      '<section class="screen screen--card bg-pink">' +
        hudHtml(ep.stepLabel, ep.title, 'Cartes : ' + state.cardIndex + ' / ' + ep.cards.length) +
        '<div class="card-stage">' +
          reminderBoxHtml(ep) +
          '<div class="stage-middle">' +
            '<div class="statement-box">' +
              '<p class="statement-prefix">' + ep.cardLabel.prefix + '</p>' +
              '<p class="statement-text' + (ep.cardLabel.quoted ? ' statement-text--quoted' : '') + '">' + promptText + '</p>' +
            '</div>' +
            '<img class="character character--' + ep.character + '" src="images/char-' + ep.character + '.webp" alt="">' +
          '</div>' +
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

    if (ep.showMascotOnFeedback) {
      var reactionPool = isTimeout ? DATA.mascotReactions.timeout : DATA.mascotReactions.wrong;
      var stage = document.querySelector('.stage-middle');
      if (stage) stage.insertAdjacentHTML('beforeend', mascotBubbleHtml(ep, pickRandom(reactionPool)));
    }
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
        hudHtml(ep.stepLabel, ep.title, 'Cartes : ' + ep.cards.length + ' / ' + ep.cards.length) +
        '<div class="bracket-panel panel panel--recap">' +
          bracketCorners() +
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
        hudHtml(d.eyebrow, d.title, 'Étapes terminées : ' + DATA.epreuves.length + ' / ' + DATA.epreuves.length, { logo: true, hideScore: true, modifier: 'hud--bilan' }) +
        '<img class="group-photo" src="images/group-photo.webp" alt="">' +
        '<div class="bracket-panel panel panel--bilan">' +
          bracketCorners() +
          '<h3 class="bilan-score">' + finalScore + ' / ' + maxScore + ' pts</h3>' +
          '<p>' + message + '</p>' +
          '<p>' + d.closing + '</p>' +
          '<button class="btn btn--primary btn--chevron" id="btn-classement">' +
            '<span>' + d.cta + '</span>' +
            '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M5 2l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
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
