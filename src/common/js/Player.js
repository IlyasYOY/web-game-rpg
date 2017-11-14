var allSkills = ['fireball','heal','kick','armor'];

typesOfUnit = {
    'magician' : {
        health : 80,
        power : 5,
        speed : 10,
        luck : 15,
        skills : {'fireball' : 10,
            'heal' : 5}
    },
    'warrior' : {
        health : 100,
        power : 10,
        speed : 5,
        luck : 10,
        skills : {
            'kick' : 10,
            'armor' : 5
        }
    },
    'archer' : {
        power : 7,
        speed : 15,
        luck : 12,
        skills : {}
    }
}

class Entity{
    constructor(x = 0,y = 0,direction = 0,typeOfUnit = "magician"){
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.typeOfunit = typeOfUnit;
    }

    getX(){
        return this.x;
    }

    getY(){
        return this.y;
    }

    setX(value){
        this.x = value;
    }

    setY(value){
        this.y = value;
    }

    getDirection(){
        return this.direction;
    }
}

class Player extends Entity{
    constructor(x = 0,y = 0,direction = 0, typeOfUnit = 'magician', energy = 10){
        super(x,y,direction);
        this.inventory = {};
        this.unit = typesOfUnit[typeOfUnit];
        this.typeOfUnit = typeOfUnit;
        this.energy = energy;
        this.health = typesOfUnit[typeOfUnit].health;
        this.skills = typesOfUnit[typeOfUnit].skills;
    }

    move(newX,newY){
        this.x = newX;
        this.y = newY;
    }


}