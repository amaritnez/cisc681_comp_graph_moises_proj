/***********
 * triangle015.js
 * A square with orbit control
 * M. Laszlo
 * September 2019
 ***********/

let camera, scene, renderer;
let cameraControls;
let clock = new THREE.Clock();


function createScene() {
    let triangle = makeSquare();
    let axes = new THREE.AxesHelper(10);
    scene.add(triangle);
    scene.add(axes);
}


function makeSquare() {
    let geom = new THREE.Geometry();
    let a = new THREE.Vector3(0, 0, 0);
    let b = new THREE.Vector3(8, 0, 0);
    let c = new THREE.Vector3(0, 8, 0);
    let d = new THREE.Vector3(8, 8, 0);
    geom.vertices.push(a, b, c, d);
    let face1 = new THREE.Face3(0, 1, 2);
    let face2 = new THREE.Face3(1, 2, 3);
    geom.faces.push(face1, face2);
    let args = {color: 0xFF00FF, side: THREE.DoubleSide};
    let mat = new THREE.MeshBasicMaterial(args);
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
	let canvasWidth = window.innerWidth;
	let canvasHeight = window.innerHeight;
	let canvasRatio = canvasWidth / canvasHeight;

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer({antialias : true, preserveDrawingBuffer: true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor(0x000000, 1.0);

	camera = new THREE.PerspectiveCamera( 40, canvasRatio, 1, 1000);
	camera.position.set(0, 0, 30);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
}


function addToDOM() {
	let container = document.getElementById('container');
	let canvas = container.getElementsByTagName('canvas');
	if (canvas.length>0) {
		container.removeChild(canvas[0]);
	}
	container.appendChild( renderer.domElement );
}


init();
createScene();
addToDOM();
render();
animate();

