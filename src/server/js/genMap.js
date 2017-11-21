let SimplexNoise = require('simplex-noise');
let fs = require('fs');

function getMap(size = 100, waterC = 1/4, rockC = 1/10, treeC = 1/10) {
    let map = {
        numberOfCell: size,
        ourMap: []
    };
    
    let simplex = new SimplexNoise();

    for (let i = 0; i < size; i++) {
        map.ourMap.push([])
        for (let j = 0; j < size; j++) {
            let y = i / size - 0.5;
            let x = j / size - 0.5;
            let point = filter(noise(x, y));
            if (point == 0) {
                let rand = Math.random();
                if (rand <= rockC) {
                    point = 2;
                } else if (rand <= rockC + treeC) {
                    point = 1;
                }
            }
            map.ourMap[i].push(point);
        }
    }

    return map;

    function filter(value) {
        if (value < waterC) {
            return -1;
        } else {
            return 0;
        }
    }

    function noise(x, y) {
        return simplex.noise2D(x, y) / 2 + 0.5;
    }
}

fs.writeFileSync('./src/server/js/json/map3.json', JSON.stringify(getMap(70)));

module.exports = getMap;