// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyB3QQKW5kb9I3mZ4vr8lYcSBTEZZ1sAM8s",
  authDomain: "hplabs-jobs.firebaseapp.com",
  projectId: "hplabs-jobs",
  storageBucket: "hplabs-jobs.firebasestorage.app",
  messagingSenderId: "424963153110",
  appId: "1:424963153110:web:cb380d3dff8d5582dafd77",
  measurementId: "G-GGL0HW29KT"
};

// Initialize Firebase (compat)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- DOM elements ---
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const btnLogin = document.getElementById("btn-login");
const btnRegister = document.getElementById("btn-register");
const btnLogout = document.getElementById("btn-logout");
const btnCheckIn = document.getElementById("btn-checkin");
const btnCheckOut = document.getElementById("btn-checkout");
const authMsg = document.getElementById("auth-msg");
const userEmail = document.getElementById("user-email");
const attendanceCard = document.getElementById("attendance-card");
const historyDiv = document.getElementById("history");
const timeNow = document.getElementById("time-now");

// --- Update clock ---
setInterval(() => {
  const now = new Date();
  timeNow.innerText = now.toLocaleTimeString();
}, 1000);

// --- Auth functions ---
btnRegister.addEventListener("click", async () => {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(emailInput.value, passwordInput.value);
    authMsg.innerText = "Đăng ký thành công!";
  } catch (error) {
    authMsg.innerText = error.message;
  }
});

btnLogin.addEventListener("click", async () => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value);
    userEmail.innerText = userCredential.user.email;
    authMsg.innerText = "";
    attendanceCard.classList.remove("hidden");
  } catch (error) {
    authMsg.innerText = error.message;
  }
});

btnLogout.addEventListener("click", async () => {
  await auth.signOut();
  userEmail.innerText = "";
  attendanceCard.classList.add("hidden");
});

// --- Check-in / Check-out ---
btnCheckIn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Vui lòng đăng nhập trước!");
  await db.collection("attendance").add({
    uid: user.uid,
    email: user.email,
    type: "check-in",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
});

btnCheckOut.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Vui lòng đăng nhập trước!");
  await db.collection("attendance").add({
    uid: user.uid,
    email: user.email,
    type: "check-out",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
});

// --- Realtime attendance history ---
db.collection("attendance")
  .orderBy("timestamp", "desc")
  .onSnapshot(snapshot => {
    historyDiv.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      const ts = data.timestamp ? data.timestamp.toDate().toLocaleString() : "--";
      div.innerText = `${data.email} - ${data.type} - ${ts}`;
      historyDiv.appendChild(div);
    });
  });

// --- Three.js 3D ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/2 / window.innerHeight/2, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth/2, window.innerHeight/2);
document.getElementById("three-container").appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
