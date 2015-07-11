/*
    For calibration
*/
function Calibration(root) {
    this.leftX = -10.49;
    this.rightX = 7.43;
    this.leftY = -2.60;
    this.rightY = -3.3;
    this.whiteY = 0;
    this.blackY = -2;

    this.left = globe();
    this.right = globe();

    this.left.position.set(this.leftX, this.leftY, 0);
    this.left.scale.set(.1, .1, .1);
    root.add(this.left);

    this.right.position.set(this.rightX, this.rightY, 0);
    this.right.scale.set(.1, .1, .1);
    root.add(this.right);
}
Calibration.prototype.getWidth = function() {
    return this.rightX - this.leftX;
}
Calibration.prototype.getOffsetX = function() {
    return this.leftX;
}
Calibration.prototype.getHeightDiff = function() {
    return this.rightY - this.leftY;
}
Calibration.prototype.getOffsetY = function() {
    return Math.max(this.rightY, this.leftY);
}
Calibration.prototype.getYfromX = function(x) {
    var percent = (x - this.getOffsetX())/this.getWidth();
    console.log("%: " + percent);
    return percent * this.getHeightDiff() + this.getOffsetY();
}
addEventListener("keydown", function(event) {
    console.log("key! " + event.keyCode);

    switch (event.keyCode) {
        case 65: // L left
            calibration.leftX -=0.01;
            calibration.left.position.x = calibration.leftX;
            console.log("leftX: " + calibration.leftX);
            break;
        case 83: // L right
            calibration.leftX +=0.01;
            calibration.left.position.x = calibration.leftX;
            console.log("leftX: " + calibration.leftX);
            break;
        case 81:  // L up
            calibration.leftY +=0.01;
            calibration.left.position.y = calibration.leftY;
            console.log("leftY: " + calibration.leftY);
            break;
        case 90: // L down
            calibration.leftY -= 0.01;
            calibration.left.position.y = calibration.leftY;
            console.log("leftY: " + calibration.leftY);
        case 186:
            calibration.rightX -=0.01;
            calibration.right.position.x = calibration.rightX;
            console.log("rightX: " + calibration.rightX);
            break;
        case 222:
            calibration.rightX +=0.01;
            calibration.right.position.x = calibration.rightX;
            console.log("rightX: " + calibration.rightX);
            break;
        case 221:
            calibration.rightY +=0.01;
            calibration.right.position.y = calibration.rightY;
            console.log("rightY: " + calibration.rightY);
            break;
        case 191:
            calibration.rightY -=0.01;
            calibration.right.position.y = calibration.rightY;
            console.log("rightY: " + calibration.rightY);
            break;
    }

});
