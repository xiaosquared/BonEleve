function MidiOut(output) {
    this.output = output;
}
MidiOut.prototype.noteOn = function(note, velocity) {
    velocity = velocity || 30;
    var noteOnMessage = [144, note, velocity];
    this.output.value.send(noteOnMessage);
    console.log("Note On: " + noteOnMessage);
};
MidiOut.prototype.noteOff = function(note, velocity) {
    velocity = velocity || 30;
    var noteOffMessage = [128, note, velocity];
    for (var i = 0; i < 10; i++)
        this.output.value.send(noteOffMessage);
    console.log("Note Off: " + noteOffMessage);
};
MidiOut.prototype.sendMsg = function(msg, time) {
    this.output.value.send(msg, time);
};
MidiOut.prototype.printIO = function() {
    console.log( "Output port [type:'" + this.output.type + "'] id:'" + this.output.id +
    "' manufacturer:'" + this.output.manufacturer + "' name:'" + this.output.name +
    "' version:'" + this.output.version + "'" );
}

function NoteSequence() {
    this.data = []; // TYPE, NOTE, VEL, TIME
    this.timeOffset = 0;
    this.timeout = 2000;
}

NoteSequence.prototype.addNote = function (type, note, vel, time) {
    console.log("Adding Note: " + note + ", vel: " + vel);

    if (this.data.length == 0)
        this.timeOffset = time;
    this.data.push([type, note, vel, time - this.timeOffset]);
    this.length++;
};
NoteSequence.prototype.getLastTime = function() {
    return this.timeOffset + this.data[this.data.length-1][3];
};
NoteSequence.prototype.addNoteTimedOut = function(time) {
    if ((this.data.length == 0) || (this.data[this.data.length-1][1] == 144))
        return false;
    else return time - this.getLastTime() > this.timeout;
};
NoteSequence.prototype.playNotes = function(out) {
    var time = window.performance.now();
    this.data.forEach(function(entry) {
        var midiMsg = [entry[0], entry[1], entry[2]];
        var offset = entry[3];
        out.sendMsg(midiMsg, time + offset);
    });
};
NoteSequence.prototype.toString = function() {
    return this.data.toString();
};

function initMidi() {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({
            sysex:false
        }).then(onMIDISuccess, onMIDIFailure);
    } else
        console.log("No MIDI support in the browser");

    function onMIDISuccess(midiAccess) {
        console.log("Success!");
        var input = midiAccess.inputs.values().next();
        if (input)
            input.value.onmidimessage = onMIDIMessage;
        var output = midiAccess.outputs.values().next();

        if (!input || !output) {
            console.log("something wrong with IO");
            return null;
        }

        doThings(new MidiOut(output));
    }

    function onMIDIFailure(msg) {
        console.log("failed to get MIDI Access = " + msg);
    }

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
            case 128:
                addToSequence(type, note, vel, time);
                console.log("Note off " + note + " velocity " + vel + " time " + time)
                break;
        }

        function addToSequence(type, note, vel, time) {
            if (seq.addNoteTimedOut(time))
                seq = new NoteSequence();
            seq.addNote(type, note, vel, time);
        }
    }
}

var seq = new NoteSequence();
function doThings(out) {

    addEventListener("keydown", function(event) {
        console.log("key! " + event.keyCode);

        if (event.keyCode != 32)
            return;

        console.log(seq.toString());
        seq.playNotes(out);
    });
}

initMidi();