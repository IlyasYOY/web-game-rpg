var path = [];

var printPath = function(array,startX,startY,sizeofCell,canvasContext){
    if (myPerson.distance >= array.length){
        canvasContext.strokeStyle = "#0aff00";
    } else {
        canvasContext.strokeStyle = "#ff342c";
    }
    for (let i in array) {
            canvasContext.strokeRect((array[i][0] - startX) * (sizeOfCell), (array[i][1] - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
    }
};

var checkTheWay = function (path,x,y) {
    let flag = false;
    for (let i in mapBonus){
        if (mapBonus[i].x === x && mapBonus[i].y == y){
            if (mapBonus[i].numb === 3){
                myPerson.maxEnergy += 1;
                myPerson.energy = myPerson.maxEnergy;
            } else  if(mapBonus[i].numb === 4){
                myPerson.distance = myPerson.maxDistance + path.length;
            } else  if(mapBonus[i].numb === 5){
                if (myPerson.inventory.indexOf(skillNames[2])=== -1) {
                    myPerson.inventory.push(skillNames[2]);
                }
            } else  if(mapBonus[i].numb === 6){
                if (myPerson.inventory.indexOf(skillNames[3])=== -1) {
                    myPerson.inventory.push(skillNames[3]);
                }
            }else  if(mapBonus[i].numb === 7){
                if (myPerson.inventory.indexOf(skillNames[4])=== -1) {
                    myPerson.inventory.push(skillNames[4]);
                }
            }else  if(mapBonus[i].numb === 8){
                myPerson.units.warrior += 5;
            } else  if(mapBonus[i].numb === 9){
                myPerson.units.magician += 5;
            }
            mapBonus.splice(i,1);
            flag = true;
            break;
            }
        }

    if (flag) {
        socket.emit("bonus_changed",mapBonus);
        socket.emit("player_get_bonus", myPerson);
    }
};

var printBonus = function (startX,startY,sizeOfCell,canvasContext) {
    for (let i in mapBonus) {
       if(fogOfWar(myPerson,mapBonus[i].x,mapBonus[i].y)) {
           if (mapBonus[i].numb === 3) {
               canvasContext.fillStyle = '#1b2a7e';
           } else if (mapBonus[i].numb === 4) {
               canvasContext.fillStyle = '#ae0a00';
           } else if (mapBonus[i].numb === 5) {
               canvasContext.fillStyle = '#ffff00';
           } else if (mapBonus[i].numb === 6) {
               canvasContext.fillStyle = '#23d6ff';
           } else if (mapBonus[i].numb === 7) {
               canvasContext.fillStyle = '#ffd3f5';
           } else if (mapBonus[i].numb === 8) {
               canvasContext.fillStyle = "#ff1a27";
           } else if (mapBonus[i].numb === 9) {
               canvasContext.fillStyle = "#1d21ff";
           }
           canvasContext.fillRect((mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
       }
    }
};

var cursorHandler = function (i,j) {
    if (isInSquare(i - camera.startX,j-camera.startY,sizeOfCell,mauseCoord.x,mauseCoord.y)){
        if (fogOfWar(myPerson,i,j) && isEnterable(map,i,j)){
            canvasContext.fillStyle = '#ffffff';
            miniMapContext.fillStyle = '#ffffff';
        } else {
            canvasContext.fillStyle = '#d7001d';
            miniMapContext.fillStyle = '#d7001d';
        }
        canvasContext.fillRect((i-camera.startX)*(sizeOfCell),(j-camera.startY)*(sizeOfCell),sizeOfCell,sizeOfCell);


        if (mauseCoord.x <= canvasHeight)
            miniMapContext.fillRect(i * miniMapHeight/map.numberOfCell,
                j * miniMapHeight / map.numberOfCell,
                miniMapHeight / map.numberOfCell,
                miniMapHeight / map.numberOfCell);

        canvasContext.fillStyle = '#000000';
        if (mauseCoord.isDown === true){
            console.log(clickedSells);
            if (clickedSells.x === i && clickedSells.y === j){
                clickedSells.isDoubleClick = true;
            } else {
            clickedSells.x = i;
            clickedSells.y = j;
            if (fogOfWar(myPerson, i, j) && isEnterable(map, i, j)) {
                path = findPath(map, [myPerson.x, myPerson.y], [i, j]);
                path.splice(0,1);
            } else {
                path = [];
            }
            clickedSells.isDoubleClick = false;
            }
            mauseCoord.isDown = false;
            if (fogOfWar(myPerson,i,j) && isEnterable(map,i,j) === true && mauseCoord.x<=canvasHeight) {
                if (clickedSells.isDoubleClick && myPerson.distance >= path.length) {
                    reloadMiniMap();
                    checkTheWay(path,i,j);
                    socket.emit('do_step', {'x': i, 'y': j},path.length);
                    socket.emit("emit_get_player");
                    path = [];
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
            canvasContext.fillStyle = '#0069ff';
    } else if (map.ourMap[i][j] === 0){
        canvasContext.fillStyle = '#ffb33f';
    } else if (map.ourMap[i][j] === 1){
        canvasContext.fillStyle = '#41b611';
    } else if (map.ourMap[i][j] === 2){
        canvasContext.fillStyle = '#f0f0e7';
    }} else {
        canvasContext.fillStyle = '#b9b9b9';
    }
    //canvasContext.fillRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell);
    canvasContext.fillRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);

    if (clickedSells.x !==i || clickedSells.y !== j){
        canvasContext.strokeStyle = '#000000';
        //canvasContext.strokeRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell); }
        canvasContext.strokeRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell); }
    // else {
    //     canvasContext.strokeStyle = '#ff1a27';
    //     //canvasContext.strokeRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell);
    //     canvasContext.strokeRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    // }
};


var printPlayers = function (startX,startY,sizeOfCell,canvasContext) {
    canvasContext.fillStyle = "#b90084";
    for (var i in players){
        if (fogOfWar(myPerson,players[i].x,players[i].y) && socket.id != i){
            canvasContext.fillRect((players[i].x - startX)*(sizeOfCell),(players[i].y - startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
        }
    }
    canvasContext.fillStyle = "#6c00b9";
    canvasContext.fillRect((myPerson.x - startX)*(sizeOfCell),(myPerson.y - startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
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
    for (let i = camera.startX;i<map.numberOfCell;++i){
        for (let j = camera.startY;j<map.numberOfCell;++j){
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


    if (keysPushed[ButtonsKeys['W']] === true){
        if (camera.startY>0) --camera.startY;
    }

    if (keysPushed[ButtonsKeys['S']] === true){
        if ((camera.startY)<(map.numberOfCell - numbersOfCell)) ++camera.startY;
    }

    if (keysPushed[ButtonsKeys['D']] === true){
        if ((camera.startX)<(map.numberOfCell - numbersOfCell)) ++camera.startX;
    }

    if (keysPushed[ButtonsKeys['A']] === true){
        if (camera.startX>0) --camera.startX;
    }

    canvasContext.clearRect(0,0,canvasWidth,canvasHeight);
    if (whereAmI === "Map") {
        printMap();
    }
    else {
        printMapForSuperVisor()
    }
};

