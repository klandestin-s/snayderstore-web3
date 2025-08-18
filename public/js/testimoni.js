const testimonialsGrid = document.getElementById("testimonialsGrid");
      const zoomModal = document.getElementById("zoomModal");
      const zoomedImage = document.getElementById("zoomedImage");
      const closeZoomModal = document.getElementById("closeZoomModal");
      const menuToggle = document.getElementById("menuToggle");
      const navLinks = document.getElementById("navLinks");
      const loadingOverlay = document.getElementById("loadingOverlay");

      // TAMBAHAN: Elemen untuk login admin
      const adminLoginModal = document.getElementById("adminLoginModal");
      const closeAdminModal = document.getElementById("closeAdminModal");
      const adminLoginForm = document.getElementById("adminLoginForm");
      const adminUsernameInput = document.getElementById("adminUsername");
      const adminPasswordInput = document.getElementById("adminPassword");
      const notification = document.getElementById("notification");

      // Fungsi untuk menampilkan loading
      function showLoading() {
        loadingOverlay.classList.add("show");
      }

      // Fungsi untuk menyembunyikan loading
      function hideLoading() {
        loadingOverlay.classList.remove("show");
      }

      // Fungsi untuk menampilkan notifikasi
      function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type}`;

        setTimeout(() => {
          notification.className = "notification";
        }, 3000);
      }

      async function fetchTestimonials() {
        showLoading(); // Tampilkan loading sebelum fetch

        try {
          const response = await fetch("/api/testimonials");
          if (!response.ok) throw new Error("Gagal memuat testimoni");
          const data = await response.json();

          renderTestimonials(data); // Render testimoni setelah data didapat
        } catch (error) {
          console.error("Error:", error);
          // Tampilkan pesan error jika fetch gagal
          testimonialsGrid.innerHTML = `
                    <div style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger); margin-bottom: 1rem;"></i>
                        <p>Gagal memuat testimoni. Silakan coba lagi nanti.</p>
                        <button class="btn" onclick="location.reload()" style="margin-top: 1rem;">
                            <i class="fas fa-sync-alt"></i> Muat Ulang
                        </button>
                    </div>
                `;
        } finally {
          hideLoading(); // Sembunyikan loading setelah selesai
        }
      }

      // Fungsi untuk menampilkan testimoni
      function renderTestimonials(testimonials) {
        testimonialsGrid.innerHTML = "";

        // Filter hanya testimoni yang terverifikasi
        const verifiedTestimonials = testimonials.filter((t) => t.verified);

        if (verifiedTestimonials.length === 0) {
          testimonialsGrid.innerHTML = `
                    <div style="text-align: center; padding: 2rem; grid-column: 1 / -1;">
                        <i class="fas fa-comment-slash" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                        <p>Belum ada testimoni. Jadilah yang pertama!</p>
                    </div>
                `;
          return;
        }

        verifiedTestimonials.forEach((testimonial, index) => {
          const testimonialCard = document.createElement("div");
          testimonialCard.className = `testimonial-card fade-in ${index > 0 ? "delay-" + index : ""}`;
          testimonialCard.setAttribute("data-product", testimonial.product.toLowerCase());

          // Buat elemen rating bintang
          let starsHtml = "";
          for (let i = 1; i <= 5; i++) {
            if (i <= testimonial.rating) {
              starsHtml += '<i class="fas fa-star"></i>';
            } else {
              starsHtml += '<i class="far fa-star"></i>';
            }
          }

          testimonialCard.innerHTML = `
                    ${testimonial.verified ? '<div class="testimonial-badge">Verified</div>' : ""}
                    <div class="testimonial-image-container">
                        <img src="${testimonial.image}" alt="Bukti testimoni" class="testimonial-image">
                        <div class="zoom-btn" data-image="${testimonial.image}">
                            <i class="fas fa-search-plus"></i>
                        </div>
                    </div>
                    <div class="testimonial-content">
                        <div class="testimonial-header">
                            <div class="testimonial-name">${testimonial.name}</div>
                        </div>
                        <div class="testimonial-product">
                            <i class="fas fa-shopping-bag"></i> ${testimonial.product}
                        </div>
                        <div class="testimonial-rating">
                            ${starsHtml}
                        </div>
                        <!-- Footer baru untuk tanggal -->
                        <div class="testimonial-footer">
                            <div class="testimonial-date">${testimonial.date}</div>
                        </div>
                    </div>
                `;

          testimonialsGrid.appendChild(testimonialCard);
        });

        // Tambahkan event listener untuk tombol zoom
        document.querySelectorAll(".zoom-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            zoomedImage.src = btn.getAttribute("data-image");
            zoomModal.classList.add("active");
          });
        });
      }

      // Toggle menu hamburger
      menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        menuToggle.classList.toggle("active");
      });

      // Tutup menu saat klik di luar
      document.addEventListener("click", function (e) {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
          navLinks.classList.remove("active");
          menuToggle.classList.remove("active");
        }
      });

      // Event listener untuk modal zoom
      closeZoomModal.addEventListener("click", () => {
        zoomModal.classList.remove("active");
      });

      zoomModal.addEventListener("click", (e) => {
        if (e.target === zoomModal) {
          zoomModal.classList.remove("active");
        }
      });

      // ========= FUNGSI LOGIN ADMIN =========
      // Event listener untuk semua tombol admin login
      document.querySelectorAll(".admin-login-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          adminLoginModal.classList.add("active");
        });
      });

      // Event listener untuk menutup modal admin
      closeAdminModal.addEventListener("click", () => {
        adminLoginModal.classList.remove("active");
      });

      // Event listener untuk klik di luar modal admin
      adminLoginModal.addEventListener("click", (e) => {
        if (e.target === adminLoginModal) {
          adminLoginModal.classList.remove("active");
        }
      });

      // Login admin
      adminLoginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = adminUsernameInput.value;
        const password = adminPasswordInput.value;

        // Tampilkan loading
        const submitBtn = adminLoginForm.querySelector(".btn-submit");
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Memproses...';
        submitBtn.disabled = true;

        // Kirim permintaan login ke server
        fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        })
          .then((response) => {
            if (response.status === 401) {
              throw new Error("Unauthorized");
            }
            return response.json();
          })
          .then((data) => {
            if (data.success) {
              localStorage.setItem("adminLoggedIn", "true");
              showNotification("Login berhasil! Mengarahkan ke panel admin...", "success");

              setTimeout(() => {
                window.location.href = "admin-panel.html";
              }, 2000);
            } else {
              showNotification(data.message || "Username atau password salah!", "error");
              submitBtn.innerHTML = originalBtnText;
              submitBtn.disabled = false;
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            if (error.message === "Unauthorized") {
              showNotification("Username atau password salah!", "error");
            } else {
              showNotification("Terjadi kesalahan. Silakan coba lagi.", "error");
            }
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
          });
      });

      // ========= FUNGSI PENCARIAN PRODUK =========
      // Fungsi untuk memfilter testimoni berdasarkan produk
      function filterTestimonials(searchTerm) {
        const cards = document.querySelectorAll(".testimonial-card");
        let hasVisibleCard = false;

        cards.forEach((card) => {
          const productName = card.getAttribute("data-product");

          if (productName.includes(searchTerm.toLowerCase())) {
            card.style.display = "";
            hasVisibleCard = true;
          } else {
            card.style.display = "none";
          }
        });

        // Tampilkan pesan jika tidak ada hasil
        const noResultsMessage = document.getElementById("noResultsMessage");
        if (!hasVisibleCard && searchTerm) {
          if (!noResultsMessage) {
            const messageDiv = document.createElement("div");
            messageDiv.id = "noResultsMessage";
            messageDiv.style.gridColumn = "1 / -1";
            messageDiv.style.textAlign = "center";
            messageDiv.style.padding = "2rem";
            messageDiv.innerHTML = `
                        <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                        <p>Tidak ditemukan testimoni untuk produk <strong>"${searchTerm}"</strong></p>
                    `;
            testimonialsGrid.appendChild(messageDiv);
          }
        } else if (noResultsMessage) {
          noResultsMessage.remove();
        }
      }

      // Setup fungsi pencarian
      function setupSearch() {
        const searchInput = document.getElementById("searchInput");
        const searchContainer = searchInput.parentElement;

        // Buat tombol clear
        const clearBtn = document.createElement("button");
        clearBtn.className = "clear-btn";
        clearBtn.innerHTML = '<i class="fas fa-times"></i>';
        clearBtn.addEventListener("click", () => {
          searchInput.value = "";
          filterTestimonials("");
          clearBtn.style.display = "none";
          searchInput.focus();
        });
        searchContainer.appendChild(clearBtn);

        // Event saat input berubah
        searchInput.addEventListener("input", function () {
          const searchTerm = this.value.trim();
          filterTestimonials(searchTerm);
          clearBtn.style.display = searchTerm ? "" : "none";
        });
      }

      // Panggil saat halaman dimuat
      document.addEventListener("DOMContentLoaded", async () => {
        // Tampilkan loading
        showLoading();

        // Ambil data testimoni
        await fetchTestimonials();

        // Setup fungsi pencarian
        setupSearch();
      });
      grecaptcha.ready(function () {
        grecaptcha.execute("6LfZknsrAAAAAOfe66QaWr0TzRixA1oGm-IMo8sc", { action: "submit" }).then(function (token) {
          // Kirim token ke server
          fetch("/api/verify-recaptcha", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.score > 0.5) {
                console.log("Human verified:", data);
                // lanjutkan proses form atau logika lainnya
              } else {
                console.log("reCAPTCHA failed or suspicious:", data);
              }
            });
        });
      });