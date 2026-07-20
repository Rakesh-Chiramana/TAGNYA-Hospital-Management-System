const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getAllAppointments,
  updateAppointment,
  deleteAppointment,
  completeVisit,
} = require("../handlers/appointmentHandler");

router.get("/api/appointments", getAllAppointments);
router.post("/api/appointments", createAppointment);
router.put("/api/appointments/:appointmentId", updateAppointment);
router.delete("/api/appointments/:appointmentId", deleteAppointment);
router.post("/api/appointments/:appointmentId/complete", completeVisit);

module.exports = router;
