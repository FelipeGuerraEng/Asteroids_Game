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

var geometry = new THREE.DodecahedronGeometry(1);
var material = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
  wireframe: true,
});
var spaceship = new THREE.Mesh(geometry, material);
scene.add(spaceship);

var sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

var speed = 0.1;
var spheres = [];

function fireSphere() {
  var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.copy(spaceship.position);
  scene.add(sphere);
  spheres.push(sphere);
}

// Crea platillos
var dishGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
var dishMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Amarillo
var dishes = [];
for (var i = 0; i < 5; i++) {
  var dish = new THREE.Mesh(dishGeometry, dishMaterial);
  dish.position.x = i * 2 - 4; // Distribuye los platillos a lo largo del eje x
  dish.position.y = Math.random() * 2 - 1; // Posición aleatoria en el eje y
  dish.position.z = -10; // Los platillos están al inicio lejos en el eje z
  scene.add(dish);
  dishes.push(dish);
}

var score = 0;

// Crea un elemento para mostrar la puntuación
var scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '10px';
scoreElement.style.left = '10px';
scoreElement.style.fontSize = '24px';
scoreElement.style.color = 'white';
document.body.appendChild(scoreElement);

// Actualizar puntuación
function updateScore() {
  scoreElement.textContent = 'Score: ' + score;
}
updateScore();

// Incrementar puntuación cuando un platillo es golpeado
function onDishHit() {
  score += 100;
  updateScore();
}

document.addEventListener('keydown', function (e) {
  switch (e.code) {
    case 'KeyW':
      spaceship.position.y += speed;
      break;
    case 'KeyS':
      spaceship.position.y -= speed;
      break;
    case 'KeyA':
      spaceship.position.x -= speed;
      break;
    case 'KeyD':
      spaceship.position.x += speed;
      break;
    case 'Space':
      fireSphere();
      break;
  }
});

function drawBresenhamCircle(radius, x_center, y_center) {
  var x = 0;
  var y = radius;
  var d = 3 - 2 * radius;

  while (y >= x) {
    createPoint(x_center + x, y_center + y);
    createPoint(x_center + y, y_center + x);
    createPoint(x_center + y, y_center - x);
    createPoint(x_center + x, y_center - y);
    createPoint(x_center - x, y_center - y);
    createPoint(x_center - y, y_center - x);
    createPoint(x_center - y, y_center + x);
    createPoint(x_center - x, y_center + y);

    x++;

    if (d > 0) {
      y--;
      d = d + 4 * (x - y) + 10;
    } else {
      d = d + 4 * x + 6;
    }
  }
}

function createPoint(x, y) {
  var geometry = new THREE.CircleGeometry(0.05, 32);
  var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var point = new THREE.Mesh(geometry, material);
  point.position.set(x, y, 0);
  scene.add(point);
}

function animate() {
  requestAnimationFrame(animate);
  drawBresenhamCircle(3, 0, 0);

  spheres.forEach(function (sphere) {
    sphere.position.z -= speed;
  });

  // Comprueba colisiones entre esferas y platillos
  for (var i = spheres.length - 1; i >= 0; i--) {
    for (var j = dishes.length - 1; j >= 0; j--) {
      var distance = spheres[i].position.distanceTo(dishes[j].position);
      if (distance < 0.7) {
        scene.remove(spheres[i]);
        scene.remove(dishes[j]);
        spheres.splice(i, 1);
        dishes.splice(j, 1);
        onDishHit(); // Incrementar puntuación
        break;
      }
    }
  }

  renderer.render(scene, camera);
}

animate();
