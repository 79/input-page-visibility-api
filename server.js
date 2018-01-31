let port = process.env.PORT || 8000;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function () {
  console.log('Server listening at port: ', port);
});

app.use(express.static('public'));

let io = require('socket.io').listen(server);

let players = {};

const xWorld = 4000;
const yWorld = 4000;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

io.sockets.on('connection',
  function (socket) {

    // Initialize new player
    console.log("We have a new player: " + socket.id)

    let player = {
      id: socket.id,
      xPos: getRandomInt(xWorld),
      yPos: getRandomInt(yWorld),
      size: 100,
      visible: true,
      lastVisibleAt: Date.now()
    }
    players[socket.id] = player

    socket.emit('initialize', {
      id: socket.id,
      players: players
    })

    socket.broadcast.emit('player_added', player)

    // Remove disconnected player
    socket.on('disconnect', function() {
      delete players[socket.id]

      io.sockets.emit('player_deleted', socket.id)
    })

    // When user becomes visible, record timestamp
    socket.on('visible', function() {
      players[socket.id] = Object.assign(players[socket.id], {
        visible: true,
        lastVisibleAt: Date.now()
      })
      io.sockets.emit('player_updated', players[socket.id])
    })

    // When user becomes invisible, record size
    socket.on('invisible', function() {
      let elapsedTime = Date.now() - players[socket.id].lastVisibleAt
      players[socket.id] = Object.assign(players[socket.id], {
        visible: false,
        size: players[socket.id].size + elapsedTime / 100
      })
      io.sockets.emit('player_updated', players[socket.id])
    })
  }
);
