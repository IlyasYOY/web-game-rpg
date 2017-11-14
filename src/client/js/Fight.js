var kickAnimation = function () {
    canvasContext.font = "20px Georgia";
    canvasContext.fillText('Na nahuy! ', 250, 80);
    for (let i = 0;i<20;++i){
        canvasContext.clearRect(50+i,250,0,0);
        drawWarrior(50 + 20*i,250);
    }
};

var doAttack = function () {
    if (clickedSells.x !== -1 && clickedSells.y !== -1) {
        kickAnimation();
        clickedSells.x = -1;
        clickedSells.y = -1;
    }
};

var isInSquare = function(i,j,sizeOfCell,x,y){
    if (x>=i*(sizeOfCell)
        && y>=j*(sizeOfCell)
        && x<=(i*(sizeOfCell)+sizeOfCell)
        && y<=(j*(sizeOfCell)+sizeOfCell)){
        return true;
    } else {
        return false;
    }
};

var cuHandler = function (me) {
    let i = 0;
    let k = -1;
    for (key in players[me].skills){
        if (i%5 === 0) ++k;
        if (isInSquare(i,k,40,mauseCoord.x - canvasHeight,mauseCoord.y - miniMapWidth)){
            if (mauseCoord.isDown === true){
                clickedSells.x = i;
                clickedSells.y = k;
                mauseCoord.isDown = false;
            }
        }
        ++i;
        inventoryContext.fillStroke = "#000000";
        inventoryContext.strokeRect((clickedSells.x * 40) % 200,clickedSells.y*40,40,40);
    }
};

var drawWarrior = function(positionX,positionY){
    //head
    canvasContext.fillStyle = '#ffe789';
    canvasContext.fillRect(50 + positionX,0 + positionY,50,50);
    //body
    canvasContext.fillStyle = '#ff2b23';
    canvasContext.fillRect(25 + positionX,50 + positionY,100,100);
    //left arm
    canvasContext.fillStyle = '#ffe789';
    canvasContext.fillRect(0 + positionX,50 + positionY,25,50);
    //right arm
    canvasContext.fillStyle = '#ffe789';
    canvasContext.fillRect(125 + positionX,50 + positionY,25,50);
    //left foot
    canvasContext.fillStyle = '#0f0aff';
    canvasContext.fillRect(30 + positionX,150 + positionY,25,50);
    //right foot
    canvasContext.fillStyle = '#0f0aff';
    canvasContext.fillRect(90 + positionX,150 + positionY,25,50);
};

var writeStat = function (me,enemy) {
    canvasContext.font="20px Georgia";
    canvasContext.fillText('You : ',0,20);
    canvasContext.fillText('health = ' + players[me].health, 60,20);
    canvasContext.fillText('energy = ' + players[me].energy, 200,20);
    canvasContext.fillText('VS',0,40);
    canvasContext.fillText('Player #' + enemy + ' : ',0,60);
    canvasContext.fillText('health = ' + players[enemy].health, 100,60);
    canvasContext.fillText('energy = ' + players[enemy].energy, 240,60);
};


var drawSkills = function (me) {
    inventoryContext.clearRect(0,0,inventoryWidth,inventoryHeight);
    let i = 0;
    let k = -1;
    for (key in players[me].skills){
        if (i%5 === 0) ++k;
        if (key === 'fireball'){
            inventoryContext.fillStyle = "#ff1a27";}
        else if(key === 'heal'){
            inventoryContext.fillStyle = "#ffc550";
        }
        inventoryContext.fillRect((i * 40) % 200,k*40,40,40);
        ++i;
    }
};

var fightHandler = function (me,enemy) {
    whereAmI = 'Fight';
    stroke = me;

    writeStat(me,enemy);
    drawWarrior(50,250);
    drawWarrior(400,250);
    drawSkills(stroke);
    cuHandler(me);
    doAttack();
};