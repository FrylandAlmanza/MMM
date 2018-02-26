var ents = Object.freeze({PLAYER: 0, CHICKEN: 1});
var tileSize = 32;

Crafty.init(1200, 800, document.getElementById("screen"));
var socket;
Crafty.sprite("graphicsscaled.png", {
    me: [0, 0, tileSize, tileSize],
    other: [tileSize, 0, tileSize, tileSize],
    chicken: [0, tileSize, tileSize, tileSize],
    dead: [tileSize, tileSize, tileSize, tileSize]
});

Crafty.c("Destination", {
    mox: 0,
    moy: 0,
    switchin: false,
    events: {
        "EnterFrame": function (e) {
            if (this.x === this.mox && this.y === this.moy) return;
            var mpt = 1;
            /*if (this.switchin === true) {
                mpt = 2;
                this.switchin = false;
            } else {
                this.switchin = true;
            }*/

            if (this.x < this.mox) {
                this.x += mpt;
            }
            if (this.x > this.mox) {
                this.x -= mpt;
            }
            if (this.y < this.moy) {
                this.y += mpt;
            }
            if (this.y > this.moy) {
                this.y -= mpt;
            }
        }
    },
    required: "2D"
});

Crafty.e("2D, DOM, Mouse, Color")
    .attr({x: 0, y: 0, w: 1200, h: 800, z: -2})
    .color("darkgreen")
    .bind("Click", function (e) {
        socket.emit("destination", {
            x: Math.floor(e.realX / tileSize),
            y: Math.floor(e.realY / tileSize)
        });
    });

var entities = {};

socket = io();

socket.on("new", function (msg) {
    var sprite = msg.you ? ", me" : ", other";
    if (msg.etype === ents.CHICKEN) sprite = ", chicken";
    entities[msg.id] = Crafty.e("2D, DOM, Mouse, Destination" + sprite)
        .attr({
            x: msg.x * tileSize,
            y: msg.y * tileSize,
            w: tileSize,
            h: tileSize,
            z: 2,
            mox: msg.x * tileSize,
            moy: msg.y * tileSize})
        .bind("Click", function(e) {
            socket.emit("target", {id: msg.id});
        });
});

socket.on("kill", function (msg) {
    entities[msg.id].sprite("dead");
});

socket.on("move", function (msg) {
    if (!entities.hasOwnProperty(msg.id)) {return 0;};
    entities[msg.id].mox = msg.x * tileSize;
    entities[msg.id].moy = msg.y * tileSize;
});

socket.on("gone", function (msg) {
    entities[msg.id].destroy();
    delete entities[msg.id];
});
