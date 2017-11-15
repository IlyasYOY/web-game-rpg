var cursorHandler = function (i,j) {
    if (isInSquare(i - camera.startX,j-camera.startY,sizeOfCell,mauseCoord.x,mauseCoord.y)){
        canvasContext.fillStyle = '#ffffff';
        canvasContext.fillRect((i-camera.startX)*(sizeOfCell),(j-camera.startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
        miniMapContext.fillStyle = '#ffffff';
        if (mauseCoord.x <= canvasHeight)
            miniMapContext.fillRect(i * miniMapHeight/map.umberOfCell,
                j * miniMapHeight / map.numberOfCell,
                miniMapHeight / map.numberOfCell,
                miniMapHeight / map.numberOfCell);

        canvasContext.fillStyle = '#000000';
        if (mauseCoord.isDown === true){
            clickedSells.x = i;
            clickedSells.y = j;
            mauseCoord.isDown = false;
            if (rangeOfWalking(myPerson,i,j) && isEnterable(map,i,j) === true && mauseCoord.x<=canvasHeight){
                myPerson.x = i;
                myPerson.y = j;
                reloadMiniMap();
                socket.emit('do_step',{'x' : i,'y' : j});
                socket.emit("emit_get_player");
                // myPerson.x = i;
                // myPerson.y = j;
                // for (var k = 0;k<players.length;++k){
                //     if (players[k].x === players[myPlayer].x &&
                //         players[k].y === players[myPlayer].y &&
                //         k!==myPlayer){
                //         clickedSells.x = -1;
                //         clickedSells.y = -1;
                //         myEnemy = k;
                //         whereAmI = 'FightMenu';
                    }
                }
            }
        };

    // if (isInSquare(i,j,miniMapHeight/map.getNumberOfCell(),mauseCoord.x - canvasHeight,mauseCoord.y)){
    //     console.log(i + " / " + j);
    //     miniMapContext.fillStyle = '#ffffff';
    //     miniMapContext.fillRect((i) * miniMapHeight / map.getNumberOfCell(), (j) * miniMapHeight/map.getNumberOfCell(),
    //                             miniMapHeight / map.getNumberOfCell(), miniMapHeight / map.getNumberOfCell());
    //
    //     if (mauseCoord.isDown === true) {
    //         clickedSells.x = i;
    //         clickedSells.y = j;
    //         if (map.isEnterable(i,j) === true){
    //         players[myPlayer].x = i;
    //         players[myPlayer].y = j;
    //         }
    //     }
    // }



var isInSquare = function(i,j,sizeOfCell,x,y){
    return x >= i * (sizeOfCell)
        && y >= j * (sizeOfCell)
        && x <= (i * (sizeOfCell) + sizeOfCell)
        && y <= (j * (sizeOfCell) + sizeOfCell);
};

var printCell = function (i,j,startX,startY,sizeOfCell,canvasContext) {
    if (fogOfWar(myPerson,i,j)) {
    if (map.ourMap[i][j] === 0) {
        canvasContext.fillStyle = '#ffaa62';
    } else if (map.ourMap[i][j] === -1) {
        canvasContext.fillStyle = '#0069ff';
    } else if (map.ourMap[i][j] === 2){
        canvasContext.fillStyle = '#00ff15';
    } else if (map.ourMap[i][j] === 3){
        canvasContext.fillStyle = '#696d7e';
    }else if (map.ourMap[i][j] === -2){
        canvasContext.fillStyle = '#ae875e';
    } else if (map.ourMap[i][j] === 4){
        canvasContext.fillStyle = '#d4e8ff';
    } else if (map.ourMap[i][j] === 1){
        canvasContext.fillStyle = '#fff581';
    }} else {
        canvasContext.fillStyle = '#b9b9b9';
    }
    //canvasContext.fillRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell);
    canvasContext.fillRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);

    if (clickedSells.x !==i || clickedSells.y !== j){
        canvasContext.strokeStyle = '#000000';
        //canvasContext.strokeRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell); }
        canvasContext.strokeRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell); }
    else {
        canvasContext.strokeStyle = '#ff1a27';
        //canvasContext.strokeRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell);
        canvasContext.strokeRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    }
};


var printPlayers = function (startX,startY,sizeOfCell,canvasContext) {
    canvasContext.fillStyle = "#b90084";
    canvasContext.fillRect((myPerson.x - startX)*(sizeOfCell),(myPerson.y - startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    for (var i in players){
        if (fogOfWar(myPerson,players[i].x,players[i].y) && socket.id != i){
            canvasContext.fillRect((players[i].x - startX)*(sizeOfCell),(players[i].y - startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
        }
    }
};

var reloadMiniMap = function () {
    for (let i = 0;i<map.numberOfCell;++i){
        for (let j = 0;j<map.numberOfCell;++j){
            printCell(i,j,0,0,miniMapHeight/map.numberOfCell,miniMapContext);
            printPlayers(0,0,miniMapHeight/map.numberOfCell,miniMapContext);
        }
    }
};

var printMap = function () {

    for (let i = camera.startX;i<map.numberOfCell;++i){
        for (let j = camera.startY;j<map.numberOfCell;++j){
            printCell(i,j,camera.startX,camera.startY,sizeOfCell,canvasContext);
            printPlayers(camera.startX,camera.startY,sizeOfCell,canvasContext);

        }
    }


    for (let i = 0;i<map.numberOfCell;++i){
        for (let j = 0;j<map.numberOfCell;++j){
            printCell(i,j,0,0,miniMapHeight/map.numberOfCell,miniMapContext);
            printPlayers(0,0,miniMapHeight/map.numberOfCell,miniMapContext);
            cursorHandler(i,j);
        }
    }
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
    printMap();
};