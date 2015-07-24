/*
    Keeps track of an animated character's numbers
*/
function FigureData(keyboard) {
    // Constants
    this.size = 1;
    this.limbLength = 2.3;
    this.limbRadius = 0.2;
    this.footLift = 0.9;
    this.hipsForward = 0.3;
    this.hipsApart = 1.3;
    this.feetApart = 1.0;
    this.noteSize = 0.5;
    this.strideLength = 0.5;
    this.headHeight = 2;
    this.headSize = 0.5;
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
    this.headBob = 0;
    this.note = 0;

    // flags
    this.faceUp = true;
    this.queueTurn = false;
    this.lastStep = false;
}
FigureData.prototype.setSpeed = function(speed) {
    this.speed = speed;
}
FigureData.prototype.initSequence = function(sequence, keyboard) {
    this.stepIndex = 0;
    this.x = sequence.getInitialPosition(keyboard);
}
FigureData.prototype.setDirection = function(figurePuppet, up) {
    this.faceUp = up;
    if (this.faceUp)
        this.hipsForward = Math.abs(this.hipsForward);
    else
        this.hipsForward = -Math.abs(this.hipsForward);
    figurePuppet.setDirection(this, this.faceUp);
}
FigureData.prototype.update = function(elapsed, keyboard) {
    if (world.isPaused)
        return;

    var tPrev = this.t;
    this.t += this.speed * elapsed;
    if (tPrev % 0.5 > this.t % 0.5) {
        this.note = handleMIDI(sequence, keyboard);
        var last = sequence.incrementStep(this);
        if (last)
            this.lastStep = true;
    }

    var deltaX = 4 * this.speed * elapsed * this.strideLength;
    if (this.faceUp) { this.x += deltaX;}
    else { this.x -= deltaX; }

    this.headBob = -cos(TAU * (this.t*2 % 1));

    var isBlack = sequence.isBlack(keyboard);
    moveFoot(this.t % 1.0, this, keyboard, isBlack, true);
    moveFoot((this.t + 0.5) % 1.0, this, keyboard, isBlack, false);

    if (shiftWeight(this)) {
        if (this.queueTurn) {
            sequence.turn();
            this.setDirection(puppet, !this.faceUp);
            this.queueTurn = false;
        }

        this.strideLength = 0.5 * sequence.getNextStep().stepSize;
        if (sequence.getPrevStep())
            this.x = keyboard.getKey(sequence.getPrevStep().midi).x;

        if (this.lastStep) {  // WHAT WE DO AT THE VERY END
          this.lastStep = false;
        }
    }

    function handleMIDI(sequence, keyboard) {
        var step = sequence.getNextStep();
        keyboard.getKey(step.midi).pressedPosition();
        //midiOut.noteOn(step.midi, 10);

        var prevStep = sequence.getPrevStep();
        if (prevStep) {
            keyboard.getKey(prevStep.midi).resetPosition();
            //midiOut.noteOff(prevStep.midi, 10);
        }
        return step.midi;
    }

    function moveFoot(f, figure, keyboard, isBLack, leftFoot) {
        var lift = figure.footLift * max(0, -sin(TAU * f));
        var dx = figure.strideLength * (f > 0.5 ? 4 * sCurve(f) - 3 : 1 - 4 * f);
        if (!figure.faceUp) { dx = -dx; }

        if (leftFoot) {
            figure.Llift = lift;
            figure.xL = dx;
            if (f > 0.5)
                figure.floorL = lerp(0.1, figure.floorL, isBlack ? keyboard.blackKeyHeight : keyboard.whiteKeyHeight);
        } else {
            figure.Rlift = lift;
            figure.xR = dx;
            if (f > 0.5)
                figure.floorR = lerp(0.1, figure.floorR, isBlack ? keyboard.blackKeyHeight : keyboard.whiteKeyHeight);
        }
    }

    function shiftWeight(figure) {
        return Math.abs(figure.xR - figure.xL) < 0.15;
    }
}

/*
    Keeps track of Figure's 3D rendered parts
*/
function FigurePuppet(material, material2) {
    this.body = node();
    this.pelvis = cylinderZ(material);

    this.Lhip = globe(material2);
    this.Lleg1 = node();
    this.Lknee = globe(material2);
    this.Lleg2 = node();
    this.Lfoot = node();
    this.Lnote = globe(material2);

    this.Rhip = globe(material);
    this.Rleg1 = node();
    this.Rknee = globe(material);
    this.Rleg2 = node();
    this.Rfoot = node();
    this.Rnote = globe(material);

    this.head = globe(material);
}
FigurePuppet.prototype.buildFigure = function(figureData, material, material2) {

    var r = figureData.limbRadius;
    var hipWidth = figureData.hipsApart;
    var l = figureData.limbLength;
    var nSize = figureData.noteSize;
    var hSize = figureData.headSize;

    this.head.scale.set(hSize*0.8,hSize/2,hSize);
    this.head.rotation.y = -0.5;

    this.pelvis.scale.set(r, r, 1.0);
    this.Lhip.scale.set(r, r, r);
    this.Lknee.scale.set(r, r, r);
    this.Lhip.position.y = hipWidth/2;
    this.Lhip.position.z = 2;
    this.Rhip.scale.set(r, r, r);
    this.Rknee.scale.set(r, r, r);
    this.Rhip.position.y = -hipWidth/2;
    this.Rhip.position.z = 2;

    var Llim1 = cylinderZ(material2);
    var Llim2 = cylinderZ(material2);
    Llim1.scale.set(r, r, l/2);
    Llim2.scale.set(r, r, l/2);
    this.Lleg1.add(Llim1);
    this.Lleg2.add(Llim2);

    this.Lnote.position.set(r - nSize, 0, l/2);
    this.Lnote.scale.set(nSize*1.05,nSize/2,nSize*0.8);
    this.Lnote.rotation.y = 0.5;
    this.Lleg2.add(this.Lnote);

    var Rlim1 = cylinderZ(material);
    var Rlim2 = cylinderZ(material);
    Rlim1.scale.set(r, r, l/2);
    Rlim2.scale.set(r, r, l/2);
    this.Rleg1.add(Rlim1);
    this.Rleg2.add(Rlim2);

    this.Rnote.position.set(r - nSize, 0, l/2);
    this.Rnote.scale.set(nSize*1.05,nSize/2,nSize*0.8);
    this.Rnote.rotation.y = 0.5;
    this.Rleg2.add(this.Rnote);

    this.body.add(this.head);
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
FigurePuppet.prototype.setDirection = function(figure, faceUp) {
    var footTurn, footX;
    if (faceUp) {
        footTurn = 0.5;
        footX = figure.limbRadius - figure.noteSize;

    } else {
        footTurn = -0.5;
        footX = figure.limbRadius + figure.noteSize/2.5;
    }

    this.head.rotation.y = -footTurn;

    this.Lnote.rotation.y = footTurn;
    this.Lnote.position.set(footX, 0, figure.limbLength/2);

    this.Rnote.rotation.y = footTurn;
    this.Rnote.position.set(footX, 0, figure.limbLength/2);
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


    var s = sqrt(figureData.limbLength * figureData.limbLength +
                figureData.hipsForward * figureData.hipsForward);
    this.Lhip.position.z = figureData.floorL + 1.88 * s +
                            figureData.Llift/2 + figureData.Rlift/4;
    this.Rhip.position.z = figureData.floorR + 1.88 * s +
                            figureData.Rlift/2 + figureData.Llift/4;

    this.pelvis.position.copy(this.Lhip.position).lerp(this.Rhip.position, 0.5);
    this.pelvis.lookAt(this.Lhip.position);

    this.head.position.x = figureData.hipsForward;
    var staffPosition = staff.getNoteHeight(figureData.note);
    if (staffPosition < 0)
        this.head.position.z = figureData.headHeight + Math.max(this.Lhip.position.z, this.Rhip.position.z) + figureData.headBob/4;
    else
        this.head.position.z = lerp(0.1, this.head.position.z, staff.getNoteHeight(figureData.note) + figureData.headBob/6);

    var vec = new THREE.Vector3();
    var d = new THREE.Vector3();

    vec.copy(this.Lfoot.position).sub(this.Lhip.position);
    d.set(1, 0, 0);
    if (!figureData.faceUp)
        d.set(-1, 0, 0);
    ik(figureData.limbLength, figureData.limbLength, vec, d);
    this.Lknee.position.copy(this.Lhip.position);
    this.Lknee.position.add(d);

    this.Lleg1.position.copy(this.Lhip.position).lerp(this.Lknee.position, 0.5);
    this.Lleg1.lookAt(this.Lknee.position);
    this.Lleg2.position.copy(this.Lknee.position).lerp(this.Lfoot.position, 0.5);
    this.Lleg2.lookAt(this.Lfoot.position);

    vec.copy(this.Rfoot.position).sub(this.Rhip.position);
    d.set(1, 0, 0);
    if (!figureData.faceUp)
        d.set(-1, 0, 0);
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
