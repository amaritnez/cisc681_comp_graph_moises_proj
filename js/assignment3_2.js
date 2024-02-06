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


let controls = new function() {
    this.nbrObjs = 49;
    this.helixRadius = 2.0;
    this.angleRate = Math.PI / 4;
    this.helixHeight = 0.5;
    this.opacity = 1.0;
    this.shape = 'Sphere';
    this.objRadius = 1.0;
    this.objHeight = 1.0;
    this.colorType = 'Fixed';
    this.color = '#0000ff'; // The professor likes blue, start here
}

function initGui() {
    let gui = new dat.GUI();
    // Base helix settings
    let f1 = gui.addFolder('Helix');
    f1.open();
    f1.add(controls, 'nbrObjs', 1, 250).step(1).name('Object Count').onChange(update);
    f1.add(controls, 'helixRadius', 1.0, 75.0).name('Helix Radius').onChange(update);
    f1.add(controls, 'angleRate', Math.PI * -2, Math.PI * 2).name('Angle of Change').onChange(update);
    f1.add(controls, 'helixHeight', 0, 3.0).name('Stacking Height').onChange(update);
    // Shape selection and parameters
    let f2 = gui.addFolder('Shapes');
    f2.open();
    var shapes = ['Sphere', 'Cube', 'Tetrahedron', 'Octahedron', 'Cylinder', 'Torus'];
    f2.add(controls, 'shape', shapes).name('Object Shape').onChange(update);
    f2.add(controls, 'objRadius', 1.0, 25.0).name('Object Radius').onChange(update);
    f2.add(controls, 'objHeight', 1.0, 25.0).name('Object Height').onChange(update);
    // Color and appearance settings
    let f3 = gui.addFolder('Color');
    f3.open();
    f3.add(controls, 'opacity', 0.0, 1.0).name('Opacity').onChange(update);
    var colorTypes = ['Fixed', 'Uniform Random', 'Individual Random', 'Rainbow', 'Reverse Rainbow'];
    f3.add(controls, 'colorType', colorTypes).name('Color Pattern').onChange(update);
    f3.addColor(controls, 'color').name('Fixed Color').onChange(update);
}

// Function that runs when the user updates the GUI settings
function update() {
    // If the helix exists
    if (helix) {
        // Remove it from the global scene
        scene.remove(helix);
    }
    // Make a new one
    var mat = new THREE.MeshLambertMaterial({color: getHelixColor(), transparent: true, opacity: controls.opacity});
    var geom = createBaseGeometry();
    var mesh = new THREE.Mesh(geom, mat);
    helix = createHelix(mesh, controls.nbrObjs, controls.helixRadius, controls.angleRate, controls.helixHeight);
    scene.add(helix);
}

function createScene() {
    // Create the scene
    scene = new THREE.Scene();
    // Define object to "helix"-ify here
    var geom = createBaseGeometry();
    // Setup material stuff based on user settings
    var mat = new THREE.MeshLambertMaterial({color: getHelixColor(), transparent: true, opacity: controls.opacity});
    var mesh = new THREE.Mesh(geom, mat);
    // Actually make the helix
    helix = createHelix(mesh, controls.nbrObjs, controls.helixRadius, controls.angleRate, controls.helixHeight);
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
    scene.add(helix);
}

// Creates the original geometry to clone for the helix, based on user setting
function createBaseGeometry() {
    switch (controls.shape) {
        case 'Sphere':
            return new THREE.SphereGeometry(controls.objRadius, 12, 12);

        case 'Cube':
            return new THREE.BoxGeometry(controls.objRadius, controls.objRadius, controls.objRadius);

        case 'Tetrahedron':
            return new THREE.TetrahedronGeometry(controls.objRadius);

        case 'Octahedron':
            return new THREE.OctahedronGeometry(controls.objRadius);

        case 'Cylinder':
            return new THREE.CylinderGeometry(controls.objRadius, controls.objRadius, controls.objHeight);

        case 'Torus':
            return new THREE.TorusGeometry(controls.objRadius, controls.objHeight, 16, 100);

        // When in doubt, SPHERE
        default:
            return new THREE.SphereGeometry(controls.objRadius, 12, 12);
    }
}

/**
 * Creates the helix of object shapes
 * @param {*} object the original object, to be copied over and over to make the helix
 * @param {*} n the number of objects to make the helix with
 * @param {*} radius how far from the center (z-axis) each object will be
 * @param {*} angle the rate of change in angle for the helix; this is how much each object will rotate by as the helix grows
 * @param {*} dist the rate of change in height (z-distance) for the helix; this is how much each object will be above the previous
 * @returns 
 */
function createHelix(object, n, radius, angle, dist) {

    // Setup counters for angle/distance
    let nextAngle = angle;
    let nextDist = 0; // start at z=0, duh
    // Create the root to keep track of all our objects
    let helixRoot = new THREE.Object3D();
    // Iterate through n objects, making n clones for the helix
    for (let i = 0; i < n; i++) {
        // Clone the original object, and we will move the clone to its necessary position (without touching the original)
        let clone = object.clone();
        // Some user settings require each individual helix object to have a unique color, update it here
        if (controls.colorType != 'Fixed' && controls.colorType != 'Uniform Random') {
            clone.material = new THREE.MeshLambertMaterial({ color: getHelixColor(i), transparent: true, opacity: controls.opacity });
        }
        // Increase angle of rotation
        nextAngle += angle;
        // Increase z-distance (helix will grow)
        nextDist += dist;
        // Calculate the x/y angle cords along the circle of orbit
        // using the current angle
        let xCord = radius * Math.sin(nextAngle);
        let yCord = radius * Math.cos(nextAngle);
        // Update the position of the new object
        clone.position.set(xCord, yCord, nextDist);
        // Add it to the overall helix
        helixRoot.add(clone);
    }
    // Once done, this root should represent the entire helix
    return helixRoot;
}

/**
 * Used to get the desired color for a specific object within the helix
 * @param {*} index the specific index of the current object in the helix; needed for some colors. Defaults to 0 if not provided
 * @returns the color for this object's material
 */
function getHelixColor(index=0) {
    // Switch based on user setting
    switch (controls.colorType) {
        // Use the preset color from the user settings
        case 'Fixed':
            return controls.color;

        // Both cases return a random color, the difference is when in the program they are called
        // Uniform random gets called at start, and uses the same color for the whole helix
        // Individual gets called for each iteration within createHelix(), causing each shape to have its own color
        case 'Uniform Random':
        case 'Individual Random':
            return getRandomColor();

        // Create a rainbow where the first object is red and the last object is violet
        // Uses the current object's index to track where in the rainbow we are
        case 'Rainbow':
            let hue = parseFloat(index / controls.nbrObjs);
            return new THREE.Color().setHSL(hue, 1.0, 0.5);

        // Same as above, but we go backwards in rainbow order (start with violet, end with red)
        case 'Reverse Rainbow':
            let hue2 = parseFloat(1 - (index / controls.nbrObjs));
            return new THREE.Color().setHSL(hue2, 1.0, 0.5);

        // When in doubt, orange
        default:
            return '#d76500';
    }
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
	camera.position.set(0, 0, 100);
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