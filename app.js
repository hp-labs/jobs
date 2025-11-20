// Firebase v9+ modular imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// --- Firebase config: Thay bằng config của Phúc ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Auth functions ---
async function register(email, password){
  try{
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert("Register success!");
  } catch(error){
    alert(error.message);
  }
}

async function login(email, password){
  try{
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    document.getElementById('user-email').innerText = userCredential.user.email;
    document.getElementById('btn-logout').classList.remove('hidden');
  } catch(error){
    alert(error.message);
  }
}

document.getElementById('btn-logout').addEventListener('click', () => {
  signOut(auth);
  document.getElementById('user-email').innerText = "";
  document.getElementById('btn-logout').classList.add('hidden');
});

// --- Check-in / Check-out ---
async function checkIn() {
  const user = auth.currentUser;
  if(!user) return alert("Please login first");
  await addDoc(collection(db, 'attendance'), {
    uid: user.uid,
    email: user.email,
    type: 'check-in',
    timestamp: serverTimestamp()
  });
  alert("Checked in!");
}

async function checkOut() {
  const user = auth.currentUser;
  if(!user) return alert("Please login first");
  await addDoc(collection(db, 'attendance'), {
    uid: user.uid,
    email: user.email,
    type: 'check-out',
    timestamp: serverTimestamp()
  });
  alert("Checked out!");
}

// --- Realtime attendance history ---
const q = query(collection(db, 'attendance'), orderBy('timestamp', 'desc'));
onSnapshot(q, snapshot => {
  const list = document.getElementById('attendance-list');
  list.innerHTML = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    const li = document.createElement('li');
    li.innerText = `${data.email} - ${data.type} - ${data.timestamp?.toDate()}`;
    list.appendChild(li);
  });
});

// --- 3D animation (Three.js) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/2 / window.innerHeight/2, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth/2, window.innerHeight/2);
document.getElementById('three-container').appendChild(renderer.domElement);

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