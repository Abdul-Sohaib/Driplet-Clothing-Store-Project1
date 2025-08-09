// backend/routes/mails.js
const express = require("express");
const router = express.Router();
const Mail = require("../../models/Mail");

// GET mails
router.get("/", async (req, res) => {
  try {
    const mails = await Mail.find().sort({ createdAt: -1 }).limit(5);
    res.json(mails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST mail (for testing or admin creation)
router.post("/", async (req, res) => {
  try {
    const { name, unread, date } = req.body;
    const mail = new Mail({ name, unread, date });
    await mail.save();
    res.status(201).json(mail);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;