const express = require("express");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/ping", authenticate, requireRole("admin"), (req, res) => {
  res.json({ message: "Admin access granted." });
});

module.exports = router;
