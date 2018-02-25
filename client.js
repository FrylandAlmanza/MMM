var ents = Object.freeze({PLAYER: 0, CHICKEN: 1});

Crafty.init(600, 400, document.getElementById("screen"));
var socket;
Crafty.sprite("graphics.png", {
    me: [0, 0, 16, 16],
    other: [16, 0, 16, 16],
    chicken: [0, 16, 16, 16],
    dead: [16, 16, 16, 16]
});
Crafty.e("2D, DOM, Mouse, Color")
    .attr({x: 0, y: 0, w: 600, h: 400, z: -2})
    .color("darkgreen")
    .bind("Click", function (e) {
        socket.emit("destination", {
            x: Math.floor(e.realX / tileSize),
            y: Math.floor(e.realY / tileSize)
        });
    });

var entities = {};

var tileSize = 16;

socket = io();

socket.on("new", function (msg) {
    var sprite = msg.you ? ", me" : ", other";
    if (msg.etype === ents.CHICKEN) sprite = ", chicken";
    entities[msg.id] = Crafty.e("2D, DOM, Mouse" + sprite)
        .attr({
            x: msg.x * tileSize,
            y: msg.y * tileSize,
            w: tileSize,
            h: tileSize,
            z: 2})
        .bind("Click", function(e) {
            socket.emit("target", {id: msg.id});
        });
});

socket.on("kill", function (msg) {
    entities[msg.id].sprite("dead");
});

socket.on("move", function (msg) {
    if (!entities.hasOwnProperty(msg.id)) {return 0;};
    entities[msg.id].x = msg.x * tileSize;
    entities[msg.id].y = msg.y * tileSize;
});

socket.on("gone", function (msg) {
    entities[msg.id].destroy();
    delete entities[msg.id];
});
