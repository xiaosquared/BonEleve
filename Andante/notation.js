function Staff(noteSize) {
    this.noteSize = noteSize || 1;
    this.lineThickness = 0.08;
    this.trebleY = 10;

    this.geometry = node();
    this.treble = node();
    this.treble8ve = node();
    this.bass = node();
    this.bass8ve = node();

    this.geometry.add(this.treble);
    this.geometry.add(this.treble8ve);
    this.geometry.add(this.bass);
    this.geometry.add(this.bass8ve);
}
Staff.prototype.addToScene = function(material, darkMaterial, root, calibration) {
    root.add(this.geometry);
    this.geometry.position.x = keyboard.numKeys/2;
    this.geometry.scale.x = keyboard.numKeys/2;

    makeStaff(this.treble, darkMaterial, this.lineThickness, this.noteSize, this.trebleY);

    function makeStaff(parent, material, thickness, noteSize, y) {
        for (var i = 0; i < 5; i ++) {
            var line = cube(material);
            line.scale.set(1, thickness, thickness);
            line.position.y = y + i * noteSize;
            parent.add(line);
        }
    }
}
Staff.prototype.getNoteHeight = function(midi) {
    // hardcoded for now just to experiment :-P
    switch (midi) {
        case 62:
            return this.trebleY - this.noteSize/2;
            break;
        case 63:
            return this.trebleY - this.noteSize/2;
            break;
        case 64:
            return this.trebleY;
            break;
        case 65:
            return this.trebleY + this.noteSize * .5;
            break;
        case 66:
            return this.trebleY + this.noteSize * .5;
            break;
        case 67:
            return this.trebleY + this.noteSize * 1;
            break;
        case 68:
            return this.trebleY + this.noteSize * 1;
            break;
        case 69:
            return this.trebleY + this.noteSize * 1.5;
            break;
        case 70:
            return this.trebleY + this.noteSize * 1.5;
            break;
        case 71:
            return this.trebleY + this.noteSize * 2;
            break;
        case 72:
            return this.trebleY + this.noteSize * 2.5;
            break;
        case 73:
            return this.trebleY + this.noteSize * 2.5;
            break;
        case 74:
            return this.trebleY + this.noteSize * 3;
            break;
        case 75:
            return this.trebleY + this.noteSize * 3;
            break;
        case 76:
            return this.trebleY + this.noteSize * 3.5;
            break;
        default:
            return -1;
    }
}
