
var calibration = new Calibration();

var world = new World(calibration);
world.setup();

calibration.addToScene(world.scene);

var keyboard = new Keyboard(calibration);
keyboard.addToScene(world.material, world.darkMaterial, world.root);

var sequence = new AlteredScale(84);//new StepSequence();

var walkingNote = new FigureData(keyboard);
var puppet = new FigurePuppet(world.material);
puppet.buildFigure(walkingNote, world.material);
puppet.addToScene(world.root);

function animate() {
    var time = (new Date()).getTime() / 1000;
    var elapsed = this.time === undefined ? .03 : time - this.time;
    //console.log(elapsed);
    this.time = time;

    walkingNote.update(elapsed, keyboard);
    puppet.update(walkingNote);
    world.render();

    requestAnimationFrame(function() { animate(elapsed += 0.001); });
}


// When everything's done, call the loop
animate(world, walkingNote, puppet);

////////////////////////////////////////////////////////////////////////////////
