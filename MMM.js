var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

http.listen(3000, function () {
    console.log("listening on *:3000");
});

var players = [];

var samePosition = function (p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

var newPlayer = function () {
    players.push({
        pos: {x: 0, y: 0},
        dest: {x: 0, y: 0},
        timeTilNextMovement: 0
    });
}

var gameLoop = (function () {
    var lastTime = new Date();
    return (function () {
        var newTime = new Date();
        for (var i = 0; i < players.length; i++) {
            player = players[i];
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
                    console.log("p" + i + ": (" + player.pos.x + ", " + player.pos.y + ")");
                }
            }
        }
        lastTime = new Date();
    });
})();

io.on("connection", function (socket) {
    console.log("new guy");
    newPlayer();
    players[players.length - 1].dest.x = Math.round(Math.random() * 10);
    players[players.length - 1].dest.y = Math.round(Math.random() * 10);
});


setInterval(function () {
    gameLoop();
}, 2);
