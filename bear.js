// bear.js – GỒM CẢ ANIMATION + ĐĂNG NHẬP FIREBASE HOÀN CHỈNH

// ==================== FIREBASE CONFIG ====================
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
  
  // ==================== DOM ELEMENTS ====================
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const btnLogin = document.getElementById("btn-login");
  const authMsg = document.getElementById("auth-msg");
  
  // ==================== MẮT LIẾC THEO CHUỘT ====================
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    eye("eye-left", x, y);
    eye("eye-right", x, y);
  });
  
  function eye(id, x, y) {
    document.getElementById(id).setAttribute("transform", `translate(${x},${y})`);
  }
  
  // ==================== CHE MẮT KHI HIỆN PASS ====================
  function hidePasswordAnimation() {
    document.getElementById("hand-left").style.transform = "translateY(-60px) rotate(-20deg)";
    document.getElementById("hand-right").style.transform = "translateY(-60px) rotate(20deg)";
  }
  function showPasswordAnimation() {
    document.getElementById("hand-left").style.transform = "translateY(0)";
    document.getElementById("hand-right").style.transform = "translateY(0)";
  }
  
  document.getElementById("toggle-pass").addEventListener("click", () => {
    const pass = document.getElementById("password");
    if (pass.type === "password") {
      pass.type = "text";
      showPasswordAnimation();
    } else {
      pass.type = "password";
      hidePasswordAnimation();
    }
  });
  
  // ==================== ANIMATION LỖI & THÀNH CÔNG ====================
  function errorAnimation() {
    document.getElementById("mouth").setAttribute("d", "M120 155 Q150 135 180 155"); // buồn
    document.getElementById("head").animate([
      { transform: "translateX(0px)" },
      { transform: "translateX(-12px)" },
      { transform: "translateX(12px)" },
      { transform: "translateX(0px)" }
    ], { duration: 400, easing: "ease-in-out" });
  }
  
  function successAnimation() {
    document.getElementById("mouth").setAttribute("d", "M120 145 Q150 175 180 145"); // cười
    document.getElementById("head").animate([
      { transform: "translateY(0px)" },
      { transform: "translateY(-18px)" },
      { transform: "translateY(0px)" }
    ], { duration: 600, easing: "ease-out" });
  }
  
  // ==================== XỬ LÝ ĐĂNG NHẬP CHÍNH ====================

  btnLogin.addEventListener("click", async () => {
    const email = emailInput.value.trim()+"@gmail.com";
    const pass = passwordInput.value;
  
    // Reset thông báo
    authMsg.innerText = "";
    authMsg.style.color = "";
  
    // Kiểm tra cơ bản
    if (!email || !pass) {
      authMsg.innerText = "Vui lòng nhập đầy đủ!";
      errorAnimation();
      return;
    }

  
    try {
        await auth.signInWithEmailAndPassword(email, pass);
      
        // THÀNH CÔNG → KIỂM TRA EMAIL BÀ CHỦ
        authMsg.innerText = "Đăng nhập thành công!";
        successAnimation();
      
        // Danh sách email Bà chủ (có thể thêm nhiều)
        //const BOSS_EMAILS = ["sil@gmail.com", "sil", "admin@gmail.com","admin"]; // ← THÊM EMAIL BÀ CHỦ VÀO ĐÂY
        const loggedUsername = auth.currentUser.email.split("@")[0].toLowerCase();

  // Danh sách USERNAME của Bà chủ (chỉ ghi tên ngắn thôi)
        const BOSS_USERNAMES = ["sil", "boss", "admin", "kkk"]; // ← thêm username bà chủ vào đây
        setTimeout(() => {
            if (BOSS_USERNAMES.includes(loggedUsername)) {
              window.location.href = "boss.html";        // Bà chủ
            } else {
              window.location.href = "attendance.html";  // Nhân viên
            }
          }, 1000);
      } catch (error) {
      // LỖI ĐĂNG NHẬP
      let msg = "Sai email hoặc mật khẩu!";
      if (error.code === "auth/user-not-found") msg = "Tài khoản không tồn tại!";
      if (error.code === "auth/wrong-password") msg = "Mật khẩu sai!";
      if (error.code === "auth/too-many-requests") msg = "Thử quá nhiều lần, đợi chút nhé!";
  
      authMsg.innerText = msg;
      authMsg.style.color = "#ff0000";
      errorAnimation();
    }
  });