/**
 * game.js : logique et rendu du jeu « Le Dossier Herbin ».
 *
 * Chaque écran est dessiné sur une scène de 1638 × 1024 px, aux coordonnées
 * exactes de la maquette Figma V2, puis mis à l'échelle pour tenir dans la
 * fenêtre. Quand la scène deviendrait illisible (téléphone, tablette en
 * portrait), la classe `is-flow` bascule sur la mise en page verticale.
 *
 * Le score part vers Bubble (ACCGP) une seule fois, au clic sur
 * « Voir le classement », ou à la fermeture du jeu si le bilan est affiché.
 */
'use strict';

(function () {
  const DATA = window.GAME_DATA;
  const RULES = DATA.scoring;
  const { cardPoints, finalScore, tierFor, shuffle } = window.Scoring;

  const STAGE_W = DATA.meta.stage.width;
  const STAGE_H = DATA.meta.stage.height;
  const MAX_SCORE = DATA.meta.maxScore;
  const TOTAL_CARDS = DATA.epreuves.reduce((n, ep) => n + ep.cards.length, 0);
  // En dessous de cette échelle, le texte de 14 px de la maquette ferait moins de 7 px.
  const FLOW_SCALE_THRESHOLD = 0.5;
  const DRAG_THRESHOLD_PX = 6;

  const root = document.documentElement;
  const stage = document.getElementById('stage');

  const state = {
    screen: 'welcome',
    epIndex: 0,
    order: [],          // ordre aléatoire des cartes de l'épreuve en cours
    cardPos: 0,
    score: 0,
    correctCount: 0,
    results: [],        // { epreuve, correct, points } pour chaque carte jouée
    answered: false,
    cardStartedAt: 0,
    timerFrame: 0,
    advanceTimer: 0,
    gameStartedAt: 0,
    final: null,        // { score, tier } une fois le bilan atteint
    scoreSent: false,
    scale: 1,
  };

  /* ---------- Utilitaires ---------- */

  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ESCAPES[c]);

  const pointsLabel = (n) => `${n} point${n > 1 ? 's' : ''}`;
  const timerLabel = (seconds) => `00 : ${String(seconds).padStart(2, '0')}`;
  const currentEpreuve = () => DATA.epreuves[state.epIndex];
  const currentCard = () => currentEpreuve().cards[state.order[state.cardPos]];

  function line(item) {
    if (item === '') return '<span class="line line--blank" aria-hidden="true">&nbsp;</span>';
    if (typeof item === 'string') return `<span class="line">${esc(item)}</span>`;
    if (item.title) return `<strong class="line line--title">${esc(item.title)}</strong>`;
    return `<strong class="line">${esc(item.bold)}</strong>`;
  }

  function textBlocks(blocks, width) {
    return `<div class="consigne__text" style="--text-w:${width}px">${blocks
      .map((block) => `<p class="consigne__block">${block.map(line).join('')}</p>`)
      .join('')}</div>`;
  }

  const CORNERS_TOP = '<img src="img/corner-tl.svg" alt=""><img src="img/corner-tr.svg" alt="">';
  // L'accueil utilise ses propres crochets du bas (pivotés), les autres écrans retournent ceux du haut.
  const CORNERS_BOTTOM_WELCOME = '<span class="corner-rot corner-rot--left"><img src="img/corner-bl.svg" alt=""></span><span class="corner-rot corner-rot--right"><img src="img/corner-br.svg" alt=""></span>';

  /** Panneau translucide encadré des 4 crochets rouges. */
  function consigne(inner, modifier) {
    const bottom = modifier === 'welcome' ? CORNERS_BOTTOM_WELCOME : CORNERS_TOP;
    return `
      <section class="consigne consigne--${modifier}">
        <div class="corners" aria-hidden="true">${CORNERS_TOP}</div>
        <div class="consigne__body"><div class="consigne__panel">${inner}</div></div>
        <div class="corners corners--bottom${modifier === 'welcome' ? '' : ' corners--flipped'}" aria-hidden="true">${bottom}</div>
      </section>`;
  }

  const background = (variant) => `<div class="bg bg--${variant}" aria-hidden="true"></div>`;

  const chevron = '<img class="btn__chevron" src="img/chevron.svg" alt="" aria-hidden="true">';

  function gameNav(ep) {
    const cardNumber = Math.min(state.cardPos + 1, ep.cards.length);
    return `
      <header class="nav">
        <p class="nav__side nav__step">${esc(ep.step)}</p>
        <div class="nav__center">
          <h1 class="nav__title">${esc(ep.title)}</h1>
          <p class="nav__counter"><span class="nav__counter-label">Cartes :</span><span class="nav__counter-value">${cardNumber} / ${ep.cards.length}</span></p>
        </div>
        <p class="nav__side nav__score" data-ref="score">${pointsLabel(state.score)}</p>
      </header>`;
  }

  function endNav() {
    return `
      <header class="nav">
        <div class="nav__logo"><img src="img/logo-adecco.webp" alt="Adecco"></div>
        <div class="nav__center">
          <h1 class="nav__title">${esc(DATA.end.title)}</h1>
          <p class="nav__counter"><span class="nav__counter-label">${esc(DATA.end.progressLabel)}</span><span class="nav__counter-value">${esc(DATA.end.progressValue)}</span></p>
        </div>
        <div class="nav__logo nav__logo--ghost" aria-hidden="true"></div>
      </header>`;
  }

  function pill(column) {
    return `<span class="pill" aria-hidden="true"><span class="capsule capsule--${column.pill}" style="--tilt:${column.tilt}deg"><span class="capsule__body"></span><span class="capsule__shine"></span><span class="capsule__joint"></span></span></span>`;
  }

  /* ---------- Scène et responsive ---------- */

  function fitStage() {
    const scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    state.scale = scale;
    root.classList.toggle('is-flow', scale < FLOW_SCALE_THRESHOLD);
    root.style.setProperty('--scale', String(scale));
  }

  /** Échelle effective de la scène (1 en mise en page verticale, sans transformation). */
  const effectiveScale = () => (root.classList.contains('is-flow') ? 1 : state.scale);

  function setScreen(name, html) {
    state.screen = name;
    stage.className = `stage screen--${name}`;
    stage.innerHTML = html;
    window.scrollTo(0, 0);
  }

  // Le focus ne suit l'écran que pour les joueurs au clavier : à la souris ou au doigt,
  // un anneau de focus apparaîtrait sur un bouton absent de la maquette.
  let keyboardUser = false;
  window.addEventListener('keydown', () => { keyboardUser = true; }, true);
  window.addEventListener('pointerdown', () => { keyboardUser = false; }, true);

  function focus(selector) {
    const el = stage.querySelector(selector);
    if (el && keyboardUser) el.focus({ preventScroll: true });
  }

  /* ---------- Écrans ---------- */

  function renderWelcome() {
    const w = DATA.welcome;
    setScreen('welcome', `
      ${background('home')}
      ${consigne(`
        <div class="avatar" aria-hidden="true"><img src="img/avatar-morpheus.webp" alt=""></div>
        ${textBlocks(w.blocks, w.width)}
        <button type="button" class="btn btn--cta" data-action="start">${esc(w.cta)}</button>`, 'welcome')}`);
    focus('[data-action="start"]');
  }

  function renderIntro() {
    const ep = currentEpreuve();
    setScreen('intro', `
      ${background('game')}
      ${gameNav(ep)}
      <div class="intro-area">
        ${consigne(`
          ${textBlocks(ep.intro.blocks, ep.intro.width)}
          <button type="button" class="btn btn--cta" data-action="begin">${esc(ep.intro.cta)}</button>`, 'intro')}
      </div>`);
    focus('[data-action="begin"]');
  }

  function renderQuestion() {
    const ep = currentEpreuve();
    const card = currentCard();
    state.answered = false;

    setScreen('question', `
      ${background('game')}
      ${gameNav(ep)}
      ${consigne(textBlocks(ep.reminder.blocks, ep.reminder.width), 'reminder')}
      <img class="character" src="${ep.character.src}" alt="${esc(ep.character.alt)}"
           style="--char-x:${ep.character.x}px; --char-w:${ep.character.width}px">
      <div class="card-box" data-ref="card" style="--card-w:${ep.card.width}px">
        <p class="card-box__text" style="--card-text-w:${ep.card.width - 60}px">
          <span class="card-box__label">${esc(ep.card.label)}</span>
          <span class="card-box__blank" aria-hidden="true">&nbsp;</span>
          <strong class="card-box__statement">${esc(card.text)}</strong>
        </p>
      </div>
      <div class="choices" role="group" aria-label="Ta réponse" style="--choice-w:${ep.choices.width}px; --choice-gap:${ep.choices.gap}px">
        ${ep.columns.map((col) => `
          <button type="button" class="choice" data-action="answer" data-column="${col.id}">${pill(col)}<span class="choice__label">${esc(col.label)}</span></button>`).join('')}
      </div>
      <div class="footer">
        <div class="bottom-bar">
          <p class="timer" data-ref="timer" aria-hidden="true">${timerLabel(ep.timerSeconds)}</p>
          <p class="feedback" data-ref="feedback" role="status" aria-live="polite"></p>
        </div>
        <img class="mascot" data-ref="mascot" src="${ep.mascot.src}" alt="" style="--mascot-top:${ep.mascot.top}px" hidden>
        <button type="button" class="btn btn--continue" data-action="continue" hidden>${esc(DATA.feedback.continueLabel)}${chevron}</button>
      </div>`);

    focus('.choice');
    startTimer();
  }

  function renderEnd() {
    const end = DATA.end;
    const { score, tier } = state.final;
    setScreen('end', `
      ${background('home')}
      ${endNav()}
      <img class="group-photo" src="img/group.webp" alt="Neo, Trinity, Morpheus et leurs acolytes célèbrent la fin de la mission">
      ${consigne(`
        <div class="end-text">
          <p class="end-text__score">${esc(end.scoreLine(score, MAX_SCORE))}</p>
          <p class="end-text__message" style="--message-size:${end.messageFontSize[tier]}px">
            <span class="line">${esc(end.messages[tier])}</span>
            <span class="line line--blank" aria-hidden="true">&nbsp;</span>
            ${end.closingLines.map((l) => `<span class="line">${esc(l)}</span>`).join('')}
          </p>
        </div>`, 'end')}
      <button type="button" class="btn btn--continue btn--ranking" data-action="ranking">${esc(end.cta)}${chevron}</button>`);
    focus('[data-action="ranking"]');
  }

  /* ---------- Chrono ---------- */

  function startTimer() {
    stopTimer();
    const ep = currentEpreuve();
    const timerEl = stage.querySelector('[data-ref="timer"]');
    const durationMs = ep.timerSeconds * 1000;
    let shown = ep.timerSeconds;
    state.cardStartedAt = performance.now();

    const tick = (now) => {
      const elapsed = now - state.cardStartedAt;
      if (elapsed >= durationMs) {
        timerEl.textContent = timerLabel(0);
        resolveCard(null);
        return;
      }
      const remaining = Math.ceil((durationMs - elapsed) / 1000);
      if (remaining !== shown) {
        shown = remaining;
        timerEl.textContent = timerLabel(remaining);
      }
      state.timerFrame = requestAnimationFrame(tick);
    };
    state.timerFrame = requestAnimationFrame(tick);
  }

  function stopTimer() {
    cancelAnimationFrame(state.timerFrame);
    state.timerFrame = 0;
  }

  /* ---------- Réponse et feedback ---------- */

  /** @param {string|null} columnId colonne choisie, ou null si le chrono est écoulé */
  function resolveCard(columnId) {
    if (state.answered) return;
    state.answered = true;
    stopTimer();

    const ep = currentEpreuve();
    const card = currentCard();
    const elapsed = performance.now() - state.cardStartedAt;
    const isCorrect = columnId === card.correct;
    const points = cardPoints(isCorrect, elapsed, ep.timerSeconds, RULES);

    state.score += points;
    if (isCorrect) state.correctCount += 1;
    state.results.push({ epreuve: ep.id, correct: isCorrect, points });

    stage.querySelectorAll('.choice').forEach((button) => {
      const col = button.dataset.column;
      button.disabled = true;
      button.classList.toggle('is-correct', col === card.correct);
      button.classList.toggle('is-wrong', col === columnId && !isCorrect);
    });
    stage.querySelector('[data-ref="card"]').classList.add('is-locked');
    stage.querySelector('[data-ref="score"]').textContent = pointsLabel(state.score);
    stage.classList.add('is-answered');

    const fb = DATA.feedback;
    const answer = ep.columns.find((c) => c.id === card.correct).answer;
    const feedbackEl = stage.querySelector('[data-ref="feedback"]');

    if (isCorrect) {
      feedbackEl.innerHTML = `<span class="feedback__lead feedback__lead--good">${esc(fb.correctPrefix(points))}</span><span class="feedback__body">${esc(card.explanation)}</span>`;
      state.advanceTimer = window.setTimeout(nextCard, RULES.autoAdvanceMs);
      return;
    }

    const lead = columnId === null ? fb.timeoutPrefix : fb.wrongPrefix;
    feedbackEl.innerHTML = `<span class="feedback__lead feedback__lead--bad">${esc(lead)}</span><span class="feedback__body">${esc(fb.answerLine(answer, card.explanation))}</span>`;
    stage.querySelector('[data-ref="mascot"]').hidden = false;
    stage.querySelector('[data-action="continue"]').hidden = false;
    focus('[data-action="continue"]');
  }

  function nextCard() {
    window.clearTimeout(state.advanceTimer);
    const ep = currentEpreuve();
    state.cardPos += 1;
    if (state.cardPos < ep.cards.length) {
      renderQuestion();
      return;
    }
    state.epIndex += 1;
    if (state.epIndex < DATA.epreuves.length) {
      startEpreuve();
      return;
    }
    finishGame();
  }

  function startEpreuve() {
    const ep = currentEpreuve();
    state.order = shuffle(ep.cards.map((_, i) => i));
    state.cardPos = 0;
    renderIntro();
  }

  function finishGame() {
    const score = finalScore(state.results.map((r) => r.points), RULES);
    state.final = { score, tier: tierFor(state.correctCount, TOTAL_CARDS, RULES) };
    renderEnd();
  }

  /* ---------- Envoi du score à Bubble (ACCGP) ---------- */

  function sendFinalScore() {
    if (state.scoreSent || !state.final) return;
    state.scoreSent = true;
    window.ACCGP.sendScore(state.final.score, MAX_SCORE, {
      gameId: DATA.meta.gameId,
      correctAnswers: state.correctCount,
      totalCards: TOTAL_CARDS,
      tier: state.final.tier,
      durationSeconds: Math.round((performance.now() - state.gameStartedAt) / 1000),
      epreuves: DATA.epreuves.map((ep) => {
        const rows = state.results.filter((r) => r.epreuve === ep.id);
        return { id: ep.id, correct: rows.filter((r) => r.correct).length, points: rows.reduce((s, r) => s + r.points, 0) };
      }),
    });
  }

  /* ---------- Glisser la carte sur une colonne ---------- */

  function setupDrag() {
    let drag = null;

    const columnAt = (x, y) => [...stage.querySelectorAll('.choice')].find((button) => {
      const r = button.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });

    const clearHover = () => stage.querySelectorAll('.choice.is-hover').forEach((b) => b.classList.remove('is-hover'));

    stage.addEventListener('pointerdown', (event) => {
      const card = event.target.closest('[data-ref="card"]');
      if (!card || state.answered || event.button !== 0) return;
      drag = { card, id: event.pointerId, x: event.clientX, y: event.clientY, moving: false };
      card.setPointerCapture(event.pointerId);
    });

    stage.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.moving && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      drag.moving = true;
      const s = effectiveScale();
      drag.card.classList.add('is-dragging');
      drag.card.style.setProperty('--drag-x', `${dx / s}px`);
      drag.card.style.setProperty('--drag-y', `${dy / s}px`);
      clearHover();
      const target = columnAt(event.clientX, event.clientY);
      if (target) target.classList.add('is-hover');
    });

    const endDrag = (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const { card, moving } = drag;
      drag = null;
      clearHover();
      card.classList.remove('is-dragging');
      card.style.removeProperty('--drag-x');
      card.style.removeProperty('--drag-y');
      if (!moving || event.type === 'pointercancel' || state.answered) return;
      const target = columnAt(event.clientX, event.clientY);
      if (target) resolveCard(target.dataset.column);
    };
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
  }

  /* ---------- Actions ---------- */

  const actions = {
    start() {
      state.gameStartedAt = performance.now();
      state.epIndex = 0;
      startEpreuve();
    },
    begin: renderQuestion,
    answer(button) { resolveCard(button.dataset.column); },
    continue: nextCard,
    ranking: sendFinalScore,
  };

  stage.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    const action = actions[button.dataset.action];
    if (action) action(button);
  });

  // Filet de sécurité : si Bubble ferme le jeu sur l'écran de bilan avant le clic
  // sur « Voir le classement », le score part quand même (une seule fois).
  window.addEventListener('pagehide', () => {
    if (state.screen === 'end') sendFinalScore();
  });

  function preloadImages() {
    const sources = new Set(['img/bg-game.webp', 'img/group.webp', 'img/logo-adecco.webp']);
    DATA.epreuves.forEach((ep) => { sources.add(ep.character.src); sources.add(ep.mascot.src); });
    sources.forEach((src) => { const img = new Image(); img.decoding = 'async'; img.src = src; });
  }

  function init() {
    fitStage();
    window.addEventListener('resize', fitStage);
    setupDrag();
    // On attend les polices pour que le premier écran s'affiche directement avec les bonnes métriques.
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1500))]).then(() => {
      renderWelcome();
      preloadImages();
    });
  }

  init();
})();
