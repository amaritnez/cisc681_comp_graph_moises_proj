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
let spnskiTetra = null;


let controls = new function() {
    this.nbrLevels = 3;
    this.totalLength = 30.0;
    this.opacity = 0.8;
    this.color = '#d76500'; // I like orange
    this.Go = update;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'nbrLevels', 0, 6).step(1).name('Level Count').onChange(update);
    gui.add(controls, 'totalLength', 1.0, 150.0).name('Size').onChange(update);
    gui.add(controls, 'opacity', 0.0, 1.0).name('Opacity').onChange(update);
    gui.addColor(controls, 'color').onChange(update);
}

// Function that runs when the user updates the GUI settings
function update() {
    // If the tetrahedron exists
    if (spnskiTetra) {
        // Remove it from the global scene
        scene.remove(spnskiTetra);
    }
    // Make a new one
    let color = new THREE.Color(controls.color);
    let opacity = controls.opacity;
    let matArgs = {color: color, transparent: true, opacity: opacity};
    mat = new THREE.MeshLambertMaterial(matArgs);
    let geom = new THREE.TetrahedronGeometry(controls.totalLength);
    spnskiTetra = sierpinskiTetrahedron(controls.nbrLevels, mat, geom);
    scene.add(spnskiTetra);
}


function createScene() {
    // Create the scene
    scene = new THREE.Scene();
    // Setup material based on user settings
    let color = new THREE.Color(controls.color);
    let opacity = controls.opacity;
    let matArgs = {color: color, transparent: true, opacity: opacity};
    mat = new THREE.MeshLambertMaterial(matArgs);
    // Setup the initial tetrahedron here, before we call the function
    let geom = new THREE.TetrahedronGeometry(controls.totalLength);
    spnskiTetra = sierpinskiTetrahedron(controls.nbrLevels, mat, geom);
    // Setup lighting stuff
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(0, 0, 40);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(20, 40, -40);
    let ambientLight = new THREE.AmbientLight(0x333333);
    // Add everything to the root scene
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(spnskiTetra);
}
/**
 * Creates a Sierpinski tetrahedron by recursively creating smaller tetrahedrons and placing them in corners of bigger ones
 * @param {*} level how many iterations we will recursively call this function
 * @param {*} mat the material to use for the entire tetrahedron
 * @param {*} geom the original tetrahedron, pre-sierpinksi-fied; we need this to track the coordinates of
 * where to place the newly created tetrahedron as we iterate
 * @returns 
 */
function sierpinskiTetrahedron(level, mat, geom) {
    // Base case
    if (level == 0) {
        // Return the initial tetrahedron; this will be continuously small and will technically be the smallest one
        return new THREE.Mesh(geom, mat);
    } else {
        // Recursively call this function, constantly going down one level (making smaller and smaller tetrahedrons)
        let singleTetraMesh = sierpinskiTetrahedron(level-1, mat, geom);
        // Setup root for manipulation
        let root = new THREE.Object3D();
        // Scale our current tetrahedron by 1/2 as per requirements
        root.scale.set(1/2, 1/2, 1/2);
        // Iterate through each of the 4 vertices of the original tetrahedron
        // We will use their coordinates to place our new, smaller tetrahedron
        for (let v of geom.vertices) {
            // Close the previous iteration's set of tetrahedron
            let clone = singleTetraMesh.clone();
            // And place them at each corner of the current iteration
            // Doing so will leave the middle empty, creating the sierpinski carpet affect
            clone.position.set(v.x, v.y, v.z);
            // Add to the root to keep track (and so it can be stored for the next iteration)
            root.add(clone);
        }
        // return the root for the next iteration to shrink and reuse
        return root;
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
	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
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