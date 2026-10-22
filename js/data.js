/**
 * data.js — Contenu du jeu « Le Dossier Herbin »
 * ================================================
 * Contenu copié tel quel depuis la page Figma « Mini Jeu 1_Développement_V2 »
 * (fichier Plateformes_Adecco, page 588:231) : les 21 cartes, leurs 2/3/4
 * options, le texte correct et les explications viennent tous des écrans
 * Question/Juste de cette page. Seul le barème (chronos, bonus, règle du
 * minimum, paliers du bilan) reste celui du document de scoring validé le
 * 21/10/2026, qui fait foi sur les chiffres.
 */
'use strict';

window.GAME_DATA = {
  meta: {
    gameId: 'dossier-herbin',
    maxScore: 210,
  },

  intro: {
    eyebrow: 'Adecco',
    title: 'Bienvenue dans la Matrice.',
    paragraphs: [
      'Ton entraînement est terminé : te voilà connecté.',
      'Sur ton chemin, une série d’épreuves t’attend, une nouvelle chaque mois.',
      'Ce mois-ci, place au recrutement.',
      'Un dossier urgent vient d’arriver : Mme Herbin, cliente de ton agence, cherche un technicien de maintenance autonome. Avec Copilot à tes côtés, tu vas le mener de bout en bout, en trois épreuves : choisir ce que tu confies à Copilot, lui donner le bon prompt, puis vérifier sa réponse.',
    ],
    bullets: [],
    closingParagraphs: [
      'À chaque épreuve, les cartes défileront et le temps sera compté.',
      'Range chacune à sa juste place : plus tu enchaînes les bonnes réponses, plus ton score s’envole.',
      'Tu es prêt. Je le sais.',
    ],
    cta: 'Commencer la mission',
  },

  epreuves: [
    {
      id: 'partage-des-roles',
      stepLabel: 'Étape 1',
      title: 'Le partage des rôles',
      character: 'neo',
      timerSeconds: 10,
      bonusThirds: [10 / 3, 20 / 3], // < 3,33 s / < 6,67 s / < 10 s
      intro: {
        enjeu: 'Enjeu : Savoir quoi confier à Copilot',
        lead: [
          'Mme Herbin a besoin d’un technicien de maintenance, et vite. Pour gagner du temps, tu fais équipe avec Copilot.',
          'Pour chaque tâche du dossier, décide : la confies-tu à Copilot, ou gardes-tu la main ?',
        ],
        cta: 'Commencer la mission',
      },
      reminder: {
        enjeu: 'Enjeu : Savoir quoi confier à Copilot',
        lead: ['Pour chaque tâche du dossier, décide : la confies-tu à Copilot, ou gardes-tu la main ?'],
      },
      cardLabel: { prefix: 'Tâche du dossier :', quoted: false },
      columns: [
        { id: 'confie', label: 'Je la confie à Copilot', capsule: 'blue', rotate: 'neg' },
        { id: 'garde', label: 'Je garde la main', capsule: 'red', rotate: 'pos' },
      ],
      cards: [
        { prompt: 'Rédiger un premier jet pour l’annonce', correct: 'confie', explanation: 'Il te fait gagner un temps précieux sur la rédaction : tu relis et ajustes ensuite.' },
        { prompt: 'Mener l’entretien avec le candidat', correct: 'garde', explanation: 'L’écoute et la relation humaine restent au cœur de ton métier.' },
        { prompt: 'Résumer tes notes d’échange avec Mme Herbin', correct: 'confie', explanation: 'Une synthèse claire en quelques secondes, prête à être relue.' },
        { prompt: 'Décider de présenter le candidat au client', correct: 'garde', explanation: 'C’est une décision de recruteur : Copilot éclaire, toi tu tranches.' },
        { prompt: 'Préparer une trame de questions d’entretien', correct: 'confie', explanation: 'Il te propose une base solide, que tu adaptes ensuite au profil.' },
        { prompt: 'Valider l’annonce avant sa publication', correct: 'garde', explanation: 'Tu restes responsable de ce qui est publié au nom de l’agence.' },
        { prompt: 'Repérer dans un CV les compétences demandées', correct: 'confie', explanation: 'Il accélère ta lecture : à toi d’interpréter ce qu’il relève.' },
      ],
    },
    {
      id: 'le-bon-prompt',
      stepLabel: 'Étape 2',
      title: 'Le bon prompt',
      character: 'trinity',
      timerSeconds: 12,
      bonusThirds: [4, 8], // < 4 s / < 8 s / < 12 s
      intro: {
        enjeu: 'Enjeu : Bien briefer Copilot',
        lead: [
          'Tu demandes à Copilot de rédiger l’annonce pour Mme Herbin. Un bon prompt réunit quatre ingrédients.',
          'Pour chaque morceau de ton prompt, décide : but, contexte, source ou attentes ?',
        ],
        details: [
          'But = ce que tu demandes.',
          'Contexte = la situation et le besoin.',
          'Source = les documents sur lesquels s’appuyer.',
          'Attentes = la forme du résultat.',
        ],
        cta: 'Commencer la mission',
      },
      reminder: {
        enjeu: 'Enjeu : Bien briefer Copilot',
        lead: [
          'Tu demandes à Copilot de rédiger l’annonce pour Mme Herbin. Pour chaque morceau de ton prompt, décide : but, contexte, source ou attentes ?',
          'But = ce que tu demandes · Contexte = la situation et le besoin · Source = les documents sur lesquels s’appuyer · Attentes = la forme du résultat',
        ],
      },
      cardLabel: { prefix: 'Morceau de ton prompt :', quoted: true },
      columns: [
        { id: 'but', label: 'But', capsule: 'blue', rotate: 'neg' },
        { id: 'contexte', label: 'Contexte', capsule: 'pink', rotate: 'neg' },
        { id: 'source', label: 'Source', capsule: 'red', rotate: 'pos' },
        { id: 'attentes', label: 'Attentes', capsule: 'green', rotate: 'pos' },
      ],
      cards: [
        { prompt: 'Rédige une annonce pour un poste de technicien de maintenance.', correct: 'but', explanation: 'C’est la tâche précise que tu confies à Copilot.' },
        { prompt: 'Ma cliente, Mme Herbin, cherche un technicien autonome pour un site de production.', correct: 'contexte', explanation: 'Copilot comprend la situation et le besoin du client.' },
        { prompt: '150 mots maximum, sur un ton chaleureux.', correct: 'attentes', explanation: 'Tu cadres la longueur et le ton du résultat.' },
        { prompt: 'Appuie-toi sur le compte rendu de mon échange avec la cliente.', correct: 'source', explanation: 'Copilot travaille à partir de tes informations, pas de suppositions.' },
        { prompt: 'Le candidat intégrera une petite équipe et doit démarrer rapidement.', correct: 'contexte', explanation: 'Ces précisions orientent le ton et les arguments de l’annonce.' },
        { prompt: 'Présente les missions sous forme de liste à puces.', correct: 'attentes', explanation: 'Tu indiques la mise en forme que tu veux obtenir.' },
        { prompt: 'Utilise la fiche de poste en pièce jointe.', correct: 'source', explanation: 'Un document de référence fiabilise le contenu de l’annonce.' },
      ],
    },
    {
      id: 'reponse-copilot',
      stepLabel: 'Étape 3',
      title: 'La réponse de Copilot',
      character: 'morpheus',
      timerSeconds: 9,
      bonusThirds: [3, 6], // < 3 s / < 6 s / < 9 s
      intro: {
        enjeu: 'Enjeu : Garder la main sur l’analyse',
        lead: [
          'Tu as transmis à Copilot la demande client, le CV de Gérard et ta synthèse d’entretien. Il t’aide à aller plus vite, mais c’est toi qui décides.',
          'Trie ses affirmations dans les catégories suivantes : fait confirmé, hypothèse ou à vérifier.',
        ],
        cta: 'Commencer la mission',
      },
      reminder: {
        enjeu: 'Enjeu : Garder la main sur l’analyse',
        lead: ['Copilot t’aide à aller plus vite, mais c’est toi qui décides : trie ses affirmations en fait confirmé, hypothèse ou à vérifier.'],
      },
      cardLabel: { prefix: 'Copilot affirme :', quoted: true },
      columns: [
        { id: 'confirme', label: 'Fait confirmé', capsule: 'blue', rotate: 'neg' },
        { id: 'hypothese', label: 'Hypothèse', capsule: 'pink', rotate: null },
        { id: 'verifier', label: 'À vérifier', capsule: 'red', rotate: 'pos' },
      ],
      cards: [
        { prompt: 'Gérard détient une habilitation électrique à jour.', correct: 'confirme', explanation: 'C’est écrit sur son CV.' },
        { prompt: 'Gérard s’intégrera sans difficulté dans une petite équipe.', correct: 'hypothese', explanation: 'Copilot le déduit, mais rien ne le démontre encore.' },
        { prompt: 'Les techniciens de maintenance sont très recherchés partout en France.', correct: 'verifier', explanation: 'Il faut une source datée, et une tendance nationale ne dit rien du bassin d’emploi local.' },
        { prompt: 'Le client souhaite idéalement un candidat titulaire du permis B.', correct: 'confirme', explanation: 'Mme Herbin l’a précisé lors de votre échange.' },
        { prompt: 'Le client attend sûrement 5 ans d’expérience en maintenance industrielle.', correct: 'hypothese', explanation: 'Le client ne l’a jamais demandé : Copilot suppose une exigence.' },
        { prompt: 'Selon une étude récente, 70 % des entreprises peinent à recruter des techniciens de maintenance.', correct: 'verifier', explanation: 'Ni la source ni la date ne sont citées : à contrôler avant d’en parler au client.' },
        { prompt: 'Gérard s’est montré motivé en entretien et peut démarrer rapidement.', correct: 'confirme', explanation: 'Tu l’as constaté toi-même en entretien.' },
      ],
    },
  ],

  wrongLabel: 'Pas tout à fait.',
  timeoutLabel: 'Temps écoulé.',
  continueLabel: 'Continuer',
  correctAutoAdvanceMs: 1600,

  bilan: {
    title: 'Le bilan',
    closing: [
      'Copilot t’aide à construire tes arguments. C’est toi qui convaincs ton client.',
      'Rendez-vous le mois prochain pour une nouvelle épreuve.',
    ],
    tiers: [
      {
        min: 0.85,
        message: 'Dossier maîtrisé : tu sais quoi confier à Copilot, tu le briefes avec précision et tu gardes la main sur ses réponses.',
      },
      {
        min: 0.6,
        message: 'Bon réflexe global. Revois les ingrédients d’un bon prompt et la distinction entre hypothèse et information à vérifier.',
      },
      {
        min: 0,
        message: 'De bons réflexes à consolider. Le replay des webinaires t’attend sur ADICT.',
      },
    ],
    cta: 'Voir le classement',
  },
};
