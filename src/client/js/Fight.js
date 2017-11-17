var kickAnimation = function () {
    canvasContext.font = "20px Georgia";
    canvasContext.fillText('Na nahuy! ', 250, 80);
    for (var i = 0;i<20;++i){
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
    return x >= i * (sizeOfCell)
        && y >= j * (sizeOfCell)
        && x <= (i * (sizeOfCell) + sizeOfCell)
        && y <= (j * (sizeOfCell) + sizeOfCell);
};

var cuHandler = function (me) {
    var i = 0;
    var k = -1;
    for (key in players[me].skills) {
        if (i % 5 === 0) ++k;
        if (isInSquare(i, k, 40, mauseCoord.x - canvasHeight, mauseCoord.y - miniMapWidth)) {
            if (mauseCoord.isDown === true) {
                clickedSells.x = i;
                clickedSells.y = k;
                mauseCoord.isDown = false;
            }
        }
        ++i;
        inventoryContext.fillStroke = "#000000";
        inventoryContext.strokeRect((clickedSells.x * 40) % 200, clickedSells.y * 40, 40, 40);
    }
};

var drawWarrior = function(positionX,positionY){
    //head
    canvasContext.fillStyle = '#ffe789';
    canvasContext.fillRect(25 + positionX,0 + positionY,25,25);
    //body
    canvasContext.fillStyle = '#ff2b23';
    canvasContext.fillRect(12.5 + positionX,25 + positionY,50,50);
    //left arm
    canvasContext.fillStyle = '#ffe789';
    canvasContext.fillRect(0 + positionX,25 + positionY,12.5,25);
    //right arm
    canvasContext.fillStyle = '#ffe789';
    canvasContext.fillRect(62.5 + positionX,25 + positionY,12.5,25);
    //left foot
    canvasContext.fillStyle = '#0f0aff';
    canvasContext.fillRect(15 + positionX,75 + positionY,12.5,25);
    //right foot
    canvasContext.fillStyle = '#0f0aff';
    canvasContext.fillRect(45 + positionX,75 + positionY,12.5,25);
};

var drawMagician = function(positionX,positionY,number){
    canvasContext.font="14px Georgia";
    canvasContext.fillStyle = '#000000';
    canvasContext.fillText(number, 15 + positionX, 5 + positionY);
    //hat
    canvasContext.fillStyle = '#000000';
    canvasContext.fillRect(20 + positionX,5 + positionY,35,5);
    canvasContext.fillRect(25 + positionX,10 + positionY,25,10);
    //head
    canvasContext.fillStyle = '#ffe789';
    canvasContext.fillRect(25 + positionX,20 + positionY,25,25);
    //body
    canvasContext.fillStyle = '#1217ff';
    canvasContext.fillRect(12.5 + positionX,30 + positionY,50,60);
    //left arm
    canvasContext.fillStyle = '#ffe789';
    canvasContext.fillRect(0 + positionX,30 + positionY,12.5,25);
    //right arm
    canvasContext.fillStyle = '#ffe789';
    canvasContext.fillRect(62.5 + positionX,30 + positionY,12.5,25);
};

var writeStat = function (myEnemy) {
    canvasContext.font="14px Georgia";
    canvasContext.fillStyle = '#000000';
    canvasContext.fillText('You : ', 0, 14);

    let health = 0;
    for (let i in myPerson.units){
        health += myPerson.units[i] * typesOfUnit[i].health;
    }
    canvasContext.fillText('health = ' + health, 0, 28);
    canvasContext.fillText('energy = ' + myPerson.energy, 0, 42);
    canvasContext.fillText('VS',0,56);
    canvasContext.fillText('Player #' + myEnemy + ' : ', 0, 70);
    console.log('myEnemy' + players[myEnemy]);
    health = 0;
    for (let i in players[myEnemy].units){
        health += players[myEnemy].units[i] * typesOfUnit[i].health;
    }
    canvasContext.fillText('health = ' + health, 0, 84);
    canvasContext.fillText('energy = ' + players[myEnemy].energy, 0, 98);
};

var drawMyPerson = function () {
    let health = 0;
    for (let i in myPerson.units){
        if (i === 'warrior'){
            drawWarrior(50,250,myPerson.units[i]);
        } else if(i === 'magician'){
            drawMagician(50,375,myPerson.units[i]);
        }
    }


};


var drawSkills = function (me) {
    inventoryContext.clearRect(0,0,inventoryWidth,inventoryHeight);
    var i = 0;
    var k = -1;
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

var fightHandler = function (myEnemy) {
    whereAmI = 'Fight';
    writeStat(myEnemy);
    drawMyPerson();
    // drawWarrior(400,250);
    // drawSkills(stroke);
    // cuHandler(me);
    // doAttack();
};