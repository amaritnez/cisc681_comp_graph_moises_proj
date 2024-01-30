/***********
 * Project that creates a
 * torus covered with 
 * starburts on its surface
 * for assignment 2 part 1
 * Moises Martinez
 * January 2024
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();
let torus = null;

// Code for Gui //

// Settings to control both the torus and starburts
let controls = new function() {
    // Torus parameters
    this.torusRadius = 100.0;
    this.tubeRadius = 25.0;
    // Starburst parameters
    this.nbrBursts = 400;
    this.burstRadius = 10.0;
    this.maxRays = 65;
    this.Go = update;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'torusRadius', 1.0, 250.0).name('Major radius');
    gui.add(controls, 'tubeRadius', 1.0, 50.0).name('Minor radius');
    gui.add(controls, 'nbrBursts', 5, 2000).step(5).name('Nbr of bursts');
    gui.add(controls, 'burstRadius', 0.1, 15.0).name('Burst radius');
    gui.add(controls, 'maxRays', 5, 200).name('Max nbr of rays');
    gui.add(controls, 'Go');
}

// Function that runs when the user presses "Go"; creates a new torus with updated settings
function update() {
    // If a torus exists
    if (torus) {
        // Remove it from the root scene
        scene.remove(torus);
    }
    // Make a new torus
    createTorus();
}

// Function that creates the actual torus shape, along with all the starbursts
// Adds the final shape + starbursts to the root scene as well
function createTorus() {
    // Create the torus object; this is the parent of the starburts, and is located in the center of the root scene
    torus = new THREE.Object3D();
    // Create the desired number of starburts that orbit randomly around the center
    for (let i=0; i < controls.nbrBursts; i++) {
        // Get a single random starburst
        let singleCreatedStarburst = starburst();
        // Get a random spot on the torus's surface and set this starburst to it
        let randomCord = calculateTorusSpot(getRandomFloat(0, 2*Math.PI), getRandomFloat(0, 2*Math.PI));
        singleCreatedStarburst.position.set(randomCord.x, randomCord.y, randomCord.z);
        // Add this created starburst to the parent scene (the torus)
        torus.add(singleCreatedStarburst);
    }
    // Add it to the root scene
    scene.add(torus);
}

/**
 * function to calculate a random spot on the torus's surface
 * @param {*} torusAngle angle along the circle of the full torus this point will be on
 * @param {*} tubeAngle angle of the circle inside the tube
 * @returns the 3d coordinates of the random spot
 */
function calculateTorusSpot(torusAngle, tubeAngle) {
    let x = (controls.torusRadius + controls.tubeRadius * Math.cos(tubeAngle)) * Math.cos(torusAngle);
    let y = (controls.torusRadius + controls.tubeRadius * Math.cos(tubeAngle)) * Math.sin(torusAngle);
    let z = controls.tubeRadius * Math.sin(tubeAngle);
    return new THREE.Vector3(x, y, z);
}

/**
 * function to make a singular starburst
 * @returns the created starburst
 */
function starburst() {
    let origin = new THREE.Vector3(0, 0, 0);
    let innerColor = getRandomColor(0.8, 0.1, 0.8);
    let black = new THREE.Color(0x000000);
    let geom = new THREE.Geometry();
    // Get random number between 1 and desired setting for ray count
    let nbrRays = getRandomInt(1, controls.maxRays);
    // The professor likes these smaller starbursts, so lets make them appear every so often
    if (Math.random() < 0.15) {
        nbrRays = getRandomInt(4, 25);
    }
    // Create each individual ray
    for (let i = 0; i < nbrRays; i++) {
        // dest is a point on some origin-centered sphere
        // of radius between 0.1 and burst radius setting
        let r = getRandomFloat(0.1, controls.burstRadius);
        let dest = getRandomPointOnSphere(r);
        geom.vertices.push(origin, dest);
        geom.colors.push(innerColor, black);
    }
    let args = {vertexColors: true, linewidth: 2};
    let mat = new THREE.LineBasicMaterial(args);
    return new THREE.Line(geom, mat, THREE.LineSegments);
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

    // Sets up the root scene
	scene = new THREE.Scene();

    // Setup web gl renderer stuff
	renderer = new THREE.WebGLRenderer({antialias : true, preserveDrawingBuffer: true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(0x000000, 1.0);
    // Add the renderer to the HTML document
    document.body.appendChild( renderer.domElement );

    // Setup camera perspective stuff
	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(-225, -137, 500);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Setup camera control stuff
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}


// Actually call our functions
init();
createTorus();
initGui();
render();
animate();