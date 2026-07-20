const db = require("../config/db");
const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  updateStaffStatus,
} = require("../business/staffBusiness");

// Register a new staff member
const addStaff = (req, res) => {
  const { username, password, name, email, role } = req.body;

  // Check if username already exists in users table
  db.query(
    "SELECT id FROM users WHERE username = ?",
    [username],
    async (err, existing) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Database error", error: err });
      }
      if (existing && existing.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Username already exists" });
      }

      // Insert into users table for login
      const insertUserSql = `
        INSERT INTO users (username, password, name, email, role, status)
        VALUES (?, ?, ?, ?, ?, 'Active')
      `;
      db.query(
        insertUserSql,
        [username, password, name, email || null, role],
        async (err, userResult) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Failed to create user account",
              error: err,
            });
          }

          // Now insert into staff table using async business function
          try {
            const result = await createStaff(req.body);
            return res.status(201).json({
              success: true,
              message: "Staff member registered successfully",
              staff: {
                id: result.staff_id || `s${result.insertId}`,
                ...req.body,
                status: req.body.status || "Active",
              },
            });
          } catch (err2) {
            // Rollback user insert
            db.query("DELETE FROM users WHERE id = ?", [userResult.insertId]);
            return res.status(500).json({
              success: false,
              message: "Failed to save staff details",
              error: err2,
            });
          }
        }
      );
    }
  );
};

// Get all staff
const getStaff = async (req, res) => {
  try {
    const result = await getAllStaff();
    const mapped = result.map((row) => ({
      id: row.staff_id || `s${row.id}`,
      name: row.name,
      role: row.role,
      phone: row.phone,
      email: row.email || "",
      age: row.age ? String(row.age) : "",
      emergency: row.emergency_contact || "",
      experience: row.experience || "",
      study: row.study || "",
      joiningDate: row.joining_date
        ? new Date(row.joining_date).toISOString().split("T")[0]
        : "",
      username: row.username,
      password: row.password,
      status: row.status || "Active",
      avatar: row.avatar || undefined,
    }));
    res.json({ success: true, count: mapped.length, staff: mapped });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Error fetching staff", error: err });
  }
};

// Get single staff
const getSingleStaff = async (req, res) => {
  const { staffId } = req.params;
  try {
    const result = await getStaffById(staffId);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Staff member not found" });
    }
    const mapped = {
      id: result.staff_id || `s${result.id}`,
      name: result.name,
      role: result.role,
      phone: result.phone,
      email: result.email || "",
      age: result.age ? String(result.age) : "",
      emergency: result.emergency_contact || "",
      experience: result.experience || "",
      study: result.study || "",
      joiningDate: result.joining_date
        ? new Date(result.joining_date).toISOString().split("T")[0]
        : "",
      username: result.username,
      password: result.password,
      status: result.status || "Active",
      avatar: result.avatar || undefined,
    };
    res.json({ success: true, staff: mapped });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Error fetching staff", error: err });
  }
};


const modifyStaff = async (req, res) => {
  const { staffId } = req.params;
  try {
    await updateStaff(staffId, req.body);
    res.json({ success: true, message: "Staff updated successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Error updating staff", error: err });
  }
};


const removeStaff = async (req, res) => {
  const { staffId } = req.params;
  try {
    await deleteStaff(staffId);
    res.json({ success: true, message: "Staff deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Error deleting staff", error: err });
  }
};


const changeStatus = async (req, res) => {
  const { staffId } = req.params;
  const { status } = req.body;
  try {
    await updateStaffStatus(staffId, status);
    res.json({ success: true, message: "Status updated successfully" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error updating status",
      error: err,
    });
  }
};

module.exports = {
  addStaff,
  getStaff,
  getSingleStaff,
  modifyStaff,
  removeStaff,
  changeStatus,
};
