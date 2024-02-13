/***********
 * Project that creates a
 * set of nested tori with a cherry
 * in the center top. Based on ziggurat project
 * Also adds various animations for the shapes
 * to move, and adds some color animations
 * Assignment 4 part 2
 * Moises Martinez
 * January 2024
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let subject = new Subject();


let controls = new function() {
    // Torus settings
    this.nbrTori = 15;
    this.torusRadius = 150.0;
    this.tubeRadius = 5.0;
    // X rotation parameters
    this.rpsXA = 0.01;
    this.rpsXB = 0.02;
    // Y rotation parameters
    this.rpsYA = 0.01;
    this.rpsYB = 0.02;
    // Color rate parameters
    this.colorRate = 0.5;
    this.saturation = 1.0;
    this.lightness = 0.5;
    this.opacity = 0.8;
    // Update button
    this.Update = recreateTori;
}

function initGui() {
    let gui = new dat.GUI();
    // X-Axis rotation settings
    let f1 = gui.addFolder('X-Axis');
    f1.open();
    f1.add(controls, 'rpsXA', -0.25, 0.25).name('rpsA');
    f1.add(controls, 'rpsXB', -0.25, 0.25).name('rpsB');
    // Y-Ayis rotation settings
    let f2 = gui.addFolder('Y-Ayis');
    f2.open();
    f2.add(controls, 'rpsYA', -0.25, 0.25).name('rpsA');
    f2.add(controls, 'rpsYB', -0.25, 0.25).name('rpsB');
    // Color rate update
    let f3 = gui.addFolder('Color Rate');
    f3.open();
    f3.add(controls, 'colorRate', -3.0, 3.0).name('Color Rate');
    f3.add(controls, 'saturation', 0.0, 1.0).name('Saturation');
    f3.add(controls, 'lightness', 0.0, 1.0).name('Lightness');
    f3.add(controls, 'opacity', 0.0, 1.0).name('Opacity');
    // Torus settings
    let f4 = gui.addFolder('Torus Settings');
    f4.open();
    f4.add(controls, 'nbrTori', 1, 30).step(1).name('Torus Count');
    f4.add(controls, 'torusRadius', 1.0, 350.0).name('First major radius');
    f4.add(controls, 'tubeRadius', 1.0, 15.0).step(1).name('Tube radius');
    // Update button
    gui.add(controls, 'Update');
}

// Function to recreate the tori as needed
function recreateTori() {
    // If the tori exists
    if (ziggurat) {
        // Remove them
        scene.remove(ziggurat);
    }
    // Remake them
    ziggurat = torusZiggurat(controls.nbrTori, controls.torusRadius, controls.tubeRadius, controls.opacity);
    scene.add(ziggurat);
    // And update animations
    let animDirection = [];
    animDirection.push(makeArithRotator(0, controls.rpsXA, controls.rpsXB));
    animDirection.push(makeArithRotator(1, controls.rpsYA, controls.rpsYB, "rpsy"));
    animDirection.push(makeColorAnimator(controls.colorRate, controls.saturation, controls.lightness));
    moveChildren(ziggurat, ...animDirection);
}


function createScene() {
    // Create the scene
    scene = new THREE.Scene();
    // Reuse our old torus ziggurat code with some slight modifications to create the nested tori + cherry, and add it to the global scene
    ziggurat = torusZiggurat(controls.nbrTori, controls.torusRadius, controls.tubeRadius, controls.opacity);
    scene.add(ziggurat);
    // Setup all animations
    let animDirection = [];
    animDirection.push(makeArithRotator(0, controls.rpsXA, controls.rpsXB));
    // we only do x+y, as z-rotations visually do nothing since the tori are facing the z-axis
    animDirection.push(makeArithRotator(1, controls.rpsYA, controls.rpsYB, "rpsy")); 
    // Also add a color anim for fun
    animDirection.push(makeColorAnimator(controls.colorRate, controls.saturation, controls.lightness));
    moveChildren(ziggurat, ...animDirection);
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
}


// Function that sets up the spinning for the tori
function makeArithRotator(indx, rpsA, rpsB, rps="rps") {
    let spin = makeSpin(indx, rps);
    return function(child, i) {
        child[rps] = rpsA + rpsB * i;
        return spin;
    }
}

// sequencing function so we can run multiple animations at once
function sequence(...fncs) {
    return function(data) { fncs.forEach(g => g.call(this, data)) };
}

// The function that attaches the relavent animations for each element of the nested tori (and cherry!)
function moveChildren(root, ...fncs) {
    let children = root.children;
    children.forEach(function (child, i, children) {
        let animFncs = fncs.map(g => g(child, i, children));
        child.update = sequence(...animFncs);
        subject.register(child);
    });
}

 
/**
 * Individual function to handle rotations in a single axis
 * @param {*} indx which direction to rotate in (0 = x, 1 = y, 2 = z)
 * @param {*} rps variable name of the current object that stores the rotation speed
 * @returns 
 */
function makeSpin(indx, rps="rps") {
    return function (delta) {
        // Get rotation object from the provided shape
        let vec = this.rotation.toVector3();
        // Get the specific direction (and its value) within the above rotation to use, as specified by the index
        let val = vec.getComponent(indx);
        // update the value using the rps field of the shape
        val += rpsToRadians(this[rps], delta);
        val %= 2 * Math.PI;
        // Update the specific value within the rotation field, specifically the direction that we updated
        vec.setComponent(indx, val);
        // And update the rotation object copying the values that we just updated
        this.rotation.setFromVector3(vec);
    }
}

// Function to handle the color animation (have the colors shift across the rainbow)
function makeColorAnimator(rate, saturation=1.0, lightness=0.5) {
    function f(child, i, children) {
        child.crate = rate;
        child.cval = i / children.length;
        return function (delta) {
            this.cval += delta * this.crate;
            this.cval = mod(this.cval, 1);
            this.material.color.setHSL(this.cval, saturation, lightness);
        }
    }
    return f;
}
 

/**
 * Creates the nested tori + cherry, using the old tori ziggurate template as a base
 * @param {*} nbrTori how many tori to make; note this doesn't count the cherry, so the total shapes is nbrTori + 1
 * @param {*} firstMajorRadius size of the major radius of the outermost torus
 * @param {*} tubeRadius size of the tube for all tori; also is used in calculating the radius of the cherry
 * @param {*} opacity opacity of the shapes in the nested tori + cherry
 * @returns the root scene containing the entire pyramid of tori + cherry
 */
function torusZiggurat(nbrTori, firstMajorRadius, tubeRadius, opacity) {
    /**
     * Create an arbitrary linear graph of index-majorRadius, where first entry is the first torus (0, firstMajorRadius)
     * and the last entry is the last, whose major radius will be the minor radius (nbrTori, controls.tubeRadius)
     * So find the slope for our graph; this will be the scale factor for the major radius
     */
    let slope = (tubeRadius - firstMajorRadius)/(nbrTori);
    // Setup first radius, it's just the user-defined setting
    let majorRadius = firstMajorRadius;
    // Setup root scene
    root = new THREE.Object3D();
    // Iterate through the number of desired tori and create each one, adding it to the root scene
    for (let i = 0; i < nbrTori; i++) {
        // First we update the radius for the next torus based on our calculated line 
        majorRadius = (slope * i) + firstMajorRadius;
        // Then, make the current iterated torus
        let tori = new THREE.TorusGeometry(majorRadius, tubeRadius, 16, 100);
        // Create the material with whichever color we use
        let matArgs = { transparent: true, opacity: opacity };
        let mat = new THREE.MeshLambertMaterial(matArgs);
        let base = new THREE.Mesh(tori, mat);
        // Add this torus to the root scene
        root.add(base);
    }
    // After all tori are done, create the singular cherry at the very top of the ziggurat
    // It'll be calculated such that it fits perfectly within the space of the last torus
    let geom = new THREE.SphereGeometry(majorRadius - tubeRadius); 
    // Create the mat
    let matArgs = {transparent: true, opacity: opacity};
    let mat = new THREE.MeshLambertMaterial(matArgs);
    let cherry = new THREE.Mesh(geom, mat);
    // Add this to the root scene too
    root.add(cherry);
    // Once done, return the root scene
    return root;
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

// Updates the animations
function update() {
    let delta = clock.getDelta();
    subject.notify(delta);
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
    // Set this up so our animations can update properly
    renderer.setAnimationLoop(function () {
        update();
        renderer.render(scene, camera);
    });
    // Add the renderer to the HTML document
    document.body.appendChild( renderer.domElement );

    // Setup camera perspective stuff
	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 10000);
	camera.position.set(0, 0, 500);
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