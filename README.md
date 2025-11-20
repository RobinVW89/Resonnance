# Resonnance
Résonnance est un club d’affaires sélectif réunissant entrepreneurs, dirigeants et experts qui souhaitent développer leur réseau, créer des opportunités et générer du business de qualité. Un cercle premium fondé sur la confiance, l’entraide, la performance collective et des rencontres professionnelles à forte valeur.

## Gestion des membres

Les membres sont désormais stockés dans `data/members.json`. Le front-end charge ce fichier via `fetch()` :

- Pour ajouter/modifier un membre, éditez `data/members.json` et rafraîchissez la page.
- Chaque membre est un objet avec les champs : `id`, `name`, `company`, `category`, `role`, `photo`, `bio`, `linkedin` (optionnel).

Exemple :

```
{
	"id": 7,
	"name": "Julie Travaillée",
	"company": "Indépendante",
	"category": "Consulting",
	"role": "Consultante",
	"photo": "https://...",
	"bio": "Consultante indépendante — voir le profil LinkedIn.",
	"linkedin": "https://www.linkedin.com/in/julie-travaillée-b39503118/"
}
```

Test local rapide :

```bash
# depuis la racine du projet
python3 -m http.server 8000
# ouvrir http://localhost:8000
```

Pour une gestion plus avancée (UI d'administration, import CSV, persistance serveur), je peux implémenter une petite API Node/Express qui servira `members.json` et offrira des endpoints CRUD.

## API et enrichissement LinkedIn

J'ai ajouté une API minimale et un script d'enrichissement :

- `server.js` : Server Express exposant les endpoints CRUD et des endpoints d'enrichissement :
	- `GET /api/members` — liste des membres
	- `GET /api/members/:id` — membre
	- `POST /api/members` — ajouter
	- `PUT /api/members/:id` — modifier
	- `DELETE /api/members/:id` — supprimer
	- `POST /api/members/save` — écraser le fichier `data/members.json` (envoi du tableau complet)
	- `POST /api/enrich` — fetch OpenGraph pour une URL LinkedIn (body: { linkedin })
	- `POST /api/enrich-batch` — enrichit en batch les membres (body: { ids: [...] } facultatif)

- `scripts/enrich.js` : script CLI qui parcourt `data/members.json`, tente de récupérer les métadonnées OpenGraph (titre, description, image) depuis les URLs LinkedIn publiques et fusionne :
	- met `photo` si vide et qu'`og:image` est présent
	- tente de renseigner `role` à partir d'`og:title` si vide
	- ajoute un champ `_og` avec le snapshot des métadonnées et horodatage

Important — limites :
- Le script et l'endpoint d'enrichissement utilisent une extraction OpenGraph publique (récupération de la page HTML et parsing). Cela fonctionne parfois pour obtenir `og:image` (photo) et `og:title` (headline), mais LinkedIn peut bloquer les requêtes non authentifiées ou renvoyer un contenu restreint. Pour des résultats fiables et conformes, utilisez l'API LinkedIn officielle (nécessite clé d'application et consentement OAuth).

Usage local :

```bash
# installer les dépendances
npm install

# démarrer l'API (par défaut port 3000)
npm start

# ou exécuter le script d'enrichissement (tentative de récupérer photos/headlines)
npm run enrich
```

Après enrichissement, le fichier `data/members.json` est mis à jour automatiquement (sauvegarde écrasée). Vérifiez et validez les modifications avant de les publier.

## Page d'administration (CRUD local)

Un outil d'administration statique a été ajouté : `admin.html`.

- Chemin : `/admin.html`
- Fonctionnalités :
	- Lister, filtrer, ajouter, modifier et supprimer des membres côté client.
	- Importer un fichier CSV (format attendu indiqué sur la page).
	- Télécharger le résultat en `JSON` ou `CSV` (boutons "Télécharger JSON" / "Télécharger CSV").

Remarque importante : l'admin fonctionne côté client uniquement (site statique). Les modifications n'écrivent pas directement dans `data/members.json` sur le serveur. Pour persistance automatisée, il faut un backend (API) pour recevoir et sauvegarder les modifications.

## C'est quoi un CSV ?

CSV = Comma-Separated Values (valeurs séparées par des virgules). C'est un format texte simple pour représenter un tableau : une première ligne contient les en-têtes (noms de colonnes), puis chaque ligne suivante représente une ligne de données.

Exemple :

```
id,name,company,category,role,photo,bio,linkedin
1,Jean Dupont,Acme,Finance,CEO,https://...,Bio...,https://linkedin.com/...
```

Le format est pratique pour importer/exporter des données depuis Excel, Google Sheets ou d'autres outils. Sur la page `admin.html` vous pouvez importer un CSV compatible pour ajouter ou mettre à jour des membres.
