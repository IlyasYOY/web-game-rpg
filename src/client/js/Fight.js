let skillNames = ['kick','mag_kick','fireball','lightning' , 'godpunch'];

let allSkills = {
    'fireball' : [200, 3],
    'lightning' : [300, 4],
    'kick' : [20, 1],
    'godpunch' : [1000, 15],
    'mag_kick' : [25, 2]};

let whoMoves = 0;

let skills = [];

let enemyUnitsCoord = {
    'warrior' : {
        'x' : 400,
        'y' : 250,
        'height' : 100,
        'width' : 75
    },
    'magician' : {
        'x' : 400,
        'y' : 375,
        'height' : 100,
        'width' : 75
    }
};

let myPersonUnitsCoord = {
    'warrior' : {
        'x' : 50,
        'y' : 250,
        'height' : 100,
        'width' : 75
    },
    'magician' : {
        'x' : 50,
        'y' : 375,
        'height' : 100,
        'width' : 75
    }
};

let clickedSkills = {
    x: -1,
    y: -1,
    isClick : false,
    skill : ''
};
let clickedUnit = {
    x: -1,
    y: -1,
    heightUnit : -1,
    widthUnit : -1,
    isClick : false,
    unit : ''
};

var kickAnimation = function () {
    canvasContext.font = "20px Georgia";
    canvasContext.fillText('Kick', 250, 80);
    for (var i = 0;i<20;++i){
        canvasContext.clearRect(50+i,250,0,0);
        drawWarrior(50 + 20*i,250);
    }
};
var doAttack = function (myEnemy) {
    let damage = 0;

    if (skills[clickedSkills.skill] === skillNames[0] && myPerson.energy >= allSkills[skillNames[0]][1]){
        damage += allSkills[skillNames[0]][0] * myPerson.units['warrior'];
        myPerson.energy -= allSkills[skillNames[0]][1];
    } else if (skills[clickedSkills.skill] === skillNames[1] && myPerson.energy >= allSkills[skillNames[1]][1]){
        damage += allSkills[skillNames[1]][0] * myPerson.units['magician'];
        myPerson.energy -= allSkills[skillNames[1]][1];
    } else if (myPerson.energy >= allSkills[skills[clickedSkills.skill]][1]){
        damage += allSkills[skills[clickedSkills.skill]][0];
        myPerson.energy -= allSkills[skills[clickedSkills.skill]][1];

    }


    players[myEnemy].units[clickedUnit.unit] -= damage / typesOfUnit[clickedUnit.unit].health;
    if (players[myEnemy].units[clickedUnit.unit] < 0){
        players[myEnemy].units[clickedUnit.unit] = 0;
    }
    console.log('my attack');
    console.log(damage);
    console.log(clickedUnit.unit);
    console.log(clickedSkills.skill);

    if (myEnemy.indexOf('bot')===-1) {
        socket.emit("do_fight_step", myEnemy, players[myEnemy], myPerson.energy);
    } else {
        socket.emit("do_fight_step_with_bot", myEnemy, players[myEnemy], myPerson.energy);
    }
};

var isInSquare = function(i,j,sizeOfCell,x,y){
    return x >= i * (sizeOfCell)
        && y >= j * (sizeOfCell)
        && x <= (i * (sizeOfCell) + sizeOfCell)
        && y <= (j * (sizeOfCell) + sizeOfCell);
};

var cursorIsInUnit = function(i,j,sizeOfX,sizeOfY,x,y){
    return x >= i
        && y >= j
        && x <= (i  + sizeOfX)
        && y <= (j + sizeOfY);
};

var cursorHandlerForUnits = function (myEnemy) {
    if (mauseCoord.isDown){
        for (let i in enemyUnitsCoord){
            if (cursorIsInUnit(enemyUnitsCoord[i].x,enemyUnitsCoord[i].y,enemyUnitsCoord[i].width,
                    enemyUnitsCoord[i].height,mauseCoord.x,mauseCoord.y) &&
                players[myEnemy].units[i] > 0){
                if (myEnemy.indexOf('bot') === -1) {
                    socket.emit("emit_fight_chose_unit", i, myEnemy);
                }
                clickedUnit.unit = i;
                console.log(clickedUnit);
                clickedUnit.x = enemyUnitsCoord[i].x;
                clickedUnit.y = enemyUnitsCoord[i].y;
                clickedUnit.heightUnit = enemyUnitsCoord[i].height;
                clickedUnit.widthUnit = enemyUnitsCoord[i].width;
                clickedUnit.isClick = true;
            }
        }
        mauseCoord.isDown = false;
    }
    canvasContext.fillStyle = "#000000";
    canvasContext.strokeStyle = "#000000";
    canvasContext.strokeRect(clickedUnit.x, clickedUnit.y, clickedUnit.widthUnit, clickedUnit.heightUnit);
};

var cursorHandlerForSkills = function (numbOfSkills) {
    for(let j = 0;j<numbOfSkills;++j)
        if (isInSquare(j % 5, j / 5, 40, mauseCoord.x - canvasHeight, mauseCoord.y - miniMapWidth)) {
            if (mauseCoord.isDown === true) {
                clickedSkills.skill = j;
                clickedSkills.x = parseInt(j % 5);
                clickedSkills.y = parseInt(j / 5);
                clickedSkills.isClick = true;
                if (myEnemy.indexOf('bot') === -1) {
                    socket.emit("emit_fight_chose_skill", clickedSkills, myEnemy);
                }
                mauseCoord.isDown = false;
            }
        }
    inventoryContext.fillStyle = "#000000";
    inventoryContext.strokeStyle = "#000000";
    inventoryContext.strokeRect((clickedSkills.x * 40) % 200, clickedSkills.y * 40, 40, 40);
};

var drawWarrior = function(positionX,positionY,number){
    canvasContext.font="14px Georgia";
    canvasContext.fillStyle = '#000000';
    canvasContext.fillText(parseInt(number), 0 + positionX, 5 + positionY);
    //head
    canvasContext.fillStyle = '#ffe789';
    canvasContext.fillRect(25 + positionX,5 + positionY,25,25);
    //body
    canvasContext.fillStyle = '#ff2b23';
    canvasContext.fillRect(12.5 + positionX,30 + positionY,50,50);
    //left arm
    canvasContext.fillStyle = '#ffe789';
    canvasContext.fillRect(0 + positionX,30 + positionY,12.5,25);
    //right arm
    canvasContext.fillStyle = '#ffe789';
    canvasContext.fillRect(62.5 + positionX,30 + positionY,12.5,25);
    //left foot
    canvasContext.fillStyle = '#0f0aff';
    canvasContext.fillRect(15 + positionX,80 + positionY,12.5,25);
    //right foot
    canvasContext.fillStyle = '#0f0aff';
    canvasContext.fillRect(45 + positionX,80 + positionY,12.5,25);
};

var drawMagician = function(positionX,positionY,number){
    canvasContext.font="14px Georgia";
    canvasContext.fillStyle = '#000000';
    canvasContext.fillText(parseInt(number), 0 + positionX, 5 + positionY);
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
        if (myPerson.units[i]>0) {
            if (i === 'warrior'){
                drawWarrior(50,250,myPerson.units[i]);
            } else if(i === 'magician'){
                drawMagician(50,375,myPerson.units[i]);
            }
        }
    }
};

var drawMyEnemy = function (myEnemy) {
    let health = 0;
    for (let i in players[myEnemy].units){
        if (players[myEnemy].units[i]>0) {
            if (i === 'warrior'){
                drawWarrior(400,250,players[myEnemy].units[i]);
            } else if(i === 'magician'){
                drawMagician(400,375,players[myEnemy].units[i]);
            }
        }
    }
};


var drawMySkills = function (myPerson) {
    inventoryContext.clearRect(0,0,inventoryWidth,inventoryHeight);
    skills = [];
    let i = 0;
    let k = -1;
    for (let key in myPerson.units){
        if (myPerson.units[key] > 0){
            if (i%5 === 0) ++k;
            if (key === 'warrior'){
                skills.push(skillNames[0]);
                inventoryContext.fillStyle = "#ff1a27";}
            else if(key === 'magician'){
                skills.push(skillNames[1]);
                inventoryContext.fillStyle = "#1d21ff";
            }
            inventoryContext.fillRect((i%5 * 40) % 200,k*40,40,40);
            ++i;
        }
    }

    for (let key in myPerson.inventory){
        if (i%5 === 0) ++k;
        if (myPerson.inventory[key] === skillNames[2]){
            skills.push(skillNames[2]);
            inventoryContext.fillStyle = "#fffd14";}
        else if(myPerson.inventory[key] === skillNames[3]){
            skills.push(skillNames[3]);
            inventoryContext.fillStyle = "#23d6ff";
        } else if(myPerson.inventory[key] === skillNames[4]){
            skills.push(skillNames[3]);
            inventoryContext.fillStyle = "#ffd3f5";
        }
        inventoryContext.fillRect(((i%5) * 40) % 200,k*40,40,40);
        ++i;
    }
    return i;
};


var clearChose = function () {
    clickedSkills.isClick = false;
    clickedUnit.isClick = false;
    clickedUnit.x = - 1;
    clickedUnit.y = -1;
    clickedUnit.widthUnit = -1;
    clickedUnit.heightUnit = -1;
    clickedSkills.x = -1;
    clickedSkills.y = -1;
};

var fightGameStep = function (myEnemy) {
    writeStat(myEnemy);
    drawMyPerson();
    drawMyEnemy(myEnemy);
    cursorHandlerForSkills(drawMySkills(myPerson));
    cursorHandlerForUnits(myEnemy);
    if (clickedSkills.isClick && clickedUnit.isClick) {
        clearChose();
        if (myEnemy.indexOf('bot')===-1) {
            socket.emit("emit_fight_attack_was_made", myEnemy);
        }
        doAttack(myEnemy);
        let flag = false;
        for (let i in players[myEnemy].units)
            if (players[myEnemy].units[i] > 0) {
                flag = true;
                break;
            }
        if (!flag) {
            if (myEnemy.indexOf('bot') === -1) {
                socket.emit("end_of_fight", myEnemy);
            } else {
                socket.emit("end_of_fight_with_bot", myEnemy);
            }
        }
    }
};

var fightHandler = function (myEnemy) {
    if (whoMoves === socket.id) {
        canvas.style.opacity = "1";
        whereAmI = 'Fight';
        if (myPerson.energy > 0 && keysPushed[ButtonsKeys['Space']] !== true) {
            keysPushed[ButtonsKeys['Space']] = false;
            fightGameStep(myEnemy);
        }else {
            socket.emit("emit_who_moves_fight", whoMoves, myEnemy);
        }
    } else {
        canvas.style.opacity = "0.5";
        canvasContext.font="20px Georgia";
        canvasContext.fillStyle = "#000000";
        canvasContext.fillText('Please Wait',250,300);
        writeStat(myEnemy);
        drawMyPerson();
        drawMyEnemy(myEnemy);
        drawMySkills(players[myEnemy]);
        canvasContext.strokeStyle = "#000000";
        canvasContext.strokeRect(clickedUnit.x, clickedUnit.y, clickedUnit.widthUnit, clickedUnit.heightUnit);
        inventoryContext.strokeStyle = "#000000";
        inventoryContext.strokeRect((clickedSkills.x * 40) % 200, clickedSkills.y * 40, 40, 40);
        socket.emit("emit_get_player");
        socket.emit("emit_get_players");
    }
};

var fightWithBotHandler = function (myEnemy) {
    if (whoMoves === socket.id) {
        canvas.style.opacity = "1";
        whereAmI = 'FightWithBot';
        if (myPerson.energy > 0 && keysPushed[ButtonsKeys['Space']] !== true) {
            fightGameStep(myEnemy);
        }else {
            whoMoves = myEnemy;
            console.log('bot');
            console.log(players[myEnemy]);
            console.log('person');
            console.log(myPerson);
            socket.emit("emit_who_moves_fight_with_bot", socket.id, myEnemy);
        }
    } else {
        canvas.style.opacity = "0.5";
        canvasContext.font="20px Georgia";
        canvasContext.fillStyle = "#000000";
        canvasContext.fillText('Please Wait',250,300);
        writeStat(myEnemy);
        drawMyPerson();
        drawMyEnemy(myEnemy);
        drawMySkills(players[myEnemy]);
    }
};