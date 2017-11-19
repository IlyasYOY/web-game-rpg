let Player = require('../../common/js/Player').Player;
let fs = require('fs');
let path = require('path');
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let isEnterable = require('../../common/js/Map').isEnterable;

let port = process.env.PORT || 8080;
let ip = "127.0.0.1";

module.exports = function startServer(dir) {
    app.use(express.static(path.join(dir, "/src")));
    app.get("/", function (req, res, next) {
        res.sendFile(path.join(dir, "/src/client/html/index.html"));
    });

    let utils = {
        playersLimit: 2,
        getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        },
        getPlayers() {
            let players = {};
            let sockets = io.sockets.connected;

            for (let id in sockets) {
                players[sockets[id].id] = sockets[id].player;
            }

            return players;
        }
    };

    let mapHandler = {
        mapNames: [],
        currentMapNumber: 0,
        currentMap: null,
        getMaps() {
            this.mapNames = fs.readdirSync(path.join(dir, "/src/server/js/json"));
            this.currentMap = JSON.parse(fs.readFileSync(path.join(dir, "/src/server/js/json", this.mapNames[this.currentMapNumber])));
        },
        nextMap() {
            this.currentMapNumber++;
            this.currentMapNumber %= this.mapNames.length;
            this.currentMap = null;
        },
        loadCurrentMap(s) {
            if (this.currentMap == null) {
                fs.readFile(path.join(dir, "/src/server/js/json", this.mapNames[this.currentMapNumber]), function (err, buffer) {
                    if (err) {
                        throw err;
                    }
                    const str = buffer.toString();
                    if (s) {
                        s.emit("get_map", str);
                    }
                    mapHandler.currentMap = JSON.parse(str);
                });
            } else {
                if (s) {
                    s.emit("get_map", JSON.stringify(mapHandler.currentMap));
                }
            }
        }
    };
    mapHandler.getMaps();
    mapHandler.loadCurrentMap();

    let moveHandler = {
        moveQueue: [],
        step: 0,
        getCurrent() {
            return this.moveQueue[this.step];
        },
        createNewPlayer() {
            let size = mapHandler.currentMap.numberOfCell;
            let x, y;
            let sockets = io.sockets.connected;
            let search = true;
            while (search) {
                x = utils.getRandomInt(0, size);
                y = utils.getRandomInt(0, size);
                if (!isEnterable(mapHandler.currentMap, x, y)) {
                    continue;
                }
                for (let id of this.moveQueue) {
                    if (sockets[id].player.x == x && sockets[id].player.y == y) {
                        continue;
                    }
                }
                search = false;
            }
            return new Player(x, y, 0);
        },
        nextMove() {
            this.step++;
            this.step %= this.moveQueue.length;
        },
        deletePlayer(id){
            for (let i in this.moveQueue){
                if (this.moveQueue[i] == id){
                    this.moveQueue.splice(i,1);
                    delete io.sockets.connected[id].player;
                }
            }
            this.step++;
            this.step %= this.moveQueue.length;
        }
    };

    io.on("connect", function (socket) {
        console.log(`Socket connected: ${socket.id}`);

        if (moveHandler.moveQueue.length < utils.playersLimit) {
            console.log("This is new player.");
            socket.player = moveHandler.createNewPlayer();
            moveHandler.moveQueue.push(socket.id);
            socket.emit("game_stage", {
                "stage": "Wait"
            });
            if (moveHandler.moveQueue.length === utils.playersLimit) {
                io.emit("who_moves", moveHandler.getCurrent());
            }
        } else {
            console.log("This is new Supervisor.");
            socket.emit("game_stage", {
                "stage": "Supervisor"
            });
        }
        socket.emit("get_player", socket.player);
        socket.on("emit_get_map", function (data) {
            mapHandler.loadCurrentMap(socket);
        });

        socket.on("emit_get_players", function () {
            socket.emit("get_players", utils.getPlayers());
        });

        socket.on("emit_who_moves_fight", function (who_moves_id,id_enemy) {
            socket.emit("get_players", utils.getPlayers());
            socket.emit("get_player", socket.player);
            io.sockets.connected[id_enemy].emit("get_players", utils.getPlayers());
            io.sockets.connected[id_enemy].emit("get_player", io.sockets.connected[id_enemy].player);

            if (socket.id === who_moves_id){
                socket.emit("who_moves_fight",id_enemy);
                io.sockets.connected[id_enemy].emit("who_moves_fight",id_enemy);
            } else {
                io.sockets.connected[id_enemy].emit("who_moves_fight",socket.id);
                socket.emit("who_moves_fight",socket.id);
            }
        });

        socket.on("do_fight_step",function (myEnemyId,myEnemy) {
            io.sockets.connected[myEnemyId].player = myEnemy;
            socket.player.energy = socket.player.maxEnergy;
        });

        socket.on("end_of_fight",function (myEnemyId) {

            // for (let i in io.sockets.connected[myEnemyId].player.inventory){
            //     socket.player.inventory.push(io.sockets.connected[myEnemyId].player.inventory[i]);
            // }
            //
            // for (let i of io.sockets.connected[myEnemyId].player.keys){
            //     socket.player.keys.push(io.sockets.connected[myEnemyId].player.keys[i]);
            // }

            socket.player.energy = socket.player.maxEnergy;

            moveHandler.deletePlayer(myEnemyId);
            console.log(moveHandler);
            socket.emit("game_stage", {
                "stage": "Map"
            });
            io.sockets.connected[myEnemyId].emit("game_stage", {
                "stage": "Supervisor"
            });
        });

        socket.on("fight", function (myEnemy) {

            socket.emit("game_stage", {
                "stage": "Fight",
                "from": myEnemy
            });
            for (let id of moveHandler.moveQueue)
                if (id == myEnemy) {
                    io.sockets.connected[id].emit("game_stage", {
                        "stage": "Fight",
                        "from": socket.id
                    });
                    socket.emit("who_moves_fight", id);
                    io.sockets.connected[id].emit("who_moves_fight", id);
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
            let isCarrying = true;

            for (let i in sockets) {
                if (sockets[i].player !== undefined) {
                    if (socket.id !== sockets[i].id && sockets[i].player.x === socket.player.x && sockets[i].player.y === socket.player.y) {
                        isCarrying = false;
                        socket.emit("game_stage", {
                            "stage": "Wait",
                            "from": sockets[i].id
                        });
                        sockets[i].emit("game_stage", {
                            "stage": "FightMenu",
                            "from": socket.id
                        });
                    }
                }
            }
            if (isCarrying) {
                moveHandler.nextMove();
                io.emit("who_moves", moveHandler.moveQueue[moveHandler.step]);
            }
        });


        socket.on("disconnect", function () {
            //...
        });
    });


    http.listen(port, function () {
        console.log(`Server works on http://${ip}:${port}/`);
    });
};
