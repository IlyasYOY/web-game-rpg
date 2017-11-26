var MapMenu = {
    menuPoints: ['map1', 'map2', 'map3'],
    numberOfPoint: 0
};

var printMapMenu = function(chainedPoint){
    canvasContext.font="20px Georgia";
    canvasContext.fillStyle = "#ffffff";
    var stepInMenu = canvasHeight / 30;

    for (var i = 0;i<MapMenu.menuPoints.length;++i){
        canvasContext.fillText(MapMenu.menuPoints[i],((canvasHeight - stepInMenu) / 2),((canvasWidth-stepInMenu*(MapMenu.menuPoints.length)) / 2) +  i*stepInMenu);
    }

    canvasContext.fillRect(((canvasHeight - stepInMenu) / 2) - 2*stepInMenu,
        ((canvasWidth-stepInMenu*(MapMenu.menuPoints.length)) / 2) +  (chainedPoint-1)*stepInMenu,20,20);

};

var mapMenuHandler = function () {
    if (keysPushed[ButtonsKeys['up']] === true){
        keysPushed[ButtonsKeys['up']] = false;
        if (MapMenu.numberOfPoint>0) --MapMenu.numberOfPoint;
    }

    if (keysPushed[ButtonsKeys['down']] === true){
        keysPushed[ButtonsKeys['down']] = false;
        if ((MapMenu.numberOfPoint+1)<MapMenu.menuPoints.length) ++MapMenu.numberOfPoint;
    }

    if (keysPushed[ButtonsKeys['enter']] === true){
        keysPushed[ButtonsKeys['enter']] = false;
        socket.emit("choose_map",MapMenu.menuPoints[MapMenu.numberOfPoint]);
    }

    printMapMenu(MapMenu.numberOfPoint);
};