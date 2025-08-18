<script>
        const detailModal = document.getElementById("detailModal");
        const closeDetailModal = document.getElementById("closeDetailModal");
        const orderModal = document.getElementById("orderModal");
        const closeOrderModal = document.getElementById("closeOrderModal");
        const orderForm = document.getElementById("orderForm");
        const productNameInput = document.getElementById("productName");
        const productPriceInput = document.getElementById("productPrice");
        const packageSelect = document.getElementById("packageSelect");
        const productDescriptionInput = document.getElementById("productDescription");
        const packageList = document.getElementById("packageList");
        const detailProductTitle = document.getElementById("detailProductTitle");
        const detailProductDescription = document.getElementById("detailProductDescription");
        const orderFromDetailBtn = document.getElementById("orderFromDetailBtn");
        const adminLoginModal = document.getElementById("adminLoginModal");
        const closeAdminModal = document.getElementById("closeAdminModal");
        const adminLoginForm = document.getElementById("adminLoginForm");
        const adminUsernameInput = document.getElementById("adminUsername");
        const adminPasswordInput = document.getElementById("adminPassword");
        const productsGrid = document.getElementById("productsGrid");
        const trendingGrid = document.getElementById("trendingGrid");
        const notification = document.getElementById("notification");
        const submitOrderBtn = document.getElementById("submitOrderBtn");
        const loadingOverlay = document.getElementById("loadingOverlay");
        const menuToggle = document.getElementById("menuToggle");
        const navLinks = document.getElementById("navLinks");
        const searchInput = document.getElementById("searchInput");
        const imageZoomModal = document.getElementById("imageZoomModal");
        const closeImageZoomModal = document.getElementById("closeImageZoomModal");
        const zoomedImage = document.getElementById("zoomedImage");

        let products = [];
        let selectedProduct = null;
        let selectedPackage = null;

        function formatPrice(price) {
            return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
            }).format(price);
        }

        function showNotification(message, type) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            setTimeout(() => {
                notification.className = "notification";
            }, 3000);
        }

        async function fetchProducts() {
            try {
                const response = await fetch("/api/products");
                if (!response.ok) throw new Error("Gagal memuat produk");
                return await response.json();
            } catch (error) {
                console.error("Error fetching products:", error);
                showNotification("Gagal memuat data produk", "error");
                return [];
            }
        }

        function renderProducts(products) {
            productsGrid.innerHTML = "";

            const filteredProducts = products.filter((p) => !p.rating || p.rating <= 4.5);

            filteredProducts.forEach((product, index) => {
                const card = document.createElement("div");
                card.className = `product-card fade-in ${index > 0 ? "delay-" + index : ""}`;
                const badge = product.badge ? `<span class="product-badge">${product.badge}</span>` : "";

                card.innerHTML = `
                    ${badge}
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-content">
                        <div class="product-top">
                            <h3 class="product-title">${product.name}</h3>
                        </div>
                        <div class="product-spacer"></div>
                        <div class="product-description-container">
                            <p class="product-description">${product.description}</p>
                        </div>
                        <div class="product-footer">
                            <p class="product-price">Mulai ${formatPrice(product.price)}</p>
                            <div class="product-actions">
                                <button class="action-btn btn-order" data-product="${product.id}">
                                    <i class="fas fa-shopping-cart"></i> Order
                                </button>
                                <button class="action-btn btn-details" data-product="${product.id}">
                                    <i class="fas fa-info-circle"></i> Detail
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                productsGrid.appendChild(card);

                card.querySelector(".product-image").addEventListener("click", function () {
                    openImageZoomModal(product.image);
                });
            });

            document.querySelectorAll(".btn-details").forEach((button) => {
                button.addEventListener("click", function () {
                    const productId = this.getAttribute("data-product");
                    openDetailModal(productId);
                });
            });

            document.querySelectorAll(".btn-order").forEach((button) => {
                button.addEventListener("click", function () {
                    const productId = this.getAttribute("data-product");
                    openOrderModal(productId);
                });
            });
        }

        function renderTrendingProducts(products) {
            trendingGrid.innerHTML = "";

            const trendingProducts = products.filter((p) => p.rating > 4.5);

            if (trendingProducts.length === 0) {
                trendingGrid.innerHTML = `
                    <div class="no-trending">
                        <i class="fas fa-star"></i>
                        <h3>Tidak ada produk trending saat ini</h3>
                        <p>Cek kembali nanti ya!</p>
                    </div>
                `;
                return;
            }

            trendingProducts.forEach((product, index) => {
                const card = document.createElement("div");
                card.className = `product-card fade-in ${index > 0 ? "delay-" + index : ""}`;

                card.innerHTML = `
                    <span class="product-badge trending-badge">TRENDING</span>
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-content">
                        <div class="product-top">
                            <h3 class="product-title">${product.name}</h3>
                        </div>
                        <div class="product-spacer"></div>
                        <div class="product-description-container">
                            <p class="product-description">${product.description}</p>
                        </div>
                        <div class="product-stats">
                            <div class="product-stat">
                                <i class="fas fa-star"></i> ${product.rating.toFixed(1)}
                            </div>
                            <div class="product-stat">
                                <i class="fas fa-shopping-cart"></i> ${product.sold}
                            </div>
                            <div class="product-stat">
                                <i class="fas fa-eye"></i> ${product.views}
                            </div>
                        </div>
                        <div class="product-footer">
                            <p class="product-price">Mulai ${formatPrice(product.price)}</p>
                            <div class="product-actions">
                                <button class="action-btn btn-order" data-product="${product.id}">
                                    <i class="fas fa-shopping-cart"></i> Order
                                </button>
                                <button class="action-btn btn-details" data-product="${product.id}">
                                    <i class="fas fa-info-circle"></i> Detail
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                trendingGrid.appendChild(card);

                card.querySelector(".product-image").addEventListener("click", function () {
                    openImageZoomModal(product.image);
                });
            });

            trendingGrid.querySelectorAll(".btn-details").forEach((button) => {
                button.addEventListener("click", function () {
                    const productId = this.getAttribute("data-product");
                    openDetailModal(productId);
                });
            });

            trendingGrid.querySelectorAll(".btn-order").forEach((button) => {
                button.addEventListener("click", function () {
                    const productId = this.getAttribute("data-product");
                    openOrderModal(productId);
                });
            });
        }

        function openImageZoomModal(imageUrl) {
            zoomedImage.src = imageUrl;
            imageZoomModal.classList.add("active");
            document.body.style.overflow = "hidden";
        }

        function openDetailModal(productId) {
            selectedProduct = products.find((p) => p.id == productId);

            if (selectedProduct) {
                detailProductTitle.textContent = selectedProduct.name;
                detailProductDescription.textContent = selectedProduct.description;

                packageList.innerHTML = "";
                if (selectedProduct.packages && selectedProduct.packages.length > 0) {
                    selectedProduct.packages.forEach((pkg) => {
                        const packageItem = document.createElement("div");
                        packageItem.className = "package-item";
                        packageItem.innerHTML = `
                            <div class="package-name">${pkg.name}</div>
                            <div class="package-price">${formatPrice(pkg.price)}</div>
                            <div style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">${pkg.description || ""}</div>
                        `;
                        packageList.appendChild(packageItem);
                    });
                } else {
                    packageList.innerHTML = "<p>Tidak ada paket tersedia</p>";
                }

                detailModal.classList.add("active");
            }
        }

        function openOrderModal(productId) {
            selectedProduct = products.find((p) => p.id == productId);

            if (selectedProduct) {
                productNameInput.value = selectedProduct.name;
                productDescriptionInput.value = selectedProduct.description;

                packageSelect.innerHTML = '<option value="">-- Pilih Paket --</option>';

                if (selectedProduct.packages && selectedProduct.packages.length > 0) {
                    selectedProduct.packages.forEach((pkg) => {
                        const option = document.createElement("option");
                        option.value = pkg.id;
                        option.textContent = `${pkg.name} - ${formatPrice(pkg.price)}`;
                        option.setAttribute("data-price", pkg.price);
                        option.setAttribute("data-name", pkg.name);
                        packageSelect.appendChild(option);
                    });

                    packageSelect.value = selectedProduct.packages[0].id;
                    productPriceInput.value = formatPrice(selectedProduct.packages[0].price);
                    selectedPackage = selectedProduct.packages[0];
                } else {
                    const option = document.createElement("option");
                    option.value = "default";
                    option.textContent = "Paket Standar";
                    packageSelect.appendChild(option);
                    packageSelect.disabled = true;
                    productPriceInput.value = formatPrice(selectedProduct.price);
                    selectedPackage = {
                        id: "default",
                        name: "Paket Standar",
                        price: selectedProduct.price,
                    };
                }

                orderModal.classList.add("active");
            }
        }

        packageSelect.addEventListener("change", function () {
            const selectedOption = packageSelect.options[packageSelect.selectedIndex];
            const price = selectedOption.getAttribute("data-price");
            const name = selectedOption.getAttribute("data-name");

            if (price && name) {
                productPriceInput.value = formatPrice(parseInt(price));
                selectedPackage = {
                    id: selectedOption.value,
                    name,
                    price: parseInt(price),
                };
            }
        });

        function closeModal() {
            detailModal.classList.remove("active");
            orderModal.classList.remove("active");
            adminLoginModal.classList.remove("active");
            imageZoomModal.classList.remove("active");
            document.body.style.overflow = "auto";
            selectedProduct = null;
            selectedPackage = null;
        }

        orderFromDetailBtn.addEventListener("click", function () {
            if (selectedProduct) {
                closeModal();
                setTimeout(() => {
                    openOrderModal(selectedProduct.id);
                }, 300);
            }
        });

        closeDetailModal.addEventListener("click", closeModal);
        closeOrderModal.addEventListener("click", closeModal);
        closeAdminModal.addEventListener("click", closeModal);
        closeImageZoomModal.addEventListener("click", closeModal);

        detailModal.addEventListener("click", function (e) {
            if (e.target === detailModal) {
                closeModal();
            }
        });

        orderModal.addEventListener("click", function (e) {
            if (e.target === orderModal) {
                closeModal();
            }
        });

        adminLoginModal.addEventListener("click", function (e) {
            if (e.target === adminLoginModal) {
                closeModal();
            }
        });

        imageZoomModal.addEventListener("click", function (e) {
            if (e.target === imageZoomModal) {
                closeModal();
            }
        });

        orderForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const customerName = document.getElementById("customerName").value.trim();

            if (!customerName) {
                showNotification("Silakan isi nama lengkap Anda", "warning");
                return;
            }

            if (!selectedPackage) {
                showNotification("Silakan pilih paket terlebih dahulu", "warning");
                return;
            }

            submitOrderBtn.innerHTML = '<span class="loading"></span> Mengirim pesan...';
            submitOrderBtn.disabled = true;

            let message = `Halo Admin SNAYDER'S STORE, saya ingin melakukan pemesanan:\n\n`;
            message += `Nama: ${customerName}\n`;
            message += `Produk: ${selectedProduct.name}\n`;
            message += `Paket: ${selectedPackage.name}\n`;
            message += `Harga: ${formatPrice(selectedPackage.price)}\n\n`;
            message += `Deskripsi Produk:\n${selectedProduct.description}\n\n`;
            message += `Terima kasih, saya tunggu konfirmasinya.`;

            setTimeout(() => {
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/6287866361260?text=${encodedMessage}`, "_blank");

                orderForm.reset();
                submitOrderBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Order via WhatsApp';
                submitOrderBtn.disabled = false;
                closeModal();

                showNotification("Pesanan berhasil dikirim ke WhatsApp!", "success");
            }, 1500);
        });

        document.querySelectorAll(".admin-login-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                adminLoginModal.classList.add("active");
            });
        });

        adminLoginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const username = adminUsernameInput.value;
            const password = adminPasswordInput.value;

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
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    if (error.message === "Unauthorized") {
                        showNotification("Username atau password salah!", "error");
                    } else {
                        showNotification("Terjadi kesalahan. Silakan coba lagi.", "error");
                    }
                });
        });

        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", function (e) {
                e.preventDefault();

                const targetId = this.getAttribute("href");
                if (targetId === "#") return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: "smooth",
                    });
                }
            });
        });

        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
            menuToggle.classList.toggle("active");
        });

        document.addEventListener("click", function (e) {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                navLinks.classList.remove("active");
                menuToggle.classList.remove("active");
            }
        });

        searchInput.addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase().trim();

            if (searchTerm.length < 2) {
                renderProducts(products);
                return;
            }

            const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm));

            renderProducts(filteredProducts);
        });
        // Tambahkan logika search input mobile
        const searchInputMobile = document.getElementById("searchInputMobile");
        searchInputMobile?.addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase().trim();

            if (searchTerm.length < 2) {
                renderProducts(products);
                return;
            }

            const filteredProducts = products.filter((product) => (product.name + " " + product.description).toLowerCase().includes(searchTerm));

            renderProducts(filteredProducts);
        });
        document.querySelectorAll(".theme-toggle-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const isLight = document.documentElement.getAttribute("data-theme") === "light";
                if (isLight) {
                    document.documentElement.removeAttribute("data-theme");
                    localStorage.setItem("theme", "dark");
                    document.querySelectorAll(".theme-toggle-btn i").forEach((icon) => {
                        icon.classList.remove("fa-sun");
                        icon.classList.add("fa-moon");
                    });
                } else {
                    document.documentElement.setAttribute("data-theme", "light");
                    localStorage.setItem("theme", "light");
                    document.querySelectorAll(".theme-toggle-btn i").forEach((icon) => {
                        icon.classList.remove("fa-moon");
                        icon.classList.add("fa-sun");
                    });
                }
            });
        });

        function filterProductsByCategory(keyword) {
            if (keyword === "all") {
                renderProducts(products); // tampilkan semua produk
                return;
            }

            const filtered = products.filter((product) => (product.name + " " + product.description).toLowerCase().includes(keyword.toLowerCase()));

            renderProducts(filtered);

            if (filtered.length === 0) {
                showNotification(`Tidak ada produk dengan kata "${keyword}"`, "warning");
            }
        }

        function scrollToProduct(target) {
            if (target === "trending") {
                document.getElementById("trending").scrollIntoView({ behavior: "smooth" });
                return;
            }

            if (target === "all") {
                renderProducts(products); // <== tambahkan ini agar reset produk
                document.getElementById("produk").scrollIntoView({ behavior: "smooth" });
                return;
            }

            filterProductsByCategory(target);
            document.getElementById("produk").scrollIntoView({ behavior: "smooth" });
        }

        document.addEventListener("DOMContentLoaded", async () => {
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme === "light") {
                document.documentElement.setAttribute("data-theme", "light");
                document.querySelectorAll(".theme-toggle-btn i").forEach((icon) => {
                    icon.classList.remove("fa-moon");
                    icon.classList.add("fa-sun");
                });
            }

            loadingOverlay.classList.add("show");

            try {
                products = await fetchProducts();
                renderProducts(products);
                renderTrendingProducts(products);

                setTimeout(() => {
                    loadingOverlay.classList.remove("show");
                }, 600);
            } catch (error) {
                console.error("Failed to load data:", error);
                showNotification("Gagal memuat data, coba lagi nanti", "error");
                loadingOverlay.classList.remove("show");
            }

            document.querySelectorAll(".product-nav-btn").forEach((btn) => {
                btn.addEventListener("click", function () {
                    document.querySelectorAll(".product-nav-btn").forEach((b) => b.classList.remove("active"));
                    this.classList.add("active");
                    const target = this.getAttribute("data-target");
                    scrollToProduct(target);
                });
            });

            grecaptcha.ready(function () {
                grecaptcha.execute("6LfZknsrAAAAAOfe66QaWr0TzRixA1oGm-IMo8sc", { action: "submit" }).then(function (token) {
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
                            } else {
                                console.log("reCAPTCHA failed or suspicious:", data);
                            }
                        });
                });
            });
        });