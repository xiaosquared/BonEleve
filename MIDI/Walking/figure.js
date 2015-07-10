/*
    Keeps track of an animated character's numbers
*/
function FigureData(keyboard) {
    // Constants
    this.size = 1;
    this.limbLength = 2.3;
    this.limbRadius = 0.1;
    this.footLift = 0.8;
    this.hipsForward = 0.37;
    this.hipsApart = 1.3;
    this.feetApart = 1.0;
    this.noteSize = 0.5;

    // moving parts
    this.t = 0;     // maybe t shouldn't be here
    this.x = 5;
    this.xL = 0;
    this.xR = 0;
    this.Llift = 0;
    this.Rlift = 0;
    this.floorL = keyboard.whiteKeyHeight;
    this.floorR = keyboard.whiteKeyHeight;
}
FigureData.prototype.update = function(elapsed, keyboard) {
    var tPrev = this.t;
    var speed = 1;  // hardcoded for now
    this.t += speed * elapsed;

    var step = 1;
    var strideLength = 0.5; // hardcoded for now. Eventually will be based on input

    this.x += 4 * speed * elapsed * strideLength;

    if (this.x >= 6)     // cheat for it to circle back when it gets to the end
        this.x -= 17;

    var f = this.t % 1.0;
    this.Llift = this.footLift * max(0, -sin(TAU * f));
    this.xL = strideLength * (f > 0.5 ? 4 * sCurve(f) - 3 : 1 - 4 * f);

    if (f > 0.5) {
        var isBlack = false;
        this.floorL = lerp(0.1,this.floorL,isBlack ? keyboard.blackKeyHeight : keyboard.whiteKeyHeight);
    }

    f = (this.t + 0.5) % 1.0;
    this.Rlift = this.footLift * max(0, -sin(TAU * f));
    this.xR = strideLength * (f > 0.5 ? 4 * sCurve(f) - 3 : 1 - 4 * f);

    if (f > 0.5) {
        var isBlack = false;
        this.floorR = lerp(0.1,this.floorR,isBlack ? keyboard.blackKeyHeight : keyboard.whiteKeyHeight);
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

    var Llim1 = cylinderZ(material);
    var Llim2 = cylinderZ(material);
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

/*
    Virtual copy of locations of keyboard
*/
function Keyboard() {
    this.whiteKeyHeight = -2;
    this.blackKeyHeight = this.whiteKeyHeight + 0.40 * 2;
    this.keyWidth = 0.25;
}
Keyboard.prototype.addToScene = function(material, root) {
    var isBlackKey = [false,true,false,true,false,false,
                      true,false,true,false,true,false];
    for (var i = 1 ; i < 20 ; i++) {
       var c = cube(material);
       var y = isBlackKey[(i + 11) % 12] ? this.whiteKeyHeight :
                                            this.blackKeyHeight;
       c.position.set((i - 12), y/2 - 1.3, 0);
       c.scale.set(.25,.01,.25);
       root.add(c);
    }
}

///////////////////////////////////////////////////////////////////////////////
// Set the Scene
function World() {
    this.renderer = new THREE.WebGLRenderer();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(4.5,width()/height(),1,1000);
    this.camera.position.z = 250;
    this.root = node();
    this.time = 0;

    this.material = phongMaterial(0xffffff, 0x000000, 0x000000, 30);
    this.darkMaterial = phongMaterial(0x202020, 0x000000, 0x000000, 20);
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

var world = new World();
world.setup();

var keyboard = new Keyboard();
keyboard.addToScene(world.darkMaterial, world.root);

var walkingNote = new FigureData(keyboard);
var puppet = new FigurePuppet(world.material);
puppet.buildFigure(walkingNote, world.material);
puppet.addToScene(world.root);


animate(world, walkingNote, puppet);


///////////////////////////////////////////////////////////////////////////////

function width() { return window.innerWidth; }
function height() { return window.innerHeight; }
window.addEventListener('resize', function() {
   world.renderer.setSize(width(), height());
   world.camera.aspect = width() / height();
   world.camera.updateProjectionMatrix();
});

///////////////////////
// UTILITY FUNCTIONS //
///////////////////////

var TAU = 2 * Math.PI;
function abs(t) { return Math.abs(t); }
function atan(t) { return Math.atan(t); }
function atan2(a,b) { return Math.atan2(a,b); }
function cos(t) { return Math.cos(t); }
function floor(t) { return Math.floor(t); }
function lerp(t,a,b) { return a + t * (b - a); }
function max(a,b) { return Math.max(a,b); }
function min(a,b) { return Math.min(a,b); }
function pow(a,b) { return Math.pow(a,b); }
function rnd() { return Math.rnd(); }
function sCurve(t) { return max(0, min(1, t * t * (3 - t - t))); }
function sin(t) { return Math.sin(t); }
function sqrt(t) { return Math.sqrt(t); }
function tan(t) { return Math.tan(t); }

function phongMaterial(ambient, diffuse, shiny, power) {
   return new THREE.MeshPhongMaterial({
      emissive : ambient,
      color    : diffuse,
      specular : shiny,
      shininess: power
   });
}

function node() {
   return new THREE.Mesh();
}

function cube(material) {
   var geometry = new THREE.CubeGeometry(2, 2, 2);
   return new THREE.Mesh(geometry, material);
}

function globe(material, m, n) {
   if (m === undefined) m = 32;
   if (n === undefined) n = floor(m / 2);
   var geometry = new THREE.SphereGeometry(1, m, n);
   return new THREE.Mesh(geometry, material);
}

function cylinder(material, n) {
   if (n === undefined) n = 24;
   var geometry = new THREE.CylinderGeometry(1, 1, 2, n, 1, false);
   return new THREE.Mesh(geometry, material);
}

function cylinderZ(material, n) {
   if (n === undefined) n = 24;
   var myNode = new node();
   var geometry = new THREE.CylinderGeometry(1, 1, 2, n, 1, false);
   var myShape = new THREE.Mesh(geometry, material);
   myShape.rotation.x = Math.PI / 2;
   myNode.add(myShape);
   return myNode;
}

function ambientLight(color) {
   return new THREE.AmbientLight(color);
}

function directionalLight(x, y, z, color) {
   var myLight = new THREE.DirectionalLight(color);
   myLight.position.set(x,y,z).normalize();
   return myLight;
}