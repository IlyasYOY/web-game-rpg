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
                this.ourMap[i][j] = {
                    numb : 0,
                    isVisible : true
                };
            }
        }
    }

    getCell(i,j){
        return this.ourMap[i][j].numb;
    }

    setCell(i,j,value) {
        this.ourMap[i][j].numb = value;
    }

    getNumberOfCell(){
        return this.numberOfCell;
    }

    isEnterable(i,j){
        return this.ourMap[i][j].numb === 0 || this.ourMap[i][j].numb === 1;
    }

    isVisible(i,j){
        return this.ourMap[i][j].isVisible;
    }
}