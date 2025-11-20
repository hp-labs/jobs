// === THREEJS BASIC SETUP ===
const container = document.getElementById("duck-container");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.offsetWidth / 200, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(container.offsetWidth, 200);
container.appendChild(renderer.domElement);

// === LIGHT ===
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(3, 3, 5);
scene.add(light);

// === CUTE DUCK (simple sphere + beak + eyes) ===
const duck = new THREE.Group();

// Body
const body = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xffd369 })
);
duck.add(body);

// Eyes
const eyeGeo = new THREE.SphereGeometry(0.15, 16, 16);
const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });

const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
const eyeR = new THREE.Mesh(eyeGeo, eyeMat);

eyeL.position.set(-0.35, 0.3, 0.9);
eyeR.position.set(0.35, 0.3, 0.9);

duck.add(eyeL);
duck.add(eyeR);

// Beak
const beak = new THREE.Mesh(
  new THREE.ConeGeometry(0.25, 0.6, 32),
  new THREE.MeshStandardMaterial({ color: 0xff7b54 })
);
beak.rotation.x = Math.PI / 2;
beak.position.set(0, 0, 1.05);
duck.add(beak);

scene.add(duck);

camera.position.z = 4;

// === FOLLOW MOUSE ===
window.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 0.6;
  const y = (e.clientY / window.innerHeight - 0.5) * -0.6;

  duck.rotation.y = x;  
  duck.rotation.x = y;
});

// === ANIMATE ===
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
