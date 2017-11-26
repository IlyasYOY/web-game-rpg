var path = [];

var printInfoAboutPlayer = function (player,name) {
    let width = 14;
    inventoryContext.clearRect(0,0,inventoryWidth,inventoryHeight);
    inventoryContext.font="14px Georgia";
    inventoryContext.fillStyle = '#ffffff';
    if (socket.id !== name) {
        inventoryContext.fillText(name + '.', 0, 14);
    } else {
        inventoryContext.fillText('You.', 0, 14);
    }
    width+=14;
    inventoryContext.fillText('ENERGY:', 0, width);
    inventoryContext.fillText(player.energy, 14*(7), width);
    width+=14;
    inventoryContext.fillText('UNITS:', 0, width);
    width+=14;
    for (let i in player.units){
        inventoryContext.fillText(i + ':', 0, width);
        inventoryContext.fillText(player.units[i], 14*(i.length), width);
        width+=14;
    }
    inventoryContext.fillText('INVENTORY:', 0, width);
    width+=14;
    for (let i in player.inventory){
        inventoryContext.fillText(player.inventory[i],0, width);
        width+=14;
    }
    inventoryContext.fillText('KEYS:', 0, width);
    width+=14;
    for (let i in player.keys){
        inventoryContext.fillText(player.keys[i],0, width);
        width+=14;
    }
};

var checkExistPerson = function (x,y,players,bots) {
    for(let i in players){
        if (players[i].x === x && players[i].y === y){
            printInfoAboutPlayer(players[i],i);
            return;
        }
    }
};

var printPath = function(array,startX,startY,sizeofCell,canvasContext){
    // if (myPerson.distance >= array.length){
    //     canvasContext.strokeStyle = "#0aff00";
    // } else {
    //     canvasContext.strokeStyle = "#ff342c";
    // }
    for (let i in array) {
        if (myPerson.distance >= array.length){
            canvasContext.drawImage(textures[13],(array[i][0] - startX) * (sizeOfCell), (array[i][1] - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
        } else {
            canvasContext.drawImage(textures[14],(array[i][0] - startX) * (sizeOfCell), (array[i][1] - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
        }


    }
};

var checkPlayers = function (x,y,length) {
    console.log("check")
    for (let i in players){
        console.log('x / y' + x  +' / ' + y);
        console.log(players[i]);

        if (socket.id !== i && players[i].x === x && players[i].y === y){
            if (i.indexOf('bot')===-1) {
                console.log('Person');
                socket.emit('do_step', {'x': x, 'y': y}, length);
                myPerson.x = x;
                myPerson.y = y;
                return false;
            } else {
                console.log('bot');
                myEnemy = i;
                whoMoves = socket.id;
                whereAmI = 'FightWithBot';
                myPerson.x = x;
                myPerson.y = y;
                socket.emit('start_fight_with_bot',x,y);
                return false;
            }
        }
    }
    return true;
};

var checkTheWay = function (path,x,y) {
    let flag = false;
    let length = 1;
    for (let cell in path) {
        flag = false;
        if (!checkPlayers(path[cell][0],path[cell][1],length)){
            return false;
        }
        for (let i in mapBonus) {
            if (mapBonus[i].x === path[cell][0] && mapBonus[i].y === path[cell][1]) {
                if (mapBonus[i].numb === 3) {
                    myPerson.maxEnergy += 1;
                    myPerson.energy = myPerson.maxEnergy;
                } else if (mapBonus[i].numb === 4) {
                    myPerson.distance = myPerson.maxDistance + length;
                } else if (mapBonus[i].numb === 5) {
                    if (myPerson.inventory.indexOf(skillNames[2]) === -1) {
                        myPerson.inventory.push(skillNames[2]);
                    }
                } else if (mapBonus[i].numb === 6) {
                    if (myPerson.inventory.indexOf(skillNames[3]) === -1) {
                        myPerson.inventory.push(skillNames[3]);
                    }
                } else if (mapBonus[i].numb === 7) {
                    if (myPerson.inventory.indexOf(skillNames[4]) === -1) {
                        myPerson.inventory.push(skillNames[4]);
                    }
                } else if (mapBonus[i].numb === 8) {
                    myPerson.units.warrior += 5;

                    myPerson.maxDistance = newMaxDistance(myPerson);
                } else if (mapBonus[i].numb === 9) {
                    myPerson.units.magician += 5;
                    myPerson.maxDistance = newMaxDistance(myPerson);
                }
                mapBonus.splice(i, 1);
                flag = true;
                break;
            }
        }

        if (flag) {
            socket.emit("bonus_changed", mapBonus);
            socket.emit("player_get_bonus", myPerson);
        }
        ++length;
    }

    return true;
};

var printBonus = function (startX,startY,sizeOfCell,canvasContext) {
    for (let i in mapBonus) {
       if(fogOfWar(myPerson,mapBonus[i].x,mapBonus[i].y)) {
           if (mapBonus[i].numb === 3) {
               //canvasContext.fillStyle = '#1b2a7e';
               canvasContext.drawImage(textures[3],(mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
           } else if (mapBonus[i].numb === 4) {
               //canvasContext.fillStyle = '#ae0a00';
               canvasContext.drawImage(textures[4],(mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
           } else if (mapBonus[i].numb === 5) {
               canvasContext.drawImage(textures[5],(mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
               //canvasContext.fillStyle = '#ffff00';
               //canvasContext.fillRect((mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
           } else if (mapBonus[i].numb === 6) {
               canvasContext.drawImage(textures[6],(mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
               //canvasContext.fillStyle = '#23d6ff';
               //canvasContext.fillRect((mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
           } else if (mapBonus[i].numb === 7) {
               canvasContext.drawImage(textures[7],(mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
               //canvasContext.fillStyle = '#ffd3f5';
               //canvasContext.fillRect((mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
           } else if (mapBonus[i].numb === 8) {
               //canvasContext.fillStyle = "#ff1a27";
               //canvasContext.fillRect((mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
               canvasContext.drawImage(textures[8],(mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
           } else if (mapBonus[i].numb === 9) {
               //canvasContext.fillStyle = "#1d21ff";
               //canvasContext.fillRect((mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
               canvasContext.drawImage(textures[0],(mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
               canvasContext.drawImage(textures[9],(mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
           }

       }
    }
};

var cursorHandler = function (i,j) {
    if (isInSquare(i - camera.startX,j-camera.startY,sizeOfCell,mauseCoord.x,mauseCoord.y)) {
        if (fogOfWar(myPerson, i, j) && isEnterable(map, i, j)) {
            //canvasContext.fillStyle = '#ffffff';
            //miniMapContext.fillStyle = '#ffffff';
            canvasContext.drawImage(textures[21],(i - camera.startX) * (sizeOfCell), (j - camera.startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
            checkExistPerson(i,j,players,null);
        } else {
           // canvasContext.fillStyle = '#d7001d';
            //miniMapContext.fillStyle = '#d7001d';
            canvasContext.drawImage(textures[20],(i - camera.startX) * (sizeOfCell), (j - camera.startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
        }



        if (mauseCoord.x <= canvasHeight)
         if (fogOfWar(myPerson, i, j) && isEnterable(map, i, j))
        {
            miniMapContext.drawImage(textures[21],i * miniMapHeight / map.numberOfCell,
                j * miniMapHeight / map.numberOfCell,
                miniMapHeight / map.numberOfCell,
                miniMapHeight / map.numberOfCell);
        } else {
             miniMapContext.drawImage(textures[20],i * miniMapHeight / map.numberOfCell,
                 j * miniMapHeight / map.numberOfCell,
                 miniMapHeight / map.numberOfCell,
                 miniMapHeight / map.numberOfCell);
         }

        canvasContext.fillStyle = '#000000';
        if (mauseCoord.isDown === true) {
            if (clickedSells.x === i && clickedSells.y === j) {
                clickedSells.isDoubleClick = true;
            } else {
                clickedSells.x = i;
                clickedSells.y = j;
                if (fogOfWar(myPerson, i, j) && isEnterable(map, i, j)) {
                    path = findPath(map, [myPerson.x, myPerson.y], [i, j]);
                    path.splice(0, 1);
                } else {
                    path = [];
                }
                clickedSells.isDoubleClick = false;
            }
            mauseCoord.isDown = false;
            if (fogOfWar(myPerson, i, j) && isEnterable(map, i, j) === true && mauseCoord.x <= canvasHeight) {
                if (clickedSells.isDoubleClick && myPerson.distance >= path.length) {
                    if (map.ourMap[i][j] === 11) {
                        socket.emit("game_end");
                    } else {
                        reloadMiniMap();
                        if (checkTheWay(path, i, j)) {
                            socket.emit('do_step', {'x': i, 'y': j}, path.length);
                            socket.emit("emit_get_player");
                        }
                        path = [];
                    }
                }
            }
        }
    }
    canvasContext.strokeStyle = '#ffffff';
    canvasContext.strokeRect((clickedSells.x-camera.startX)*(sizeOfCell),(clickedSells.y-camera.startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
};


var isInSquare = function(i,j,sizeOfCell,x,y){
    return x >= i * (sizeOfCell)
        && y >= j * (sizeOfCell)
        && x <= (i * (sizeOfCell) + sizeOfCell)
        && y <= (j * (sizeOfCell) + sizeOfCell);
};

var printCell = function (i,j,startX,startY,sizeOfCell,canvasContext) {
    if (fogOfWar(myPerson,i,j)) {
    if (map.ourMap[i][j] === -1) {
        //canvasContext.fillStyle = '#0069ff';
        //canvasContext.fillRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell);
        //canvasContext.fillRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
        canvasContext.drawImage(textures[-1],(i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    } else if (map.ourMap[i][j] === 0){
        //canvasContext.fillStyle = '#ffb33f';
        canvasContext.drawImage(textures[0], (i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    } else if (map.ourMap[i][j] === 1){
        //canvasContext.fillStyle = '#41b611';
        //canvasContext.fillRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell);
        canvasContext.drawImage(textures[0],(i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
        canvasContext.drawImage(textures[1],(i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
        //canvasContext.fillRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    } else if (map.ourMap[i][j] === 2){
        canvasContext.fillStyle = '#f0f0e7';
        //canvasContext.fillRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell);
        //canvasContext.fillRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
        canvasContext.drawImage(textures[0],(i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
        canvasContext.drawImage(textures[2],(i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    }else if (map.ourMap[i][j] === 11){
        //canvasContext.fillStyle = '#000000';
        //canvasContext.fillRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell);
        //canvasContext.fillRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
        if (myPerson.keys.length >= (parseInt(playersLimit / 2) + 1)) {
            canvasContext.drawImage(textures[19], (i - startX) * (sizeOfCell), (j - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
        } else {
            canvasContext.drawImage(textures[18], (i - startX) * (sizeOfCell), (j - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
        }
    }} else {
        canvasContext.fillStyle = '#4b4b4b';
        //canvasContext.fillRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell);
        canvasContext.fillRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    }


    if (clickedSells.x !==i || clickedSells.y !== j){
        canvasContext.strokeStyle = '#000000';
        //canvasContext.strokeRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell); }
        canvasContext.strokeRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    }
    // else {
    //     canvasContext.strokeStyle = '#ff1a27';
    //     //canvasContext.strokeRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell);
    //     canvasContext.strokeRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    // }
};


var printPlayers = function (startX,startY,sizeOfCell,canvasContext) {
    //canvasContext.fillStyle = "#b90084";
    for (var i in players){
        if (fogOfWar(myPerson,players[i].x,players[i].y) && socket.id != i){
            canvasContext.drawImage(textures[10],(players[i].x - startX)*(sizeOfCell),(players[i].y - startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
            //canvasContext.fillRect((players[i].x - startX)*(sizeOfCell),(players[i].y - startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
        }
    }
    // canvasContext.fillStyle = "#6c00b9";
    // canvasContext.fillRect((myPerson.x - startX)*(sizeOfCell),(myPerson.y - startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    canvasContext.drawImage(textures[12],(myPerson.x - startX)*(sizeOfCell),(myPerson.y - startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
};

var reloadMiniMap = function () {
    for (let i = 0;i<map.numberOfCell;++i){
        for (let j = 0;j<map.numberOfCell;++j){
            printCell(i,j,0,0,miniMapHeight/map.numberOfCell,miniMapContext);
            printPlayers(0,0,miniMapHeight/map.numberOfCell,miniMapContext);
        }
    }

    printBonus(0,0,miniMapHeight/map.numberOfCell,miniMapContext);
};



var reloadMainMap = function () {
    for (let i = camera.startX;i<(camera.startX+numbersOfCell);++i){
        for (let j = camera.startY;j<(camera.startY + numbersOfCell);++j){
            printCell(i,j,camera.startX,camera.startY,sizeOfCell,canvasContext);
            printPlayers(camera.startX,camera.startY,sizeOfCell,canvasContext);

        }
    }
    printPath(path,camera.startX,camera.startY,sizeOfCell,canvasContext);
    printBonus(camera.startX,camera.startY,sizeOfCell,canvasContext);
};

var printMap = function () {

   reloadMainMap();

    for (let i = 0;i<map.numberOfCell;++i){
        for (let j = 0;j<map.numberOfCell;++j){
            printCell(i,j,0,0,miniMapHeight/map.numberOfCell,miniMapContext);
            printPlayers(0,0,miniMapHeight/map.numberOfCell,miniMapContext);
            cursorHandler(i,j);
        }
    }
    printBonus(0,0,miniMapHeight/map.numberOfCell,miniMapContext);
};




var toMap = function () {
    if (keysPushed[ButtonsKeys['up']] === true){
        if (camera.startY>0) --camera.startY;
    }

    if (keysPushed[ButtonsKeys['down']] === true){
        if ((camera.startY)<(map.numberOfCell - numbersOfCell)) ++camera.startY;
    }

    if (keysPushed[ButtonsKeys['right']] === true){
        if ((camera.startX)<(map.numberOfCell - numbersOfCell)) ++camera.startX;
    }

    if (keysPushed[ButtonsKeys['left']] === true){
        if (camera.startX>0) --camera.startX;
    }


    // if (keysPushed[ButtonsKeys['W']] === true){
    //     if (camera.startY>0) --camera.startY;
    // }
    //
    // if (keysPushed[ButtonsKeys['S']] === true){
    //     if ((camera.startY)<(map.numberOfCell - numbersOfCell)) ++camera.startY;
    // }
    //
    // if (keysPushed[ButtonsKeys['D']] === true){
    //     if ((camera.startX)<(map.numberOfCell - numbersOfCell)) ++camera.startX;
    // }
    //
    // if (keysPushed[ButtonsKeys['A']] === true){
    //     if (camera.startX>0) --camera.startX;
    // }

    if (keysPushed[ButtonsKeys['Space']] === true){
        socket.emit('next_step');
        keysPushed[ButtonsKeys['Space']] = false;
    }

    if (keysPushed[ButtonsKeys['Esc']] === true){
        whereAmI = "Menu";
        keysPushed[ButtonsKeys['Esc']] = false;
    }

    canvasContext.clearRect(0,0,canvasWidth,canvasHeight);
    if (whereAmI === "Map") {
        drawMySkills(myPerson);
        printMap();
    }
    else {
        printMapForSuperVisor()
    }
};

