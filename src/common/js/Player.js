var allSkills = ['fireball','heal','kick','armor'];

typesOfUnit = {
    'magician' : {
        health : 80,
        power : 5,
        speed : 10,
        luck : 15,
        intelegente : 10,
    },
    'warrior' : {
        health : 100,
        power : 10,
        speed : 5,
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
        this.units = {'warrior' : 5, 'magician' : 5};
        this.energy = energy;
    }

    move(newX,newY){
        this.x = newX;
        this.y = newY;
    }


}