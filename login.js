// login.js – PHIÊN BẢN HOÀN CHỈNH, CHẠY NGON 100%
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
  const authMsg = document.getElementById("auth-msg");
  const btnLogin = document.getElementById("btn-login");
  
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  // === CHỈ 1 SỰ KIỆN DUY NHẤT, XỬ LÝ TẤT CẢ ===
  btnLogin.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value;
  
    // Reset
    authMsg.innerText = "";
  
    if (!email || !pass) {
      authMsg.innerText = "Vui lòng nhập đầy đủ email và mật khẩu!";
      errorAnimation();
      return;
    }
  
    if (!isValidEmail(email)) {
      authMsg.innerText = "Email không hợp lệ!";
      errorAnimation();
      return;
    }
  
    try {
      await auth.signInWithEmailAndPassword(email, pass);
  
      // THÀNH CÔNG → gấu cười + thông báo + chuyển trang
      authMsg.innerText = "Đăng nhập thành công! Đang chuyển...";
      authMsg.style.color = "#00aa00";
      successAnimation();
  
      setTimeout(() => {
        window.location.href = "attendance.html";
      }, 1000);
  
    } catch (error) {
      // LỖI → gấu buồn
      let msg = "Sai email hoặc mật khẩu!";
      if (error.code === "auth/user-not-found") msg = "Tài khoản không tồn tại!";
      if (error.code === "auth/wrong-password") msg = "Mật khẩu sai!";
      if (error.code === "auth/too-many-requests") msg = "Thử quá nhiều, đợi chút nhé!";
  
      authMsg.innerText = msg;
      authMsg.style.color = "#ff0000";
      errorAnimation();
    }
  });