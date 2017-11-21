/*0 - земля
-1 - вода
1 - дерево
2 - камень
3 - зелье с (маной)energy(увеличивает максимальную энерджи)
4 - зелье с выносливостью(distance)(полностью восстанавливает distance)
5 - fireball
6 - lightning
7 - godpunch
8 - войны(warrior) 5 - штук
9 - маги(magician) 5 - штук
10 - npc-охранник
11 - выход*/
class Map{
    constructor(numberOfCell = 0){
        this.numberOfCell = numberOfCell;
        this.ourMap = [];
        for (let i = 0;i<numberOfCell;++i){
            this.ourMap[i] = [];
            for (let j = 0;j<numberOfCell;++j) {
                this.ourMap[i][j] = 0
            }
        }
    }

    getCell(i,j){
        return this.ourMap[i][j];
    }

    setCell(i,j,value) {
        this.ourMap[i][j] = value;
    }

    getNumberOfCell(){
        return this.numberOfCell;
    }


    isVisible(i,j){
        return this.ourMap[i][j];
    }
}

var isEnterable = function(map,i,j){
    return (map.ourMap[i][j] === 11 && myPerson.keys.length >= (parseInt(playersLimit / 2) + 1)) || map.ourMap[i][j] === 0;
};

var fogOfWar = function(player,i,j){
    let distance = 3;
    let ratio = 50;
    distance += parseInt((player.units.warrior*typesOfUnit['warrior'].intelegente + player.units.magician*typesOfUnit['magician'].intelegente)/ratio);
    return (Math.abs(player.x - i) + Math.abs(player.y - j)) <= distance;
};

module.exports.isEnterable = isEnterable;