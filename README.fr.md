[![en](https://img.shields.io/badge/language-english-red)](./README.md)
[![fr](https://img.shields.io/badge/langue-français-brightgreen)](./README.fr.md)

# InterBar-backend

## Contexte

Ce projet a été développé dans le cadre de ma dernière année de Bachelier en Informatique et systèmes.

## Contenu

Ce projet contient le code pour faire fonctionner le backend du projet InterBar, qui est une application mobile pour iOS et Android qui permet aux utilisateurs de créer et de rejoindre des événements et de créer ensuite des commandes pour commander des boissons ou de la nourriture. [Le dépôt contenant le frontend du projet est disponible en cliquant sur ce lien](https://github.com/LouisFitdevoie/interbar-frontend).

Dans ce projet, nous avons un serveur backend ainsi qu'une API pour communiquer avec l'application mobile. Le serveur backend et l'API sont écrits en NodeJS.

Vous pouvez également trouver un script pour créer la base de données et les tables en MySQL.

## Installation

1. Installer NodeJS et NPM
2. Installer MySQL
3. Cloner le dépôt
4. Ouvrir un terminal et accéder à votre serveur MySQL
5. Coller le contenu du fichier `generate_tables.sql` dans le terminal
6. Créer un fichier nommé `.env` à la racine du projet
7. Coller le contenu suivant dans le fichier `.env` et remplacer les valeurs par les vôtres

```JS
DB_PASSWORD=your_password
ACCESS_TOKEN_SECRET=your_secret_access_token // This is used to generate the access token of users with jwt
REFRESH_TOKEN_SECRET=your_secret_refresh_token // This is used to generate the refresh token of users with jwt
DATABASE_PORT=your_database_port // This is the port of your MySQL server
API_PORT=your_api_port // This is the port on which the API will be available
NODE_ENV=development
DATABASE_PROD=interbar // This is the name of the database that will be used in production
DATABASE_TESTING=interbar-testing // This is the name of the database that will be used for testing
DATABASE_DEV=interbar-dev // This is the name of the database that will be used in development
API_VERSION=v3 // This is the version of the API
API_HOST=localhost // This is the host of the API
TEST_FILES_TOTAL=8 // This is the total number of test files
TEST_FILES_COMPLETED=0
```

8. Ouvrir un terminal et accéder à la racine du projet
9. Exécuter la commande `npm install` pour installer toutes les dépendances
10. Exécuter la commande `npm start` pour démarrer le serveur ou `npm run start:dev` pour démarrer le serveur en mode développement ou `npm test` pour exécuter les tests.

## Utilisation

Le serveur s'exécute sur le port que vous avez spécifié. Vous pouvez accéder à l'API à l'adresse suivante: `http://localhost:8000/api/v3/`

Si vous souhaitez accéder à l'API depuis un autre appareil, vous pouvez utiliser l'adresse IP de votre ordinateur à la place de `localhost`.

Si vous avez défini le port de l'API à une autre valeur que 8000, vous devez remplacer 8000 par la valeur que vous avez définie.
