/***********
 * Project that creates a
 * pyramid of tori with a cherry
 * on top. Based on ziggurat project
 * Assignment 2 part 2
 * Moises Martinez
 * January 2024
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let helix = null;
let floor = null;
let boxes = null;


let controls = new function() {
    this.nbrObjs = 100;
    this.minSide = 5;
    this.maxSide = 20;
    this.minHeight = 5;
    this.maxHeight = 60;
    this.opacity = 0.8;
    this.Go = update;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'nbrObjs', 1, 200).step(1).name('Box Count');
    gui.add(controls, 'minSide', 1.0, 150.0).step(1).name('Box min width');
    gui.add(controls, 'maxSide', 1.0, 150.0).step(1).name('Box max width');
    gui.add(controls, 'minHeight', 1.0, 100).step(1).name('Box min height');
    gui.add(controls, 'maxHeight', 1.0, 100).step(1).name('Box max height');
    gui.add(controls, 'opacity', 0.0, 1.0).name('Opacity');
    gui.add(controls, 'Go').name('Generate');
}

// Function that runs when the user updates the GUI settings
function update() {
    // If the floor exists
    if (floor) {
        // Remove it from the global scene
        scene.remove(floor);
    }
    // Same logic for the boxes
    if (boxes) {
        scene.remove(boxes);
    }
    // Create generic grey rectangle base
    let baseGeom = new THREE.BoxGeometry(200, 1, 200);
    var mat = new THREE.MeshLambertMaterial({color: 'grey', transparent: true, opacity: 1.0});
    floor = new THREE.Mesh(baseGeom, mat);
    // Create new boxes
    boxes = randomBoxes(controls.nbrObjs, controls.minSide, controls.maxSide, controls.minHeight, controls.maxHeight, controls.opacity);
    // Add them to the scene
    scene.add(floor);
    scene.add(boxes);
}

function createScene() {
    // Create the scene
    scene = new THREE.Scene();


    // Create generic grey rectangle base
    let baseGeom = new THREE.BoxGeometry(200, 1, 200);
    var mat = new THREE.MeshLambertMaterial({color: 'grey', transparent: true, opacity: 1.0});
    floor = new THREE.Mesh(baseGeom, mat);
    // Create the actual randomized boxes, passing in the user settings for box generation
    boxes = randomBoxes(controls.nbrObjs, controls.minSide, controls.maxSide, controls.minHeight, controls.maxHeight, controls.opacity);
    // Add light stuff
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(0, 0, 40);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(20, 40, -40);
    let ambientLight = new THREE.AmbientLight(0x333333);
    // Add it all to the scene!
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    // scene.add(helix);
    scene.add(floor);
    scene.add(boxes);
}


function randomBoxes(nbrBoxes, minSide, maxSide, minHeight, maxHeight, opacity) {
    // Setup base root for the random boxes, this is what'll be returned in the end
    let baseroot = new THREE.Object3D();
    // Iterate for the number of desired boxes, making a new one each time
    for (let i = 0; i < nbrBoxes; i++) {
        var randomBox = new THREE.BoxGeometry(getRandomInt(minSide,maxSide), getRandomInt(minHeight,maxHeight), getRandomInt(minSide,maxSide));
        var material = new THREE.MeshLambertMaterial({ color: getRandomColor(), transparent: true, opacity: opacity});
        var randomMesh = new THREE.Mesh(randomBox, material);
        // Set to a random x/z position such that it won't extend beyond the floor
        // Y position is such that the box's bottom lies on top of the floor
        randomMesh.position.set(getRandomInt(-1 * ((floor.geometry.parameters.width / 2) - (randomMesh.geometry.parameters.width / 2)),
        (floor.geometry.parameters.width / 2) - (randomMesh.geometry.parameters.width / 2)),
        randomMesh.geometry.parameters.height / 2,
        getRandomInt(-1 * ((floor.geometry.parameters.depth / 2) - (randomMesh.geometry.parameters.depth / 2)),
            (floor.geometry.parameters.depth / 2) - (randomMesh.geometry.parameters.depth / 2)));
        // Add this box to the root when done
        baseroot.add(randomMesh);
    }
    return baseroot;
}

/**
 * Used to get a random color for the boxes
 * @returns the color for this object's material
 */
function getRandomColor() {
    return new THREE.Color().setHSL(getRandomFloat(0, 1.0), getRandomFloat(0.8, 0.95), getRandomFloat(0.3, 0.7));
}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}


function render() {
    let delta = clock.getDelta();
    cameraControls.update(delta);
	renderer.render(scene, camera);
}


function init() {
    // Setup canvas size to be that of the browser window on startup
	let canvasWidth = window.innerWidth;
	let canvasHeight = window.innerHeight;
	let canvasRatio = canvasWidth / canvasHeight;

    // Setup web gl renderer stuff
	renderer = new THREE.WebGLRenderer({antialias : true, preserveDrawingBuffer: true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(0x000000, 1.0);
    // Add the renderer to the HTML document
    document.body.appendChild( renderer.domElement );

    // Setup camera perspective stuff
	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 10000);
	camera.position.set(0, 250, 300);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Setup camera control stuff
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}


// Actually call our functions
init();
createScene();
initGui();
render();
animate();