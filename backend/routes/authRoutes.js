const express = require("express");
const router = express.Router();

const { login } = require("../handlers/authHandler");

router.post("/api/login", login);

module.exports = router;