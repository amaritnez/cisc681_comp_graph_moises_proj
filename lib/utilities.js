Array.prototype.shuffle = function() {
  var i = this.length, j, temp;
  if ( i == 0 ) return this;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     temp = this[i];
     this[i] = this[j];
     this[j] = temp;
  }
  return this;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomPointOnSphere(rad) {
  rad = rad || 1.0;
  var theta = Math.random() * 2 * Math.PI;
  var phi = Math.acos(2 * Math.random() - 1);
  var x = rad * Math.cos(theta) * Math.sin(phi);
  var y = rad * Math.sin(theta) * Math.sin(phi);
  var z = rad * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function getRandomColor(minSaturation, minLightness, maxLightness) {
  minSaturation = minSaturation || 0.3;
  minLightness = minLightness || 0.0;
  maxLightness = maxLightness || 1.0;
  var hue = Math.random();
  var sat = getRandomFloat(minSaturation, 1.0);
  var lit = getRandomFloat(minLightness, maxLightness);
  return new THREE.Color().setHSL(hue, sat, lit);
}


function rpsToRadians(rps, t) {
  return 2.0 * Math.PI * rps * t;
}

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function construct(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
}

// observer design pattern
// registered observers should have the property update:
//   function update(data) {...}
class Subject {
  constructor() {
    this.observers = [];
  }

  register(obs) {
    this.observers.push(obs);
  }

  unregister(obs) {
    this.observers = this.observers.filter(function (o) {return o !== obs;});

  }

  notify(data) {
    this.observers.forEach(function (obs) {obs.update(data);});
  }
}



function makeAxes(params) {
  var theAxes = new THREE.Object3D();

  params = params || {};
  var axisRadius = params.axisRadius !== undefined ? params.axisRadius:0.04;
  var axisLength = params.axisLength !== undefined ? params.axisLength:11;
  var axisTess = params.axisTess !== undefined ? params.axisTess:48;

  var axisXMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
  var axisYMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00 });
  var axisZMaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF });
  axisXMaterial.side = THREE.DoubleSide;
  axisYMaterial.side = THREE.DoubleSide;
  axisZMaterial.side = THREE.DoubleSide;
  var axisX = new THREE.Mesh(
    new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true), 
    axisXMaterial
    );
  var axisY = new THREE.Mesh(
    new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true), 
    axisYMaterial
    );
  var axisZ = new THREE.Mesh(
    new THREE.CylinderGeometry(axisRadius, axisRadius, axisLength, axisTess, 1, true), 
    axisZMaterial
    );
  axisX.rotation.z = - Math.PI / 2;
  axisX.position.x = axisLength/2-0;  // was 2-1

  axisY.position.y = axisLength/2-0;  // was 2-1

  axisZ.rotation.y = - Math.PI / 2;
  axisZ.rotation.z = - Math.PI / 2;
  axisZ.position.z = axisLength/2-0;  // was 2-1

  theAxes.add(axisX);
  theAxes.add(axisY);
  theAxes.add(axisZ);

  var arrowX = new THREE.Mesh(
    new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true), 
    axisXMaterial
    );
  var arrowY = new THREE.Mesh(
    new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true), 
    axisYMaterial
    );
  var arrowZ = new THREE.Mesh(
    new THREE.CylinderGeometry(0, 4*axisRadius, 4*axisRadius, axisTess, 1, true), 
    axisZMaterial
    );
  arrowX.rotation.z = - Math.PI / 2;
  arrowX.position.x = axisLength - 0 + axisRadius*4/2;  // was - 1

  arrowY.position.y = axisLength - 0 + axisRadius*4/2;  // was - 1

  arrowZ.rotation.z = - Math.PI / 2;
  arrowZ.rotation.y = - Math.PI / 2;
  arrowZ.position.z = axisLength - 0 + axisRadius*4/2;  // was - 1

  theAxes.add(arrowX);
  theAxes.add(arrowY);
  theAxes.add(arrowZ);
  return theAxes;
}

