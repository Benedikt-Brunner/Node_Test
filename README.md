# Sc-Springer-Bad-Koenig-Website-example

>This is a express powered Webserver, using a java + SQL backend to host an internal rating system for a local chess club.

## Installation

Prerequisites: 
- **NodeJS**
- **Java** 
-  **MySQL**

Install the Items listed above and clone the repository.
The server can now be started by using the following command:

    >npm start

The server will now be running on port 3000, and can be accessed by using the following URL:

    http://localhost:3000

## Configuration

Make sure to use the provided database image and setup the required User, specified in the index.js file.

```javascript	
    const con = mysql.createConnection({
     host: "localhost",
     user: "sqluser",
     password: "password",
     database: "elo_datenbank"
    });
```
>These credentials are obviously for testing and dev only and will be secured before deployment, as are the Auth0 credentials provided in Index.js.

The Java Backend and the nodeJS server should work without any further configuration as long as their respecitve runtimes are configured correctly and the required dependencies are installed.

## Usage

After this initial setup, the website now provides an interactive experience to explore the Database and Input new data into it. 

The Website is secured using Auth0 and can only be accessed by users with a valid account. Make sure to register a new account to acces the website.

## Contributing
Feel free to contribute to this project by forking it and creating a pull request. The Main branch is protected and pull request will be reviewed before being merged.

To call data from the Backend eiter use a existing API-Endpoint or create a new one. Please make sure to follow basic SQL safety Principles and call out any vulnerabilities in the code.

Documentation will be added in the future, but feel free to add you own documentation to the code or contact me with any Questions that come up.
