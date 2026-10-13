# Trippy

Application web mobile codée à partir des maquettes Figma (les PNG du dossier parent). React + Vite + Tailwind CSS.

## Lancer l'appli

```bash
npm install
npm run dev -- --port 5199
```

Puis ouvrir http://localhost:5199. Sur ordinateur, l'appli s'affiche dans un cadre de téléphone ; sur mobile, en plein écran.

**Tester sur ton téléphone** : connecte-le au même Wi-Fi que l'ordinateur, puis ouvre l'adresse « Network » affichée par `npm run dev` (par ex. `http://192.168.1.20:5199`). Dans Safari/Chrome, « Ajouter à l'écran d'accueil » l'installe comme une appli.

## Écrans

| Route | Écran | Ce qui marche |
|---|---|---|
| `/` | Accueil | Filtres ALL/PLACES/…, recherche, filtre « Hot Deal », favoris ❤, choix de la ville, notifications, menu avec thème clair/sombre, carte dépliable → détails |
| `/trip/:id` | Détails | Read more, carte OpenStreetMap, Save, réservation avec nombre de voyageurs |
| `/discover` | Discover | Onglets Discover / Saved / Applied / Closed (alimentés par Save et Book Now), recherche, tri par prix |
| `/feed` | Feed | Stories plein écran, carrousel auto (swipe/tap), Follow, traduction, likes, réponses aux commentaires, zoom photo |
| `/savings` | Savings | Ajouter/retirer de l'argent, créer un objectif |
| `/messages` | Messages | Chats / Groups / Travel, recherche, suivre des offices de tourisme, créer une chaîne |
| `/chat/:id` | Chat | Envoi de messages, vote au sondage (pourcentages recalculés) |

Tout est enregistré dans le navigateur (localStorage) : likes, votes, messages, objectifs… Pas encore de serveur.

## Où modifier quoi

- **Textes, voyages, contacts, messages** : `src/data.ts`
- **Couleurs et polices** : bloc `@theme` dans `src/index.css`
- **État et actions** (like, vote, envoi…) : `src/store.tsx`
- **Écrans** : `src/screens/`, composants communs dans `src/components/ui.tsx`

## Images

`npm run assets` (ou `node scripts/build-assets.mjs`) régénère `public/images/` :
- avatars, logos et vignettes **découpés dans les PNG Figma** ;
- photos de lieux téléchargées depuis **Wikimedia Commons** (licences libres ; auteurs et licences dans `public/images/CREDITS.md` et dans l'appli, MENU › Crédits photos).

Les photos d'origine du Figma avaient du texte incrusté ; pour les remplacer, dépose tes propres fichiers dans `public/images/` avec le même nom.

## Mise en ligne

L'appli est publiée sur GitHub Pages : https://cx-banger.github.io/trippy-app/

Chaque push sur `main` la redéploie automatiquement (workflow `.github/workflows/deploy.yml`, onglet **Actions** du dépôt). Les crédits des photos sont accessibles dans l'appli via **MENU › Crédits photos**.
