typesOfUnit = {
    "magician" : {
        power : 5,
        speed : 10,
        luck : 15,
        skills : {}
    },
    "warrior" : {
        power : 10,
        speed : 5,
        luck : 10,
        skills : {}
    },
    "archer" : {
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
        this.typeOfUnit = typeOfUnit;
        this.energy = energy;
    }

    move(newX,newY){
        this.x = newX;
        this.y = newY;
    }


}