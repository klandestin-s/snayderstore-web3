document.addEventListener("DOMContentLoaded", function () {
      const adminLoginModal = document.getElementById("adminLoginModal");
      const closeAdminModal = document.getElementById("closeAdminModal");
      const adminLoginForm = document.getElementById("adminLoginForm");
      const adminUsernameInput = document.getElementById("adminUsername");
      const adminPasswordInput = document.getElementById("adminPassword");
      const notification = document.getElementById("notification");
      const adminLoginBtns = document.querySelectorAll(".admin-login-btn");
      const menuToggle = document.getElementById("menuToggle");
      const navLinks = document.getElementById("navLinks");

      // Tampilkan notifikasi
      function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type}`;

        setTimeout(() => {
          notification.className = "notification";
        }, 3000);
      }
      // Event listener untuk tombol admin login
      adminLoginBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          adminLoginModal.classList.add("active");
        });
      });

      // Tutup modal admin
      closeAdminModal.addEventListener("click", () => {
        adminLoginModal.classList.remove("active");
      });

      // Tutup modal jika klik di luar
      adminLoginModal.addEventListener("click", function (e) {
        if (e.target === adminLoginModal) {
          adminLoginModal.classList.remove("active");
        }
      });

      // Toggle menu mobile
      menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
      });

      // Tutup menu ketika klik di luar area menu
      document.addEventListener("click", function (e) {
        if (!navLinks.contains(e.target) && 
            !menuToggle.contains(e.target) && 
            navLinks.classList.contains('active')) {
          navLinks.classList.remove("active");
          menuToggle.classList.remove("active");
        }
      });

      // Login admin
      adminLoginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = adminUsernameInput.value;
        const password = adminPasswordInput.value;

        // Kirim permintaan login ke server
        fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        })
        .then(response => {
          if (response.status === 401) {
            throw new Error('Unauthorized');
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            localStorage.setItem("adminLoggedIn", "true");
            showNotification("Login berhasil! Mengarahkan ke panel admin...", "success");

            setTimeout(() => {
              window.location.href = "admin-panel.html";
            }, 2000);
          } else {
            showNotification(data.message || "Username atau password salah!", "error");
          }
        })
        .catch(error => {
          console.error('Error:', error);
          if (error.message === 'Unauthorized') {
            showNotification("Username atau password salah!", "error");
          } else {
            showNotification("Terjadi kesalahan. Silakan coba lagi.", "error");
          }
        });
      });
    });
    
    // Fungsi untuk mengatur status config
    const configStatus = {
      xl: true,
      telkomsel: true,
      axis: true,
      byu: true,
      isat: true,
      smartfren: true,
      special: true
    };

    function applyConfigStatus() {
      document.querySelectorAll(".category-title").forEach(title => {
        const categoryKey = title.dataset.category;
        const statusIndicator = title.parentElement.querySelector(".status-indicator");

        if (!categoryKey || !statusIndicator) return;

        const isActive = configStatus[categoryKey];

        if (isActive) {
          statusIndicator.classList.remove("status-inactive");
          statusIndicator.classList.add("status-active");
          statusIndicator.querySelector(".status-text").textContent = "Active";
        } else {
          statusIndicator.classList.remove("status-active");
          statusIndicator.classList.add("status-inactive");
          statusIndicator.querySelector(".status-text").textContent = "Non-Active";
        }
      });
    }

    document.addEventListener("DOMContentLoaded", applyConfigStatus);