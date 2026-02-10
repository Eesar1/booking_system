const express = require("express");
const authRoutes = require("./auth");
const adminRoutes = require("./admin");
const appointmentRoutes = require("./appointments");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/appointments", appointmentRoutes);

module.exports = router;
