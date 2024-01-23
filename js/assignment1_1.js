/***********
 * Project that creates a
 * cylinder based on triangles
 * for assignment 1 part 2
 * Moises Martinez
 * January 2024
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
    // Set inner color
    var innerColorString = myUrl2.searchParams.get('innerColor');
    if (innerColorString == null) {
        // Default to red
        innerColorString = 'red';
    }
    // Set outer color
    var outerColorString = myUrl2.searchParams.get('outerColor');
    if (outerColorString == null) {
        // Default to blue
        outerColorString = 'blue';
    }
    // Setup colors
    let innerColor = new THREE.Color(innerColorString);
    let outerColor = new THREE.Color(outerColorString);
    // Actually make the polygon
    let polygon = regularPolygonMesh(polygonSideCount, polygonRadiusSize, innerColor, outerColor);
    // Add the polygon to the scene
    scene.add(polygon);
}

// Creates a regular polygon with N sides and rad radius, and has a color that gradually changes from innerColor to outerColor
// n - number of sides the polygon will be
// rad - radius of the polygon.
// innerColor - defines the inner color of the polygon; colors are defined in the three.js library
// outerColor - defines the outer color of the polygon; colors are defined in the three.js library
function regularPolygonMesh(n, rad, innerColor, outerColor)
{
    let geom = new THREE.Geometry();

    // Setup array of vertices for use with the polygon, it will have n + 1 number of vertices
    let vertexArray = [];
    // Now iterate for each vertex; save the last vertex for a special case, so only iterate for n
    for (let i=0; i<n; i++) {
        // Get angle of this cord, based on current vertex index
        let angle = parseFloat((360/n) * i);
        // Assume first vertex has x = 0
        let xCord = rad * Math.sin(Math.PI * 2 * angle / 360.0);
        let yCord = rad * Math.cos(Math.PI * 2 * angle / 360.0);
        // Setup our vertext; assume all vertices are in same z-plane
        vertexArray.push(new THREE.Vector3(xCord, yCord, 0));
        // Add them to the array of verticies in the geom object
        geom.vertices.push(vertexArray[i]);
    }
    // the n-th index vertex is a special vertex that represents the center of the polygon, create it now
    let centerVertex = new THREE.Vector3(0, 0, 0);
    geom.vertices.push(centerVertex);
    // Now the fun part, create a set of triangles based on our vertices to form the polygon
    // Each triangle uses vertex indicies j,j+1, and n to make itself
    for (let j=0; j<n; j++) {
        var currFace;
        // Overflow check; at max index, we use index 0 instead of j+1 to avoid overflowing the array
        if (j == n -1) {
            currFace = new THREE.Face3(j, 0, n);
            geom.faces.push(currFace);
        } else {
            currFace = new THREE.Face3(j, j+1, n);
            geom.faces.push(currFace);
        }
        // Now, setup the color for this triangle following the pattern of innerColor gradiating to outerColor
        // Convieniently, the third vertex of all faces represents the inner vertex, so use vertex coloring
        // where first two vertices use outerColor, and third vertex uses innerColor
        currFace.vertexColors.push(outerColor, outerColor, innerColor);
    }
    // Setup material + mesh here, be sure to include vertext coloring to get interporlating effect
    let mat = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors, side: THREE.DoubleSide});
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