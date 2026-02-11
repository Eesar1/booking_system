const Service = require("../models/service");

const DEFAULT_SERVICES = [
  {
    name: "General Consultation",
    description: "Professional consultation with experienced staff",
    durationMinutes: 30,
    price: 30
  },
  {
    name: "Skin Care Session",
    description: "Refreshing skin treatment for glowing results",
    durationMinutes: 45,
    price: 45
  },
  {
    name: "Business Coaching",
    description: "One on one growth and strategy guidance",
    durationMinutes: 60,
    price: 60
  },
  {
    name: "Salon Services",
    description: "Premium hair and beauty services",
    durationMinutes: 90,
    price: 75
  }
];

const ensureDefaultServices = async () => {
  const count = await Service.countDocuments();
  if (count === 0) {
    await Service.insertMany(DEFAULT_SERVICES);
  }
};

const getServices = async (req, res) => {
  try {
    await ensureDefaultServices();

    const services = await Service.find({ isActive: true }).sort({ createdAt: 1 });
    return res.status(200).json({ services });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch services." });
  }
};

module.exports = { getServices };
