const express = require("express");
const authRoutes = require("./auth");
const adminRoutes = require("./admin");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
