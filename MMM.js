var players = [];

var samePosition = function (p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

var newPlayer = function () {
    players.push({
        pos: {x: 0, y: 0},
        dest: {x: 0, y: 0},
        timeSinceLastMovement: 0
    });
}

var gameLoop = (function () {
    var lastTime = new Date();
    return (function () {
        var newTime = new Date();
        for (var i = 0; i < players.length; i++) {
            player = players[i];
            if (!samePosition(player.pos, player.dest)) {
                player.timeSinceLastMovement += newTime - lastTime;
                if (player.timeSinceLastMovement > 100) {
                    player.timeSinceLastMovement -= 100;
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

newPlayer();
newPlayer();
players[0].dest.x = 8;
players[0].dest.y = 20;
players[1].dest.x = 6;
players[1].dest.y = 3;
while (true) {
    gameLoop();
}
