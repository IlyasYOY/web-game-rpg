var printBonusForSuperVisor = function (startX,startY,sizeOfCell,canvasContext) {
    for (let i in mapBonus) {
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
};

var printCellForSuperVisor = function (i,j,startX,startY,sizeOfCell,canvasContext) {
    if (map.ourMap[i][j] === -1) {
        canvasContext.fillStyle = '#0069ff';
    } else if (map.ourMap[i][j] === 0){
        canvasContext.fillStyle = '#ffb33f';
    } else if (map.ourMap[i][j] === 1){
        canvasContext.fillStyle = '#41b611';
    } else if (map.ourMap[i][j] === 2){
        canvasContext.fillStyle = '#f0f0e7';
    }
    console.log('lol5');
    canvasContext.strokeStyle = '#000000';
    //canvasContext.strokeRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell); }
    canvasContext.strokeRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    //canvasContext.fillRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell);
    canvasContext.fillRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
};

var printPlayersForSuperVisor = function (startX,startY,sizeOfCell,canvasContext) {
    console.log('lol4');
    canvasContext.fillStyle = "#b90084";
    for (let i in players){
        canvasContext.fillRect((players[i].x - startX)*(sizeOfCell),(players[i].y - startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    }
};


var printMapForSuperVisor = function () {
    for (let i = camera.startX;i<map.numberOfCell;++i){
        for (let j = camera.startY;j<map.numberOfCell;++j){
            printCellForSuperVisor(i,j,camera.startX,camera.startY,sizeOfCell,canvasContext);
            printPlayersForSuperVisor(camera.startX,camera.startY,sizeOfCell,canvasContext);
        }
    }
    printBonusForSuperVisor(camera.startX,camera.startY,sizeOfCell,canvasContext);
};

var reloadMiniMapForSuperVisor = function () {
    for (let i = 0;i<map.numberOfCell;++i){
        for (let j = 0;j<map.numberOfCell;++j){
            printCellForSuperVisor(i,j,0,0,miniMapHeight/map.numberOfCell,miniMapContext);
            printPlayersForSuperVisor(0,0,miniMapHeight/map.numberOfCell,miniMapContext);
        }
    }
    printBonusForSuperVisor(0,0,miniMapHeight/map.numberOfCell,miniMapContext);
};


