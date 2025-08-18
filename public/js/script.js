const menuToggle = document.getElementById("menuToggle");
      const navLinks = document.getElementById("navLinks");
      const adminLoginBtns = document.querySelectorAll(".admin-login-btn");
      const adminLoginModal = document.getElementById("adminLoginModal");
      const closeAdminModal = document.getElementById("closeAdminModal");
      const adminLoginForm = document.getElementById("adminLoginForm");
      const notification = document.getElementById("notification");
      const loadingOverlay = document.getElementById("loadingOverlay");

      // Toggle mobile menu
      menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        menuToggle.classList.toggle("active");
      });

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
          menuToggle.classList.remove("active");
        }
      });

      // Admin login buttons
      adminLoginBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          adminLoginModal.classList.add("active");
        });
      });

      // Close admin modal
      closeAdminModal.addEventListener("click", () => {
        adminLoginModal.classList.remove("active");
      });

      // Close modal when clicking outside
      adminLoginModal.addEventListener("click", (e) => {
        if (e.target === adminLoginModal) {
          adminLoginModal.classList.remove("active");
        }
      });

      // Admin login form submission
      adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("adminUsername").value;
        const password = document.getElementById("adminPassword").value;

        try {
          const response = await fetch("/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (data.success) {
            localStorage.setItem("adminLoggedIn", "true");
            showNotification("Login berhasil! Mengarahkan ke panel admin...", "success");

            setTimeout(() => {
              window.location.href = "admin-panel.html";
            }, 2000);
          } else {
            showNotification(data.message || "Username atau password salah!", "error");
          }
        } catch (error) {
          console.error("Login error:", error);
          showNotification("Terjadi kesalahan. Silakan coba lagi.", "error");
        }
      });

      // Show notification
      function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type}`;

        setTimeout(() => {
          notification.className = "notification";
        }, 3000);
      }

      // ReCAPTCHA untuk keamanan form
      grecaptcha.ready(function () {
        grecaptcha.execute("6LfZknsrAAAAAOfe66QaWr0TzRixA1oGm-IMo8sc", { action: "submit" }).then(function (token) {
          // Kirim token ke server jika diperlukan
          // Contoh implementasi bisa ditambahkan di sini
        });
      });