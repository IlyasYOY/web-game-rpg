let Player = require('../../common/js/Player').Player;
let fs = require('fs');
let path = require('path');
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);


let port = process.env.PORT || 8080;
let ip = "127.0.0.1";
let playersLimit = 2;


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


module.exports = function startServer(dir) {
    app.use(express.static(path.join(dir, "/src")));
    app.get("/", function (req, res, next) {
        res.sendFile(path.join(dir, "/src/client/html/index.html"));
    });

    let mapHandler = {
        mapNames: [],
        currentMapNumber: 0,
        currentMap: null,
        getMaps: function () {
            this.mapNames = fs.readdirSync(path.join(dir, "/src/server/js/json"));
        },
        nextMap: function () {
            this.currentMapNumber++;
            this.currentMapNumber %= this.mapNames.length;
            this.currentMap = null;
        },
        loadCurrentMap: function (s) {
            if (this.currentMap == null) {
                fs.readFile(path.join(dir, "/src/server/js/json", this.mapNames[this.currentMapNumber]), function (err, buffer) {
                    if (err) {
                        throw err;
                    }
                    const str = buffer.toString();
                    if (s) {
                        s.emit("get_map", str);
                    }
                    mapHandler.currentMap = str;
                });
            } else {
                s.emit("get_map", mapHandler.currentMap);
            }
        }
    }
    mapHandler.getMaps();
    mapHandler.loadCurrentMap();
    let moveHandler = {
        moveQueue: [],
        step: 0,
        getCurrent: function () {
            return this.moveQueue[this.step];
        },
        getNewPlayer: function () {
            // TODO.
        },
        nextMove: function () {
            this.step++;
            this.step %= this.moveQueue.length;
        }
    };
    let currentMapName = "map1";

    io.on("connect", function (socket) {
        console.log(`Socket connected: ${socket.id}`);
        if (moveHandler.moveQueue.length < playersLimit) {
            socket.player = new Player(0, 0, 0, 10);
            moveHandler.moveQueue.push(socket.id);
            socket.emit("game_stage", {
                "stage": "Wait"
            });
            if (moveHandler.moveQueue.length === playersLimit) {
                io.emit("who_moves", moveHandler.getCurrent());
            }
        } else {
            console.log(moveHandler.moveQueue.length);
            socket.emit("game_stage", {
                "stage": "Supervisor"
            });
        }
        socket.emit("get_player", socket.player);
        socket.on("emit_get_map", function(data) {
            fs.readFile(path.join(dir, "/src/server/js/json", `${currentMapName}.json`), function (err, buffer) {
                if (err) {
                    throw err;
                }
                socket.emit("get_map", buffer.toString());
            });
        });

        socket.on("emit_get_players", function () {
            socket.emit("get_players", getPlayers());
        });

        socket.on("fight",function (myEnemy) {
           socket.emit("game_stage",{
               "stage": "Fight",
               "from": myEnemy
           });

            let sockets = io.sockets.connected;

            for (let i in sockets)
                if (sockets[i].id == myEnemy){
                    sockets[i].emit("game_stage",{
                        "stage": "Fight",
                        "from": socket.id
                    });
                    break;
                }

        });


        socket.on("emit_get_player", function () {
            socket.emit("get_player", socket.player);
        });

        socket.on("do_step", function (step) {

            socket.player.x = step.x;
            socket.player.y = step.y;

            let sockets = io.sockets.connected;
            let flag = true;

            for (let j in sockets) {
                if (sockets[j].player !== undefined) {
                    if (socket.id !== sockets[j].id && sockets[j].player.x === socket.player.x && sockets[j].player.y === socket.player.y) {
                        flag = false;
                        socket.emit("game_stage", {
                            "stage": "Wait",
                            "from": sockets[j].id
                        });
                        sockets[j].emit("game_stage", {
                            "stage": "FightMenu",
                            "from": socket.id
                        });
                    }
                }
            }
            if (flag) {
                moveHandler.nextMove();
                io.emit("who_moves", moveHandler.moveQueue[moveHandler.step]);
            }
        });

        socket.on("fight", function (socketid) {

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