const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Appointment booking API running"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
