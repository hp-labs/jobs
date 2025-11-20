// attendance.js - PHIÊN BẢN HOẠT ĐỘNG ỔN ĐỊNH

// Dùng đúng config của bạn (copy từ login.js)
const firebaseConfig = {
  apiKey: "AIzaSyB3QQKW5kb9I3mZ4vr8lYcSBTEZZ1sAM8s",
  authDomain: "hplabs-jobs.firebaseapp.com",
  projectId: "hplabs-jobs",
  storageBucket: "hplabs-jobs.firebasestorage.app",
  messagingSenderId: "424963153110",
  appId: "1:424963153110:web:cb380d3dff8d5582dafd77",
  measurementId: "G-GGL0HW29KT"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM
const btnLogout = document.getElementById("btn-logout");
const userEmail = document.getElementById("user-email");
const dateInput = document.getElementById("date");
const timeInInput = document.getElementById("time-in");
const timeOutInput = document.getElementById("time-out");
const btnSave = document.getElementById("btn-save");
const historyDiv = document.getElementById("history");

// Kiểm tra đăng nhập - QUAN TRỌNG
auth.onAuthStateChanged(user => {
  if (!user) {
    // Chưa đăng nhập → đẩy về login
    window.location.href = "index.html";
  } else {
    // Đã đăng nhập → hiển thị email
    userEmail.innerText = user.email;
    loadHistory(); // tải lịch sử luôn
  }
});

// Đăng xuất
btnLogout.addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
});

// Lưu chấm công
btnSave.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Chưa đăng nhập!");

  const date = dateInput.value;
  const timeIn = timeInInput.value;
  const timeOut = timeOutInput.value;

  if (!date || !timeIn || !timeOut) {
    alert("Vui lòng điền đầy đủ!");
    return;
  }

  try {
    await db.collection("attendance").add({
      uid: user.uid,
      email: user.email,
      date,
      timeIn,
      timeOut,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("Chấm công thành công!");
    dateInput.value = timeInInput.value = timeOutInput.value = "";
  } catch (e) {
    alert("Lỗi: " + e.message);
  }
});

// Tải lịch sử
function loadHistory() {
  db.collection("attendance")
    .orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      historyDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const d = doc.data();
        const div = document.createElement("div");
        const ts = d.timestamp ? d.timestamp.toDate().toLocaleString() : "N/A";
        div.innerHTML = `<b>${d.date}</b> | ${d.timeIn} → ${d.timeOut} | ${d.email} <small>(${ts})</small>`;
        div.style.padding = "8px";
        div.style.borderBottom = "1px solid #eee";
        historyDiv.appendChild(div);
      });
    });
}