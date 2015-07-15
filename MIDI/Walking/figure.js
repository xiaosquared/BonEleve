function Step(stepSize, midi, vel, time) {
    this.stepSize = stepSize;
    this.midi = midi;
    this.velocity = vel;
    this.time = time || 1;
}

function StepSequence() {
    this.defaultMidi = [60, 62, 64, 65, 67, 69, 71, 72];
    this.defaultSteps = [1, 2, 2, 1, 2, 2, 2, 1];

    this.steps = [];
    this.timeout = 2000;
    this.prevTime = 0;
}
StepSequence.prototype.addNote = function(midi, vel, time) {
    console.log("adding note! " + midi + " time " + time);

    var step;
    if (this.steps.length == 0) {
        step = new Step(1, midi, vel);
        this.prevTime = time;
    }
    else {
        var stepSize = midi - this.steps[this.steps.length-1].midi;
        step = new Step(stepSize, midi, vel, (time - this.prevTime)/1000);
        this.prevTime = time;
    }
    this.steps.push(step);
}
StepSequence.prototype.getInitialPosition = function() {
    //var index = this.defaultMidi[0] - 22;
    //return keyboard.keys[index].x - keyboard.distBetweenKeys/2;

    var index = this.steps[0].midi - 22;
    return keyboard.keys[index].x - 0.5;
}
StepSequence.prototype.getLength = function() {
    //return this.defaultMidi.length;
    return this.steps.length;
}
StepSequence.prototype.getNote = function(index) {
    //return this.defaultMidi[index];
    return this.steps[index].midi;
}
StepSequence.prototype.getMidi = function(index) {
    return [this.steps[index].midi, this.steps[index].velocity];
}
StepSequence.prototype.getStepSize = function(index) {
    //return this.defaultSteps[index];
    if (index == 0)
        return 1;
    return this.steps[index].stepSize;
}
StepSequence.prototype.getSpeed = function(index) {
    if (index == 0)
        return 1;
    return 1/(this.steps[index].time*2);
}
StepSequence.prototype.isBlack = function(index, keyboard) {
    return keyboard.isBlack(this.steps[index].midi - 20);
}


/*
    Keeps track of an animated character's numbers
*/
function FigureData(keyboard) {
    // Constants
    this.size = 1;
    this.limbLength = 2.3;
    this.limbRadius = 0.15;
    this.footLift = 0.9;
    this.hipsForward = 0.3;
    this.hipsApart = 1.3;
    this.feetApart = 1.0;
    this.noteSize = 0.5;
    this.strideLength = 0.5;
    this.speed = 1;

    // moving parts
    this.t = 0;
    this.x = 0;
    this.y = -0;    // make the y based on which note he's stepping on
    this.xL = 0;
    this.xR = 0;
    this.Llift = 0;
    this.Rlift = 0;
    this.floorL = keyboard.whiteKeyHeight;
    this.floorR = keyboard.whiteKeyHeight;

    // moving around
    this.prevKey = null;
    this.stepIndex = 0;

    this.speed = 0.5;

}
FigureData.prototype.initSequence = function() {
    this.x = sequence.getInitialPosition();
}

FigureData.prototype.update = function(elapsed, keyboard) {
    if (world.isPaused) {
        this.stepIndex = 0;
        return;
    }

    var tPrev = this.t;
    this.speed = sequence.getSpeed(this.stepIndex);
    this.t += this.speed * elapsed;


    //console.log("elapsed: " + elapsed);


    if (tPrev % 0.5 > this.t % 0.5) {
        var midi = sequence.getMidi(this.stepIndex);
        midiOut.noteOn(midi[0], midi[1]);
        var noteOff;
        if (this.stepIndex != 0) {
            noteOff = sequence.getNote(this.stepIndex - 1);
            midiOut.noteOff(noteOff, 10);
        }

        this.stepIndex++;
   }

   if (this.stepIndex >= sequence.getLength()) {
        this.stepIndex = 0;
        world.isPaused = true;
    }

    var step = sequence.getStepSize(this.stepIndex);
    this.strideLength = lerp(0.1, this.strideLength, 0.5 * step);
    this.x += 4 * this.speed * elapsed * this.strideLength;

    // determines what type of step
    var f = this.t % 1.0;
    this.Llift = this.footLift * max(0, -sin(TAU * f));
    this.xL = this.strideLength * (f > 0.5 ? 4 * sCurve(f) - 3 : 1 - 4 * f);

    if (f > 0.5) {
        var isBlack = sequence.isBlack(this.stepIndex, keyboard);
        this.floorL = lerp(0.1, this.floorL, isBlack ? keyboard.blackKeyHeight : keyboard.whiteKeyHeight);
    }

    f = (this.t + 0.5) % 1.0;
    this.Rlift = this.footLift * max(0, -sin(TAU * f));
    this.xR = this.strideLength * (f > 0.5 ? 4 * sCurve(f) - 3 : 1 - 4 * f);

    if (f > 0.5) {
        var isBlack = sequence.isBlack(this.stepIndex, keyboard);
        this.floorR = lerp(0.1, this.floorR, isBlack ? keyboard.blackKeyHeight : keyboard.whiteKeyHeight);
    }

}

/*
    Keeps track of Figure's 3D rendered parts
*/
function FigurePuppet(material, root) {
    this.body = node();
    this.pelvis = cylinderZ(material);

    this.Lhip = globe(material);
    this.Lleg1 = node();
    this.Lknee = globe(material);
    this.Lleg2 = node();
    this.Lfoot = node();

    this.Rhip = globe(material);
    this.Rleg1 = node();
    this.Rknee = globe(material);
    this.Rleg2 = node();
    this.Rfoot = node();
}
FigurePuppet.prototype.buildFigure = function(figureData, material) {

    var r = figureData.limbRadius;
    var hipWidth = figureData.hipsApart;
    var l = figureData.limbLength;
    var nSize = figureData.noteSize;

    this.pelvis.scale.set(r, r, 1.0);
    this.Lhip.scale.set(r, r, r);
    this.Lknee.scale.set(r, r, r);
    this.Lhip.position.y = hipWidth/2;
    this.Lhip.position.z = 2;
    this.Rhip.scale.set(r, r, r);
    this.Rknee.scale.set(r, r, r);
    this.Rhip.position.y = -hipWidth/2;
    this.Rhip.position.z = 2;

    var Llim1 = cylinderZ()//material);
    var Llim2 = cylinderZ()//material);
    Llim1.scale.set(r, r, l/2);
    Llim2.scale.set(r, r, l/2);
    this.Lleg1.add(Llim1);
    this.Lleg2.add(Llim2);

    var Lnote = globe(material);
    Lnote.position.set(r - nSize, 0, l/2);
    Lnote.scale.set(nSize*1.05,nSize/2,nSize*0.8);
    Lnote.rotation.y = 0.5;
    this.Lleg2.add(Lnote);

    var Rlim1 = cylinderZ(material);
    var Rlim2 = cylinderZ(material);
    Rlim1.scale.set(r, r, l/2);
    Rlim2.scale.set(r, r, l/2);
    this.Rleg1.add(Rlim1);
    this.Rleg2.add(Rlim2);

    var Rnote = globe(material);
    Rnote.position.set(r - nSize, 0, l/2);
    Rnote.scale.set(nSize*1.05,nSize/2,nSize*0.8);
    Rnote.rotation.y = 0.5;
    this.Rleg2.add(Rnote);

    this.body.add(this.pelvis);
    this.body.add(this.Lleg1);
    this.body.add(this.Lknee);
    this.body.add(this.Lleg2);
    this.body.add(this.Rleg1);
    this.body.add(this.Rknee);
    this.body.add(this.Rleg2);
}
FigurePuppet.prototype.addToScene = function(root) {
    root.add(this.body);
    this.body.rotation.x = -Math.PI / 2;
}
FigurePuppet.prototype.update = function(figureData) {
    this.body.position.x = figureData.x;
    this.body.position.y = figureData.y;
    //console.log("x :" + this.body.position.x);

    this.Lfoot.position.x = figureData.xL;
    this.Lfoot.position.y = figureData.feetApart / 2;
    this.Lfoot.position.z = figureData.floorL + figureData.Llift;
    this.Rfoot.position.x = figureData.xR;
    this.Rfoot.position.y = - figureData.feetApart / 2;
    this.Rfoot.position.z = figureData.floorR + figureData.Rlift;
    this.Lhip.position.x = figureData.hipsForward;
    this.Rhip.position.x = figureData.hipsForward;

    //console.log("Lfoot x: " + this.Lfoot.position.x);
    //console.log("Rfoot x: " + this.Rfoot.position.x);

    var s = sqrt(figureData.limbLength * figureData.limbLength +
                figureData.hipsForward * figureData.hipsForward);
    this.Lhip.position.z = figureData.floorL + 1.88 * s +
                            figureData.Llift/2 + figureData.Rlift/4;
    this.Rhip.position.z = figureData.floorR + 1.88 * s +
                            figureData.Rlift/2 + figureData.Llift/4;

    this.pelvis.position.copy(this.Lhip.position).lerp(this.Rhip.position, 0.5);
    this.pelvis.lookAt(this.Lhip.position);

    var vec = new THREE.Vector3();
    var d = new THREE.Vector3();

    vec.copy(this.Lfoot.position).sub(this.Lhip.position);
    d.set(1, 0, 0);
    ik(figureData.limbLength, figureData.limbLength, vec, d);
    this.Lknee.position.copy(this.Lhip.position);
    this.Lknee.position.add(d);

    this.Lleg1.position.copy(this.Lhip.position).lerp(this.Lknee.position, 0.5);
    this.Lleg1.lookAt(this.Lknee.position);
    this.Lleg2.position.copy(this.Lknee.position).lerp(this.Lfoot.position, 0.5);
    this.Lleg2.lookAt(this.Lfoot.position);

    vec.copy(this.Rfoot.position).sub(this.Rhip.position);
    d.set(1, 0, 0);
    ik(figureData.limbLength, figureData.limbLength, vec, d);
    this.Rknee.position.copy(this.Rhip.position).add(d);

    this.Rleg1.position.copy(this.Rhip.position).lerp(this.Rknee.position, 0.5);
    this.Rleg1.lookAt(this.Rknee.position);
    this.Rleg2.position.copy(this.Rknee.position).lerp(this.Rfoot.position, 0.5);
    this.Rleg2.lookAt(this.Rfoot.position);

    function ik(a, b, C, D) {
       var cc = C.dot(C), x = (1 + (a*a - b*b)/cc) / 2, y = C.dot(D)/cc;
       D.set(D.x - y * C.x, D.y - y * C.y, D.z - y * C.z);
       y = sqrt(max(0,a*a - cc*x*x) / D.dot(D));
       D.set(x*C.x + y*D.x, x*C.y + y*D.y, x*C.z + y*D.z);
    }
}
