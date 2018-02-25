Crafty.init(600, 400, document.getElementById("screen"));
var socket;
Crafty.sprite("graphics.png", {
    me: [0, 0, 16, 16],
    other: [16, 0, 16, 16]
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

var players = {};

var tileSize = 16;

socket = io();

socket.on("new", function (msg) {
    var sprite = msg.you ? ", me" : ", other";
    players[msg.id] = Crafty.e("2D, DOM" + sprite)
        .attr({
            x: msg.x * tileSize,
            y: msg.y * tileSize,
            w: tileSize,
            h: tileSize,
            z: 2});
});

socket.on("move", function (msg) {
    if (!players.hasOwnProperty(msg.id)) {return 0;};
    players[msg.id].x = msg.x * tileSize;
    players[msg.id].y = msg.y * tileSize;
});

socket.on("gone", function (msg) {
    players[msg.id].destroy();
    delete players[msg.id];
});
