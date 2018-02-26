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

app.get("/graphicsscaled.png", function(req, res) {
    res.sendFile(__dirname + "/graphicsscaled.png");
});

app.get("/style.css", function(req, res) {
    res.sendFile(__dirname = "/style.css");
});

http.listen(3000, function () {
    console.log("listening on *:3000");
});

var entities = {};
var entityCounter = 0;

var samePosition = function (p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

var ents = Object.freeze({PLAYER: 0, CHICKEN: 1});

var newPlayer = function (socket) {
    var id = socket.id;
    entities[id] = {
        etype: ents.PLAYER,
        pos: {x: 0, y: 0},
        dest: {x: 0, y: 0},
        timeTilNextMovement: 0,
        target: null,
        socket: socket,
        id: id,
        alive: true
    };
    return entities[id];
}

var newChicken = function () {
    var id = entityCounter++
    entities[id] = {
        etype: ents.CHICKEN,
        pos: {
            x: Math.floor(Math.random() * 30),
            y: Math.floor(Math.random() * 30)
        },
        dest: {
            x: Math.floor(Math.random() * 30),
            y: Math.floor(Math.random() * 30)
        },
        timeTilNextMovement: Math.floor(Math.random() * 1000),
        target: null,
        id: id,
        alive: true
    };
    return entities[id];
}

var gameLoop = (function () {
    var lastTime = new Date();
    for (var i = 0; i < 10; i++) {
        var chicken = newChicken();
        io.emit("new", {
            id: chicken.id,
            x: chicken.x,
            y: chicken.y,
            you: false,
            etype: ents.CHICKEN
        });
    }
    return (function () {
        var newTime = new Date();
        Object.entries(entities).forEach(function (key, value) {
            var entity = key[1];
            if (!entity.alive) return 0;
            if (!samePosition(entity.pos, entity.dest)) {
                entity.timeTilNextMovement -= newTime - lastTime;
                if (entity.timeTilNextMovement <= 0) {
                    entity.timeTilNextMovement = 1000;
                    if (entity.pos.x < entity.dest.x) {
                        entity.pos.x++;
                    }
                    if (entity.pos.x > entity.dest.x) {
                        entity.pos.x--;
                    }
                    if (entity.pos.y < entity.dest.y) {
                        entity.pos.y++;
                    }
                    if (entity.pos.y > entity.dest.y) {
                        entity.pos.y--;
                    }
                    if (entity.etype === ents.CHICKEN) {
                        if (entity.pos.x === entity.dest.x &&
                            entity.pos.y === entity.dest.y) {
                            entity.dest.x = Math.floor(Math.random() * 30);
                            entity.dest.y = Math.floor(Math.random() * 30);
                            entity.timeTilNextMovement = 5000;
                        }
                    }
                    if (entity.target !== null) {
                        var target = entities[entity.target];
                        entity.dest.x = target.pos.x;
                        entity.dest.y = target.pos.y;
                        if (entity.pos.x === target.pos.x &&
                            entity.pos.y === target.pos.y) {
                            target.alive = false;
                            entity.target = null;
                            entity.dest.x = entity.pos.x;
                            entity.dest.y = entity.pos.y;
                            io.emit("kill", {id: target.id});
                        }
                    }
                    //console.log("p" + i + ": (" + entity.pos.x + ", " + entity.pos.y + ")");
                    io.emit("move", {
                        id: entity.id,
                        x: entity.pos.x,
                        y: entity.pos.y
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
    var p = entities[socket.id];
    Object.entries(entities).forEach(function (key, value) {
        var entity = key[1];
        socket.emit("new", {
            id: entity.id,
            x: entity.pos.x,
            y: entity.pos.y,
            you: socket.id === entity.id,
            etype: entity.etype
        });
    });
    socket.broadcast.emit("new", {
        id: socket.id,
        x: p.pos.x,
        y: p.pos.y,
        you: false,
        etype: ents.PLAYER
    });

    socket.on("destination", function (msg) {
        entities[socket.id].dest.x = msg.x;
        entities[socket.id].dest.y = msg.y;
    });

    socket.on("target", function (msg) {
        entities[socket.id].target = msg.id;
        entities[socket.id].dest.x = entities[msg.id].pos.x;
        entities[socket.id].dest.y = entities[msg.id].pos.y;
    });

    socket.on("disconnect", function () {
        console.log("They gone.");
        delete entities[socket.id];
        io.emit("gone", {id: socket.id});
    });
});


setInterval(function () {
    gameLoop();
}, 2);
