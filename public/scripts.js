var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

var sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

var speed = 0.1;
var spheres = [];

function fireSphere() {
  var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.copy(cube.position);
  scene.add(sphere);
  spheres.push(sphere);
}

document.addEventListener('keydown', function (e) {
  switch (e.code) {
    case 'KeyW':
      cube.position.y += speed;
      break;
    case 'KeyS':
      cube.position.y -= speed;
      break;
    case 'KeyA':
      cube.position.x -= speed;
      break;
    case 'KeyD':
      cube.position.x += speed;
      break;
    case 'Space':
      fireSphere();
      break;
  }
});

function animate() {
  requestAnimationFrame(animate);

  spheres.forEach(function (sphere) {
    sphere.position.z -= speed;
  });

  renderer.render(scene, camera);
}

animate();
