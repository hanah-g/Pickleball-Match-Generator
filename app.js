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
  updatePlayerCount();
}

$("add-player").onclick = addPlayer;

//list players 
function listPlayers() {
  const list = $("player-list");
  list.innerHTML = "";
  players.filter(p => !p.removed).forEach(p => {
    const div = document.createElement("div");
    div.textContent = `${p.name} (${p.wins})`;
    const remove = document.createElement("button");
    remove.textContent = "×";
    remove.onclick = () => {
      p.removed = true;
      listPlayers();
      updateWins();
      updatePlayerCount();
    };
    div.appendChild(remove);
    list.appendChild(div);
  });
}

//shuffle helper
function shuffle(arr) {
  return arr
    .map(x => ({ x, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(o => o.x);
}

function shufflePlayers(round) {
    //only shuffle if NO court has a winner
    if (round.courts.some(c => c.winner)) return;
    const all = [];
    round.courts.forEach(c => {
      all.push(...c.team1, ...c.team2);
    });
    const shuffled = shuffle(all);
    // Reassign teams of 2 per court
    let idx = 0;
    round.courts.forEach(c => {
      c.team1 = shuffled.slice(idx, idx + 2);
      c.team2 = shuffled.slice(idx + 2, idx + 4);
      idx += 4;
    });
    showRounds();
  }

//generate a round
function generateRound() {
  const courts = parseInt($("court-count").value);
  const maxPlayers = courts * 4;
  const shuffled = shuffle(players.filter(p => !p.removed).map(p => p.id));
  const used = shuffled.slice(0, maxPlayers);
  const sittingOut = shuffled.slice(maxPlayers);
  const round = [];
  let idx = 0;
  for (let c = 0; c < courts; c++) {
      round.push({
        court: c + 1,
        team1: used.slice(idx, idx + 2),
        team2: used.slice(idx + 2, idx + 4),
        winner: null
      });
    idx += 4;
  }
  rounds.push({
    courts: round,
    sittingOut: sittingOut
  });
  showRounds();
}

$("generate-round").onclick = generateRound;

//list rounds
function showRounds() {
  const container = $("rounds");
  container.innerHTML = "";
  rounds.forEach((round, rIndex) => {
    const div = document.createElement("div");
    div.innerHTML = `<h3>Round ${rIndex + 1}</h3>`;
    if (!round.courts.some(c => c.winner)) {
        const shuffleAllBtn = document.createElement("button");
        shuffleAllBtn.textContent = "Shuffle All Teams";
        shuffleAllBtn.onclick = () => shufflePlayers(rounds[rIndex]);
        div.appendChild(shuffleAllBtn);
    }    
    round.courts.forEach(court => {
      const cDiv = document.createElement("div");
      cDiv.innerHTML = `
        <strong>Court ${court.court}</strong><br>
        Team A: ${court.team1.map(id => players.find(p => p.id === id)?.name || "(removed)").join(", ")}<br>
        Team B: ${court.team2.map(id => players.find(p => p.id === id)?.name || "(removed)").join(", ")}<br>
      `;
      const btnA = document.createElement("button");
      btnA.textContent = "Team A Win";
      const btnB = document.createElement("button");
      btnB.textContent = "Team B Win";
      //lock after winning so teams can't both win or win more than once
      if (court.winner) {
        btnA.disabled = true;
        btnB.disabled = true;
        btnA.classList.add("winner");
        btnB.classList.add("winner");
      }
      btnA.onclick = e => {
        e.stopPropagation();
        //btnA.classList.add("winner");
        //btnB.classList.add("winner");
        recordWin(court, "A");
      };
      btnB.onclick = e => {
        e.stopPropagation();
        //btnA.classList.add("winner");
        //btnB.classList.add("winner");
        recordWin(court, "B");
      };
      cDiv.appendChild(btnA);
      cDiv.appendChild(btnB);
      div.appendChild(cDiv);
    });
    if (round.sittingOut.length > 0) {
        const sitDiv = document.createElement("div");
        sitDiv.innerHTML = `${round.sittingOut.map(id => players.find(p => p.id === id)?.name || "(removed)").join(", ")}`;
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
  /*const roundDivs = document.querySelectorAll("#rounds > div");
  const lastRound = roundDivs[roundDivs.length - 1];
  const buttons = lastRound.querySelectorAll("button");
  buttons.forEach(btn => {
    if (btn.textContent.includes(winner === "A" ? "Team A" : "Team B")) {
      btn.classList.add("winner");
    }
  });*/
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

//want to add number of plauers since i had to keep counting
function updatePlayerCount() {
    $("player-count").textContent = `Players: ${players.length}`;
  }  

//Export
function exportEnd() {
  $("export-output").value = players
    .map(p => `${p.name}: ${p.wins}`)
    .join("\n");
}

$("export").onclick = exportEnd;



//NEED TO:
// FIX EXPORT (TXT FILE?), FIX BREAK WHEN PLAYER LEAVES, ADD SHUFFLE FEATURE, ADD EDIT TEAMS FEATURE (?), ADD TRY TO SHUFFLE PLAYERS AS MUCH AS POSSIBLE?