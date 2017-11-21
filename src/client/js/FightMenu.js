var FightMenu = {
    menuPoints: ['Fight', 'Run', 'Unite'],
    numberOfPoint: 0
};

var printFightMenu = function(chainedPoint){
    canvasContext.font="20px Georgia";
    canvasContext.fillStyle = "#000000";
    var stepInMenu = canvasHeight / 30;

    for (var i = 0;i<FightMenu.menuPoints.length;++i){
        canvasContext.fillText(FightMenu.menuPoints[i],((canvasHeight - stepInMenu) / 2),((canvasWidth-stepInMenu*(FightMenu.menuPoints.length)) / 2) +  i*stepInMenu);
    }

    canvasContext.fillRect(((canvasHeight - stepInMenu) / 2) - 2*stepInMenu,
        ((canvasWidth-stepInMenu*(FightMenu.menuPoints.length)) / 2) +  (chainedPoint-1)*stepInMenu,20,20);

};

var fightMenuHandler = function (myEnemy) {
    if (keysPushed[ButtonsKeys['up']] === true){
        if (FightMenu.numberOfPoint>0) --FightMenu.numberOfPoint;
    }

    if (keysPushed[ButtonsKeys['down']] === true){
        if ((FightMenu.numberOfPoint+1)<FightMenu.menuPoints.length) ++FightMenu.numberOfPoint;
    }

    if (keysPushed[ButtonsKeys['enter']] === true){
        if (FightMenu.menuPoints[FightMenu.numberOfPoint] === 'Fight'){
            socket.emit('fight',myEnemy);
        } else if (FightMenu.menuPoints[FightMenu.numberOfPoint] === 'Run'){
            socket.emit('run',myEnemy);
        } else if (FightMenu.menuPoints[FightMenu.numberOfPoint] === 'Unite'){
            socket.emit('unite');
        }
    }

    printFightMenu(FightMenu.numberOfPoint);
};