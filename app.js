let players = [];
let rounds = [];
let nextPlayerId = 1;
const $ = id => document.getElementById(id);

//add a player
function addPlayer() {
  const input = $("player-input").value.trim();
  if (!input) return;
  input.split(",").forEach(name => {
    name = name.trim();
    if (name) players.push({ id: nextPlayerId++, name, wins: 0 });
  });
  $("player-input").value = "";
  listPlayers();
  updateWins();
}

$("add-player").onclick = addPlayer;

//list rounds
function showRounds() {
    const container = $("rounds");
    container.innerHTML = "";
    rounds.forEach((round, rIndex) => {
      const div = document.createElement("div");
      div.innerHTML = `<h3>Round ${rIndex + 1}</h3>`;
      round.courts.forEach(court => {
        const cDiv = document.createElement("div");
        cDiv.innerHTML = `
          <strong>Court ${court.court}</strong><br>
          Team A: ${court.team1.map(id => players.find(p => p.id === id).name).join(", ")}<br>
          Team B: ${court.team2.map(id => players.find(p => p.id === id).name).join(", ")}<br>
        `;
        const btnA = document.createElement("button");
        btnA.textContent = "Team A Win";
        const btnB = document.createElement("button");
        btnB.textContent = "Team B Win";
        //lock after winning so teams can't both win or win more than once
        if (court.winner) {
          btnA.disabled = true;
          btnB.disabled = true;
        }
        btnA.onclick = e => {
          e.stopPropagation();
          recordWin(court, "A");
        };
        btnB.onclick = e => {
          e.stopPropagation();
          recordWin(court, "B");
        };
        cDiv.appendChild(btnA);
        cDiv.appendChild(btnB);
        div.appendChild(cDiv);
      });
      if (round.sittingOut.length > 0) {
        const sitDiv = document.createElement("div");
        sitDiv.innerHTML = `
          <em>Sitting Out:</em> 
          ${round.sittingOut.map(id => players.find(p => p.id === id).name).join(", ")}`;
        div.appendChild(sitDiv);
      }
      container.appendChild(div);
    });
} 

//record a win
function recordWin(court, winner) {
  court.winner = winner;
  const team = winner === "A" ? court.team1 : court.team2;
  team.forEach(id => players.find(p => p.id === id).wins++);
  listPlayers();
  updateWins();
  showRounds();
}

//update win leaderboard
function updateWins() {
  const container = $("wins");
  container.innerHTML = "";
  players
    .slice()
    .sort((a, b) => b.wins - a.wins)
    .forEach(p => {
      const div = document.createElement("div");
      div.textContent = `${p.name}: ${p.wins}`;
      container.appendChild(div);
    });
}

//Export
function exportEnd() {
  $("export-output").value = players
    .map(p => `${p.name}: ${p.wins}`)
    .join("\n");
}

$("export").onclick = exportEnd;
//NEED TO: STYLE, FIX EXPORT (TXT FILE?)