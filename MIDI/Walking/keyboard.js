///////////////////////////////////////////////////////////////////////////////
/*
    Key
*/
function Key(midi, x, y, isBlack) {
    this.midi = midi;
    this.x = x;
    this.y = y;
    this.pressedY = y + 0.5;
    this.isBlack = isBlack;
    this.geometry = node();
}
Key.prototype.pressedPosition = function() {
    this.geometry.position.y = this.pressedY;
}
Key.prototype.resetPosition = function() {
    this.geometry.position.y = this.y;
}

/*
    Virtual copy of locations of keyboard
*/
function Keyboard(calibration) {
    this.whiteKeyHeight = 0;
    this.blackKeyHeight = .2;
    this.keyWidth = 0.08;
    this.keyHeight = 0.2;
    this.geometry = node();

    this.keys = [];
    for (var i = 0; i < 88; i++) {
        var x = i * calibration.getWidth()/88 + calibration.getOffsetX();
        var y = i * calibration.getHeightDiff()/88 + calibration.getOffsetY();
        var isBlackKey = isBlack(i);
        var key = new Key(i + 21, x, y + (isBlackKey ? this.blackKeyHeight : this.whiteKeyHeight), isBlackKey);
        this.keys.push(key);
    }
    console.log(this.keys.length);
    function isBlack(num) {
        var isBlack = [1, 4, 6, 9, 11];
        for (var i = 0; i < isBlack.length; i++) {
            if (num % 12 == isBlack[i])
                return true;
        }
        return false;
    }
}
Keyboard.prototype.getKeyFromX = function(x) {
    var diffThresh = 0.02;
    var result = this.keys.reduce(function(a, b) { if (Math.abs(b.x - x) < diffThresh)
                                                        return b;
                                                    else
                                                        return a;}, null);
    if (result)
        console.log("getKeyFromX result: " + result.x);
    return result;

}
Keyboard.prototype.addToScene = function(material, darkMaterial, root) {
    root.add(this.geometry);
    for (var i = 0; i < this.keys.length; i ++) {
        var keyBlock= cube(this.keys[i].isBlack ? darkMaterial : material);
        keyBlock.position.set(this.keys[i].x, this.keys[i].y, 0);
        keyBlock.scale.set(this.keyWidth, this.keyHeight/2, this.keyWidth);

        this.keys[i].geometry = keyBlock;
        this.geometry.add(keyBlock);
    }
}
Keyboard.prototype.getKey = function(midi) {
    return this.keys[midi-21];
}
