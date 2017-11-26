let Player = require('../../common/js/Player').Player;
let fs = require('fs');
let path = require('path');
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let isEnterable = require('../../common/js/Map').isEnterable;
let findPath = require('./FindPath').findPath;
let typesOfUnit = require('../../common/js/Player').typesOfUnit;
let so;


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
        currentMapNumber: 2,
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
            return new Player(x, y, 0, 10, id);
        },
        botStep(id) {
            let skillNames = ['kick', 'mag_kick', 'fireball', 'lightning', 'godpunch'];
            let newMaxDistance = function (player) {
                return parseInt((player.units.warrior * (200 / typesOfUnit['warrior'].speed) + player.units.magician * (200 / typesOfUnit['magician'].speed)) / 50);
            };
            let checkTheBotWay = function (path, id, x, y) {
                let flag = false;
                let length = 1;
                for (let cell in path) {
                    for (let i in mapBonus) {
                        if (mapBonus[i].x === path[cell][0] && mapBonus[i].y === path[cell][1]) {
                            if (mapBonus[i].numb === 3) {
                                io.bots[id].player.maxEnergy += 1;
                                io.bots[id].player.energy = io.bots[id].player.maxEnergy;
                            } else if (mapBonus[i].numb === 4) {
                                io.bots[id].player.distance = io.bots[id].player.maxDistance;
                            } else if (mapBonus[i].numb === 5) {
                                if (io.bots[id].player.inventory.indexOf(skillNames[2]) === -1) {
                                    io.bots[id].player.inventory.push(skillNames[2]);
                                }
                            } else if (mapBonus[i].numb === 6) {
                                if (io.bots[id].player.inventory.indexOf(skillNames[3]) === -1) {
                                    io.bots[id].player.inventory.push(skillNames[3]);
                                }
                            } else if (mapBonus[i].numb === 7) {
                                if (io.bots[id].player.inventory.indexOf(skillNames[4]) === -1) {
                                    io.bots[id].player.inventory.push(skillNames[4]);
                                }
                            } else if (mapBonus[i].numb === 8) {
                                io.bots[id].player.units.warrior += 5;
                                io.bots[id].player.maxDistance = newMaxDistance(io.bots[id].player);
                            } else if (mapBonus[i].numb === 9) {
                                io.bots[id].player.units.magician += 5;
                                io.bots[id].player.maxDistance = newMaxDistance(io.bots[id].player);
                            }
                            mapBonus.splice(i, 1);
                            flag = true;
                            break;
                        }
                    }
                    ++length;
                }

            };
            let compareStrength = function (me, enemy) {
                let sumMe = me.player.units.warrior + me.player.units.magician;
                let sumEnemy = enemy.player.units.warrior + enemy.player.units.magician;
                return sumMe > sumEnemy;
            };
            let getObjects = function (id) {
                let objects = [];
                for (let i in mapBonus) {
                    objects.push(mapBonus[i]);
                }
                for (let i in io.bots) {
                    if (io.bots[i].player && i !== id && compareStrength(io.bots[id], io.bots[i])) {
                        console.log(io.bots[i].player);
                        objects.push(io.bots[i].player);
                    }
                }
                for (let i in io.sockets.connected) {
                    if (io.sockets.connected[i].player && compareStrength(io.bots[id], io.sockets.connected[i])) {
                        console.log(io.sockets.connected[i].player);
                        objects.push(io.sockets.connected[i].player);
                    }
                }
                return objects;
            };

            let searchNear = function (objects, botX, botY) {
                let minLength;
                let length;
                console.log("yes");
                minLength = findPath(mapHandler.currentMap, [botX, botY], [objects[0].x, objects[0].y]);
                for (let i in objects) {
                    length = findPath(mapHandler.currentMap, [botX, botY], [objects[i].x, objects[i].y]);
                    if (minLength.length > length.length) {
                        minLength = length;
                    }
                }
                // console.log("min path");
                /// console.log(minLength);
                return minLength;
            };
            let botFight = function (botOneId, botTwoId) {
                io.bots[botOneId].player.units['warrior'] -= parseInt(io.bots[botTwoId].player.units['warrior'] / 2);
                if (io.bots[botOneId].player.units['warrior'] < 0) {
                    io.bots[botOneId].player.units['warrior'] = 0;
                }
                io.bots[botOneId].player.units['magician'] -= parseInt(io.bots[botTwoId].player.units['magician'] / 2);
                if (io.bots[botOneId].player.units['magician'] < 0) {
                    io.bots[botOneId].player.units['magician'] = 0;
                }
                io.bots[botTwoId].player.units['warrior'] = parseInt(io.bots[botTwoId].player.units['warrior'] / 2);
                io.bots[botTwoId].player.units['magician'] = parseInt(io.bots[botTwoId].player.units['magician'] / 2);

                for (let i in io.bots[botTwoId].player.inventory) {
                    if (io.bots[botOneId].player.inventory.indexOf(io.bots[botTwoId].player.inventory[i]) === -1) {
                        io.bots[botOneId].player.inventory.indexOf(io.bots[botTwoId].player.inventory[i])
                    }
                }

                for (let i in io.bots[botTwoId].player.keys) {
                    io.bots[botOneId].player.keys.push(io.bots[botTwoId].player.keys[i])
                }

                moveHandler.deleteNPC(botTwoId);
            };

            let checkPersons = function (path, botId) {
                for (let i in path) {
                    for (let bot in io.bots) {
                        if (io.bots[bot].player && bot !== botId && io.bots[bot].player.x === path[i][0] && io.bots[bot].player.y === path[i][1]) {
                            console.log('ENTER TO FIGHT BOT WITH BOT')
                            if (compareStrength(io.bots[botId], io.bots[bot])) {
                                botFight(botId, bot);
                            } else {
                                botFight(bot, botId);
                            }
                            return true;
                        }
                    }
                    for (let j in io.sockets.connected) {
                        if (io.sockets.connected[j].player && io.sockets.connected[j].player.x === path[i][0] && io.sockets.connected[j].player.y === path[i][1]) {
                            console.log('ENTER TO FIGHT WITH BOT')
                            console.log(j);
                            io.bots[id].player.x = path[i][0];
                            io.bots[id].player.y = path[i][1];
                            io.sockets.connected[j].emit("who_moves_fight", j);
                            io.sockets.connected[j].emit("game_stage", {
                                "stage": "FightWithBot",
                                "from": botId
                            });
                            return true;

                        }
                    }
                }
                return false;
            };
            let flag = true;
            let path;
            io.bots[id].player.distance = io.bots[id].player.maxDistance;
            while (io.bots[id].player.distance > 0) {
                console.log(io.bots[id].player);
                path = searchNear(getObjects(id), io.bots[id].player.x, io.bots[id].player.y);
                path.splice(0, 1);
                if (io.bots[id].player.distance < (path.length)) {
                    path = path.slice(0, io.bots[id].player.distance);
                }
                if (checkPersons(path, id)) {
                    return false;
                }
                if (path[path.length - 1]) {
                    console.log(path);
                    io.bots[id].player.x = path[path.length - 1][0];
                    io.bots[id].player.y = path[path.length - 1][1];
                    io.bots[id].player.distance -= path.length;
                    checkTheBotWay(path, id, io.bots[id].player.x, io.bots[id].player.y);
                } else {
                    io.bots[id].player.distance = 0;
                }
            }
            if (flag) {
                io.bots[id].player.distance = io.bots[id].player.maxDistance;
                this.nextMove();
            }

        },
        nextMove() {
            let checkEndOfGame = function () {
                let flag = true;
                for (let i in io.sockets.connected) {
                    if (io.sockets.connected[i].player) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    so.emit("game_stage", {
                        "stage": "EndOfGame"
                    });
                    so.broadcast.emit("game_stage", {
                        "stage": "LastEndOfGame"
                    });
                    return true;
                }
                return false;
            };
            if (!checkEndOfGame()) {
                do{
                this.step++;
                this.step %= this.moveQueue.length;
                } while (!this.moveQueue[this.step]);
                if (this.moveQueue[this.step].indexOf('bot') === 0) {
                    this.botStep(this.moveQueue[this.step]);
                }
            }
        },
        deletePlayer(id) {
            for (let i in this.moveQueue) {
                if (this.moveQueue[i] == id) {
                    this.moveQueue.splice(i, 1);
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
                let number = utils.getRandomInt(3, 10);
                let isOver = false;

                do {
                    y = utils.getRandomInt(0, mapHandler.currentMap.numberOfCell);
                    x = utils.getRandomInt(0, mapHandler.currentMap.numberOfCell);
                    isOver = false;

                    if (mapHandler.currentMap.ourMap[x][y] !== 0) {
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
                };
                bots[id] = bot;
                moveHandler.moveQueue.push(id)
            }

            return bots;
        },
        deleteNPC(id) {
            for (let i in this.moveQueue) {
                if (this.moveQueue[i] == id) {
                    this.moveQueue.splice(i, 1);
                    delete io.bots[id];
                    break
                }
            }
            this.step++;
            this.step %= this.moveQueue.length;
        }
    };


    let mapBonus = [];

    app.use(express.static(path.join(dir, "/src")));
    app.get("/", function (req, res, next) {
        res.sendFile(path.join(dir, "/src/client/html/index.html"));
    });

    io.on("connect", function (socket) {
        let numberOfBots = 2;
        let numberOfBonuses = 7;
        console.log(`Socket connected: ${socket.id}`);
        so = socket;

        socket.on("message_sent", function (data) {
            io.emit("message_sent", data);
        });

        if (moveHandler.moveQueue.length < utils.playersLimit) {
            socket.player = moveHandler.createNewPlayer(socket.id);
            moveHandler.moveQueue.push(socket.id);
            console.log(utils.playersLimit);
            console.log(moveHandler.moveQueue);
            console.log("This is new player.");
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

        socket.emit("get_players_limit", utils.playersLimit);

        socket.on("emit_get_players", function () {
            socket.emit("get_players", utils.getPlayers());
        });

        socket.on("emit_who_moves_fight", function (who_moves_id, id_enemy) {
            socket.player.energy = socket.player.maxEnergy;
            socket.emit("get_players", utils.getPlayers());
            socket.emit("get_player", socket.player);
            io.sockets.connected[id_enemy].emit("get_players", utils.getPlayers());
            io.sockets.connected[id_enemy].emit("get_player", io.sockets.connected[id_enemy].player);

            if (socket.id === who_moves_id) {
                socket.emit("who_moves_fight", id_enemy);
                io.sockets.connected[id_enemy].emit("who_moves_fight", id_enemy);
            } else {
                io.sockets.connected[id_enemy].emit("who_moves_fight", socket.id);
                socket.emit("who_moves_fight", socket.id);
            }
        });

        socket.on("emit_who_moves_fight_with_bot", function (id, idBot) {
            let allSkills = {
                'fireball': [200, 3],
                'lightning': [300, 4],
                'kick': [20, 1],
                'godpunch': [1000, 15],
                'mag_kick': [25, 2]
            };

            let checkEnd = function (myEnemyId) {
                console.log('check_end');
                let flag = false;
                for (let i in socket.player.units)
                    if (socket.player.units[i] > 0) {
                        flag = true;
                        break;
                    }
                if (!flag) {
                    for (let i in socket.player.inventory) {
                        if (io.bots[myEnemyId].player.inventory.indexOf(socket.player.inventory[i]) === -1) {
                            io.bots[myEnemyId].player.inventory.push(socket.player.inventory[i]);
                        }
                    }

                    for (key in socket.player.keys) {
                        io.bots[myEnemyId].player.keys.push(socket.player.keys[key]);
                    }

                    io.bots[myEnemyId].player.energy = io.bots[myEnemyId].player.maxEnergy;

                    socket.emit("game_stage", {
                        "stage": "Supervisor"
                    });

                    moveHandler.deletePlayer(socket.id);
                    moveHandler.nextMove();
                    io.emit("who_moves", moveHandler.moveQueue[moveHandler.step]);
                    return true;

                }

                return false;
            };

            let doSimpleBotAttack = function (id, idBot) {
                console.log('do bot attck');
                console.log('bot');
                let warPunch;
                let magPunch;
                let punch = -1;
                let energy = 1;
                let max;
                while (io.bots[idBot] && io.bots[idBot].player.energy > 0) {
                    if (socket.player) {
                        console.log('cicle');
                        punch = 0;
                        energy = 1;
                        max = io.bots[idBot].player.units.warrior * typesOfUnit.warrior.power;
                        if (io.bots[idBot].player.energy >= 2) {
                            punch = io.bots[idBot].player.units.magician * typesOfUnit.magician.power;
                            if (max < punch) {
                                max = punch;
                                energy = 2;
                            }
                        }
                        console.log('one');
                        console.log(max);
                        for (let i of io.bots[idBot].player.inventory) {
                            if (io.bots[idBot].player.energy >= allSkills[i][1]) {
                                punch = allSkills[i][0];
                                if (max < punch) {
                                    max = punch;
                                    energy = allSkills[i][1];
                                }
                            }
                        }
                        console.log("punch");
                        console.log(max);
                        if (max > 0) {
                            if (idBot.indexOf('medium') === -1) {
                                warPunch = socket.player.units.warrior * typesOfUnit.warrior.power;
                                magPunch = socket.player.units.magician * typesOfUnit.magician.power;
                            } else {
                                warPunch = socket.player.units.warrior * typesOfUnit.warrior.power * socket.player.energy;
                                magPunch = socket.player.units.magician * typesOfUnit.magician.power * parseInt(socket.player.energy / 2);
                            }
                            if (warPunch > magPunch) {
                                console.log('war');
                                socket.player.units.warrior -= max / typesOfUnit.warrior.health;
                            } else {
                                console.log('mag');
                                socket.player.units.magician -= max / typesOfUnit.magician.health;
                            }
                            io.bots[idBot].player.energy -= energy;
                        } else {
                            break;
                        }

                        if (checkEnd(idBot)) {
                            return false;
                        }
                    } else {
                        io.bots[idBot].player.energy = 0;
                    }
                }
                if (io.bots[idBot]) {
                    io.bots[idBot].player.energy = io.bots[idBot].player.maxEnergy;
                }
                return true;
            };

            //console.log(io.bots[idBot].player);
            socket.emit("get_players", utils.getPlayers());
            if (doSimpleBotAttack(id, idBot)) {
                socket.player.energy = socket.player.maxEnergy;
                socket.emit("get_player", socket.player);
                socket.emit("who_moves_fight", socket.id);
            }
        });

        socket.on("emit_get_bonus", function () {
            if (mapBonus.length < 4) {
                mapBonus = mapBonus.concat(moveHandler.getBonuses(numberOfBonuses - 3));
            }
            socket.emit("get_bonus", mapBonus);
        });

        socket.on("bonus_changed", function (bonus) {
            mapBonus = bonus;
        });

        socket.on("do_fight_step", function (myEnemyId, myEnemy, myEnergy) {
            io.sockets.connected[myEnemyId].player = myEnemy;
            socket.player.energy = myEnergy;
        });

        socket.on("do_fight_step_with_bot", function (myEnemyId, myEnemy, myEnergy) {
            io.bots[myEnemyId].player = myEnemy;
            socket.player.energy = myEnergy;
            console.log('after attack');
            console.log(io.bots[myEnemyId].player);
        });

        socket.on("emit_fight_chose_unit", function (clickedUnit, myEnemy) {
            io.sockets.connected[myEnemy].emit("fight_chose_unit", clickedUnit);
        });

        socket.on("emit_fight_chose_skill", function (clickedSkills, myEnemy) {
            io.sockets.connected[myEnemy].emit("fight_chose_skill", clickedSkills);
        });

        socket.on("emit_fight_attack_was_made", function (myEnemy) {
            io.sockets.connected[myEnemy].emit("fight_attack_was_made");
        });

        socket.on("end_of_fight", function (myEnemyId) {

            for (let i in io.sockets.connected[myEnemyId].player.inventory) {
                if (socket.player.inventory.indexOf(io.sockets.connected[myEnemyId].player.inventory[i]) === -1) {
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
            moveHandler.nextMove();
            io.emit("who_moves", moveHandler.moveQueue[moveHandler.step]);
        });

        socket.on('start_fight_with_bot', function (x, y) {
            socket.player.x = x;
            socket.player.y = y;
        });

        socket.on("end_of_fight_with_bot", function (myEnemyId) {

            for (let i in io.bots[myEnemyId].player.inventory) {
                if (socket.player.inventory.indexOf(io.bots[myEnemyId].player.inventory[i]) === -1) {
                    socket.player.inventory.push(io.bots[myEnemyId].player.inventory[i]);
                }
            }

            for (key in io.bots[myEnemyId].player.keys) {
                socket.player.keys.push(io.bots[myEnemyId].player.keys[key]);
            }

            socket.player.energy = socket.player.maxEnergy;
            socket.emit("get_player", socket.player);


            socket.emit("game_stage", {
                "stage": "Map"
            });

            moveHandler.deleteNPC(myEnemyId);
            moveHandler.nextMove();
            io.emit("who_moves", moveHandler.moveQueue[moveHandler.step]);
        });

        socket.on("run", function (myEnemy) {
            socket.player.x = io.sockets.connected[myEnemy].player.x;
            socket.player.y = io.sockets.connected[myEnemy].player.y;
            io.sockets.connected[myEnemy].player.units['warrior'] += parseInt(socket.player.units['warrior'] / 2);
            io.sockets.connected[myEnemy].player.units['magician'] += parseInt(socket.player.units['magician'] / 2);
            socket.player.units['warrior'] -= parseInt(socket.player.units['warrior'] / 2);
            socket.player.units['magician'] -= parseInt(socket.player.units['magician'] / 2);


            if (isEnterable(mapHandler.currentMap, socket.player.x + 1, socket.player.y)) {
                socket.player.x += 1
            } else if (isEnterable(mapHandler.currentMap, socket.player.x - 1, socket.player.y)) {
                socket.player.x -= 1
            } else if (isEnterable(mapHandler.currentMap, socket.player.x, socket.player.y + 1)) {
                socket.player.y += 1
            } else if (isEnterable(mapHandler.currentMap, socket.player.x, socket.player.y - 1)) {
                socket.player.y -= 1
            }

            socket.emit("game_stage", {
                "stage": "Wait"
            });

            io.sockets.connected[myEnemy].emit("game_stage", {
                "stage": "Wait"
            });

            socket.emit("get_player", socket.player);
            socket.emit("get_players", utils.getPlayers());
            io.sockets.connected[myEnemy].emit("get_player", io.sockets.connected[myEnemy].player);
            io.sockets.connected[myEnemy].emit("get_players", utils.getPlayers());
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
            socket.player = playerWithBonus;
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
            if (!socket.player) {
                return
            }
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

        socket.on("next_step", function () {
            if (socket.player) {
                socket.player.distance = socket.player.maxDistance;
                moveHandler.nextMove();
                io.emit("who_moves", moveHandler.moveQueue[moveHandler.step]);
            }
        });

        socket.on("do_step", function (step, rangeOfStep) {
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

        socket.on("game_end", function () {
            for (let id in io.sockets.connected)
                io.sockets.connected[id].emit("game_stage", {
                    "stage": "Supervisor"
                });
            socket.emit("game_stage", {
                "stage": "Win"
            });
        });

        socket.on("emit_who_moves", function () {
            io.emit("who_moves",moveHandler.getCurrent());
        });

        socket.on("start_new_game", function () {
            mapBonus = [];
            moveHandler.moveQueue = [];
            moveHandler.step = 0;

            for (let i in io.bots) {
                if (io.bots[i]) {
                    delete io.bots[i];
                }
            }

            // for (let i in io.sockets.connected) {
            //     if (io.sockets.connected[i].player) {
            //         delete io.sockets.connected[i].player;
            //     }
            // }
            // for (let i in io.bots) {
            //     if (io.bots[i]) {
            //         delete io.bots[i];
            //     }
            // }
            //
            // mapBonus = [];
            // moveHandler.moveQueue = [];
            // moveHandler.step = 0;
            //
            // for (let i in io.sockets.connected) {
            //     if (moveHandler.moveQueue.length < utils.playersLimit) {
            //         console.log("This is new player.");
            //         io.sockets.connected[i].player = moveHandler.createNewPlayer(i);
            //         moveHandler.moveQueue.push(i);
            //         io.sockets.connected[i].emit("get_player", io.sockets.connected[i].player);
            //         io.sockets.connected[i].emit("get_players", utils.getPlayers());
            //         io.sockets.connected[i].emit("game_stage", {
            //             "stage": "Wait"
            //         });
            //         if (moveHandler.moveQueue.length === utils.playersLimit) {
            //             io.bots = moveHandler.getNPCs(numberOfBots);
            //             mapBonus = moveHandler.getBonuses(numberOfBonuses);
            //             io.emit("who_moves", moveHandler.getCurrent());
            //         }
            //     } else {
            //         console.log("This is new Supervisor.");
            //         io.sockets.connected[i].emit("game_stage", {
            //             "stage": "Supervisor"
            //         });
            //     }
            // }

        });

        socket.on("disconnect", function () {
            //...
            console.log("Client disconnected: " + socket.id);
            if (moveHandler.moveQueue[moveHandler.step] == socket.id) {
                moveHandler.nextMove();
            }
            moveHandler.moveQueue.pop(moveHandler.moveQueue.indexOf(socket.id));
        });
    });


    http.listen(port, function () {
        console.log(`Server works on http://${ip}:${port}/`);
    });
};
