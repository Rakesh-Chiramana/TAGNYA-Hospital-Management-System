const express = require("express");
const router = express.Router();

const labHandler = require("../handlers/labHandler");

router.get(
    "/patient/:ipNo",
    labHandler.getPatient
);

router.get(
    "/tests",
    labHandler.getTests
);

router.get(
    "/test/:testName",
    labHandler.getParameters
);

router.post(
    "/save-result",
    labHandler.saveResults
);

module.exports = router;