import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { 
  getFirestore, 
  setDoc, 
  doc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB8mZ82t0siOJOrNJamtvV9L64Ty0GABhQ",
  authDomain: "project-cloud-3f733.firebaseapp.com",
  projectId: "project-cloud-3f733",
  storageBucket: "project-cloud-3f733.firebasestorage.app",
  messagingSenderId: "860711332427",
  appId: "1:860711332427:web:a9baef176010a9544c3bce",
  measurementId: "G-V718741YLY"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ========== FUNGSI UTILITAS ==========

// Buat container untuk toast jika belum ada
function getToastContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

// Tampilkan toast notification yang cantik
function showMessage(message, type = 'info', duration = 5000) {
  const container = getToastContainer();
  
  // Tentukan icon berdasarkan tipe
  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  };
  
  // Tentukan judul berdasarkan tipe
  const titles = {
    success: 'Berhasil',
    error: 'Error',
    warning: 'Peringatan',
    info: 'Informasi'
  };
  
  // Buat element toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      ${icons[type] || icons.info}
    </div>
    <div class="toast-content">
      <p class="toast-title">${titles[type] || titles.info}</p>
      <p class="toast-message">${message}</p>
    </div>
    <button class="toast-close" type="button" aria-label="Close">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;
  
  // Tambahkan toast ke container
  container.appendChild(toast);
  
  // Set CSS variable untuk progress bar duration
  toast.style.setProperty('--toast-duration', `${duration}ms`);
  
  // Fungsi untuk remove toast
  const removeToast = () => {
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  };
  
  // Event listener untuk tombol close
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', removeToast);
  
  // Auto remove setelah duration
  setTimeout(removeToast, duration);
}

// Tampilkan status loading pada tombol
function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.classList.add('loading');
    button.disabled = true;
  } else {
    button.classList.remove('loading');
    button.disabled = false;
  }
}

// Validasi format email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Tampilkan modal konfirmasi kustom
function showConfirm(message, title = 'Konfirmasi', onConfirm, onCancel) {
  // Buat overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  // Buat konten modal
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 class="modal-title">${title}</h3>
      </div>
      <p class="modal-message">${message}</p>
      <div class="modal-actions">
        <button class="modal-btn modal-btn-cancel" type="button">Batal</button>
        <button class="modal-btn modal-btn-confirm" type="button">Ya, Keluar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Fungsi untuk close modal
  const closeModal = () => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 200);
  };
  
  // Event listener untuk tombol
  const cancelBtn = overlay.querySelector('.modal-btn-cancel');
  const confirmBtn = overlay.querySelector('.modal-btn-confirm');
  
  cancelBtn.addEventListener('click', () => {
    closeModal();
    if (onCancel) onCancel();
  });
  
  confirmBtn.addEventListener('click', () => {
    closeModal();
    if (onConfirm) onConfirm();
  });
  
  // Close saat klik overlay (opsional)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
      if (onCancel) onCancel();
    }
  });
}

// ========== HALAMAN REGISTER ==========
const registerForm = document.getElementById("registerForm");
const registerBtn = document.getElementById("registerBtn");

if (registerForm && registerBtn) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirmPassword").value;

    if (!name || !email || !password || !confirmPassword) {
      showMessage("Semua field harus diisi!", "error");
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("Format email tidak valid!", "error");
      return;
    }

    if (password.length < 8) {
      showMessage("Password minimal 8 karakter!", "error");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Password dan konfirmasi password tidak cocok!", "error");
      return;
    }

    setButtonLoading(registerBtn, true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", userCred.user.uid), {
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
        verified: false
      });

      await sendEmailVerification(userCred.user);

      showMessage("Registrasi berhasil! Silakan cek email Anda untuk verifikasi.", "success", 4500);
      
      setTimeout(() => {
        window.location.href = "index.html";
      }, 5000);

    } catch (err) {
      console.error("Error register:", err);
      
      if (err.code === "auth/email-already-in-use") {
        showMessage("Email sudah digunakan. Silakan login atau gunakan email lain.", "error");
      } else if (err.code === "auth/invalid-email") {
        showMessage("Format email tidak valid!", "error");
      } else if (err.code === "auth/weak-password") {
        showMessage("Password terlalu lemah! Gunakan kombinasi huruf dan angka.", "error");
      } else if (err.code === "auth/network-request-failed") {
        showMessage("Koneksi internet bermasalah. Periksa koneksi Anda dan coba lagi.", "error");
      } else {
        showMessage("Terjadi kesalahan: " + err.message, "error");
      }
    } finally {
      setButtonLoading(registerBtn, false);
    }
  });
}

// ========== HALAMAN LOGIN ==========
const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");

// Cek apakah ada parameter logout=success di URL
const loginPageParams = new URLSearchParams(window.location.search);
if (loginPageParams.get('logout') === 'success') {
  // Tampilkan pesan logout berhasil
  setTimeout(() => {
    showMessage("Logout berhasil! Sampai jumpa lagi.", "success", 4000);
  }, 500);
  
  // Hapus parameter dari URL agar tidak muncul lagi saat refresh
  window.history.replaceState({}, document.title, window.location.pathname);
}

if (loginForm && loginBtn) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      showMessage("Email dan password harus diisi!", "error");
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("Format email tidak valid!", "error");
      return;
    }

    setButtonLoading(loginBtn, true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      if (!userCred.user.emailVerified) {
        showMessage("Email belum diverifikasi! Silakan cek inbox dan spam folder Anda.", "warning");
        await signOut(auth);
        setButtonLoading(loginBtn, false);
        return;
      }

      // Redirect dengan parameter login sukses
      window.location.href = "dashboard.html?login=success";

    } catch (err) {
      console.error("Error login:", err);
      
      if (err.code === "auth/user-not-found") {
        showMessage("Email tidak terdaftar. Silakan register terlebih dahulu.", "error");
      } else if (err.code === "auth/wrong-password") {
        showMessage("Password salah! Silakan coba lagi.", "error");
      } else if (err.code === "auth/invalid-email") {
        showMessage("Format email tidak valid!", "error");
      } else if (err.code === "auth/invalid-credential") {
        showMessage("Email atau password salah!", "error");
      } else if (err.code === "auth/network-request-failed") {
        showMessage("Koneksi internet bermasalah. Periksa koneksi Anda dan coba lagi.", "error");
      } else if (err.code === "auth/too-many-requests") {
        showMessage("Terlalu banyak percobaan login. Coba lagi nanti.", "error");
      } else {
        showMessage("Login gagal: " + err.message, "error");
      }
    } finally {
      setButtonLoading(loginBtn, false);
    }
  });
}

// ========== LUPA PASSWORD ==========
const forgotLink = document.getElementById("forgotPassword");

if (forgotLink) {
  forgotLink.addEventListener("click", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("loginEmail");
    const email = emailInput ? emailInput.value.trim() : "";

    if (!email) {
      showMessage("Masukkan email Anda terlebih dahulu untuk reset password.", "warning");
      if (emailInput) emailInput.focus();
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("Format email tidak valid!", "error");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showMessage("Email reset password telah dikirim! Silakan cek inbox dan spam folder Anda.", "success");
    } catch (error) {
      console.error("Error reset password:", error);
      
      if (error.code === "auth/user-not-found") {
        showMessage("Email tidak terdaftar. Pastikan email sudah benar.", "error");
      } else if (error.code === "auth/invalid-email") {
        showMessage("Format email tidak valid!", "error");
      } else if (error.code === "auth/network-request-failed") {
        showMessage("Koneksi internet bermasalah. Coba lagi nanti.", "error");
      } else {
        showMessage("Terjadi kesalahan: " + error.message, "error");
      }
    }
  });
}

// ========== LOGOUT ==========
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    showConfirm(
      "Apakah Anda yakin ingin keluar dari akun Anda?",
      "Konfirmasi Logout",
      async () => {
        setButtonLoading(logoutBtn, true);

        try {
          await signOut(auth);
          
          // Redirect dengan parameter logout
          window.location.href = "index.html?logout=success";
        } catch (err) {
          console.error("Error logout:", err);
          showMessage("Logout gagal: " + err.message, "error");
          setButtonLoading(logoutBtn, false);
        }
      }
    );
  });
}

// ========== DASHBOARD & STATUS AUTENTIKASI ==========

// Cek parameter login success SEBELUM onAuthStateChanged
const dashboardParams = new URLSearchParams(window.location.search);
if (dashboardParams.get('login') === 'success') {
  // Tampilkan toast login berhasil
  setTimeout(() => {
    showMessage("Selamat datang! Login berhasil.", "success", 4000);
  }, 500);
  
  // Hapus parameter dari URL
  window.history.replaceState({}, document.title, window.location.pathname);
}

onAuthStateChanged(auth, async (user) => {
  const path = window.location.pathname;
  const fileName = path.substring(path.lastIndexOf('/') + 1);
  
  if (user && (fileName === "dashboard.html" || fileName === "")) {
    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        
        const welcomeText = document.getElementById("welcomeText");
        if (welcomeText) {
          welcomeText.textContent = `Halo, ${userData.name}! 👋`;
        }

        const userEmailElement = document.getElementById("userEmail");
        if (userEmailElement) {
          userEmailElement.textContent = user.email;
        }

        const userIdElement = document.getElementById("userId");
        if (userIdElement) {
          userIdElement.textContent = user.uid.substring(0, 12) + "...";
        }

        const createdAtElement = document.getElementById("createdAt");
        if (createdAtElement && userData.createdAt) {
          const date = new Date(userData.createdAt);
          createdAtElement.textContent = date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      } else {
        console.error("Dokumen user tidak ditemukan di Firestore");
        
        await setDoc(doc(db, "users", user.uid), {
          name: user.email.split('@')[0],
          email: user.email,
          createdAt: new Date().toISOString(),
          verified: user.emailVerified
        });
        
        window.location.reload();
      }
    } catch (err) {
      console.error("Error mengambil data user:", err);
      
      if (err.code === "permission-denied") {
        showMessage("Tidak ada izin mengakses data. Silakan login ulang.", "error");
        await signOut(auth);
        window.location.href = "index.html";
      }
    }
  } 
  else if (!user && (fileName === "dashboard.html" || path.includes("dashboard"))) {
    window.location.href = "index.html";
  }
  else if (user && (fileName === "index.html" || fileName === "register.html")) {
    if (user.emailVerified) {
      window.location.href = "dashboard.html";
    }
  }
});

// ========== MONITORING STATUS JARINGAN ==========
window.addEventListener('online', () => {
  console.log('Koneksi internet kembali');
});

window.addEventListener('offline', () => {
  showMessage('Koneksi internet terputus. Periksa koneksi Anda.', 'warning');
});

// ========== MENCEGAH FORM RESUBMISSION ==========
if (window.history.replaceState) {
  window.history.replaceState(null, null, window.location.href);
}