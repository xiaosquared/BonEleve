/*
    Data for each key
*/
function Key(midi, x, y, isBlack) {
    this.midi = midi;
    this.x = x;
    this.y = y;
    this.pressedY = y - 0.5;
    this.isBlack = isBlack;
    this.geometry = node();
}
Key.prototype.pressedPosition = function() {
    this.geometry.position.y = this.pressedY;
}
Key.prototype.resetPosition = function() {
    this.geometry.position.y = this.y;
}
Key.prototype.setXY = function(x, y) {
    this.x = x;
    this.y = y;
    this.geometry.position.set(x, y, 0);
}

/*
    Virtual copy of locations of keyboard
*/
function Keyboard() {
    this.whiteKeyHeight = 0;
    this.blackKeyHeight = 1;
    this.keyWidth = 0.4;
    this.keyHeight = 0.1;
    this.geometry = node();
    this.midiMax = 108;
    this.midiMin = 21;
    this.numKeys = 88;

    this.keys = [];
    for (var i = 1; i < 1 + this.numKeys; i++) {
        var x = i;
        var y = 0;
        var isBlackKey = this.isBlack(i);
        var key = new Key(i + 20, x, y + (isBlackKey ? this.blackKeyHeight : this.whiteKeyHeight), isBlackKey);
        this.keys.push(key);
    }
    console.log("x0: " + this.keys[0].x);
    console.log("x87: " + this.keys[87].x);
    console.log(this.keys.length);
}
Keyboard.prototype.getWidth = function() {
    return this.keyWidth * this.numKeys;
}
Keyboard.prototype.isBlack= function(num) {
    var isBlack = [2, 5, 7, 10, 0]; //[1, 4, 6, 9, 11];
    for (var i = 0; i < isBlack.length; i++) {
        if (num % 12 == isBlack[i])
            return true;
    }
    return false;
}
Keyboard.prototype.calibrate = function() {
    for (var i = 1; i < 1 + this.numKeys; i++) {
        var x = i;
        var y = 0
        this.keys[i-1].setXY(x, y);
    }
}
Keyboard.prototype.getKeyFromX = function(x) {
    var diffThresh = 0.02;
    var result = this.keys.reduce(function(a, b) { if (Math.abs(b.x - x) < diffThresh)
                                                        return b;
                                                    else
                                                        return a;}, null);
    if (result)
        //console.log("getKeyFromX result: " + result.x);
    return result;
}
Keyboard.prototype.getNextKeyFromX = function(x) {
    var diffThresh = 0.02;
    for (var i = 0; i < this.keys.length; i++) {
        if (Math.abs(this.keys[i].x - x) < diffThresh) {
            if (i == 87)
                return this.keys[0];
            else
                return this.keys[i+1];
        }
    }
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

///////////////////////////////////////////////////////////////////////////////
// Disklavier support!

function MidiOut(output) {
    this.output = output;
}
MidiOut.prototype.noteOn = function(note, velocity) {
    velocity = velocity || 30;
    var noteOnMessage = [144, note, velocity];
    this.output.value.send(noteOnMessage);
    //console.log("Note On: " + noteOnMessage);
};
MidiOut.prototype.noteOff = function(note, velocity) {
    velocity = velocity || 30;
    var noteOffMessage = [128, note, velocity];
    for (var i = 0; i < 10; i++)
        this.output.value.send(noteOffMessage);
    //console.log("Note Off: " + noteOffMessage);
};
MidiOut.prototype.sendMsg = function(msg, time) {
    this.output.value.send(msg, time);
};
MidiOut.prototype.printIO = function() {
    console.log( "Output port [type:'" + this.output.type + "'] id:'" + this.output.id +
    "' manufacturer:'" + this.output.manufacturer + "' name:'" + this.output.name +
    "' version:'" + this.output.version + "'" );
}
MidiOut.prototype.flushNotes = function() {
    for (var i = 0; i < 21+88; i++) {

        var count = 0;
        while (count < 5) {
            this.output.value.send([128, i, 20]);
            count++;
        }
    }
}

var midiOut;
navigator.requestMIDIAccess().then(
    function(midiAccess) {
        console.log("Success!");
        var input = midiAccess.inputs.values().next();
        if (input)
            input.value.onmidimessage = onMIDIMessage;

        var output = midiAccess.outputs.values().next();
        if (output)
            midiOut = new MidiOut(output);

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
            sequence.addNote(note, vel, time);
            break;
        case 128:
            console.log("Note off " + note + " velocity " + vel + " time " + time)
            keyboard.getKey(note).resetPosition();
            break;
    }
}
