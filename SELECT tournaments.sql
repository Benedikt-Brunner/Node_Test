SELECT tournaments.Name, tournamentresults.placement,players.name
FROM tournamentresults
INNER JOIN tournaments ON tournamentresults.tournament_id=tournaments.id
INNER JOIN players ON tournamentresults.player_id=players.id;