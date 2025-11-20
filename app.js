/* app.js - Firebase + Three.js + Attendance logic
   => PHẢI chỉnh firebaseConfig bằng config từ Firebase console
*/

// ----------------- Firebase config (THAY THẾ BẰNG CỦA PHÚC) -----------------
const firebaseConfig = {
  apiKey: "REPLACE_API_KEY",
  authDomain: "REPLACE_AUTH_DOMAIN",
  projectId: "REPLACE_PROJECT_ID",
  // ... các trường khác nếu có
};
// -------------------------------------------------------------------------
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --------- UI elements ----------
const emailEl = document.getElementById('email');
const passEl  = document.getElementById('password');
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const authMsg = document.getElementById('auth-msg');
const authCard = document.getElementById('auth-card');
const attendanceCard = document.getElementById('attendance-card');
const btnCheckin = document.getElementById('btn-checkin');
const btnCheckout = document.getElementById('btn-checkout');
const historyEl = document.getElementById('history');
const userEmailEl = document.getElementById('user-email');
const btnLogout = document.getElementById('btn-logout');
const timeNowEl = document.getElementById('time-now');

// ---------- Auth actions ----------
btnRegister.onclick = async () => {
  authMsg.textContent = 'Đang tạo...';
  try{
    const u = await auth.createUserWithEmailAndPassword(emailEl.value, passEl.value);
    authMsg.textContent = 'Đã tạo tài khoản: ' + u.user.email;
  }catch(e){
    authMsg.textContent = 'Lỗi: ' + e.message;
  }
};

btnLogin.onclick = async () => {
  authMsg.textContent = 'Đang đăng nhập...';
  try{
    const u = await auth.signInWithEmailAndPassword(emailEl.value, passEl.value);
    authMsg.textContent = 'Đăng nhập thành công';
  }catch(e){
    authMsg.textContent = 'Lỗi: ' + e.message;
  }
};

btnLogout.onclick = () => auth.signOut();

// ---------- Auth state observer ----------
auth.onAuthStateChanged(async user => {
  if(user){
    userEmailEl.textContent = user.email;
    btnLogout.classList.remove('hidden');
    authCard.classList.add('hidden');
    attendanceCard.classList.remove('hidden');
    loadHistory();
  }else{
    userEmailEl.textContent = '';
    btnLogout.classList.add('hidden');
    authCard.classList.remove('hidden');
    attendanceCard.classList.add('hidden');
    historyEl.innerHTML = '';
  }
});

// ---------- Attendance actions ----------
btnCheckin.onclick = async () => {
  const u = auth.currentUser;
  if(!u) return alert('Chưa đăng nhập');
  const now = new Date();
  const doc = {
    uid: u.uid,
    email: u.email,
    checkin: firebase.firestore.Timestamp.fromDate(now),
    checkout: null,
    date: now.toISOString().slice(0,10)
  };
  await db.collection('attendance').add(doc);
  await loadHistory();
  alert('Check in: ' + now.toLocaleString());
};

btnCheckout.onclick = async () => {
  const u = auth.currentUser;
  if(!u) return alert('Chưa đăng nhập');
  // Tìm bản ghi hôm nay có checkout = null
  const today = new Date().toISOString().slice(0,10);
  const q = await db.collection('attendance')
    .where('uid','==',u.uid)
    .where('date','==',today)
    .where('checkout','==',null)
    .orderBy('checkin','desc')
    .limit(1)
    .get();
  if(q.empty){ alert('Không có bản ghi check in chưa checkout hôm nay'); return; }
  const docRef = q.docs[0].ref;
  await docRef.update({ checkout: firebase.firestore.Timestamp.fromDate(new Date()) });
  await loadHistory();
  alert('Check out thành công');
};

// ---------- Load history ----------
async function loadHistory(){
  const u = auth.currentUser;
  if(!u) return;
  const q = await db.collection('attendance')
    .where('uid','==',u.uid)
    .orderBy('checkin','desc')
    .limit(50)
    .get();
  historyEl.innerHTML = '';
  q.forEach(d => {
    const data = d.data();
    const ci = data.checkin ? data.checkin.toDate().toLocaleString() : '-';
    const co = data.checkout ? data.checkout.toDate().toLocaleString() : '-';
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `<strong>${data.date}</strong><div>In: ${ci}</div><div>Out: ${co}</div>`;
    historyEl.appendChild(div);
  });
}

// ---------- Clock ----------
setInterval(()=> {
  const now = new Date();
  timeNowEl.textContent = now.toLocaleTimeString();
}, 500);

// ---------------- Three.js simple scene ----------------
const container = document.getElementById('three-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(5,10,7); scene.add(dir);

// Create a rotating 3D "attendance card"
const group = new THREE.Group();
scene.add(group);
const geo = new THREE.BoxGeometry(6,3.5,0.3);
const mat = new THREE.MeshStandardMaterial({ color: 0x0ea5a4, metalness:0.2, roughness:0.2 });
const card = new THREE.Mesh(geo, mat);
card.position.z = 0;
group.add(card);

// Text using CanvasTexture
function makeTextTexture(text, opts={}){
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#061826'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#e6f0fb'; ctx.font = '56px sans-serif';
  ctx.fillText(text, 60, 140);
  ctx.font = '36px sans-serif';
  ctx.fillText(opts.line || 'Chấm Công 3D', 60, 220);
  return new THREE.CanvasTexture(canvas);
}
const tex = makeTextTexture('Chào mừng đến hệ thống chấm công', {line:'Sử dụng Firebase'});
const faceMat = new THREE.MeshStandardMaterial({ map: tex });
const front = new THREE.Mesh(new THREE.PlaneGeometry(5.9,3.4), faceMat);
front.position.z = 0.17; front.position.y = 0; group.add(front);

camera.position.set(0,0,10);
function animate(){
  requestAnimationFrame(animate);
  group.rotation.y += 0.006;
  renderer.render(scene, camera);
}
animate();

// Resize handling
window.addEventListener('resize', ()=> {
  renderer.setSize(container.clientWidth, container.clientHeight);
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
});