
var world = new World();
world.setup();

var calibration = new Calibration(world.root);

var sequence = new StepSequence();

var keyboard = new Keyboard(calibration);
keyboard.addToScene(world.material, world.darkMaterial, world.root);

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

window.addEventListener('resize', function() {
   world.renderer.setSize(width(), height());
   world.camera.aspect = width() / height();
   world.camera.updateProjectionMatrix();
});
function width() { return window.innerWidth; }
function height() { return window.innerHeight; }
