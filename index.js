const { readFile, readFileSync, writeFile, writeFileSync } = require('fs');
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const app = express();
const mysql = require('mysql');
const { exec } = require("child_process");
const http = require('http');
const ejs = require('ejs');
const serveFavicon = require('serve-favicon');
const { dirname } = require('path');
const path = require('path')
const schedule = require('node-schedule');
const server = http.createServer(app);

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'Ve0VF1Ihg1DOHdH2V6yANx9WtAzmvBU7rOPUsrtt',
  baseURL: 'http://localhost:3000',
  clientID: 'sNvXjDNZVtVIp0tLaN0U3UJEXcZMWPvZ',
  issuerBaseURL: 'https://dev-6nxdvsl2kt22elnw.eu.auth0.com'
};

const con = mysql.createConnection({
  host: "localhost",
  user: "sqluser",
  password: "password",
  database: "elo_datenbank"
});

app.set('view engine', 'ejs');
app.use(serveFavicon(path.join(__dirname, "css", "site_favicon_16_1664892280095.ico")))
app.use(auth(config));
app.use(express.static(path.join(__dirname, "css")));
app.use(express.text())
app.use(express.json());
app.set('trust proxy', true);



const job = schedule.scheduleJob('0 0 1 * *', function () { setupArchive() })

function setupArchive() {

  Playercheck(players => {
    PlayerArchivecheck(archive => {
      if (players.length != archive.length) {
        con.query(`INSERT INTO playersArchive (player) Values (${archive.length + 1})`, (err, result) => {
          if (err) throw err;
          setupArchive();
        });
      } else {
        con.query('Select * from playersArchive where player = 1', (err, result) => {
          if (err) throw err;
          let numberOfColumns = Object.keys(result[0]).length - 1;
          con.query(`ALTER TABLE playersArchive ADD Month${numberOfColumns} varchar(255)`, (err, result) => {
            backupData(numberOfColumns)
          })
        })
      }

    })
  })


}
function backupData(column) {
  getPlayers(players => {
    for (let i = 0; i < players.length; i++) {
      let str = "";
      str += players[i].Classical_ELORATING;
      str += `:${players[i].Classical_Rank}`;
      str += `:${players[i].Blitz_ELORATING}`;
      str += `:${players[i].Blitz_Rank}`;
      str += `:${players[i].Rapid_ELORATING}`;
      str += `:${players[i].Rapid_Rank}`;
      str += `:${players[i].C960_Elorating}`;
      str += `:${players[i].C960_Rank}`;
      str += `:${players[i].Classical_Games_Played}`;
      str += `:${players[i].BLitz_Games_Played}`;
      str += `:${players[i].Rapid_Games_Played}`;
      str += `:${players[i].C960_Games_Played}`;
      str += `:${players[i].Total_Games_Played}`;

      const query = "UPDATE playersArchive SET Month" + column + " = ? WHERE player = ?";
      const values = [str, i + 1];

      con.query(query, values, (err, result) => {
        if (err) throw err;

      });

    }
    console.log("done")
  });
}




function Playercheck(callback) {
  con.query('SELECT id FROM Players', (err, result) => {
    if (err) throw err;
    callback(result);
  });
}

function PlayerArchivecheck(callback) {
  con.query('SELECT Player FROM PlayersArchive', (err, result) => {
    if (err) throw err;
    callback(result);
  });
}




app.post('/button-clicked', (req, res) => {
  const inputData = req.body.inputData;
  if (inputData) {
    writeFileSync("Input.json", ('{"Games": ' + JSON.stringify(inputData) + '}'));
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

function maketournament(javastring) {
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

function inputGames() {
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
  });
}



con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});


function getPlayers(id, callback) {
let sortby;
let order;
switch(id){
  case 1: sortby = "Name"; order = "ASC"; break;
  case 2: sortby = "Classical_ELORATING"; order = "DESC"; break;
  case 3: sortby = "Classical_Rank"; order = "ASC"; break;
  case 4: sortby = "Blitz_ELORATING"; order = "DESC"; break;
  case 5: sortby = "Blitz_Rank"; order = "ASC"; break;
  case 6: sortby = "Rapid_ELORATING"; order = "DESC"; break;
  case 7: sortby = "Rapid_Rank"; order = "ASC"; break;
  case 8: sortby = "C960_Elorating"; order = "DESC"; break;
  case 9: sortby = "C960_Rank"; order = "ASC"; break;
  case 10: sortby = "Classical_Games_Played"; order = "DESC"; break;
  case 11: sortby = "BLitz_Games_Played"; order = "DESC"; break;
  case 12: sortby = "Rapid_Games_Played"; order = "DESC"; break;
  case 13: sortby = "C960_Games_Played"; order = "DESC"; break;
  case 14: sortby = "Total_Games_Played"; order = "DESC"; break;
  default: sortby = "Name"; order = "ASC"; break;


}

  con.query(`SELECT id, Name, Classical_ELORATING, Classical_Rank, Blitz_ELORATING, Blitz_Rank, Rapid_ELORATING, Rapid_Rank, C960_Elorating, C960_Rank, Classical_Games_Played, BLitz_Games_Played, Rapid_Games_Played,C960_Games_Played,Total_Games_Played FROM Players ORDER BY ${sortby} ${order}`, (err, result) => {
    if (err) throw err;
    callback(result);
  });
}




app.get('/getplayers/:id', (request, response) => {
let id = parseInt(request.params.id);
 
if (isNaN(id)) {
  response.status(500).send(`${request.params.id} is not a valid id`);
  return;
}

  getPlayers(id, ( players) => {
    response.send(players);
  });


});

function getGames(callback) {
  con.query('SELECT g.id, g.TOURNAMENT_ID, p1.name AS WhitePlayerName, p2.name AS BlackPlayerName, g.Result, g.Gametype, g.Date,g.URL FROM games g JOIN players p1 ON g.WhitePlayer = p1.id JOIN players p2 ON g.BlackPlayer = p2.id ORDER BY g.id; ', (err, result) => {
    if (err) throw err;
    callback(result);
  });
}




app.get('/getgames', (request, response) => {


  getGames((games) => {
    response.send(games);
  });


});

function gettour(callback) {
  con.query('SELECT tournaments.id, tournaments.Name, tournamentresults.placement,players.name FROM tournamentresults INNER JOIN tournaments ON tournamentresults.tournament_id=tournaments.id INNER JOIN players ON tournamentresults.player_id=players.id;', (err, result) => {
    if (err) throw err;
    callback(result);
  });
}




app.get('/gettour', (request, response) => {


  gettour((players) => {
    response.send(players);
  });


});


app.get('/', requiresAuth(), (request, response) => {
  readFile('./html/Index.html', 'utf8', (err, html) => {

    if (err) {
      response.status(500).send("oops i did it again")
    }
    response.send(html);

  })
});

app.get('/Players', requiresAuth(), (request, response) => {
  readFile('./html/Players.html', 'utf8', (err, html) => {

    if (err) {
      response.status(500).send("oops i did it again")
    }
    response.send(html);

  })
});

app.get('/Players/:PlayerId', requiresAuth(), (request, response) => {
  var PlayerId = request.params.PlayerId;

  response.render('Player', { PlayerId: PlayerId });
});

app.get('/Input', requiresAuth(), (request, response) => {
  readFile('./html/Input.html', 'utf8', (err, html) => {

    if (err) {
      response.status(500).send("oops i did it again")
    }
    response.send(html);

  })
});

app.get('/tourInput', requiresAuth(), (request, response) => {
  readFile('./html/tourInput.html', 'utf8', (err, html) => {

    if (err) {
      response.status(500).send("oops i did it again")
    }
    response.send(html);

  })
});

app.get('/Games', requiresAuth(), (request, response) => {
  readFile('./html/Games.html', 'utf8', (err, html) => {

    if (err) {
      response.status(500).send("oops i did it again")
    }
    response.send(html);

  })
});

app.get('/Tournaments', requiresAuth(), (request, response) => {
  readFile('./html/Tournaments.html', 'utf8', (err, html) => {

    if (err) {
      response.status(500).send("oops i did it again")
    }
    response.send(html);

  })
});







app.get('/Tournaments/:tournamentId', requiresAuth(), (request, response) => {
  let tournamentId = request.params.tournamentId;


  response.render('Tournament', { tournamentId: tournamentId });
});

app.get('/getData/:id', (request, response) => {
  let id = parseInt(request.params.id);
 
  if (isNaN(id)) {
    response.status(500).send(`${request.params.id} is not a valid id`);
    return;
  }
  getData(id, (data) => {
    response.send(data);
  })
})

function getData(id, callback) {
  con.query(`SELECT * FROM playersArchive WHERE player = ${id}`, (err, result) => {
    if (err) throw err;
    callback(result);
  });
}






app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});



app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.listen(process.env.Port || 3000, () => console.log('App available on http://localhost:3000'))