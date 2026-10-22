/**
 * data.js : contenu du jeu « Le Dossier Herbin »
 * ================================================
 * Source unique : page Figma « Mini Jeu 1_Développement_V2 » (fichier
 * Plateformes_Adecco, page 588:231). Tous les textes sont copiés mot pour mot
 * depuis les écrans Accueil, Intro, Question, Juste, Faux, TempsEcoule et Fin.
 * Le barème vient du document « Scoring explication » de la même page
 * (version validée le 21/10/2026).
 *
 * Format des textes de panneau :
 *   blocks = [ bloc, bloc, ... ]   (blocs séparés par l'espacement Figma)
 *   bloc   = [ ligne, ligne, ... ]
 *   ligne  = 'texte'               (Inter 14)
 *          | ''                    (ligne vide de 14 px, comme dans Figma)
 *          | { title: 'texte' }    (Inter Bold 18)
 *          | { bold: 'texte' }     (Inter Bold 14)
 *
 * Les coordonnées (x, top, width...) sont celles du cadre Figma 1638 × 1024.
 */
'use strict';

window.GAME_DATA = {
  meta: {
    gameId: 'adecco-dossier-herbin',
    maxScore: 210,
    stage: { width: 1638, height: 1024 },
  },

  scoring: {
    basePoints: 7,
    speedBonus: [3, 2, 1],        // 1er, 2e, 3e tiers du chrono
    minimumFinalScore: 1,
    autoAdvanceMs: 1600,          // délai avant la carte suivante après une bonne réponse
    tiers: [                       // seuils sur le taux de bonnes réponses
      { id: 'maitrise', minRate: 0.85 },
      { id: 'bon', minRate: 0.60 },
      { id: 'consolider', minRate: 0 },
    ],
  },

  welcome: {
    width: 520,
    blocks: [
      [
        { title: 'Bienvenue dans la Matrice.' },
        '',
        'Ton entraînement est terminé : te voilà connecté.',
        "Sur ton chemin, une série d'épreuves t'attend, une nouvelle chaque mois.",
      ],
      [
        'Ce mois-ci, place au recrutement.',
        '',
        "Un dossier urgent vient d'arriver : Mme Herbin, cliente de ton agence, cherche un technicien de maintenance autonome. Avec Copilot à tes côtés, tu vas le mener de bout en bout, en trois épreuves : choisir ce que tu confies à Copilot, lui donner le bon prompt, puis vérifier sa réponse.",
      ],
      [
        'À chaque épreuve, les cartes défileront et le temps sera compté.',
        '',
        'Range chacune à sa juste place :',
        "plus tu enchaînes les bonnes réponses, plus ton score s'envole.",
        '',
        { bold: 'Tu es prêt. Je le sais.' },
      ],
    ],
    cta: 'Commencer la mission',
  },

  epreuves: [
    {
      id: 'partage-des-roles',
      step: 'Étape 1',
      title: 'Le partage des rôles',
      timerSeconds: 10,
      intro: {
        width: 760,
        blocks: [
          [{ title: 'Enjeu : Savoir quoi confier à Copilot' }],
          ["Mme Herbin a besoin d'un technicien de maintenance, et vite. Pour gagner du temps, tu fais équipe avec Copilot."],
          ['Pour chaque tâche du dossier, décide : la confies-tu à Copilot, ou gardes-tu la main ?'],
        ],
        cta: 'Commencer la mission',
      },
      reminder: {
        width: 760,
        blocks: [
          [{ title: 'Enjeu : Savoir quoi confier à Copilot' }],
          ['Pour chaque tâche du dossier, décide : la confies-tu à Copilot, ou gardes-tu la main ?'],
        ],
      },
      character: { src: 'img/char-neo.webp', alt: 'Neo', x: 474, width: 690 },
      card: { label: 'Tâche du dossier :', width: 700 },
      choices: { width: 340, gap: 40 },
      mascot: { src: 'img/mascot-e1.webp', top: 689 },
      columns: [
        { id: 'confie', label: 'JE LA CONFIE À COPILOT', answer: 'Je la confie à Copilot', pill: 'blue', tilt: -35 },
        { id: 'garde', label: 'JE GARDE LA MAIN', answer: 'Je garde la main', pill: 'red', tilt: 35 },
      ],
      cards: [
        { text: "Rédiger un premier jet pour l'annonce", correct: 'confie', explanation: 'Il te fait gagner un temps précieux sur la rédaction : tu relis et ajustes ensuite.' },
        { text: "Mener l'entretien avec le candidat", correct: 'garde', explanation: "L'écoute et la relation humaine restent au cœur de ton métier." },
        { text: "Résumer tes notes d'échange avec Mme Herbin", correct: 'confie', explanation: 'Une synthèse claire en quelques secondes, prête à être relue.' },
        { text: 'Décider de présenter le candidat au client', correct: 'garde', explanation: "C'est une décision de recruteur : Copilot éclaire, toi tu tranches." },
        { text: "Préparer une trame de questions d'entretien", correct: 'confie', explanation: 'Il te propose une base solide, que tu adaptes ensuite au profil.' },
        { text: "Valider l'annonce avant sa publication", correct: 'garde', explanation: "Tu restes responsable de ce qui est publié au nom de l'agence." },
        { text: 'Repérer dans un CV les compétences demandées', correct: 'confie', explanation: "Il accélère ta lecture : à toi d'interpréter ce qu'il relève." },
      ],
    },
    {
      id: 'le-bon-prompt',
      step: 'Étape 2',
      title: 'Le bon prompt',
      timerSeconds: 12,
      intro: {
        width: 760,
        blocks: [
          [
            { title: 'Enjeu : Bien briefer Copilot' },
            '',
            "Tu demandes à Copilot de rédiger l'annonce pour Mme Herbin. Un bon prompt réunit quatre ingrédients.",
            '',
            'Pour chaque morceau de ton prompt, décide : but, contexte, source ou attentes ?',
            '',
            'But = ce que tu demandes.',
            'Contexte = la situation et le besoin.',
            "Source = les documents sur lesquels s'appuyer.",
            'Attentes = la forme du résultat.',
          ],
        ],
        cta: 'Commencer la mission',
      },
      reminder: {
        width: 1260,
        blocks: [
          [
            { title: 'Enjeu : Bien briefer Copilot' },
            '',
            "Tu demandes à Copilot de rédiger l'annonce pour Mme Herbin. Pour chaque morceau de ton prompt, décide : but, contexte, source ou attentes ?",
            '',
            "But = ce que tu demandes · Contexte = la situation et le besoin · Source = les documents sur lesquels s'appuyer · Attentes = la forme du résultat",
          ],
        ],
      },
      character: { src: 'img/char-trinity.webp', alt: 'Trinity', x: 419, width: 800 },
      card: { label: 'Morceau de ton prompt :', width: 800 },
      choices: { width: 230, gap: 20 },
      mascot: { src: 'img/mascot-e2.webp', top: 734 },
      columns: [
        { id: 'but', label: 'BUT', answer: 'But', pill: 'blue', tilt: -35 },
        { id: 'contexte', label: 'CONTEXTE', answer: 'Contexte', pill: 'pink', tilt: -35 },
        { id: 'source', label: 'SOURCE', answer: 'Source', pill: 'red', tilt: 35 },
        { id: 'attentes', label: 'ATTENTES', answer: 'Attentes', pill: 'green', tilt: 35 },
      ],
      cards: [
        { text: '« Rédige une annonce pour un poste de technicien de maintenance. »', correct: 'but', explanation: "C'est la tâche précise que tu confies à Copilot." },
        { text: '« Ma cliente, Mme Herbin, cherche un technicien autonome pour un site de production. »', correct: 'contexte', explanation: 'Copilot comprend la situation et le besoin du client.' },
        { text: '« 150 mots maximum, sur un ton chaleureux. »', correct: 'attentes', explanation: 'Tu cadres la longueur et le ton du résultat.' },
        { text: '« Appuie-toi sur le compte rendu de mon échange avec la cliente. »', correct: 'source', explanation: 'Copilot travaille à partir de tes informations, pas de suppositions.' },
        { text: '« Le candidat intégrera une petite équipe et doit démarrer rapidement. »', correct: 'contexte', explanation: "Ces précisions orientent le ton et les arguments de l'annonce." },
        { text: '« Présente les missions sous forme de liste à puces. »', correct: 'attentes', explanation: 'Tu indiques la mise en forme que tu veux obtenir.' },
        { text: '« Utilise la fiche de poste en pièce jointe. »', correct: 'source', explanation: "Un document de référence fiabilise le contenu de l'annonce." },
      ],
    },
    {
      id: 'la-reponse-de-copilot',
      step: 'Étape 3',
      title: 'La réponse de Copilot',
      timerSeconds: 9,
      intro: {
        width: 760,
        blocks: [
          [
            { title: "Enjeu : Garder la main sur l'analyse" },
            '',
            "Tu as transmis à Copilot la demande client, le CV de Gérard et ta synthèse d'entretien. Il t'aide à aller plus vite, mais c'est toi qui décides.",
            '',
            'Trie ses affirmations dans les catégories suivantes : fait confirmé, hypothèse ou info à vérifier.',
          ],
        ],
        cta: 'Commencer la mission',
      },
      reminder: {
        width: 1260,
        blocks: [
          [
            { title: "Enjeu : Garder la main sur l'analyse" },
            '',
            "Copilot t'aide à aller plus vite, mais c'est toi qui décides : trie ses affirmations en fait confirmé, hypothèse ou à vérifier.",
          ],
        ],
      },
      character: { src: 'img/char-morpheus.webp', alt: 'Morpheus', x: 474, width: 690 },
      card: { label: 'Copilot affirme :', width: 800 },
      choices: { width: 300, gap: 39 },
      mascot: { src: 'img/mascot-e3.webp', top: 649 },
      columns: [
        { id: 'fait', label: 'FAIT CONFIRMÉ', answer: 'Fait confirmé', pill: 'blue', tilt: -35 },
        { id: 'hypothese', label: 'HYPOTHÈSE', answer: 'Hypothèse', pill: 'pink', tilt: 0 },
        { id: 'verifier', label: 'À VÉRIFIER', answer: 'À vérifier', pill: 'red', tilt: 35 },
      ],
      cards: [
        { text: '« Gérard détient une habilitation électrique à jour. »', correct: 'fait', explanation: "C'est écrit sur son CV." },
        { text: "« Gérard s'intégrera sans difficulté dans une petite équipe. »", correct: 'hypothese', explanation: 'Copilot le déduit, mais rien ne le démontre encore.' },
        { text: '« Les techniciens de maintenance sont très recherchés partout en France. »', correct: 'verifier', explanation: "Il faut une source datée, et une tendance nationale ne dit rien du bassin d'emploi local." },
        { text: '« Le client souhaite idéalement un candidat titulaire du permis B. »', correct: 'fait', explanation: "Mme Herbin l'a précisé lors de votre échange." },
        { text: "« Le client attend sûrement 5 ans d'expérience en maintenance industrielle. »", correct: 'hypothese', explanation: "Le client ne l'a jamais demandé : Copilot suppose une exigence." },
        { text: '« Selon une étude récente, 70 % des entreprises peinent à recruter des techniciens de maintenance. »', correct: 'verifier', explanation: "Ni la source ni la date ne sont citées : à contrôler avant d'en parler au client." },
        { text: "« Gérard s'est montré motivé en entretien et peut démarrer rapidement. »", correct: 'fait', explanation: "Tu l'as constaté toi-même en entretien." },
      ],
    },
  ],

  feedback: {
    correctPrefix: (points) => `+${points} pts. `,
    wrongPrefix: 'Pas tout à fait. ',
    timeoutPrefix: 'Temps écoulé. ',
    answerLine: (answer, explanation) => `Réponse : ${answer}. ${explanation}`,
    continueLabel: 'Continuer',
  },

  end: {
    title: 'Le bilan',
    progressLabel: 'Étapes terminées :',
    progressValue: '3 / 3',
    scoreLine: (score, max) => `Score : ${score} / ${max} pts`,
    messages: {
      maitrise: 'Dossier maîtrisé : tu sais quoi confier à Copilot, tu le briefes avec précision et tu gardes la main sur ses réponses.',
      bon: "Bon réflexe global. Revois les ingrédients d'un bon prompt et la distinction entre hypothèse et information à vérifier.",
      consolider: "De bons réflexes à consolider. Le replay des webinaires t'attend sur ADICT.",
    },
    // Taille du texte du bilan, propre à chaque écran Fin de la maquette.
    messageFontSize: { maitrise: 16, bon: 22, consolider: 22 },
    closingLines: [
      "Copilot t'aide à construire tes arguments. C'est toi qui convaincs ton client.",
      'Rendez-vous le mois prochain pour une nouvelle épreuve.',
    ],
    cta: 'Voir le classement',
  },
};
