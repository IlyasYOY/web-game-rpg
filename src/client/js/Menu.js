var Menu = {
    menuPoints: ['Map', 'Info', 'Quit'],
    numberOfPoint: 0
};

var printMenu = function(chainedPoint){
    canvasContext.font="20px Georgia";
    canvasContext.fillStyle = "#000000";
    var stepInMenu = canvasHeight / 30;

    for (var i = 0;i<Menu.menuPoints.length;++i){
        canvasContext.fillText(Menu.menuPoints[i],((canvasHeight - stepInMenu) / 2),((canvasWidth-stepInMenu*(Menu.menuPoints.length)) / 2) +  i*stepInMenu)
    }

    canvasContext.fillRect(((canvasHeight - stepInMenu) / 2) - 2*stepInMenu,
        ((canvasWidth-stepInMenu*(Menu.menuPoints.length)) / 2) +  (chainedPoint-1)*stepInMenu,20,20);

};

var menuHandler = function () {
    if (keysPushed[ButtonsKeys['up']] === true){
        keysPushed[ButtonsKeys['up']] = false;
        if (Menu.numberOfPoint>0) --Menu.numberOfPoint;
    }

    if (keysPushed[ButtonsKeys['down']] === true){
        keysPushed[ButtonsKeys['down']] = false;
        if ((Menu.numberOfPoint+1)<Menu.menuPoints.length) ++Menu.numberOfPoint;
    }

    if (keysPushed[ButtonsKeys['enter']] === true){
        keysPushed[ButtonsKeys['enter']] = false;
        whereAmI = Menu.menuPoints[Menu.numberOfPoint];
    }

    printMenu(Menu.numberOfPoint);
};