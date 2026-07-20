const express = require("express");
const router = express.Router();

const {
    createBed,
    getBeds,
    updateBed
} = require("../handlers/bedHandler");

// Bed endpoints
router.post("/api/beds", createBed);

router.get("/api/beds", getBeds);

router.put("/api/beds/:bedId", updateBed);

module.exports = router;