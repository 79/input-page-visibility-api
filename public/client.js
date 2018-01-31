let socket = io()
let players
let player_id
let growth
let initializeTime

const DEBUG = false
const xWorld = 4000
const yWorld = 4000

function handleVisibilityChange() {
  if (document.hidden) {
    socket.emit('invisible')
  } else  {
    socket.emit('visible')
  }
}

document.addEventListener('visibilitychange', handleVisibilityChange, false);

function setup() {
  createCanvas(windowWidth, windowHeight)
  background(255)

  // Listen for confirmation of connection
  socket.on('connected', function () {
    console.log("Connected")
  });

  // Receive world state
  socket.on('initialize', function (state) {
    player_id = state.id
    players = state.players

    // Record start time so we can add growth
    initializeTime = millis()
  })

  socket.on('player_added', function(player) {
    players[player.id] = player
  })

  socket.on('player_deleted', function(id) {
    delete players[id]
  })

  socket.on('player_updated', function(player) {
    players[player.id] = player
  })
}

function draw() {
  background(0);
  noStroke();
  fill(255);
  translate(windowWidth / 2, windowHeight / 2)

  // Wait until game initializes before drawing
  if (players === undefined || player_id === undefined) {
    return
  }

  let currentTime = Date.now()

  // Draw self
  let me = players[player_id]
  let mySize = me.visible ? (me.size + (currentTime - me.lastVisibleAt) / 100) : me.size
  push()
  ellipseMode(CENTER)
  ellipse(0, 0, mySize, mySize)
  textAlign(CENTER)
  text(me.id)
  pop()

  // Draw other players
  for (let id in players) {
    if (id === player_id) { continue; }

    let player = players[id]
    let playerSize = player.visible ? (player.size + (currentTime - player.lastVisibleAt) / 100) : player.size
    let x = map(player.xPos - me.xPos, -xWorld, xWorld, -windowWidth / 2, windowWidth / 2)
    let y = map(player.yPos - me.yPos, -yWorld, yWorld, -windowHeight / 2, windowHeight / 2)

    push()
    fill("magenta")
    ellipseMode(CENTER)
    ellipse(x, y, playerSize, playerSize)
    textAlign(CENTER)
    text(player.id)
    pop()
  }


  if (DEBUG) {
    textAlign(CENTER)
    fill("cyan")
    text(player_id, 10, 30)
    text(Object.keys(players).length, 0, 0)
  }
}
