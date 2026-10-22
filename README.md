# Le Dossier Herbin · Mini-jeu Adecco n° 1

Mini-jeu « custom code » pour la plateforme de challenges Bubble d'Albus Factory, intégré via le protocole **ACCGP**.

- **Production** : https://adecco-dossier-herbin.vercel.app
- **Maquette de référence** : Figma « Plateformes_Adecco », page **« Mini Jeu 1_Développement_V2 »** (node `588:231`). La page V1 (`527:477`) est obsolète.

## Le jeu

Mme Herbin cherche un technicien de maintenance autonome. Avec Copilot, le joueur traite le dossier en 3 épreuves de 7 cartes, tirées dans un ordre aléatoire et chronométrées :

| Épreuve | Colonnes | Chrono |
|---|---|---|
| 1. Le partage des rôles | Je la confie à Copilot · Je garde la main | 10 s |
| 2. Le bon prompt | But · Contexte · Source · Attentes | 12 s |
| 3. La réponse de Copilot | Fait confirmé · Hypothèse · À vérifier | 9 s |

Le joueur répond en cliquant sur une colonne ou en y glissant la carte. Bonne réponse : feedback vert, carte suivante après 1,6 s. Erreur ou temps écoulé : la bonne colonne passe en vert, la colonne choisie en rouge, la mascotte apparaît avec le bouton « Continuer ».

## Barème (document « Scoring explication » du 21/10/2026, revu par la cliente le 22/10/2026)

- Bonne réponse : 10 points, quel que soit le temps mis. Pas de bonus de rapidité.
- Mauvaise réponse ou temps écoulé : 0 point. Aucun malus.
- Score final : somme des 21 cartes, entre **1** (minimum garanti) et **210**.
- Message du bilan selon le taux de bonnes réponses : 85 % et plus « Dossier maîtrisé », de 60 à 84 % « Bon réflexe global », moins de 60 % « De bons réflexes à consolider ».

## Intégration Bubble (ACCGP)

1. Coller `https://adecco-dossier-herbin.vercel.app` dans le champ `custom_code_url` du challenge.
2. Bubble ouvre le jeu avec `?userId=…&challengeId=…`.
3. Le score part vers Bubble **une seule fois**, au clic sur « Voir le classement » du bilan. Le workflow Bubble enregistre les points puis ferme la popup : le joueur retrouve le classement de la plateforme.
4. Si la popup est fermée sur le bilan sans ce clic, le score part quand même (événement `pagehide`), toujours une seule fois.

Exemple de message reçu par Bubble :

```json
{
  "type": "ALBUS_GAME_COMPLETE",
  "protocol": "ACCGP/1.0",
  "userId": "user-42",
  "challengeId": "chal-7",
  "score": 150,
  "maxScore": 210,
  "metadata": { "gameId": "adecco-dossier-herbin", "correctAnswers": 15, "totalCards": 21, "tier": "bon", "durationSeconds": 412, "epreuves": [] }
}
```

Sans `challengeId` dans l'URL, ACCGP passe en mode dev : rien n'est envoyé, les messages s'affichent dans la console.

## Écart volontaire avec la maquette

À la demande de la cliente (22/10/2026), les panneaux blancs de consigne sont plus lisibles que dans le Figma : blanc à 80 % avec fond flouté (au lieu de 50 % sans flou), texte en Inter Medium 16 px (au lieu de 14 px) et titres en 19 px (au lieu de 18 px). Tout le reste suit la maquette V2. Réglages : `--panel` et `--panel-blur` dans `css/styles.css`.

## Affichage

- **Ordinateur, tablette à l'horizontale, popup Bubble** : chaque écran est une scène de 1638 × 1024 px aux coordonnées exactes de la maquette, mise à l'échelle pour tenir dans la fenêtre.
- **Téléphone et tablette en portrait, téléphone à l'horizontale** : quand la scène deviendrait illisible (échelle < 0,5), le jeu bascule sur une mise en page verticale avec les mêmes éléments, textes et couleurs (`.is-flow` dans `css/styles.css`).

## Structure

```
index.html          page unique
css/styles.css      styles de la scène, puis mise en page mobile (.is-flow)
js/accgp.js         pont Bubble, copié du skill albus-bubble-game-scaffold (NE PAS MODIFIER)
js/data.js          tous les textes et réglages, copiés mot pour mot de la maquette V2
js/scoring.js       barème en fonctions pures
js/game.js          écrans, chrono, glisser-déposer, envoi du score
img/                visuels exportés de Figma (WebP, recadrés comme dans la maquette)
fonts/              Inter, Michroma, Source Code Pro (auto-hébergées)
tests/              tests du barème
```

Modifier un texte : uniquement dans `js/data.js`, après validation dans Figma.

## Développement

```bash
npx serve -l 3000
```

Puis ouvrir `http://localhost:3000/?userId=test&challengeId=test-challenge`.

```bash
npm test
```

Le déploiement est automatique : chaque push sur `master` met la production à jour sur Vercel.
