var ButtonsKeys = {
    'up' : 38,
    'down' : 40,
    'enter' : 13,
    'right' : 39,
    'left' : 37,
    'W' : 87,
    'S' : 83,
    'A' : 65,
    'D' : 68
};

var keysPushed = {};

var setKeyPush = function (keyCode) {
    keysPushed[keyCode] = true;
    console.log("added")
};

var setKeyUp = function(keyCode){
    keysPushed[keyCode] = false;
    console.log("deleted");
};
