[![en](https://img.shields.io/badge/language-english-brightgreen)](https://github.com/LouisFitdevoie/interBar-backend/blob/main/README.md)
[![fr](https://img.shields.io/badge/langue-français-red)](https://github.com/LouisFitdevoie/interBar-backend/blob/main/README.fr.md)

# InterBar-backend

---

## Context

This project is realised as part of the last year of my Bachelor in computer science and systems.

## Content

This project contains the code to run the backend of the InterBar project, which is a mobile application for iOS and Android that allows users to create and join events and then create commands to order drinks or food. [The repository containing the frontend of this project is available by clicking on this link](https://github.com/LouisFitdevoie/interbar-frontend)

In this project, we have a backend server as well as an API to communicate with the mobile application. The backend server and the API are written in NodeJS.

You can also find a script to create the database and the tables in MySQL.

## Installation

1. Install NodeJS and NPM
2. Install MySQL
3. Clone the repository
4. Open a terminal and access to your MySQL server
5. Paste the content of the file `generate_tables.sql` in the terminal
6. Create a file named `.env` in the root of the project
7. Paste the following content in the file `.env` and replace the values with your own

```JS
DB_PASSWORD=your_password
ACCESS_TOKEN_SECRET=your_secret_access_token // This is used to generate the access token of users with jwt
REFRESH_TOKEN_SECRET=your_secret_refresh_token // This is used to generate the refresh token of users with jwt
DATABASE_PORT=your_database_port // This is the port of your MySQL server
API_PORT=your_api_port // This is the port on which the API will be available
```

8. Open a terminal and access to the root of the project
9. Run the command `npm install` to install all the dependencies
10. Run the command `npm start` to start the server or `npm run start:dev` to start the server in development mode

## Usage

The server is running on the port that you specified. You can access to the API at the following address: `http://localhost:8000/api/v2.2/`

If you want to access to the API from another device, you can use the IP address of your computer instead of `localhost`.

If you set the API_PORT to another value than 8000, you have to replace 8000 by the value that you set.

## Documentation (currently working on it)

The documentation of the API will be available at the following address: `http://localhost:8000/api/v2.2/docs/`.
