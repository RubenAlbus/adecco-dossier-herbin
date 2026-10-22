# Le Dossier Herbin — Mini-jeu Adecco #1

Mini-jeu custom code pour la plateforme de challenge Bubble d'Albus Factory.

## Stack

- HTML5 / CSS3 / JavaScript vanilla (aucune dépendance)
- Protocole ACCGP (Albus Custom Code Game Protocol) pour l'intégration Bubble
- Hébergé sur Vercel

## Dev local

```bash
npx serve -p 3000
```

Ouvrir `http://localhost:3000?userId=test&challengeId=test-challenge`

En mode dev (sans `challengeId` en URL), ACCGP logge les messages dans la console au lieu de les envoyer à Bubble.

## Déploiement

```bash
npx vercel --prod --yes --name adecco-dossier-herbin
```

URL de prod : `https://adecco-dossier-herbin.vercel.app`

## Intégration Bubble

Coller l'URL Vercel dans le champ `custom_code_url` de l'admin Bubble du challenge concerné. C'est tout.

Le protocole ACCGP gère automatiquement :
- La réception de `userId` et `challengeId` via URL params
- L'envoi du score final à Bubble via `postMessage`
- L'attribution des points par le workflow Bubble standard

## Mécanique

Le joueur incarne un recruteur Adecco qui traite le dossier de Mme Herbin (cliente Rom'Elec), à la recherche d'un électricien autonome. Avec l'aide de « Copilot », il mène 3 épreuves de 7 cartes chronométrées :

1. **La commande** — qualifier chaque critère du besoin client : Indispensable ou Ajustable (10 s/carte).
2. **Le candidat** — évaluer le profil de Gérard, le candidat : Atout, Écart compensable ou À approfondir (12 s/carte).
3. **La réponse de Copilot** — trier les affirmations de Copilot sur le dossier : Fait confirmé, Hypothèse ou À vérifier (9 s/carte).

## Scoring

- Bonne réponse : 7 points. Mauvaise réponse ou temps écoulé : 0 point. Jamais de malus.
- Bonus de rapidité (si bonne réponse uniquement), selon le tiers du chrono où le joueur répond : +3 / +2 / +1.
- Une carte rapporte donc 0, 8, 9 ou 10 points.
- Score final = somme des 21 cartes, toujours compris entre 1 (minimum si la partie est terminée) et 210 (maximum).
- Le message de bilan dépend du taux de réussite (bonnes réponses / 21), selon 3 paliers (≥ 85 %, 60–84 %, < 60 %).

Score max : 210 points.

⚠️ Le contenu des 21 cartes (`js/data.js`) est un premier jet rédigé à partir du scénario Figma et du document de scoring validé le 21/10/2026. À faire relire et valider avant mise en production réelle.

## Structure

```
./
├── index.html      # Shell HTML + viewport responsive
├── css/
│   └── styles.css  # Design du jeu (DA Figma, responsive mobile/tablette/desktop)
├── js/
│   ├── accgp.js    # Pont Bubble (NE PAS MODIFIER)
│   ├── data.js     # Contenu du jeu (textes, cartes, feedbacks, bilan)
│   └── game.js     # State machine, timers, scoring, rendu
└── images/         # Assets exportés depuis Figma (optimisés jpg/webp)
```
