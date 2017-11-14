
var cursorHandler = function (i,j) {
    if (isInSquare(i - camera.startX,j-camera.startY,sizeOfCell,mauseCoord.x,mauseCoord.y)){
        canvasContext.fillStyle = '#ffffff';
        canvasContext.fillRect((i-camera.startX)*(sizeOfCell),(j-camera.startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
            miniMapContext.fillStyle = '#ffffff';
            if (mauseCoord.x <= canvasHeight)
            miniMapContext.fillRect(i * sizeOfCell / 10, j * sizeOfCell / 10, sizeOfCell / 10, sizeOfCell / 10);

        canvasContext.fillStyle = '#000000';
        if (mauseCoord.isDown === true){
            clickedSells.x = i;
            clickedSells.y = j;
            mauseCoord.isDown = false;
            if (map.isEnterable(i,j) === true && mauseCoord.x<=canvasHeight){
            players[myPlayer].x = i;
            players[myPlayer].y = j;
            }
        }
    } else if (isInSquare(i,j,sizeOfCell/10,mauseCoord.x - canvasHeight,mauseCoord.y)){
        console.log(i + " / " + j);
        miniMapContext.fillStyle = '#ffffff';
        miniMapContext.fillRect((i-3) * sizeOfCell / 10, (j-1) * sizeOfCell / 10, sizeOfCell / 10, sizeOfCell / 10);

        if (mauseCoord.isDown === true) {
            clickedSells.x = i-3;
            clickedSells.y = j-1;
            if (map.isEnterable(i,j) === true){
            players[myPlayer].x = i-3;
            players[myPlayer].y = j-1;
            }
        }
    }
};


var isInSquare = function(i,j,sizeOfCell,x,y){
    // if (mauseCoord.x>=i*(sizeOfCell+10)
    //     && mauseCoord.y>=j*(sizeOfCell+10)
    //     && mauseCoord.x<=(i*(sizeOfCell+10)+sizeOfCell)
    //     && mauseCoord.y<=(j*(sizeOfCell+10)+sizeOfCell)){
    //     return true;
    // } else {
    //     return false;
    // }
    if (x>=i*(sizeOfCell)
        && y>=j*(sizeOfCell)
        && x<=(i*(sizeOfCell)+sizeOfCell)
        && y<=(j*(sizeOfCell)+sizeOfCell)){
        return true;
    } else {
        return false;
    }
};

var printCell = function (i,j,startX,startY,sizeOfCell,canvasContext) {

    if (map.getCell(i,j) === 0) {
        canvasContext.fillStyle = '#ffaa62';
    } else if (map.getCell(i,j) === -1) {
        canvasContext.fillStyle = '#0069ff';
    } else if (map.getCell(i,j) === 2){
        canvasContext.fillStyle = '#00ff15';
    } else if (map.getCell(i,j) === 3){
        canvasContext.fillStyle = '#adadad';
    }else if (map.getCell(i,j) === -2){
        canvasContext.fillStyle = '#ae875e';
    } else if (map.getCell(i,j) === 4){
        canvasContext.fillStyle = '#d4e8ff';
    } else if (map.getCell(i,j) === 1){
        canvasContext.fillStyle = '#fff581';
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
    for (let i = 0;i < players.length; ++i){
    //canvasContext.fillRect((players[i].x - startX)*(sizeOfCell+10) + 5,(players[i].y - startY)*(sizeOfCell+10) + 5,sizeOfCell - 10,sizeOfCell - 10);
    canvasContext.fillRect((players[i].x - startX)*(sizeOfCell),(players[i].y - startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    }
};

var printMap = function () {

    for (let i = camera.startX;i<map.getNumberOfCell();++i){
        for (let j = camera.startY;j<map.getNumberOfCell();++j){
           printCell(i,j,camera.startX,camera.startY,sizeOfCell,canvasContext);
           printPlayers(camera.startX,camera.startY,sizeOfCell,canvasContext);

        }
    }


    for (let i = 0;i<map.getNumberOfCell();++i){
        for (let j = 0;j<map.getNumberOfCell();++j){
            printCell(i,j,0,0,sizeOfCell/10,miniMapContext);
            printPlayers(0,0,sizeOfCell/10,miniMapContext);
            cursorHandler(i,j);
        }
    }
};

var toMap = function () {
    if (keysPushed[ButtonsKeys['up']] === true){
        if (camera.startY>0) --camera.startY;
    }

    if (keysPushed[ButtonsKeys['down']] === true){
        if ((camera.startY+1)<(map.getNumberOfCell() - numbersOfCell)) ++camera.startY;
    }

    if (keysPushed[ButtonsKeys['right']] === true){
        if ((camera.startX+1)<(map.getNumberOfCell() - numbersOfCell)) ++camera.startX;
    }

    if (keysPushed[ButtonsKeys['left']] === true){
        if (camera.startX>0) --camera.startX;
    }


    if (keysPushed[ButtonsKeys['W']] === true){
        if (camera.startY>0) --camera.startY;
    }

    if (keysPushed[ButtonsKeys['S']] === true){
        if ((camera.startY+1)<(map.getNumberOfCell() - numbersOfCell)) ++camera.startY;
    }

    if (keysPushed[ButtonsKeys['D']] === true){
        if ((camera.startX+1)<(map.getNumberOfCell() - numbersOfCell)) ++camera.startX;
    }

    if (keysPushed[ButtonsKeys['A']] === true){
        if (camera.startX>0) --camera.startX;
    }

    canvasContext.clearRect(0,0,canvasWidth,canvasHeight);
    printMap();
};