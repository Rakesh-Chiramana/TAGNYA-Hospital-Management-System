const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const staffRoutes = require("./routes/staffRoutes");
const pharmacyRoutes = require("./routes/pharmacyRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const salesRoutes = require("./routes/salesRoutes");
const bedRoutes = require("./routes/bedRoutes");
const labRoutes = require("./routes/labRoutes");
const revenueRoutes = require("./routes/revenueRoutes");
const dischargeRoutes = require("./routes/dischargeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");


const app = express();

require("./config/db");

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ type: '*/*' }));
app.use(authRoutes);
app.use(patientRoutes);
app.use(doctorRoutes);
app.use(appointmentRoutes);
app.use(staffRoutes);
app.use(pharmacyRoutes);
app.use(purchaseRoutes);
app.use(salesRoutes);
app.use(bedRoutes);
app.use(labRoutes);
app.use(revenueRoutes);
app.use("/api/discharge", dischargeRoutes);
app.use("/api/expense", expenseRoutes);
app.get("/", (req, res) => {
  res.send("ACC HMS Backend Running");
});

app.listen(5000, () => {
  console.log("Server Running On Port 5000");
});