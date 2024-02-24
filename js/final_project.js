/***********
 * Final project that has
 * various objects bouncing
 * within a rectangular space
 * Contains various options
 * to configure the bouncing
 * behaviour and functionality
 * Moises Martinez
 * January 2024
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();

let subject = new Subject();

// Global variable to track the out of bounds box
let globalBoundBox = null;

// Global variable to track each bouncing object
let bouncingObjectRoot1 = null;
let bouncingObjectRoot2 = null;

// Constants to track which direction we touched
const rightTouch = 1;
const leftTouch = 2;
const topTouch = 3;
const bottomTouch = 4;


let controls = new function() {
    // Bounding box settings; values represent size from end-to-end
    this.xBounds = 300;
    this.yBounds = 300;
    this.boundOpacity = 0.0;
    // Object 1 settings
    this.xMove1 = 0.7; // Movement rate of object 1 (in units/frame)
    this.yMove1 = 1.2;
    this.size1 = 45; // Object 1 size
    this.colorChangeOnTouch1 = true; // change color on touch
    // Object 2 settings
    this.enable2 = false; // whether object 2 exists or not
    this.xMove2 = 1.6; // Movement rate of object 1 (in units/frame)
    this.yMove2 = 0.3;
    this.size2 = 17; // Object 2 size
    this.colorChangeOnTouch2 = false; // change color on touch
}

function initGui() {
    let gui = new dat.GUI();
    // Options for different shape types
    let f1 = gui.addFolder('Bounding Box');
    f1.open();
    f1.add(controls, 'xBounds', 100, 1000).step(1).name('x size').onChange(updateBoundingBoxChanges);
    f1.add(controls, 'yBounds', 100, 1000).step(1).name('y size').onChange(updateBoundingBoxChanges);
    f1.add(controls, 'boundOpacity', 0.0, 1.0).step(0.05).name('bounding opacity').onChange(updateBoundingBoxChanges);    
    // Object 1 settings
    let f2 = gui.addFolder('Object 1');
    f2.open();
    f2.add(controls, 'xMove1', 0, 15.0).name('x speed').onChange(updateObj1);
    f2.add(controls, 'yMove1', 0, 15.0).name('y speed').onChange(updateObj1);
    f2.add(controls, 'size1', 1, 500).step(1).name('size').onChange(updateObj1);
    f2.add(controls, 'colorChangeOnTouch1').name('change color on touch').onChange(updateObj1);
    // Object 2 settings
    let f3 = gui.addFolder('Object 2');
    f3.open();
    f3.add(controls, 'enable2').name('Add 2nd Object').onChange(updateObj2);
    f3.add(controls, 'xMove2', 0, 15.0).name('x speed').onChange(updateObj2);
    f3.add(controls, 'yMove2', 0, 15.0).name('y speed').onChange(updateObj2);
    f3.add(controls, 'size2', 1, 500).step(1).name('size').onChange(updateObj2);
    f3.add(controls, 'colorChangeOnTouch2').name('change color on touch').onChange(updateObj2);
}

// Updates object 1
function updateObj1() {
    // Safety check; size can't be bigger than the bounds of the box, fix that here
    if (controls.size1 > controls.xBounds) {
        controls.size1 = controls.xBounds;
    }
    if (controls.size1 > controls.yBounds) {
        controls.size1 = controls.yBounds;
    }
    // Another safety check, the size of both objects cant be bigger than the box as well
    // Obv only check if obj2 exist
    if (controls.enable2 == true) {
        if (controls.size1 + controls.size2 > controls.xBounds) {
            controls.size1 = controls.xBounds - controls.size2;
        }
        if (controls.size1 + controls.size2 > controls.yBounds) {
            controls.size1 = controls.yBounds - controls.size2;
        }
    }
    // Save original position + velocities
    let originalPosition = new THREE.Vector3();
    let prevXRate = bouncingObjectRoot1.xRate;
    let prevYRate = bouncingObjectRoot1.yRate;
    // If the tori exists
    if (bouncingObjectRoot1) {
        // Save original position
        originalPosition.copy(bouncingObjectRoot1.position);
        // Remove them
        subject.unregister(bouncingObjectRoot1);
        scene.remove(bouncingObjectRoot1);
    }
    // Make a root object to countain our bouncing object
    bouncingObjectRoot1 = new THREE.Object3D();
    // Basic square obj
    let bouncingSquare = makeBasicSquare(controls.size1);
    // Update root size
    bouncingObjectRoot1.size = controls.size1;
    // Get current direction (so we can preserve it)
    let xDir = prevXRate > 0 ? 1 : -1;
    let yDir = prevYRate > 0 ? 1 : -1;
    // Update the direction with the new speed values, while preserving current direction
    bouncingObjectRoot1.xRate = xDir * controls.xMove1;
    bouncingObjectRoot1.yRate = yDir * controls.yMove1;
    // Remake the square to the bouncing object root
    bouncingObjectRoot1.add(bouncingSquare);
    // Also save it to the root obj so we can access it for any reason
    bouncingObjectRoot1.bouncingSquare = bouncingSquare;
    // Add the core movement animation to the root's update function (this is what causes the shape to move!)
    bouncingObjectRoot1.update = moveObject;
    subject.register(bouncingObjectRoot1);
    // Set it's position back to where it was
    bouncingObjectRoot1.position.copy(originalPosition);
    // Set value to change the color on touch here for this obj
    bouncingObjectRoot1.changeColorOnTouch = controls.colorChangeOnTouch1;
    // And re add the root to the global scene
    scene.add(bouncingObjectRoot1);
}

// Updates object 2
function updateObj2() {
    // Safety check; size can't be bigger than the bounds of the box, fix that here
    if (controls.size2 > controls.xBounds) {
        controls.size2 = controls.xBounds;
    }
    if (controls.size2 > controls.yBounds) {
        controls.size2 = controls.yBounds;
    }
    // Another safety check, the size of both objects cant be bigger than the box as well
    if (controls.size1 + controls.size2 > controls.xBounds) {
        controls.size2 = controls.xBounds - controls.size1;
    }
    if (controls.size1 + controls.size2 > controls.yBounds) {
        controls.size2 = controls.yBounds - controls.size1;
    }
    let originalPosition = new THREE.Vector3();
    let prevXRate;
    let prevYRate;
    // If obj2 exists
    if (bouncingObjectRoot2) {
        // Save original position + velocities
        originalPosition.copy(bouncingObjectRoot2.position);
        prevXRate = bouncingObjectRoot2.xRate;
        prevYRate = bouncingObjectRoot2.yRate;
        // Remove them
        subject.unregister(bouncingObjectRoot2);
        scene.remove(bouncingObjectRoot2);
        // null out the object
        bouncingObjectRoot2 = null;
    }
    // Only make the 2nd object if we need to
    if (controls.enable2 == true) {
        // Make a root object to countain our bouncing object
        bouncingObjectRoot2 = new THREE.Object3D();
        // Basic square obj
        let bouncingSquare = makeBasicSquare(controls.size2, 'blue');
        // Update root size
        bouncingObjectRoot2.size = controls.size2;
        // Get current direction (so we can preserve it)
        let xDir = prevXRate > 0 ? 1 : -1;
        let yDir = prevYRate > 0 ? 1 : -1;
        // Update the direction with the new speed values, while preserving current direction
        bouncingObjectRoot2.xRate = xDir * controls.xMove2;
        bouncingObjectRoot2.yRate = yDir * controls.yMove2;
        // Remake the square to the bouncing object root
        bouncingObjectRoot2.add(bouncingSquare);
        // Also save it to the root obj so we can access it for any reason
        bouncingObjectRoot2.bouncingSquare = bouncingSquare;
        // Add the core movement animation to the root's update function (this is what causes the shape to move!)
        bouncingObjectRoot2.update = moveObject;
        subject.register(bouncingObjectRoot2);
        // Set it's position back to where it was
        bouncingObjectRoot2.position.copy(originalPosition);
        // Set value to change the color on touch here for this obj
        bouncingObjectRoot2.changeColorOnTouch = controls.colorChangeOnTouch2;
        // And re add the root to the global scene
        scene.add(bouncingObjectRoot2);
    }
}

// Updates bounding box based on setting changes
function updateBoundingBoxChanges() {
    // Another safety check, the size of both objects cant be bigger than the box as well
    if (controls.size1 + controls.size2 > controls.xBounds) {
        controls.xBounds = controls.size1 + controls.size2 + 1;
    }
    if (controls.size1 + controls.size2 > controls.yBounds) {
        controls.yBounds = controls.size1 + controls.size2 + 1;
    }
    // remove the current bounding box
    if (globalBoundBox) {
        scene.remove(globalBoundBox);
    }
    // And recreate it
    globalBoundBox = makeGlobalBox(controls.boundOpacity, controls.xBounds, controls.yBounds);
    scene.add(globalBoundBox);
}


function createScene() {
    // Create the scene
    scene = new THREE.Scene();

    // Create the global bounding box first; this is what'll contain our bouncing shapes
    globalBoundBox = makeGlobalBox(controls.boundOpacity, controls.xBounds, controls.yBounds);
    // Make a root object to countain our bouncing object
    bouncingObjectRoot1 = new THREE.Object3D();
    // Save size and move speed settings to the root, so it can be used to calculate bouncing
    bouncingObjectRoot1.size = controls.size1;
    bouncingObjectRoot1.xRate = controls.xMove1;
    bouncingObjectRoot1.yRate = controls.yMove1;
    // Basic square obj
    let bouncingSquare = makeBasicSquare(controls.size1);
    // Add the square to the bouncing object root
    bouncingObjectRoot1.add(bouncingSquare);
    // Also save it to the root obj so we can access it for any reason
    bouncingObjectRoot1.bouncingSquare = bouncingSquare;
    // Add the core movement animation to the root's update function (this is what causes the shape to move!)
    bouncingObjectRoot1.update = moveObject;
    subject.register(bouncingObjectRoot1);
    // Set value to change the color on touch here for this obj
    bouncingObjectRoot1.changeColorOnTouch = controls.colorChangeOnTouch1;
    // Add it to the scene
    scene.add(globalBoundBox);
    scene.add(bouncingObjectRoot1);
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

// Makes the background box
function makeGlobalBox(opacity, xSize, ySize) {
    // Setup geometry
    let boxGeom = new THREE.BoxGeometry(xSize, ySize, 1);
    // Setup material for each face, so we only render the walls
    let materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial({
        color: 0xc0c0c0,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide,
        depthWrite: false
    }));
    materialArray.push(new THREE.MeshBasicMaterial({
        color: 0xc0c0c0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: opacity,
        depthWrite: false
    }));
    
    materialArray.push(new THREE.MeshBasicMaterial({
        color: 0xc0c0c0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: opacity,
        depthWrite: false
    }));
    materialArray.push(new THREE.MeshBasicMaterial({
        color: 0xc0c0c0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: opacity,
        depthWrite: false
    }));
    // Front-back face get barebone material to appear "invisible"
    materialArray.push(new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
    }));
    materialArray.push(new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
    }));
    // Setup the mesh for the whole box
    let boxMesh = new THREE.Mesh(boxGeom, materialArray);
    boxMesh.position.set(0, 0, -2);
    return boxMesh;

}

// Makes the basic dvd logo square, which is actually a box with 5 sides invisible
function makeBasicSquare(size, color='red') {
    // Setup box geom
    let squareGeom = new THREE.BoxGeometry(size, size, 0);
    // Load up texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('./lib/dvd_logo.png')
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // We only want 1 dvd logo to appear
    texture.repeat.set(1, 1);
    // The front face is the one with the logo
    let frontMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        color: new THREE.Color(color),
        side: THREE.FrontSide,
        transparent: true,
        depthWrite: false
    });
    // Make an array of materials as we want 5/6 of the faces to be empty
    let materialArray = [];
    materialArray.push(new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0,
        visible: false,
        depthWrite: false
    }));
    materialArray.push(new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0,
        visible: false,
        depthWrite: false
    }));
    materialArray.push(new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0,
        visible: false,
        depthWrite: false
    }));
    materialArray.push(new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0,
        visible: false,
        depthWrite: false
    }));
    materialArray.push(frontMaterial); // 5th index = front face, this is what we want the text to load too
    materialArray.push(new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0,
        visible: false,
        depthWrite: false
    }));
    return new THREE.Mesh(squareGeom, materialArray);
}


// Function to change the color of the bouncing obj on contact
function changeColorOnTouch(obj) {
    // recall the bouncing object is made up of multiple faces, so access the face with the texture
    obj.material[4].color = getRandomColor();    
}

// Function that handles the actual movement of the bouncing object
function moveObject(delta) {
    // Update x and y positions based on the current movement rate (aka velocities)
    this.position.x += this.xRate;
    this.position.y += this.yRate;
    // Check if we are out of bounds
    let isOOB = checkOutOfBounds(this, globalBoundBox);
    // We are too far to the right
    if (isOOB == 1) {
        // Set x movement to the left
        this.xRate = -1 * Math.abs(this.xRate);
        // Set x position such that it doesn't clip out of the box
        this.position.x = (globalBoundBox.geometry.parameters.width / 2) - (this.size / 2);
    } else if (isOOB == 2) { // Too far to the left
        // Set x movement to the right
        this.xRate = Math.abs(this.xRate);
        // Set x position such that it doesn't clip out of the box
        this.position.x = -(globalBoundBox.geometry.parameters.width / 2) + (this.size / 2);
    } 
    // Check again; we split into two if-elses in rare scenario where x size = x width;
    // in this case, the above code will run, but we still need to update
    // vertical velocities as well (or else it will fly off into the void)
    isOOB = checkOutOfBounds(this, globalBoundBox);
    // Check if too far up
    if (isOOB == 3) { 
        // Set y movement down
        this.yRate = -1 * Math.abs(this.yRate);
        // Set y position such that it doesn't clip out of the box
        this.position.y = (globalBoundBox.geometry.parameters.height / 2) - (this.size / 2);
    } else if (isOOB == 4) { // Too far down
        // Set y movement up
        this.yRate = Math.abs(this.yRate);
        // Set y position such that it doesn't clip out of the box
        this.position.y = -(globalBoundBox.geometry.parameters.height / 2) + (this.size / 2);
    }
    // Change the color of the logo (if desired)
    if (isOOB != 0 && this.changeColorOnTouch == true) {
        changeColorOnTouch(this.bouncingSquare);
    }

    // Now check for collision with the other object //
    // Only object 1 does this check (since both objects are touching, only 1 needs todo the logic)
    if (isBounceObject1(this) == true) {
        // Get the other bouncing object for collision checks
        let otherObj = getOtherBounceObj(this);
        // Only proceed if other object exist (we have 2 objs)
        if (otherObj != null) {
            // Track if we end up doing a collision
            let isCollided = checkObjectIntersection(this, otherObj);
            // If this obj right hits the other's left
            if (isCollided == rightTouch) {
                // Set x movement to the left
                this.xRate = -1 * Math.abs(this.xRate);
                // Set x movement of the other obj to the opposite
                otherObj.xRate = Math.abs(otherObj.xRate);
                // Set x position such that it doesn't clip in the other object
                this.position.x = otherObj.position.x - (otherObj.size / 2) - (this.size / 2);
            } else if (isCollided == leftTouch) { // If this obj left hits the other's right
                // Set x movement to the right
                this.xRate = Math.abs(this.xRate);
                // Set x movement of the other obj to the left
                otherObj.xRate = -1 * Math.abs(otherObj.xRate);
                // Set this x position such that it doesn't clip in the other object
                this.position.x = otherObj.position.x + (otherObj.size / 2) + (this.size / 2);
            }
            if (isCollided == topTouch) { // If this obj top touches other's bottom
                // Set y movement down
                this.yRate = -1 * Math.abs(this.yRate);
                // Set y movement of the other obj to the opposite
                otherObj.yRate = Math.abs(otherObj.yRate);
                // Set y position such that it doesn't clip in the other object
                this.position.y = otherObj.position.y - (otherObj.size / 2) - (this.size / 2);
            }
            else if (isCollided == bottomTouch) { // If this obj bottom touches other's top
                // Set y movement up
                this.yRate = Math.abs(this.yRate);
                // Set y movement of the other obj to the opposite
                otherObj.yRate = -1 * Math.abs(otherObj.yRate);
                // Set y position such that it doesn't clip in the other object
                this.position.y = otherObj.position.y + (otherObj.size / 2) + (this.size / 2);
            }
            // If a collision happened in any direction, update colors (as necessary)
            if (isCollided != 0) {
                // Change the color of the logo (if desired)
                if (this.changeColorOnTouch == true) {
                    changeColorOnTouch(this.bouncingSquare);
                }
                if (otherObj.changeColorOnTouch == true) {
                    changeColorOnTouch(otherObj.bouncingSquare);
                }
            }
        }
    }
}

// 
/**
 * Checks if the provided shape has gone out of bounds
 * @param {*} collisionObject initial object, the "moving" one
 * @param {*} boundingObject object to check against aka out of bounds
 * @return 0 if no intersection; otherwise the value represents which direction it happened
 */
function checkOutOfBounds(collisionObject, boundingObject) {
    let xBound = boundingObject.geometry.parameters.width / 2;
    let yBound = boundingObject.geometry.parameters.height / 2;
    // Divide size by 2 as we are measuring from center to end, not end to end
    let sizeMeas = collisionObject.size / 2;
    // Get object coordinates for convience sake
    let xCord = collisionObject.position.x;
    let yCord = collisionObject.position.y;
    // Check if too far to the right
    if (xCord + sizeMeas > xBound) {
        return 1;
    }
    // Check if too far to the left
    if (xCord - sizeMeas < -xBound) {
        return 2;
    }
    // Check if too far up
    if (yCord + sizeMeas > yBound) {
        return 3;
    }
    // Check if too far down
    if (yCord - sizeMeas < -yBound) {
        return 4;
    }
    return 0;
}

/**
 * Checks if two objects are intersecting each-other
 * @param {*} object1 initial object, "moving"
 * @param {*} object2 object to check against, "not moving"
 * @return 0 if no intersection; otherwise the value represents which direction it happened
 */
function checkObjectIntersection(object1, object2) {  
    // Divide size by 2 as we are measuring from center to end, not end to end
    let sizeMeas1 = object1.size / 2;
    let sizeMeas2 = object2.size / 2;
    // Get object coordinates for convience sake
    let xCord1 = object1.position.x;
    let yCord1 = object1.position.y;
    let xCord2 = object2.position.x;
    let yCord2 = object2.position.y;
    // And horizontal/vertical distances
    let xDist = xCord2 - xCord1;
    let yDist = yCord2 - yCord1;
    // Get the size of both objects from center to center; if the distance is less than this, then they are touching
    let combinedSize = sizeMeas1 + sizeMeas2;
    // First check if there's a horizontal "collision"
    if (Math.abs(xDist) < combinedSize) {
        // If we have horizontal collision, need to check vertical collision
        // Possible scenario where horizontally objects are close, but vertically objects are far
        if (Math.abs(yDist) < combinedSize) {
            /**
             * If this is true too, we have a collision in both axis, they are touching!
             * Now determine which side is touching what
             * How we do this: track how far the obj is touching in each direction
             * Whichever has the lowest value, that's the direction the obj approached from
             */
            let touchingDistances = [999, 999, 999, 999];
            // If obj1 right is inside obj2 left
            if (xCord1 + sizeMeas1 > xCord2 - sizeMeas2) {
                touchingDistances[rightTouch-1] = (xCord1 + sizeMeas1) - (xCord2 - sizeMeas2);
            }
            // If obj1 left is inside obj2 right
            if (xCord1 - sizeMeas1 < xCord2 + sizeMeas2) {
                touchingDistances[leftTouch-1] = (xCord2 + sizeMeas2) - (xCord1 - sizeMeas1);
            }
            // If obj1 top is inside obj2 bottom
            if (yCord1 + sizeMeas1 > yCord2 - sizeMeas2) {
                touchingDistances[topTouch-1] = (yCord1 + sizeMeas1) - (yCord2 - sizeMeas2);
            }
            // If obj1 bottom is inside obj2 top
            if (yCord1 - sizeMeas1 < yCord2 + sizeMeas2) {
                touchingDistances[bottomTouch-1] = (yCord2 + sizeMeas2) - (yCord1 - sizeMeas1);
            }
            // Finally, check which has the smallest value
            let smallestIndex = 0;
            for (let i = 0; i < touchingDistances.length; i++) {
                if (touchingDistances[i] < touchingDistances[smallestIndex]) {
                    smallestIndex = i;
                }
            }
            // Return the index + 1 to indicate which direction is touching
            return smallestIndex + 1;
        }
    }
    // No collision, all good
    return 0;
}

// Checks if the provided object is obj 1
function isBounceObject1(thisObj) {
    if (thisObj == bouncingObjectRoot1) {
        return true;
    }
    return false;
}

// Gets the other global bouncing object, based on the provided one
function getOtherBounceObj(thisObj) {
    if (thisObj == bouncingObjectRoot1) {
        return bouncingObjectRoot2
    } else {
       return bouncingObjectRoot1;
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
	renderer = new THREE.WebGLRenderer({antialias : true, preserveDrawingBuffer: true, alpha: true});
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