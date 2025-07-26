const https = require("https");

const TOKEN = process.env.GITHUB_TOKEN;
const REPO = "klandestin-s/api-protes";
const FILEPATH = "products.json";
const BRANCH = "main";

function githubRequest(path, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.github.com",
      path,
      method,
      headers: {
        "User-Agent": "Vercel-App",
        Authorization: `token ${TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(body || "{}");
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject({
              statusCode: res.statusCode,
              message: json.message || `GitHub API error: ${res.statusCode}`,
              errors: json.errors,
            });
          }
        } catch (e) {
          reject({
            statusCode: 500,
            message: "JSON parse error",
            details: e.message,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject({
        statusCode: 500,
        message: "Network error",
        details: error.message,
      });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Helper function to fetch current products
async function getCurrentProducts() {
  try {
    const fileData = await githubRequest(`/repos/${REPO}/contents/${FILEPATH}?ref=${BRANCH}`);

    if (!fileData.content) return { products: [], sha: null };

    const content = Buffer.from(fileData.content, "base64").toString("utf8");
    return {
      products: JSON.parse(content),
      sha: fileData.sha,
    };
  } catch (error) {
    if (error.statusCode === 404) return { products: [], sha: null };
    throw error;
  }
}

// Generate unique ID for new products
function generateProductId() {
  return "prod_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

// Validasi tipe data untuk properti baru
function validateNumberFields(product) {
  const errors = [];

  // Validasi wajib untuk POST
  if (product.rating !== undefined && (typeof product.rating !== "number" || isNaN(product.rating))) {
    errors.push("Rating harus berupa angka");
  }

  if (product.sold !== undefined && (typeof product.sold !== "number" || isNaN(product.sold))) {
    errors.push("Sold harus berupa angka");
  }

  if (product.views !== undefined && (typeof product.views !== "number" || isNaN(product.views))) {
    errors.push("Views harus berupa angka");
  }

  return errors;
}

// Fungsi untuk menambahkan nilai default jika properti tidak ada
function applyDefaults(product, isNew = false) {
  if (isNew) {
    // Untuk produk baru, set default jika tidak disertakan
    if (product.rating === undefined) product.rating = 0;
    if (product.sold === undefined) product.sold = 0;
    if (product.views === undefined) product.views = 0;
  } else {
    // Untuk update, hanya set jika tidak disertakan
    // Tetapi validasi tetap dilakukan di validasi utama
  }

  // Pastikan tipe data benar
  if (typeof product.rating !== "number") product.rating = parseFloat(product.rating) || 0;
  if (typeof product.sold !== "number") product.sold = parseInt(product.sold) || 0;
  if (typeof product.views !== "number") product.views = parseInt(product.views) || 0;

  // Batasi nilai rating antara 0-5
  if (product.rating < 0) product.rating = 0;
  if (product.rating > 5) product.rating = 5;

  return product;
}

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (!TOKEN) {
    return res.status(500).json({
      error: "Missing GitHub token. Set GITHUB_TOKEN environment variable.",
    });
  }

  try {
    // GET: Return product list
    if (req.method === "GET") {
      const { products } = await getCurrentProducts();
      return res.status(200).json(products || []);
    }

    // Helper function for updating GitHub file
    const updateGitHubFile = async (products, message, sha) => {
      const updatePayload = {
        message,
        content: Buffer.from(JSON.stringify(products, null, 2)).toString("base64"),
        branch: BRANCH,
      };

      if (sha) updatePayload.sha = sha;

      return githubRequest(`/repos/${REPO}/contents/${FILEPATH}`, "PUT", updatePayload);
    };

    // POST: Add new product
    if (req.method === "POST") {
      const newProduct = req.body;

      // Validasi data wajib
      if (!newProduct.name || !newProduct.image || !newProduct.price) {
        return res.status(400).json({
          error: "Nama, gambar, dan harga wajib diisi",
        });
      }

      // Convert price to number
      newProduct.price = parseFloat(newProduct.price);
      if (isNaN(newProduct.price)) {
        return res.status(400).json({
          error: "Harga harus berupa angka",
        });
      }

      // Validasi properti baru
      const numberErrors = validateNumberFields(newProduct);
      if (numberErrors.length > 0) {
        return res.status(400).json({
          error: numberErrors.join(", "),
        });
      }

      // Tambahkan nilai default untuk properti baru
      applyDefaults(newProduct, true);

      // Generate unique ID
      newProduct.id = generateProductId();

      // Get current products
      const { products, sha } = await getCurrentProducts();
      const updatedProducts = [...products, newProduct];

      // Update file on GitHub
      await updateGitHubFile(updatedProducts, `Tambah produk: ${newProduct.name}`, sha);

      return res.status(201).json({
        success: true,
        message: "Produk berhasil ditambahkan",
        product: newProduct,
      });
    }

    // PUT: Update existing product
    if (req.method === "PUT") {
      const updatedProduct = req.body;

      // Validasi data wajib
      if (!updatedProduct.id) {
        return res.status(400).json({ error: "ID produk wajib diisi" });
      }

      if (!updatedProduct.name || !updatedProduct.image || !updatedProduct.price) {
        return res.status(400).json({
          error: "Nama, gambar, dan harga wajib diisi",
        });
      }

      // Convert price to number
      updatedProduct.price = parseFloat(updatedProduct.price);
      if (isNaN(updatedProduct.price)) {
        return res.status(400).json({
          error: "Harga harus berupa angka",
        });
      }

      // Validasi properti baru
      const numberErrors = validateNumberFields(updatedProduct);
      if (numberErrors.length > 0) {
        return res.status(400).json({
          error: numberErrors.join(", "),
        });
      }

      // Get current products
      const { products, sha } = await getCurrentProducts();

      // Find product index
      const productIndex = products.findIndex((p) => p.id === updatedProduct.id);
      if (productIndex === -1) {
        return res.status(404).json({ error: "Produk tidak ditemukan" });
      }

      // Apply defaults and keep existing values for missing properties
      const originalProduct = products[productIndex];

      // Untuk properti baru, gunakan nilai yang ada jika tidak diupdate
      if (updatedProduct.rating === undefined) updatedProduct.rating = originalProduct.rating;
      if (updatedProduct.sold === undefined) updatedProduct.sold = originalProduct.sold;
      if (updatedProduct.views === undefined) updatedProduct.views = originalProduct.views;

      // Pastikan tipe data benar
      applyDefaults(updatedProduct);

      // Update product
      products[productIndex] = {
        ...originalProduct,
        ...updatedProduct,
      };

      // Update file on GitHub
      await updateGitHubFile(products, `Update produk: ${updatedProduct.name}`, sha);

      return res.status(200).json({
        success: true,
        message: "Produk berhasil diperbarui",
        product: products[productIndex],
      });
    }

    // DELETE: Delete product
    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "ID produk wajib diisi" });
      }

      // Get current products
      const { products, sha } = await getCurrentProducts();

      // Find product index
      const productIndex = products.findIndex((p) => p.id === id);
      if (productIndex === -1) {
        return res.status(404).json({ error: "Produk tidak ditemukan" });
      }

      // Remove product
      const [deletedProduct] = products.splice(productIndex, 1);

      // Update file on GitHub
      await updateGitHubFile(products, `Hapus produk: ${deletedProduct.name}`, sha);

      return res.status(200).json({
        success: true,
        message: "Produk berhasil dihapus",
        product: deletedProduct,
      });
    }

    return res.status(405).json({
      error: "Method not allowed. Supported methods: GET, POST, PUT, DELETE",
    });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Internal server error",
      details: error.details || error.errors || "No additional details",
    });
  }
};
