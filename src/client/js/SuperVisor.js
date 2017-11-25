var printBonusForSuperVisor = function (startX,startY,sizeOfCell,canvasContext) {
    for (let i in mapBonus) {
            if (mapBonus[i].numb === 3) {
                canvasContext.drawImage(textures[3],(mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
            } else if (mapBonus[i].numb === 4) {
                canvasContext.drawImage(textures[4],(mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
            } else if (mapBonus[i].numb === 5) {
                //canvasContext.fillStyle = '#ffff00';
                //canvasContext.fillRect((mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
                canvasContext.drawImage(textures[5],(mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
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
                canvasContext.drawImage(textures[9],(mapBonus[i].x - startX) * (sizeOfCell), (mapBonus[i].y - startY) * (sizeOfCell), sizeOfCell, sizeOfCell);
            }

    }
};

var printCellForSuperVisor = function (i,j,startX,startY,sizeOfCell,canvasContext) {
    if (map.ourMap[i][j] === -1) {
        //canvasContext.fillStyle = '#0069ff';
        //canvasContext.fillRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell);
        canvasContext.drawImage(textures[-1],(i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    } else if (map.ourMap[i][j] === 0){
        // canvasContext.fillStyle = '#ffb33f';
        canvasContext.drawImage(textures[0], (i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    } else if (map.ourMap[i][j] === 1){
        //canvasContext.fillStyle = '#41b611';
        //canvasContext.fillRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell);
        canvasContext.drawImage(textures[0],(i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
        canvasContext.drawImage(textures[1],(i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    } else if (map.ourMap[i][j] === 2){
        //canvasContext.fillStyle = '#f0f0e7';
        //canvasContext.fillRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell);
        canvasContext.drawImage(textures[0],(i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
        canvasContext.drawImage(textures[2],(i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    }else if (map.ourMap[i][j] === 11){
        //canvasContext.fillStyle = '#000000';
        //canvasContext.fillRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell);
        canvasContext.drawImage(textures[18],(i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
    }
    canvasContext.strokeStyle = '#000000';
    //canvasContext.strokeRect((i-startX)*(sizeOfCell+10),(j-startY)*(sizeOfCell+10),sizeOfCell,sizeOfCell); }
    canvasContext.strokeRect((i-startX)*(sizeOfCell),(j-startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
};

var printPlayersForSuperVisor = function (startX,startY,sizeOfCell,canvasContext) {
    //canvasContext.fillStyle = "#b90084";
    for (let i in players){
        canvasContext.drawImage(textures[10],(players[i].x - startX)*(sizeOfCell),(players[i].y - startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
        //canvasContext.fillRect((players[i].x - startX)*(sizeOfCell),(players[i].y - startY)*(sizeOfCell),sizeOfCell,sizeOfCell);
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


