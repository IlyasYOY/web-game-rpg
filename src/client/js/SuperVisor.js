var printCellForSuperVisor = function (i,j,startX,startY,sizeOfCell,canvasContext) {
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
    console.log('lol3');
    for (let i = camera.startX;i<map.numberOfCell;++i){
        for (let j = camera.startY;j<map.numberOfCell;++j){
            printCellForSuperVisor(i,j,camera.startX,camera.startY,sizeOfCell,canvasContext);
            printPlayersForSuperVisor(camera.startX,camera.startY,sizeOfCell,canvasContext);
        }
    }

};


