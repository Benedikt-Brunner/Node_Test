const {readFile, readFileSync} = require('fs');
const express = require('express');
const app = express();
const mysql = require('mysql');
const {exec} = require("child_process");
const http = require('http');
const server = http.createServer(app);
app.use(express.static("./css"));

app.use(express.json()); // This line enables parsing of JSON request bodies

app.post('/button-clicked', (req, res) => {
  const inputData = req.body.inputData;
  if (inputData) {
    console.log(inputData);
    res.send('Button clicked successfully!');
  } else {
    res.status(400).send('Bad Request');
  }
});

function inputGames(){
exec(`java -jar ${__dirname}/club_elo_project-1.0-SNAPSHOT.jar "0${__dirname}/TestInput.json!Games"`, (error, stdout, stderr) => {
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
    con.query('SELECT Name, Classical_ELORATING, Classical_Rank, Blitz_ELORATING, Blitz_Rank, Rapid_ELORATING, Rapid_Rank, C960_Elorating, C960_Rank, Classical_Games_Played, BLitz_Games_Played, Rapid_Games_Played, Total_Games_Played FROM Players', (err, result) => {
      if (err) throw err;
      callback(result);
    });
  }
  
 


  app.get('/results',(request, response) =>{
  
       
    getPlayers((players) => {
        response.send(players);
      });
        

    });


app.get('/',(request, response) =>{
    readFile('./html/Index.html', 'utf8', (err, html) =>{

        if(err){
            response.status(500).send("oops i did it again")
        }
        response.send(html);

    })
} );

app.get('/Players',(request, response) =>{
  readFile('./html/Players.html', 'utf8', (err, html) =>{

      if(err){
          response.status(500).send("oops i did it again")
      }
      response.send(html);

  })
} );

app.get('/Input',(request, response) =>{
  readFile('./html/Input.html', 'utf8', (err, html) =>{

      if(err){
          response.status(500).send("oops i did it again")
      }
      response.send(html);

  })
} );

app.get('/Games',(request, response) =>{
  readFile('./html/Games.html', 'utf8', (err, html) =>{

      if(err){
          response.status(500).send("oops i did it again")
      }
      response.send(html);

  })
} );

app.get('/Tournaments',(request, response) =>{
  readFile('./html/Tournaments.html', 'utf8', (err, html) =>{

      if(err){
          response.status(500).send("oops i did it again")
      }
      response.send(html);

  })
} );

app.listen(process.env.Port || 3000, () => console.log('App available on http://localhost:3000'))