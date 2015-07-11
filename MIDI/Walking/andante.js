
var world = new World();
world.setup();

var calibration = new Calibration(world.root);

var keyboard = new Keyboard(calibration);
keyboard.addToScene(world.material, world.darkMaterial, world.root);

var walkingNote = new FigureData(keyboard);
var puppet = new FigurePuppet(world.material);
puppet.buildFigure(walkingNote, world.material);
puppet.addToScene(world.root);

// When everything's done, call the loop
animate(world, walkingNote, puppet);

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

///////////////////////////////////////////////////////////////////////////////
// Disklavier support!

navigator.requestMIDIAccess().then(
    function(midiAccess) {
        console.log("Success!");
        var input = midiAccess.inputs.values().next();
        if (input)
            input.value.onmidimessage = onMIDIMessage;
        var output = midiAccess.outputs.values().next();

        if (!input || !output) {
            console.log("something wrong with IO");
            return null;
        }

    },
    function(err) { console.log("Failed to get MIDI access - " + err); }
);

function onMIDIMessage(event) {
    var data = event.data,
    cmd = data[0] >> 4,
    channel = data[0] & 0xf,
    type = data[0] & 0xf0, // channel agnostic message type. Thanks, Phil Burk.
    note = data[1],
    vel = data[2];
    var time = event.timeStamp;

    switch(type) {
        case 144:
            console.log("Note on " + note + " velocity " + vel + " time " + time)
            keyboard.getKey(note).pressedPosition();
            break;
        case 128:
            console.log("Note off " + note + " velocity " + vel + " time " + time)
            keyboard.getKey(note).resetPosition();
            break;
    }
}

////////////////////////////////////////////////////////////////////////////////

window.addEventListener('resize', function() {
   world.renderer.setSize(width(), height());
   world.camera.aspect = width() / height();
   world.camera.updateProjectionMatrix();
});
function width() { return window.innerWidth; }
function height() { return window.innerHeight; }
