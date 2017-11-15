let Player = require('../../common/js/Player').Player;
let fs = require('fs');
let path = require('path');
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

let port = process.env.PORT || 8080;
let ip = "127.0.0.1";

module.exports = function startServer(dir) {
    app.use(express.static(path.join(dir, "/src")));
    app.get("/", function (req, res, next) {
        res.sendFile(path.join(dir, "/src/client/html/index.html"));
    });

    let moveHandler = {
        "moveQueue": [],
        "step": 0,
        "nextMove": function() {
            this.step++;
            this.step %= this.moveQueue.length;
        }
    };
    let currentMapName = "map1";

    io.on("connect", function (socket) {
        console.log(`Socket connected: ${socket.id}`);
        socket.player = new Player(0, 0, 0, 10);
        moveHandler.moveQueue.push(socket.id);
        socket.emit("get_player", socket.player);
        fs.readFile(path.join(dir, "/src/server/js/json", `${currentMapName}.json`), function (err, buffer) {
            if (err) {
                throw err;
            }
            socket.emit("get_map", buffer.toString());
        });

        socket.on("emit_get_players",function () {
            console.log("emit_get_players");
            socket.emit("get_players", getPlayers());
        });


        socket.on("emit_get_player",function () {
            socket.emit("get_player", socket.player);
        });

        socket.on("do_step", function (step) {

            socket.player.x = step.x;
            socket.player.y = step.y;

            var sockets = io.sockets.connected;

            for (var i in sockets) {
                if (sockets[i].player.x == step.x && sockets[i].player.y == step.y) {
                    socket.emit("game_stage", {
                        "stage": "FightMenu",
                        "from": socket.id
                    });
                    socket.emit("game_stage", {
                        "stage": "Wait",
                        "from": i.id
                    });
                }
            }
            moveHandler.nextMove();
            io.emit("who_moves", moveHandler.moveQueue[moveHandler.step]);
        });

        socket.on("fight", function(socketid) {

        });

        socket.on("disconnect", function () {
            //...
        });
    });

};

http.listen(port, function () {
    console.log(`Server works on http://${ip}:${port}/`);
});


function getPlayers() {
    let players = {};

    var sockets = io.sockets.connected;

    for (var i in sockets)
        players[sockets[i].id] = sockets[i].player;

    return players;
}