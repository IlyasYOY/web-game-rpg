/*0 - земля
1 - возвышенность
2 - кусты
-1 - вода
3 - камень
4 - гора
-2 - впадина*/
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
    return map.ourMap[i][j] === 0 || map.ourMap[i][j] === 1;
};

var fogOfWar = function(player,i,j){
    let distance = 3
    return Math.abs(player.x - i) <= distance && Math.abs(player.y - j) <= distance;
};