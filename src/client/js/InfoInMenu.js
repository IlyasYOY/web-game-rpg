var getInfo = function (player,name) {
    let width = 14;
    canvasContext.clearRect(0,0,canvasWidth,canvasHeight);
    canvasContext.font="14px Georgia";
    canvasContext.fillStyle = '#ffffff';
    canvasContext.fillText('Your name is ' + name, 0, 14);
    width+=28;
    canvasContext.fillText('COORD(x/y):', 0, width);
    canvasContext.fillText(player.x + ' / ' + player.y, 14*(11), width);
    width+=28;
    canvasContext.fillText('ENERGY:', 0, width);
    canvasContext.fillText(player.energy, 14*(7), width);
    width+=28;
    canvasContext.fillText('UNITS:', 0, width);
    width+=14;
    for (let i in player.units){
        canvasContext.fillText(i + ':', 0, width);
        canvasContext.fillText(player.units[i], 14*(i.length), width);
        width+=14;
    }
    width+=14;
    canvasContext.fillText('INVENTORY:', 0, width);
    width+=14;
    for (let i in player.inventory){
        canvasContext.fillText(player.inventory[i],0, width);
        width+=14;
    }
    width+=14;
    canvasContext.fillText('KEYS:', 0, width);
    width+=14;
    for (let i in player.keys){
        canvasContext.fillText(player.keys[i],0, width);
        width+=14;
    }
    width+=14;
    canvasContext.fillText('DISTANCE:', 0, width);
    canvasContext.fillText(player.distance, 14*(9), width);
    width+=28;
    canvasContext.fillText('MAX DISTANCE:', 0, width);
    canvasContext.fillText(player.maxDistance, 14*(13), width);
};