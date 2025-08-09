const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema({
  logoUrl: { type: String, default: "" },
  banners: {
    section1: { type: [String], default: [] },
    section2: { type: [String], default: [] },
    section3: { type: [String], default: [] },
  },
  tagline: { type: String, default: "" },
  about: { type: String, default: "" },
});

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
