/***********
 * triangle015.js
 * A simple triangle with orbit control
 * M. Laszlo
 * September 2019
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();


function createScene() {
    // DEFINE PARAMETERS HERE
    const myUrl2 = new URL(window.location.toLocaleString());
    // Set polygon size
    var polygonSideCount = myUrl2.searchParams.get('n');
    if (polygonSideCount == null) {
        // Default to 8 sided polygon
        polygonSideCount = 8;
    }
    // Set polygon radius
    var polygonRadiusSize = myUrl2.searchParams.get('rad');
    if (polygonRadiusSize == null) {
        // Default to 15 radius
        polygonRadiusSize = 15;
    }
    // Set polygon length
    var polygonLengthSize = myUrl2.searchParams.get('len');
    if (polygonLengthSize == null) {
        // Default to 20 length
        polygonLengthSize = 15;
    }
    // Actually make the polygon
    let polygon = createCylinder(polygonSideCount, polygonRadiusSize, polygonLengthSize);
    // Add the polygon to the scene
    scene.add(polygon);
}

// Creates a regular polygon with N sides and rad radius, and has a color that gradually changes from innerColor to outerColor
// n - number of sides the polygon will be
// rad - radius of the polygon
// len - height of the cylinder. It will be len tall, with it centered on the origin such that it's center lies on the y-plane and aligns with the y-axis
function createCylinder(n, rad, len) {
    // Setup geometry object
    let geom = new THREE.Geometry();
    // Get height for bottom/top based on len value 
    let height = len / 2;

    // Setup array of vertices for use with the cylinder, it will have 2n number of vertices
    let vertexArray = [];
    // The first iteration is for all the verticies in the same y-axis; do all bottom vertices, then all top verticies
    for (let i = 0; i < 2; i++) {
        // Now iterate for each vertex within that y plane to make the n-sided polygon
        for (let j = 0; j < n; j++) {
            // Get angle of this cord, based on current vertex index
            let angle = parseFloat((360 / n) * j);
            // Use the power of MATH to get the x/z cords (calculate different points along a circle)
            let xCord = rad * Math.sin(Math.PI * 2 * angle / 360.0);
            let zCord = rad * Math.cos(Math.PI * 2 * angle / 360.0);
            // Setup our vertex using the calculated x/z coordinates
            // The y-cord is based on whether this is the top or bottom plane
            vertexArray.push(new THREE.Vector3(xCord, i == 0 ? height * -1 : height, zCord));
            // Add them to the array of verticies in the geom object
            geom.vertices.push(vertexArray[(i*n)+j]);
        }
    }

    // Now setup the faces for the cylinder; lets start with the bases //
    // Iterate through bottom-top again
    for (let k = 0; k < 2; k++) {
        // For each base, we iterate through n-2 times making triangles
        for (let l = 1; l < n-1; l++) {
            // Use the first vertex of the base, the current iterator index, and current iterator index + 1
            let face = new THREE.Face3(k * n, (k*n) + l, (k*n) + (l+1));
            geom.faces.push(face);
        }
    }

    // Finally, connect the two bases by making a face for each side //
    // We will have N number of sides, so iterate that number of times
    for (let p = 0; p < n; p++) {
        // Each side face is made of two triangles, so double iterate
        for (let m = 0; m < 1; m++) {
            // Overflow check; at max index, we use index n instead of n+p+1 to avoid overflowing (we loop back to first index of the base)
            if (p == n - 1) {
                let overflowFace = new THREE.Face3(p, n + p, n);
                geom.faces.push(overflowFace);
            } else {
                // Connect one bottom vertex with two top verticies (one of same index, one of index + 1)
                let face1 = new THREE.Face3(p, n + p, n + p + 1);
                geom.faces.push(face1);
                // Connect two bottom verticies with one top vertex (top vertext is always p+1)
                // Also convieniently, when this overflows it helps fill out the last triangle that isn't covered by the other if-block
                let face2 = new THREE.Face3(p, p + 1, n + p + 1);
                geom.faces.push(face2);
            }
        }
    }

    // Set face normals and mesh stuff, then return final shape
    geom.computeFaceNormals();
    let mat = new THREE.MeshBasicMaterial({color: 0xFF00FF, side: THREE.DoubleSide, wireframe: true});
    let mesh = new THREE.Mesh(geom, mat);
    return mesh;
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

    // Sets up the scene
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
	camera.position.set(0, 0, 120);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Setup camera control stuff
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}


// Actually call our functions
init();
createScene();
render();
animate();