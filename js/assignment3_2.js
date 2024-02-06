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
let ziggurat = null;


let controls = new function() {
    this.nbrTori = 15;
    this.torusRadius = 150.0;
    this.tubeRadius = 5.0;
    this.opacity = 0.8;
    this.colorType = 'Random';
    this.Go = update;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'nbrTori', 1.0, 30.0).step(1).name('Number of tori');
    gui.add(controls, 'torusRadius', 1.0, 250.0).name('First torus radius');
    gui.add(controls, 'tubeRadius', 1.0, 15.0).step(1).name('Torus height');
    gui.add(controls, 'opacity', 0.0, 1.0).name('Opacity');
    var colorTypes = ['Random', 'Rainbow'];
    gui.add(controls, 'colorType', colorTypes).name('Color Pattern');
    gui.add(controls, 'Go');
}

// Function that runs when the user presses "Go"; creates a new torus pyramid with updated settings
function update() {
    // If the pyramid exists
    if (ziggurat) {
        // Remove it from the global scene
        scene.remove(ziggurat);
    }
    // Make a new one
    createScene();
}

// Create the torus ziggurat feat. the cherry on top
function createScene() {
    // Sets up the global scene
	scene = new THREE.Scene();
    // Create the pyramid of torus ziggurat + cherry and add it to the global scene
    ziggurat = torusZiggurat(controls.nbrTori, controls.tubeRadius * 2, 0.9);
    scene.add(ziggurat);
}

function createSceneTest() {
    scene = new THREE.Scene();
    let color = new THREE.Color(controls.color);
    let opacity = controls.opacity;
    let matArgs = {color: color, transparent: true, opacity: opacity};
    mat = new THREE.MeshLambertMaterial(matArgs);

    // Define object to "helix"-ify here
    var mat = new THREE.MeshLambertMaterial({color: 'blue'});
    var geom = new THREE.SphereGeometry(1, 12, 12);
    var mesh = new THREE.Mesh(geom, mat);
    var helix = createHelix(mesh, 6, 2, Math.PI / 4, 0.5);
    // cantor = makeCantor(retainSierpinskiCarpet, 0, mat, 30);
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light.position.set(0, 0, 40);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000 );
    light2.position.set(20, 40, -40);
    let ambientLight = new THREE.AmbientLight(0x333333);
    // scene.add(makeFloor());
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
    scene.add(helix);
}

function createHelix(object, n, radius, angle, dist) {
    let helixRoot = new THREE.Object3D();
    if (n == 0)
    {
        return object;
    }
    else
    {
        angle += angle;
        dist += dist;
        let subObject = createHelix(object, n-1, radius, angle, dist);
        let clone = subObject.clone();
        // Get angle of this cord, based on current vertex index
        // angle += angle; // parseFloat((360/n) * i);
        // Assume first vertex has x = 0
        let xCord = radius * Math.sin(angle);
        let yCord = radius * Math.cos(angle);
        clone.position.set(xCord, yCord, dist);
        helixRoot.add(clone);
    }
    return helixRoot;
}

function makeCantor3(retainF, level, mat, len=1) {
    if (level == 0) {
        let geom = new THREE.BoxGeometry(len, len, len);
        return new THREE.Mesh(geom, mat);
    } else {
        let cantor = makeCantor3(retainF, level-1, mat, len);
        let root = new THREE.Object3D();
        root.scale.set(1/3, 1/3, 1/3);
        for (x of [-len, 0, len]) {
            for (y of [-len, 0, len]) {
                for (z of [-len, 0, len]) {
                    if (retainF(x, y, z, len)) {
                        let clone = cantor.clone();
                        clone.position.set(x, y, z);
                        root.add(clone);
                    }
                }
            }
        }
        return root;
    }
}
 
function retainSierpinskiCube(x, y, z, len) {
    return (Math.abs(x) + Math.abs(y) + Math.abs(z)) > len;
}

function makeCantor(retainF, level, mat, len=10) {
    if (level == 0) {
        let geom = new THREE.TetrahedronGeometry(len);
        return new THREE.Mesh(geom, mat);
    } else {
        let cantor = makeCantor(retainF, level-1, mat, len);
        let root = new THREE.Object3D();
        root.scale.set(1/3, 1, 1/3);
        for (x of [-len, 0, len]) {
            for (z of [-len, 0, len]) {
                if (retainF(x, z, len)) {
                    let clone = cantor.clone();
                    clone.position.set(x, 0, z);
                    root.add(clone);
                }
            }
        }
        return root;
    }
}

function retainCantor(x, z, len) {
    return (Math.abs(x) + Math.abs(z)) > len;
}

function retainSierpinskiCarpet(x, z, len) {
    return (Math.abs(x) + Math.abs(z)) > 0;
}

/**
 * Creates the actual pyramid of tori + the cherry, using the ziggurate template as a base
 * @param {*} nbrTori how many tori to make; note this doesn't count the cherry, so the total shapes is nbrTori + 1
 * @param {*} height how tall each invidual torus will be; this corresponds to the torus's minor radius * 2
 * @returns the root scene containing the entire pyramid of tori + cherry
 */
function torusZiggurat(nbrTori, height) {
    /**
     * Create an arbitrary linear graph of index-majorRadius, where first entry is the first torus (0, controls.torusRadius)
     * and the last entry is the cherry, whose radius will be the tori's minor radius (controls.tubeRadius, nbrTori)
     * So find the slope for our graph; this will be the scale factor for the major radius
     */
    let slope = (controls.tubeRadius - controls.torusRadius)/(nbrTori);
    // Setup first radius, it's just the user-defined setting
    let majorRadius = controls.torusRadius;
    // The z-position of the next torus, will continuously be updated as we make more tori
    let zpos = 0.0;
    // Setup root scene
    root = new THREE.Object3D();
    // Iterate through the number of desired tori and create each one, adding it to the root scene
    for (let i = 0; i < nbrTori; i++) {
        // First we update the radius for the next torus based on our calculated line 
        majorRadius = (slope * i) + controls.torusRadius;
        // Then, make the current iterated torus
        let base = zigguratTorusBase(majorRadius, i);
        // Update it's z-height relative to it's own scene to create the visual of stacking onto the ziggurat
        base.position.z += zpos;
        // Add this torus to the root scene
        root.add(base);
        // Update the height that we will add onto the next torus (this is the diameter of the tube)
        zpos += height;
    }
    // After all tori are done, create the singular cherry at the very top of the ziggurat
    let geom = new THREE.SphereGeometry(controls.tubeRadius); 
    // Create different colors based on selected setting
    var color;
    if (controls.colorType == 'Random') {
        color = getRandomColor();
    } else {
        // The cherry is always red since it's at the end of the rainbow and loops (also it's a cherry, they're always red!)
        color = new THREE.Color().setHSL(0.0, 1.0, 0.5);
    }
    let matArgs = {transparent: true, opacity: controls.opacity, color: color};
    let mat = new THREE.MeshBasicMaterial(matArgs);
    let cherry = new THREE.Mesh(geom, mat);
    // It's z-height still needs to be updated to stack, using whatever the last value from the iteration was
    // We reduce the height by half the so part of the cherry falls inside the last torus, for neat asthetics
    cherry.position.z += zpos - (height/2);
    // Add this to the root scene too
    root.add(cherry);
    // Once done, return the root scene
    return root;
}

/**
 * Creates a singular torus with a provided major radius to use
 * @param {*} majorRadius - major radius of the created torus
 * @param {*} index - index of the major torus relative to the ziggurat (used for rainbow coloring)
 * @returns the final mesh of the created torus
 */
function zigguratTorusBase(majorRadius, index) {
    // Create the actual torus geometry
    let geom = new THREE.TorusGeometry(majorRadius, controls.tubeRadius, 16, 100);
    // Create different colors based on selected setting
    var color;
    if (controls.colorType == 'Random') {
        color = getRandomColor();
    } else {
        let hue = parseFloat(index / controls.nbrTori);
        color = new THREE.Color().setHSL(hue, 1.0, 0.5);
    }
    // Create the material with whichever color we use
    let matArgs = {transparent: true, opacity: controls.opacity, color: color};
    let mat = new THREE.MeshBasicMaterial(matArgs);
    let base = new THREE.Mesh(geom, mat);
    // Return the final mesh
    return base;
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
createSceneTest();
initGui();
render();
animate();