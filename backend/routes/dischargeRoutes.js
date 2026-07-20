const express = require("express");
const router = express.Router();

const dischargeHandler = require("../handlers/dischargeHandler");
router.get("/patients", dischargeHandler.getPatients);
router.get("/patient/:id", dischargeHandler.getPatientById);

router.post("/", dischargeHandler.saveDischarge);

router.put("/:id", dischargeHandler.updateDischarge);
router.delete("/:id", dischargeHandler.deleteDischarge);
module.exports = router;