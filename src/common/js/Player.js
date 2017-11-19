
typesOfUnit = {
    'magician' : {
        health : 80,
        power : 10,
        speed : 5,
        luck : 15,
        intelegente : 10,
    },
    'warrior' : {
        health : 100,
        power : 10,
        speed : 10,
        luck : 10,
        intelegente : 5,
    },
};

class Entity{
    constructor(x = 0,y = 0,direction = 0){
        this.x = x;
        this.y = y;
        this.direction = direction;
    }
}

class Player extends Entity{
    constructor(x = 0,y = 0,direction = 0, energy = 10){
        super(x,y,direction);
        this.rangeOfVisobility = 10;
        this.inventory = {};
        this.keys = {};
        this.units = {'warrior' : 5, 'magician' : 5};
        this.energy = energy/5;
        this.maxEnergy = energy/5;
        this.maxDistance = parseInt((this.units.warrior*(100/typesOfUnit['warrior'].speed) + this.units.magician*(100/typesOfUnit['magician'].speed))/50);
        this.distance = this.maxDistance;
    }

    move(newX, newY) {
        this.x = newX;
        this.y = newY;
    }
}

// var rangeOfWalking = function(player,i,j){
//   // let distance = 10;
//   let maxSumSpeed = 100;
//   let ratio = 50;
//   let distance = parseInt((player.units.warrior*(maxSumSpeed/typesOfUnit['warrior'].speed) + player.units.magician*(maxSumSpeed/typesOfUnit['magician'].speed))/ratio);
//     return (Math.abs(player.x - i) + Math.abs(player.y - j)) <= distance;
// };

module.exports.Entity = Entity;
module.exports.Player = Player;
module.exports.typesOfUnit = typesOfUnit;