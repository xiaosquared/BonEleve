function Step(stepSize, midi, vel, time) {
    this.stepSize = stepSize;
    this.midi = midi;
    this.velocity = vel || 10;
    this.time = time || 1;
}

function StepSequence() {
    this.steps = [];
    this.stepIndex = 0;
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
        console.log(stepSize);
    }
    this.steps.push(step);
}
StepSequence.prototype.getInitialPosition = function(keyboard) {
    var index = this.steps[0].midi - 22;
    return keyboard.keys[index].x - 0.5;
}
StepSequence.prototype.incrementStep = function() {
    if (this.stepIndex < this.steps.length - 1) {
        this.stepIndex++;
        return false;
    } else return true;
}
StepSequence.prototype.reset = function() {
    this.stepIndex = 0;
}
StepSequence.prototype.getNextStep = function() {
    return this.steps[this.stepIndex];
}
StepSequence.prototype.getPrevStep = function() {
    if (this.stepIndex == 0) { return null; }
    else { return this.steps[this.stepIndex - 1]; }
}
StepSequence.prototype.getLength = function() {
    return this.steps.length;
}
StepSequence.prototype.getNote = function(index) {
    return this.steps[index].midi;
}
StepSequence.prototype.getMidi = function(index) {
    return [this.steps[index].midi, this.steps[index].velocity];
}
StepSequence.prototype.getStepSize = function(index) {
    return this.steps[index].stepSize;
}
StepSequence.prototype.getSpeed = function(index) {
    if (index == 0)
        return 1;
    return 1/(this.steps[index].time*2);
}
StepSequence.prototype.isBlack = function(keyboard) {
    return keyboard.isBlack(this.getNextStep().midi - 20);
}

////////////////////////////////////////////////////////////////////////////////
function Scale(start, stepSizes) {
    var firstNote = start || 60;
    this.stepSizes = stepSizes || [2, 2, 1, 2, 2, 2, 1];
    this.stepIndex = 0;

    this.prevStep = null;
    this.step = new Step(1, start);

    this.goingUp = true;

    // var step = new Step(1, start);
    // this.steps.push(step);
    // for (var i = 0; i < this.stepSizes.length; i ++) {
    //     var prevNote = this.steps[i].midi;
    //     var step = new Step(this.stepSizes[i], prevNote + this.stepSizes[i]);
    //     this.steps.push(step);
    // }
}
Scale.prototype = Object.create(StepSequence.prototype);
Scale.prototype.setDirection = function(goingUp) {
    // if (this.goingUp == goingUp)
    //     return;
    // this.goingUp = goingUp;
    // if (goingUp)
    //     this.prevStep =
}
Scale.prototype.printNotes = function(){
    var str = "";
    var prevNote = this.step.midi;
    str += prevNote;
    for (var i = 0; i < this.stepSizes.length; i++) {
        var nextNote = prevNote + this.stepSizes[i];
        str = str + " " + nextNote;
        prevNote = nextNote;
    }
    console.log(str);
}
Scale.prototype.getInitialPosition = function() {
    var index = this.step.midi - 22;
    return keyboard.keys[index].x - 0.5;
}
Scale.prototype.incrementStep = function(figure) {
    if (this.goingUp) {
        this.stepIndex++;
        if (this.stepIndex == this.stepSizes.length) {
            this.stepIndex = 0;
        }
    } else {
        this.stepIndex--;
        if (this.stepIndex < 0)
            this.stepIndex = this.stepSizes.length - 1;
    }
    this.prevStep = this.step;
    var prevNote = this.step.midi;
    var stepSize = this.stepSizes[this.stepIndex];
    if (this.goingUp)
        this.step = new Step(stepSize, prevNote + stepSize);
    else
        this.step = new Step(stepSize, prevNote - stepSize);
    return false;
}
Scale.prototype.getNextStep = function() {
    return this.step;
}
Scale.prototype.getPrevStep = function() {
    return this.prevStep;
}

function Chromatic(start) {
    Scale.call(this, start || 22, [1, 1, 1, 1]);
}
Chromatic.prototype = Object.create(Scale.prototype);
// Chromatic.prototype.incrementStep = function() {
//     this.stepIndex ++;
//     if (this.stepIndex > 1)
//         this.stepIndex = 0;
// }
// Chromatic.prototype.getNextStep = function() {
//
// }

function AlteredScale(start) {
    Scale.call(this, start || 60, [1, 2, 1, 2, 2, 2, 2]);
}
AlteredScale.prototype = Object.create(Scale.prototype);

function NaturalMinor(start) {
    Scale.call(this, start || 60, [2, 1, 2, 2, 1, 2, 2]);
}
NaturalMinor.prototype = Object.create(Scale.prototype);

var cMajor = new Scale(60);
cMajor.printNotes();

var cAltered = new AlteredScale(60);
cAltered.printNotes();

var cMinor = new NaturalMinor(60);
cMinor.printNotes();
