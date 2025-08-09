const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary");
const auth = require("../../middleware/Adminauth");
const SiteSettings = require("../../models/SiteSettings");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "clothing_store/site-settings",
    allowed_formats: ["jpg", "jpeg", "png" , "svg", "webp"],
  },
});
const upload = multer({ storage });

router.get("/", async (req, res) => {
  try {
    const settings = await SiteSettings.findOne();
    if (!settings) return res.status(404).json({ message: "No settings found" });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching site settings" });
  }
});

router.post(
  "/update",
  auth,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "section1" },
    { name: "section2" },
    { name: "section3" },
  ]),
  async (req, res) => {
    try {
      const { tagline, about } = req.body;
      const logo = req.files["logo"]?.[0]?.path || "";
      const section1 = (req.files["section1"] || []).map((f) => f.path);
      const section2 = (req.files["section2"] || []).map((f) => f.path);
      const section3 = (req.files["section3"] || []).map((f) => f.path);

      const existing = await SiteSettings.findOne();
      const payload = {
        tagline,
        about,
        ...(logo && { logoUrl: logo }),
        banners: {
          section1: section1.length ? section1 : existing?.banners?.section1 || [],
          section2: section2.length ? section2 : existing?.banners?.section2 || [],
          section3: section3.length ? section3 : existing?.banners?.section3 || [],
        },
      };

      let updated;
      if (existing) {
        updated = await SiteSettings.findByIdAndUpdate(existing._id, payload, { new: true });
      } else {
        updated = await SiteSettings.create({ ...payload });
      }

      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message || "Failed to update settings" });
    }
  }
);

module.exports = router;
