# Jass Jura

Application de gestion de tournoi de jass jurassien, sans annonces. Aucune dépendance npm, aucun compte et aucun service externe.

## Tester sans installation

Sur GitHub, cliquer sur **Code → Download ZIP**, puis extraire le ZIP. Ouvrir **Jass-Jura.html** par double-clic dans Chrome, Edge ou Firefox. Aucune installation ni connexion Internet nécessaire pour cette version.

Conserver le fichier au même emplacement pour retrouver la sauvegarde du navigateur. Le comportement du stockage local des fichiers peut varier selon le navigateur : enregistrer régulièrement un fichier de tournoi JSON avec **Enregistrer un fichier**.

## Démarrer en développement

Avec Python 3 installé, depuis le dossier du projet :

```sh
npm start
```

Ouvrir `http://localhost:5173` dans un navigateur. Node.js 18+ permet de lancer les tests : `npm test`. Le serveur ne sert que les fichiers ; les données du tournoi restent dans le navigateur utilisé. L'application fonctionne sans connexion Internet une fois chargée, tant que la page reste ouverte. Le démarrage nécessite le serveur local.

## Utilisation

Créer un tournoi avec un nombre pair d'équipes, le nombre de passes et le nombre de parties par passe (12 par défaut). Reporter les rencontres du tirage physique pour chaque passe. Saisir séparément les deux totaux de la table : leur somme doit être égale à `157 × nombre de parties`, soit 1 884 points par défaut. Une équipe ne peut être affectée qu'à une table par passe.

Le classement cumule uniquement les résultats complets et corrects. Les scores restent modifiables ; une correction met immédiatement à jour le classement. Les équipes à égalité partagent leur rang, sans critère de départage supplémentaire.

La sauvegarde automatique utilise le stockage local du navigateur, lié à son adresse. Elle peut disparaître si les données du navigateur sont effacées ; le mode privé peut également la limiter. Utiliser **Enregistrer un fichier** pour conserver une copie JSON sur le Bureau (choisir l'emplacement dans le navigateur, ou déplacer le fichier depuis Téléchargements). **Ouvrir** permet de reprendre ce fichier, y compris sur un autre ordinateur. L'application ne peut pas écrire silencieusement sur le Bureau. Conserver des copies régulières, notamment avant de créer un autre tournoi.

## Mettre à jour la version autonome

Après une modification des sources, exécuter `npm run build` pour régénérer `Jass-Jura.html`.
