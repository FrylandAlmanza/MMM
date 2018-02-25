var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/client.js", function(req, res) {
    res.sendFile(__dirname + "/client.js");
});

app.get("/graphics.png", function(req, res) {
    res.sendFile(__dirname + "/graphics.png");
});

http.listen(3000, function () {
    console.log("listening on *:3000");
});

var players = {};

var samePosition = function (p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

var newPlayer = function (socket) {
    players[socket.id] = {
        pos: {x: 0, y: 0},
        dest: {x: 0, y: 0},
        timeTilNextMovement: 0,
        socket: socket
    };
}

var gameLoop = (function () {
    var lastTime = new Date();
    return (function () {
        var newTime = new Date();
        Object.entries(players).forEach(function (key, value) {
            var player = key[1];
            if (!samePosition(player.pos, player.dest)) {
                player.timeTilNextMovement -= newTime - lastTime;
                if (player.timeTilNextMovement <= 0) {
                    player.timeTilNextMovement = 500;
                    if (player.pos.x < player.dest.x) {
                        player.pos.x++;
                    }
                    if (player.pos.x > player.dest.x) {
                        player.pos.x--;
                    }
                    if (player.pos.y < player.dest.y) {
                        player.pos.y++;
                    }
                    if (player.pos.y > player.dest.y) {
                        player.pos.y--;
                    }
                    //console.log("p" + i + ": (" + player.pos.x + ", " + player.pos.y + ")");
                    io.emit("move", {
                        id: player.socket.id,
                        x: player.pos.x,
                        y: player.pos.y
                    });
                }
            }
        });
        lastTime = new Date();
    });
})();

io.on("connection", function (socket) {
    console.log("new guy");
    newPlayer(socket);
    var p = players[socket.id];
    p.dest.x = Math.round(Math.random() * 10);
    p.dest.y = Math.round(Math.random() * 10);
    Object.entries(players).forEach(function (key, value) {
        var player = key[1];
        socket.emit("new", {
            id: player.socket.id,
            x: player.pos.x,
            y: player.pos.y,
            you: socket.id === player.socket.id
        });
    });
    socket.broadcast.emit("new", {
        id: socket.id,
        x: p.pos.x,
        y: p.pos.y,
        you: false
    });

    socket.on("destination", function (msg) {
        players[socket.id].dest = msg;
    });

    socket.on("disconnect", function () {
        console.log("They gone.");
        delete players[socket.id];
        io.emit("gone", {id: socket.id});
    });
});


setInterval(function () {
    gameLoop();
}, 2);
