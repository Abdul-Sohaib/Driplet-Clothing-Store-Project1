const axios = require("axios");
const fs = require("fs");
const path = require("path");

const generateReceiptTemplate = async (user, order) => {
  // Base URL for static assets (use public URL if deployed, localhost for local testing)
  const BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

  // Default logo from the images folder
  let logoUrl = `${BASE_URL}/images/DRIPLET.svg`;

  // Attempt to fetch logo URL from site-settings (optional fallback)
  try {
    const response = await axios.get(`${BASE_URL}/api/site-settings`, { withCredentials: true });
    logoUrl = response.data.logoUrl || logoUrl;
    console.log("✅ Fetched logo URL:", logoUrl);
  } catch (err) {
    console.error("❌ Error fetching logo URL, using default:", err.message);
  }

  // Fallback to local file reading as base64 (for email embedding, optional)
  let base64Logo = "";
  try {
    const logoPath = path.join(__dirname, "../images/DRIPLET.svg");
    if (fs.existsSync(logoPath)) {
      const logoData = fs.readFileSync(logoPath);
      base64Logo = `data:image/svg+xml;base64,${logoData.toString("base64")}`;
      console.log("✅ Loaded logo as base64 for embedding");
    } else {
      console.warn("⚠️ Logo file not found at:", logoPath);
    }
  } catch (err) {
    console.error("❌ Error reading logo file:", err.message);
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const productNames = items.map(item => item.name || "Unknown Product").join(", ");

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">
        <img src="${item.image || `${BASE_URL}/images/placeholder.jpg`}" 
             alt="${item.name || "Unknown Product"}" 
             style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" 
             onerror="this.src='${BASE_URL}/images/placeholder.jpg';" />
      </td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.name || "Unknown Product"}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity || 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.size || "N/A"}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">₹${item.price || 0}</td>
    </tr>
  `).join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #9155FD; font-size: 24px; margin-bottom: 20px;">
        Order Confirmation - Order #${order.paymentOrderId || order._id || "N/A"} - ${productNames || "No Products"}
      </h2>

      <p style="color: #333; font-size: 16px;">Dear ${user.name || "Customer"},</p>
      <p style="color: #333; font-size: 16px;">Thank you for your order with Driplet! Below are the details of your purchase:</p>

      <h3 style="color: #9155FD; font-size: 18px; margin-top: 20px;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #333;">Order ID:</td>
          <td style="padding: 8px; color: #333;">${order.paymentOrderId || order._id || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #333;">Date:</td>
          <td style="padding: 8px; color: #333;">${order.date || new Date().toISOString().split("T")[0]}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #333;">Status:</td>
          <td style="padding: 8px; color: #333;">${order.status || "Placed"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #333;">Payment Status:</td>
          <td style="padding: 8px; color: #333;">${order.paymentStatus || "Paid"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #333;">Total Amount:</td>
          <td style="padding: 8px; color: #333;">₹${order.amount || 0}</td>
        </tr>
      </table>

      <h3 style="color: #9155FD; font-size: 18px; margin-top: 20px;">Shipping Address</h3>
      <p style="color: #333; font-size: 16px;">
        ${order.customer?.name || user.name}<br>
        ${order.customer?.address || "N/A"}<br>
        ${order.customer?.email || user.email}
      </p>

      <h3 style="color: #9155FD; font-size: 18px; margin-top: 20px;">Order Items</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr style="background-color: #9155FD; color: white;">
            <th style="padding: 8px; border: 1px solid #ddd;">Image</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Product</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Size</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml || "<tr><td colspan='5' style='padding: 8px; border: 1px solid #ddd; text-align: center;'>No items available</td></tr>"}
        </tbody>
      </table>

      <div style="text-align: center; margin-top: 20px;">
        <img src="${base64Logo || logoUrl}" alt="Driplet Logo" 
             style="width: 120px; height: auto; margin-bottom: 10px;" 
             onerror="this.src='${BASE_URL}/images/driplet-logo.png'; this.onerror=null;" />
        <p style="color: #333; font-size: 16px; font-weight: bold;">Thank you for shopping with Driplet!</p>
      </div>
    </div>
  `;
};

module.exports = { generateReceiptTemplate };