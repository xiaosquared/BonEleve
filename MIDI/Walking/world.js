function World() {
    this.renderer = new THREE.WebGLRenderer();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(4.5,width()/height(),1,1000);
    this.camera.position.z = 250;
    this.root = node();
    this.time = 0;

    this.material = phongMaterial(0xffffff, 0x000000, 0x000000, 30);
    this.darkMaterial = phongMaterial(0x202020, 0x000000, 0x000000, 20);

    this.isPaused = true;
}

World.prototype.setup = function() {
    this.renderer.setSize(width(), height());
    document.body.appendChild(this.renderer.domElement);

    this.scene.add(ambientLight(0x333333));
    this.scene.add(directionalLight(1,1,1, 0xffffff));

    this.root.scale.set(1, 1, 1);
    this.scene.add(this.root);
}
World.prototype.render = function() {
    this.renderer.setClearColor( 0x000000, 1);
    this.renderer.render(this.scene, this.camera);
}
World.prototype.getRoot = function() {
    return this.root;
}

/*
    For calibration
*/
function Calibration(root) {
    this.leftX = -10.59;
    this.rightX = 7.23;
    this.leftY = -2.7;
    this.rightY = -3.39;
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
    //console.log("%: " + percent);
    return percent * this.getHeightDiff() + this.getOffsetY();
}
addEventListener("keydown", function(event) {
    console.log("key! " + event.keyCode);

    var recalibrate = true;
    switch (event.keyCode) {
        case 13:
            world.isPaused = !world.isPaused;
            midiOut.flushNotes();
            walkingNote.initSequence(sequence);
            console.log("seq length " + sequence.getLength());

            recalibrate = false;
            break;
        case 65: // L left ... A
            calibration.leftX -=0.01;
            calibration.left.position.x = calibration.leftX;
            console.log("leftX: " + calibration.leftX);
            break;
        case 83: // L right ... S
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
            break;
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
        default:
            recalibrate = false;
            break;
    }
    if (recalibrate)
        keyboard.calibrate(calibration);

});
