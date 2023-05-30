var scene = new THREE.Scene();
var gameContainer = document.getElementById('game-container');
var camera = new THREE.PerspectiveCamera(
  75,
  gameContainer.offsetWidth / gameContainer.offsetHeight,
  0.1,
  1000
);
camera.position.z = 5;

var gameAreaSize = 5; // tamaño del área de juego
var boundaryBox = new THREE.Box3(
  new THREE.Vector3(-gameAreaSize, -gameAreaSize, -gameAreaSize),
  new THREE.Vector3(gameAreaSize, gameAreaSize, gameAreaSize)
);

function isInsideGameArea(object) {
  return boundaryBox.containsPoint(object.position);
}

function wrapAroundGameArea(object) {
  if (!isInsideGameArea(object)) {
    if (object.position.x > gameAreaSize) object.position.x = -gameAreaSize;
    if (object.position.x < -gameAreaSize) object.position.x = gameAreaSize;
    if (object.position.y > gameAreaSize) object.position.y = -gameAreaSize;
    if (object.position.y < -gameAreaSize) object.position.y = gameAreaSize;
    if (object.position.z > gameAreaSize) object.position.z = -gameAreaSize;
    if (object.position.z < -gameAreaSize) object.position.z = gameAreaSize;
  }
}

var renderer = new THREE.WebGLRenderer();
renderer.setSize(gameContainer.offsetWidth, gameContainer.offsetHeight);
gameContainer.appendChild(renderer.domElement);

var geometry = new THREE.ConeGeometry(1, 2, 3); // Radio, altura y segmentos radiales
geometry.rotateX(Math.PI / 2); // Rota el cono para que su punta apunte hacia arriba
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

var starGeometry = new THREE.SphereGeometry(0.01, 8, 8);
var starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
var stars = [];

for (var i = 0; i < 1000; i++) {
  var star = new THREE.Mesh(starGeometry, starMaterial);
  star.position.x = Math.random() * gameAreaSize * 2 - gameAreaSize;
  star.position.y = Math.random() * gameAreaSize * 2 - gameAreaSize;
  star.position.z = Math.random() * gameAreaSize * 2 - gameAreaSize;
  scene.add(star);
  stars.push(star);
}

// Crea platillos
var dishGeometry = new THREE.DodecahedronGeometry(0.5, 0);
var dishMaterial = new THREE.MeshBasicMaterial({ color: 0x898976 }); // Amarillo
var dishes = [];
for (var i = 0; i < 5; i++) {
  var dish = new THREE.Mesh(dishGeometry, dishMaterial);
  dish.position.x = i * 2 - 4; // Distribuye los platillos a lo largo del eje x
  dish.position.y = Math.random() * 2 - 1; // Posición aleatoria en el eje y
  dish.position.z = -10; // Los platillos están al inicio lejos en el eje z
  dish.velocityX = (Math.random() - 0.5) * 0.06; // Velocidad aleatoria en el eje x
  dish.velocityY = (Math.random() - 0.5) * 0.06;
  scene.add(dish);
  dishes.push(dish);
}

var score = 0;

// Crea un elemento para mostrar la puntuación
var scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '25%'; // Centra verticalmente
scoreElement.style.left = '50%'; // Centra horizontalmente
scoreElement.style.transform = 'translate(-50%, -50%)'; // Asegura un centrado preciso
scoreElement.style.fontSize = '24px';
scoreElement.style.color = 'black'; // Cambia el color a negro
document.getElementById('score-container').appendChild(scoreElement);

var canvas = document.createElement('canvas');
canvas.id = 'scoreCanvas';
canvas.width = 100;
canvas.height = 100;
document.getElementById('score-container').appendChild(canvas);
drawBresenhamCircle(10, 50, 50);

var canvas2 = document.createElement('canvas');
canvas2.id = 'triangleCanvas';
canvas2.width = 100;
canvas2.height = 100;
document.getElementById('triangle-container').appendChild(canvas2);

// Actualizar puntuación
function updateScore() {
  scoreElement.textContent = score;
}
updateScore();

// Incrementar puntuación cuando un platillo es golpeado
function onDishHit(dish) {
  score += 100;
  updateScore();

  var ctx = document.getElementById('triangleCanvas').getContext('2d');

  var triangles = score / 100; // Cada platillo derribado añade un triángulo
  var base = ctx.canvas.width / 5; // El tamaño del triángulo depende del número de triángulos

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Borra los triángulos existentes

  for (var i = 0; i < triangles; i++) {
    var x = i * base + base / 2; // La posición x del triángulo
    var y = ctx.canvas.height / 2; // La posición y del triángulo (siempre en la parte inferior del canvas)
    var height = base; // La altura del triángulo

    var triangleVertices = drawTriangle(ctx, x, y, base, height); // Dibuja el triángulo

    var line = {
      x0: triangleVertices[0].x,
      y0: triangleVertices[0].y,
      x1: x,
      y1: y - height,
    };

    // Usa clipLine para recortar la línea
    var clippedLine = clipLine(
      line.x0,
      line.y0,
      line.x1,
      line.y1,
      0,
      ctx.canvas.width,
      0,
      ctx.canvas.height
    );

    if (clippedLine) {
      ctx.beginPath();
      ctx.moveTo(clippedLine.x0, clippedLine.y0);
      ctx.lineTo(clippedLine.x1, clippedLine.y0);
      ctx.stroke();
    }

    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(x - base / 2, y);
    ctx.lineTo(x, y - height);
    ctx.lineTo(x + base / 2, y);
    ctx.stroke();
  }
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

function drawTriangle(ctx, x, y, base, height) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - base / 2, y + height);
  ctx.lineTo(x + base / 2, y + height);
  ctx.closePath();
  //ctx.fillStyle = 'blue';
  //ctx.fill();
  // Devuelve los vértices del triángulo
  return [
    { x: x, y: y },
    { x: x - base / 2, y: y + height },
    { x: x + base / 2, y: y + height },
  ];
}

function computeOutCode(x, y, xmin, xmax, ymin, ymax) {
  var code = 0;

  if (x < xmin) code |= 1; // Izquierda
  else if (x > xmax) code |= 2; // Derecha

  if (y < ymin) code |= 4; // Abajo
  else if (y > ymax) code |= 8; // Arriba

  return code;
}

function clipLine(x0, y0, x1, y1, xmin, xmax, ymin, ymax) {
  var outcode0 = computeOutCode(x0, y0, xmin, xmax, ymin, ymax);
  var outcode1 = computeOutCode(x1, y1, xmin, xmax, ymin, ymax);

  while (true) {
    if (!(outcode0 | outcode1)) {
      // Ambos puntos están dentro del área de recorte
      return { x0: x0, y0: y0, x1: x1, y1: y1 };
    } else if (outcode0 & outcode1) {
      // Ambos puntos están fuera del área de recorte en la misma dirección
      return null;
    } else {
      // Al menos un punto está fuera del área de recorte
      var x, y;

      var outcodeOut = outcode0 ? outcode0 : outcode1;

      // Encuentra la intersección del segmento de línea con el borde del área de recorte
      if (outcodeOut & 8) {
        // Arriba
        x = x0 + ((x1 - x0) * (ymax - y0)) / (y1 - y0);
        y = ymax;
      } else if (outcodeOut & 4) {
        // Abajo
        x = x0 + ((x1 - x0) * (ymin - y0)) / (y1 - y0);
        y = ymin;
      } else if (outcodeOut & 2) {
        // Derecha
        y = y0 + ((y1 - y0) * (xmax - x0)) / (x1 - x0);
        x = xmax;
      } else if (outcodeOut & 1) {
        // Izquierda
        y = y0 + ((y1 - y0) * (xmin - x0)) / (x1 - x0);
        x = xmin;
      }

      // Actualiza el punto fuera del área de recorte al punto de intersección
      if (outcodeOut == outcode0) {
        x0 = x;
        y0 = y;
        outcode0 = computeOutCode(x0, y0, xmin, xmax, ymin, ymax);
      } else {
        x1 = x;
        y1 = y;
        outcode1 = computeOutCode(x1, y1, xmin, xmax, ymin, ymax);
      }
    }
  }
}

var lineMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
});

function drawBresenhamCircle(radius, x_center, y_center) {
  var canvas = document.getElementById('scoreCanvas');
  var ctx = canvas.getContext('2d');

  var x = 0;
  var y = radius;
  var d = 3 - 2 * radius;

  while (y >= x) {
    drawPoint(ctx, x_center + x, y_center + y);
    drawPoint(ctx, x_center + y, y_center + x);
    drawPoint(ctx, x_center + y, y_center - x);
    drawPoint(ctx, x_center + x, y_center - y);
    drawPoint(ctx, x_center - x, y_center - y);
    drawPoint(ctx, x_center - y, y_center - x);
    drawPoint(ctx, x_center - y, y_center + x);
    drawPoint(ctx, x_center - x, y_center + y);

    x++;

    if (d > 0) {
      y--;
      d = d + 4 * (x - y) + 10;
    } else {
      d = d + 4 * x + 6;
    }
  }
}

function drawPoint(ctx, x, y) {
  ctx.fillRect(x, y, 1, 1);
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

  wrapAroundGameArea(spaceship);

  spheres.forEach(function (sphere) {
    sphere.position.z -= speed * 2;
  });

  stars.forEach(function (star) {
    star.position.z += speed * 3; // Las estrellas se mueven 5 veces más rápido que las esferas
    if (star.position.z > gameAreaSize) {
      // Si la estrella se pasa de la nave, la reubica al principio
      star.position.x = Math.random() * gameAreaSize * 2 - gameAreaSize;
      star.position.y = Math.random() * gameAreaSize * 2 - gameAreaSize;
      star.position.z = -gameAreaSize;
    }
  });

  dishes.forEach(function (dish) {
    dish.position.x += dish.velocityX;
    dish.position.y += dish.velocityY;
    if (dish.position.x < -gameAreaSize || dish.position.x > gameAreaSize) {
      dish.velocityX *= -1; // Invierte la dirección si la roca alcanza los límites en el eje x
    }
    if (dish.position.y < -gameAreaSize || dish.position.y > gameAreaSize) {
      dish.velocityY *= -1; // Invierte la dirección si la roca alcanza los límites en el eje y
    }
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
        onDishHit(dishes[j]); // Incrementar puntuación
        break;
      }
    }
  }

  renderer.render(scene, camera);
}

animate();
