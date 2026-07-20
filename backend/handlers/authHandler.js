const { loginUser } = require("../business/authBusiness");
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";

const login = (req, res) => {
  const contentType = req.headers && req.headers["content-type"] ? String(req.headers["content-type"]) : "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return res.status(415).json({ success: false, message: "Unsupported Media Type - application/json required" });
  }

  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }

  const username = req.body.username ? String(req.body.username).trim() : "";
  const password = req.body.password ? String(req.body.password).trim() : "";

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password required",
    });
  }

  loginUser(username, password, (err, result) => {
    if (err) {
      console.error("Login Error:", err);
      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }

    if (!result || result.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const u = result[0];
    const user = {
      id: u.id,
      username: u.username,
      role: u.role,
      name: u.name || u.firstName || u.username,
    };

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role, name: user.name }, secret, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      success: true,
      user,
      token,
    });
  });
};

module.exports = { login };