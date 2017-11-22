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
            for (let id in io.bots) {
                players[id] = io.bots[id].player;
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
        createNewPlayer(id) {
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
                    if (!sockets[id]) {
                        continue;
                    }
                    if (sockets[id].player.x == x && sockets[id].player.y == y) {
                        continue;
                    }
                }
                search = false;
            }
            return new Player(x, y, 0,10,id);
        },
        botStep(id){

        },
        nextMove() {
                this.step++;
                this.step %= this.moveQueue.length;
                if (this.moveQueue[this.step].indexOf('bot') !== 0){
                    botStep(this.moveQueue[this.step]);
                }
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
        },
        getBonuses(n) {
            let ids = moveHandler.moveQueue;
            let bonuses = [];

            for (let i = 0; i < n; i++) {
                let x;
                let y;
                let number = utils.getRandomInt(3, 9);
                let isOver = false;                

                do {
                    y = utils.getRandomInt(0, mapHandler.currentMap.numberOfCell);
                    x = utils.getRandomInt(0, mapHandler.currentMap.numberOfCell);
                    isOver = false;

                     if (mapHandler.currentMap.ourMap[x][y] !== 0){
                         isOver = true;
                         continue;
                     }

                    for (let id of ids) {
                        if (id.indexOf('bot') == 0) {
                            continue;
                        }
                        if (io.sockets.connected[id].player.x === x && io.sockets.connected[id].player.y === y) {
                            isOver = true;
                            break;
                        }
                    }

                    if (isOver) {
                        continue;
                    }

                    if (io.bots) {
                        for (let id of ids) {
                            if (id.indexOf('bot') != 0) {
                                continue;
                            }
                            if (io.bots[id].player.x == x && io.bots[id].player.y == y) {
                                isOver = true;
                                break;
                            }
                        } 
                    }

                    if (isOver) {
                        continue;
                    }

                    for (let bonus of bonuses) {
                        if (bonus.x == x && bonus.y == y) {
                            isOver = true;
                            continue;
                        }
                    }

                } while (isOver);
                
                bonuses.push({
                    "numb": number,
                    "x": x,
                    "y": y
                });
            }

            return bonuses;
        },
        getNPCs(n) {
            let bots = {};

            for (let i = 0; i < n; i++) {
                let id = "bot" + i;
                let bot = {
                    "id": id,
                    "player": moveHandler.createNewPlayer(id)
                }
                bots[id] = bot;
                //moveHandler.moveQueue.push(id)
            }

            return bots;
        }
    };

    let mapBonus;

    app.use(express.static(path.join(dir, "/src")));
    app.get("/", function (req, res, next) {
        res.sendFile(path.join(dir, "/src/client/html/index.html"));
    });

    io.on("connect", function (socket) {
        let numberOfBots = 1;
        let numberOfBonuses = 7;
        console.log(`Socket connected: ${socket.id}`);

        socket.on("message_sent", function(data) {
            io.emit("message_sent", data);
        });

        if (moveHandler.moveQueue.length < utils.playersLimit) {
            console.log("This is new player.");
            socket.player = moveHandler.createNewPlayer(socket.id);
            moveHandler.moveQueue.push(socket.id);
            socket.emit("game_stage", {
                "stage": "Wait"
            });
            if (moveHandler.moveQueue.length === utils.playersLimit) {
                io.bots = moveHandler.getNPCs(numberOfBots);
                mapBonus = moveHandler.getBonuses(numberOfBonuses);                
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

        socket.emit("get_players_limit",utils.playersLimit);

        socket.on("emit_get_players", function () {
            socket.emit("get_players", utils.getPlayers());
        });

        socket.on("emit_who_moves_fight", function (who_moves_id,id_enemy) {
            socket.player.energy = socket.player.maxEnergy;
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

        socket.on("emit_get_bonus",function () {
            if (mapBonus<4) mapBonus = moveHandler.getBonuses(numberOfBonuses);
            socket.emit("get_bonus", mapBonus);
        });

        socket.on("bonus_changed",function (bonus) {
            mapBonus = bonus;
        });

        socket.on("do_fight_step",function (myEnemyId,myEnemy,myEnergy) {
            io.sockets.connected[myEnemyId].player = myEnemy;
            socket.player.energy = myEnergy;
        });

        socket.on("emit_fight_chose_unit", function(i,myEnemy){
            io.sockets.connected[myEnemy].emit("fight_chose_unit",i);
        });

        socket.on("emit_fight_chose_skill",function(clickedSkills,myEnemy){
            io.sockets.connected[myEnemy].emit("fight_chose_skill",clickedSkills);
        });

        socket.on("emit_fight_attack_was_made",function (myEnemy) {
            io.sockets.connected[myEnemy].emit("fight_attack_was_made");
        });

        socket.on("end_of_fight",function (myEnemyId) {

            for (let i in io.sockets.connected[myEnemyId].player.inventory){
                if (socket.player.inventory.indexOf(io.sockets.connected[myEnemyId].player.inventory[i])=== -1) {
                    socket.player.inventory.push(io.sockets.connected[myEnemyId].player.inventory[i]);
                }
            }

            for (key in io.sockets.connected[myEnemyId].player.keys) {
                socket.player.keys.push(io.sockets.connected[myEnemyId].player.keys[key]);
            }

            socket.player.energy = socket.player.maxEnergy;
            socket.emit("get_player", socket.player);

            moveHandler.deletePlayer(myEnemyId);

            socket.emit("game_stage", {
                "stage": "Map"
            });
            io.sockets.connected[myEnemyId].emit("game_stage", {
                "stage": "Supervisor"
            });
        });

        socket.on("run", function (myEnemy) {
            io.sockets.connected[myEnemy].player.units['warrior'] += parseInt(socket.player.units['warrior'] / 2);
            io.sockets.connected[myEnemy].player.units['magician'] += parseInt(socket.player.units['magician'] / 2);
            socket.player.units['warrior']  = parseInt(socket.player.units['warrior'] / 2);
            socket.player.units['magician'] = parseInt(socket.player.units['magician'] / 2);


            if (isEnterable(mapHandler.currentMap, socket.player.x+1,socket.player.y)) {
                socket.player.x += 1
            } else if (isEnterable(mapHandler.currentMap, socket.player.x-1,socket.player.y)) {
                socket.player.x -= 1
            } else if (isEnterable(mapHandler.currentMap, socket.player.x,socket.player.y + 1)) {
                socket.player.y += 1
            } else if (isEnterable(mapHandler.currentMap, socket.player.x,socket.player.y - 1)) {
                socket.player.y -= 1
            }

            socket.emit("game_stage", {
                "stage": "Wait"
            });

            io.sockets.connected[myEnemy].emit("game_stage", {
                "stage": "Wait"
            });

            socket.emit("get_player",socket.player);
            socket.emit("get_players",utils.getPlayers());
            io.sockets.connected[myEnemy].emit("get_player",io.sockets.connected[myEnemy].player);
            io.sockets.connected[myEnemy].emit("get_players",utils.getPlayers());
            moveHandler.nextMove();
            io.emit("who_moves", moveHandler.moveQueue[moveHandler.step]);
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
        socket.on("player_get_bonus", function (playerWithBonus) {
           socket.player  = playerWithBonus;
        });

        socket.on("quit", function () {
            socket.emit("game_stage", {
                "stage": "Supervisor"
            });
            moveHandler.deletePlayer(socket.id);
            moveHandler.nextMove();
            io.emit("who_moves", moveHandler.moveQueue[moveHandler.step]);
        });

        socket.on("unite", function (myEnemy) {
            io.sockets.connected[myEnemy].player.units['warrior'] += socket.player.units['warrior'];
            io.sockets.connected[myEnemy].player.units['magician'] += socket.player.units['magician'];

            for (let i in socket.player.inventory) {
                if (io.sockets.connected[myEnemy].player.inventory.indexOf(socket.player.inventory[i]) === -1) {
                    io.sockets.connected[myEnemy].player.inventory.push(socket.player.inventory[i])
                }
            }

            for (let i in socket.player.keys) {
                    io.sockets.connected[myEnemy].player.keys.push(socket.player.keys[i])
            }

            io.sockets.connected[myEnemy].emit("game_stage", {
                "stage": "Wait"
            });
            socket.emit("game_stage", {
                "stage": "Supervisor"
            });

            moveHandler.deletePlayer(socket.id);

            io.sockets.connected[myEnemy].emit("get_player", io.sockets.connected[myEnemy].player);
            io.sockets.connected[myEnemy].emit("get_players", utils.getPlayers());
            moveHandler.nextMove();
            io.emit("who_moves", moveHandler.moveQueue[moveHandler.step]);
        });

        socket.on("emit_get_player", function () {
            socket.emit("get_player", socket.player);
        });

        socket.on("do_step", function (step,rangeOfStep) {
            if (socket.player.distance >= rangeOfStep) {
                socket.player.distance -= rangeOfStep;
                socket.player.x = step.x;
                socket.player.y = step.y;

                let sockets = io.sockets.connected;
                let isCarrying = true;

                for (let i in sockets) {
                    if (sockets[i].player !== undefined) {
                        if (socket.id !== sockets[i].id && sockets[i].player.x === socket.player.x && sockets[i].player.y === socket.player.y) {
                            socket.player.distance = socket.player.maxDistance;
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
                if (isCarrying && socket.player.distance === 0) {
                    socket.player.distance = socket.player.maxDistance;
                    moveHandler.nextMove();
                    io.emit("who_moves", moveHandler.moveQueue[moveHandler.step]);
                }
            }
       });

        socket.on("game_end",function () {
            for (let id in io.sockets.connected)
                    io.sockets.connected[id].emit("game_stage", {
                        "stage": "Supervisor"
                    });
            socket.emit("game_stage", {
                "stage": "Win"
            });
        });

        socket.on("disconnect", function () {
            //...
        });
    });


    http.listen(port, function () {
        console.log(`Server works on http://${ip}:${port}/`);
    });
};
