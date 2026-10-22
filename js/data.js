/**
 * data.js — Contenu du jeu « Le Dossier Herbin »
 * ================================================
 * Premier jet rédigé à partir du scénario validé en Figma (Mini Jeu 1,
 * Développement_V2) et du document de scoring validé le 21/10/2026.
 *
 * ⚠️ Les 21 cartes ci-dessous (texte, bonne réponse, feedback) sont un
 * premier jet à faire relire et valider avant mise en production réelle.
 * Tout le reste (barème, chronos, seuils de bonus, messages de bilan,
 * textes narratifs, structure des écrans) est repris tel quel de la
 * maquette Figma validée.
 */
'use strict';

window.GAME_DATA = {
  meta: {
    gameId: 'dossier-herbin',
    maxScore: 210,
  },

  intro: {
    eyebrow: 'Adecco',
    title: 'Bienvenue dans la matrice.',
    paragraphs: [
      'Ton entraînement est terminé : te voilà connecté.',
      'Sur ton chemin, une série d’épreuves t’attend, une nouvelle chaque mois.',
      'Ce mois-ci, place au recrutement.',
      'Un dossier urgent vient d’arriver.',
      'Mme Herbin, cliente de ton agence, cherche un électricien autonome.',
      'Avec Copilot à tes côtés, tu vas le mener de bout en bout, en trois épreuves :',
    ],
    bullets: [
      'qualifier la demande du client',
      'évaluer ton candidat',
      'vérifier l’analyse de Copilot',
    ],
    closingParagraphs: [
      'À chaque épreuve, les cartes défileront et le temps sera compté.',
      'Range chacune à sa juste place : plus tu enchaînes les bonnes réponses, plus ton score s’envole.',
      'Tu es prêt. Je le sais.',
    ],
    cta: 'Commencer la mission',
  },

  // Courtes relances affichées dans la bulle du collègue (Copilot) en cas
  // de mauvaise réponse / temps écoulé. Purement décoratif, à ne pas
  // confondre avec l'explication factuelle affichée dans le bandeau bas.
  mascotReactions: {
    wrong: ['Aïe, pas celle-là !', 'Petit piège, hein ?', 'Pas tout à fait…'],
    timeout: ['Le temps a filé !', 'Trop lent, cette fois.', 'Chrono à zéro !'],
  },

  epreuves: [
    {
      id: 'commande',
      stepLabel: 'Étape 1',
      title: 'La commande',
      character: 'neo',
      timerSeconds: 10,
      bonusThirds: [10 / 3, 20 / 3], // < 3,33 s / < 6,67 s / < 10 s
      showMascotOnFeedback: false,
      mascotPose: 0,
      intro: {
        lead: [
          'Mme Herbin a besoin d’un électricien, et vite.',
          'Pour chaque critère, décide : est-il indispensable pour cette mission, ou peut-il s’ajuster avec elle ?',
        ],
        title: 'Le besoin de Mme Herbin (Rom’Elec)',
        context: [
          'Un électricien autonome pour poser des chemins de câbles et tirer des câbles dans un supermarché.',
          'Il intégrera une petite équipe et doit démarrer rapidement.',
        ],
        cta: 'Commencer la mission',
      },
      cardLabel: { prefix: 'Pour cette mission, le critère est :', quoted: false },
      columns: [
        { id: 'indispensable', label: 'Indispensable', pill: 'blue' },
        { id: 'ajustable', label: 'Ajustable', pill: 'red' },
      ],
      cards: [
        {
          prompt: 'Visite médicale à jour',
          correct: 'indispensable',
          explanation: 'C’est une obligation réglementaire pour intervenir : elle ne se négocie pas.',
        },
        {
          prompt: 'Habilitation électrique en cours de validité',
          correct: 'indispensable',
          explanation: 'Sans habilitation à jour, impossible d’intervenir légalement sur une installation électrique.',
        },
        {
          prompt: 'Capacité à travailler en toute autonomie sur le chantier',
          correct: 'indispensable',
          explanation: 'C’est exactement ce que demande Mme Herbin : un électricien autonome, pas un critère secondaire.',
        },
        {
          prompt: 'Expérience spécifique en grande distribution',
          correct: 'ajustable',
          explanation: 'Un atout, mais pas un prérequis : un bon généraliste du câblage s’adapte vite à cet environnement.',
        },
        {
          prompt: 'Titulaire du permis poids lourd',
          correct: 'ajustable',
          explanation: 'Rien dans la mission ne demande de conduire un poids lourd : ce critère n’a pas lieu d’être ici.',
        },
        {
          prompt: 'Disponible dès la semaine prochaine',
          correct: 'indispensable',
          explanation: 'Mme Herbin veut démarrer rapidement : la disponibilité immédiate fait partie du besoin exprimé.',
        },
        {
          prompt: 'Profil jeune de préférence',
          correct: 'ajustable',
          explanation: 'L’âge n’est pas un critère de compétence : ce n’est pas un vrai besoin métier, à écarter de la sélection.',
        },
      ],
      recapWording: { good: 'bonnes réponses' },
    },
    {
      id: 'candidat',
      stepLabel: 'Étape 2',
      title: 'Le candidat',
      character: 'trinity',
      timerSeconds: 12,
      bonusThirds: [4, 8], // < 4 s / < 8 s / < 12 s
      showMascotOnFeedback: true,
      mascotPose: 1,
      intro: {
        lead: [
          'Tu as rencontré Gérard, électricien depuis plus de 20 ans : un bon profil, avec quelques points à approfondir.',
          'Pour chaque élément de son profil, décide : atout, écart compensable ou point à approfondir ?',
        ],
        title: null,
        context: [],
        cta: 'Commencer la mission',
      },
      cardLabel: { prefix: 'Pour cette mission, le critère est :', quoted: false },
      columns: [
        { id: 'atout', label: 'Atout', pill: 'blue' },
        { id: 'ecart', label: 'Écart compensable', pill: 'pink' },
        { id: 'approfondir', label: 'À approfondir', pill: 'red' },
      ],
      cards: [
        {
          prompt: 'Autonome dans plusieurs environnements',
          correct: 'atout',
          explanation: '20 ans d’expérience variée : c’est exactement le profil autonome recherché par Mme Herbin.',
        },
        {
          prompt: '20 ans d’expérience en électricité générale',
          correct: 'atout',
          explanation: 'Une solide expérience générale, directement utile pour la mission.',
        },
        {
          prompt: 'N’a jamais travaillé en grande distribution',
          correct: 'ecart',
          explanation: 'Le cœur du métier, poser et tirer des câbles, reste le même : cet environnement s’apprend vite.',
        },
        {
          prompt: 'Son habilitation électrique est à renouveler dans 2 mois',
          correct: 'approfondir',
          explanation: 'Il faut vérifier que le renouvellement est prévu avant le début réel de la mission.',
        },
        {
          prompt: 'Aucune référence récente vérifiable',
          correct: 'approfondir',
          explanation: 'Un point à creuser avant de confirmer définitivement le profil.',
        },
        {
          prompt: 'Disponible dès la semaine prochaine',
          correct: 'atout',
          explanation: 'Cela correspond exactement au besoin de démarrage rapide de Mme Herbin.',
        },
        {
          prompt: 'Préfère travailler seul plutôt qu’en équipe',
          correct: 'approfondir',
          explanation: 'La mission demande d’intégrer une petite équipe : un point à vérifier avant de conclure.',
        },
      ],
      recapWording: { good: 'bonnes réponses' },
    },
    {
      id: 'copilot',
      stepLabel: 'Étape 3',
      title: 'La réponse de Copilot',
      character: 'morpheus',
      timerSeconds: 9,
      bonusThirds: [3, 6], // < 3 s / < 6 s / < 9 s
      showMascotOnFeedback: true,
      mascotPose: 2,
      intro: {
        lead: [
          'Tu as transmis à Copilot la demande client, le CV de Gérard et ta synthèse d’entretien.',
          'Il t’aide à aller plus vite, mais c’est toi qui décides : trie ses affirmations, fait confirmé, hypothèse ou info à vérifier ?',
        ],
        title: null,
        context: [],
        cta: 'Commencer la mission',
      },
      cardLabel: { prefix: 'Copilot affirme :', quoted: true },
      columns: [
        { id: 'confirme', label: 'Fait confirmé', pill: 'blue' },
        { id: 'hypothese', label: 'Hypothèse', pill: 'pink' },
        { id: 'verifier', label: 'À vérifier', pill: 'red' },
      ],
      cards: [
        {
          prompt: 'Selon une étude récente, 70 % des entreprises peinent à recruter des électriciens.',
          correct: 'verifier',
          explanation: 'C’est un chiffre externe avancé par Copilot : avant de t’en servir, vérifie sa source, il ne vient pas du dossier de Mme Herbin.',
        },
        {
          prompt: 'Gérard a 20 ans d’expérience en électricité, c’est écrit sur son CV.',
          correct: 'confirme',
          explanation: 'C’est écrit noir sur blanc dans le CV : c’est un fait confirmé par le dossier.',
        },
        {
          prompt: 'Mme Herbin a besoin d’un électricien pour un supermarché, selon sa demande initiale.',
          correct: 'confirme',
          explanation: 'C’est exactement ce qu’indique la demande client : un fait confirmé.',
        },
        {
          prompt: 'Comme il est expérimenté, Gérard saura sûrement s’adapter à la grande distribution.',
          correct: 'hypothese',
          explanation: 'C’est une déduction de Copilot, pas un fait établi par le dossier : une hypothèse, pas une certitude.',
        },
        {
          prompt: 'Gérard est disponible dès la semaine prochaine, il l’a confirmé en entretien.',
          correct: 'confirme',
          explanation: 'C’est noté dans ta synthèse d’entretien : un fait confirmé.',
        },
        {
          prompt: 'Vu son profil, Gérard acceptera sans problème de travailler en équipe.',
          correct: 'hypothese',
          explanation: 'Le dossier indique plutôt qu’il préfère travailler seul : Copilot fait ici une supposition hâtive.',
        },
        {
          prompt: 'L’habilitation électrique de Gérard sera renouvelée avant la mission.',
          correct: 'verifier',
          explanation: 'C’est annoncé, mais pas encore confirmé : à contrôler avant de valider le profil.',
        },
      ],
      recapWording: { good: 'bonnes réponses' },
    },
  ],

  timeoutLabel: 'Temps écoulé',
  wrongLabel: 'Pas tout à fait',
  continueLabel: 'Continuer',
  correctAutoAdvanceMs: 1600,

  bilan: {
    eyebrow: 'Adecco',
    title: 'Félicitations',
    closing: 'On se retrouve bientôt pour un nouveau défi Adecco.',
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
