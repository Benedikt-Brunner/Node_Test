const {readFile, readFileSync, writeFile, writeFileSync} = require('fs');
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const app = express();
const mysql = require('mysql');
const {exec} = require("child_process");
const http = require('http');
const ejs = require('ejs');
const server = http.createServer(app);

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'Ve0VF1Ihg1DOHdH2V6yANx9WtAzmvBU7rOPUsrtt',
  baseURL: 'http://localhost:3000',
  clientID: 'sNvXjDNZVtVIp0tLaN0U3UJEXcZMWPvZ',
  issuerBaseURL: 'https://dev-6nxdvsl2kt22elnw.eu.auth0.com'
};

app.set('view engine', 'ejs');
app.use(auth(config));
app.use(express.static("./css"));
app.use(express.text())

app.use(express.json()); 

app.set('trust proxy', true);

app.post('/button-clicked', (req, res) => {
  const inputData = req.body.inputData;
  if (inputData) {
    writeFileSync("Input.json",('{"Games": ' + JSON.stringify(inputData) + '}'));
    inputGames();
    res.send('Button clicked successfully!');
  } else {
    res.status(400).send('Bad Request');
  }
});

app.post('/maketournament', (req, res) => {
  const inputData = req.body;
  if (inputData) {
    maketournament(inputData);
    res.send('Tournament made');
  } else {
    res.status(400).send('Bad Request');
  }
});

function maketournament(javastring){
  exec(`java -jar ${__dirname}/club_elo_project-1.0-SNAPSHOT.jar "${javastring}"`, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

function inputGames(){
exec(`java -jar ${__dirname}/club_elo_project-1.0-SNAPSHOT.jar "0${__dirname}/Input.json!Games"`, (error, stdout, stderr) => {
  if (error) {
      console.log(`error: ${error.message}`);
      return;
  }
  if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
  }
  console.log(`stdout: ${stdout}`);
});}

const con = mysql.createConnection({
  host: "localhost",
  user: "sqluser",
  password: "password",
  database:"elo_datenbank"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


function getPlayers(callback) {
    con.query('SELECT Name, Classical_ELORATING, Classical_Rank, Blitz_ELORATING, Blitz_Rank, Rapid_ELORATING, Rapid_Rank, C960_Elorating, C960_Rank, Classical_Games_Played, BLitz_Games_Played, Rapid_Games_Played,C960_Games_Played,Total_Games_Played FROM Players', (err, result) => {
      if (err) throw err;
      callback(result);
    });
  }
  
 


  app.get('/getplayers',(request, response) =>{
  
       
    getPlayers((players) => {
        response.send(players);
      });
        

    });

    function getGames(callback) {
      con.query('SELECT g.id, p1.name AS WhitePlayerName, p2.name AS BlackPlayerName, g.Result, g.Gametype, g.Date,g.URL FROM games g JOIN players p1 ON g.WhitePlayer = p1.id JOIN players p2 ON g.BlackPlayer = p2.id ORDER BY g.id; ', (err, result) => {
        if (err) throw err;
        callback(result);
      });
    }
    
   
  
  
    app.get('/getgames',(request, response) =>{
    
         
      getGames((games) => {
          response.send(games);
        });
          
  
      });

      function gettour(callback) {
        con.query('SELECT tournaments.Name, tournamentresults.placement,players.name FROM tournamentresults INNER JOIN tournaments ON tournamentresults.tournament_id=tournaments.id INNER JOIN players ON tournamentresults.player_id=players.id;', (err, result) => {
          if (err) throw err;
          callback(result);
        });
      }
      
     
    
    
      app.get('/gettour',(request, response) =>{
      
           
        gettour((players) => {
            response.send(players);
          });
            
    
        });


app.get('/',requiresAuth(),(request, response) =>{
    readFile('./html/Index.html', 'utf8', (err, html) =>{

        if(err){
            response.status(500).send("oops i did it again")
        }
        response.send(html);

    })
} );

app.get('/Players',requiresAuth(),(request, response) =>{
  readFile('./html/Players.html', 'utf8', (err, html) =>{

      if(err){
          response.status(500).send("oops i did it again")
      }
      response.send(html);

  })
} );

app.get('/Input',requiresAuth(),(request, response) =>{
  readFile('./html/Input.html', 'utf8', (err, html) =>{

      if(err){
          response.status(500).send("oops i did it again")
      }
      response.send(html);

  })
} );

app.get('/tourInput',requiresAuth(),(request, response) =>{
  readFile('./html/tourInput.html', 'utf8', (err, html) =>{

      if(err){
          response.status(500).send("oops i did it again")
      }
      response.send(html);

  })
} );

app.get('/Games',requiresAuth(),(request, response) =>{
  readFile('./html/Games.html', 'utf8', (err, html) =>{

      if(err){
          response.status(500).send("oops i did it again")
      }
      response.send(html);

  })
} );

app.get('/Tournaments',requiresAuth(),(request, response) =>{
  readFile('./html/Tournaments.html', 'utf8', (err, html) =>{

      if(err){
          response.status(500).send("oops i did it again")
      }
      response.send(html);

  })
} );





app.get('/Tournaments/:tournamentId',requiresAuth(),(request, response) =>{
  var tournamentId = request.params.tournamentId;

    response.render('tournament', { tournamentId: tournamentId});
}) ;






app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});



app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.listen(process.env.Port || 3000, () => console.log('App available on http://localhost:3000'))