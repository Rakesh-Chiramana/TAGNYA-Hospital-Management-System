const db = require("../config/db");

// Get all doctors from users table
const getDoctors = (callback) => {
  const query = "SELECT id, name, email, role, status FROM users WHERE role = 'Doctor'";
  
  db.query(query, (err, results) => {
    if (err) {
      return callback(err);
    }

    // Transform to match frontend Doctor interface
    const doctors = results.map(doc => ({
      id: doc.id,
      name: doc.name,
      email: doc.email,
      specialization: "", // Can be added to users table later
      availability: [], // Can be added to users table later
      status: doc.status,
      role: doc.role
    }));

    callback(null, doctors);
  });
};

// Get doctor by ID
const getDoctorById = (doctorId, callback) => {
  const query = "SELECT id, name, email, role, status FROM users WHERE id = ? AND role = 'Doctor'";
  
  db.query(query, [doctorId], (err, results) => {
    if (err) {
      return callback(err);
    }

    if (results.length === 0) {
      return callback(new Error("Doctor not found"));
    }

    const doctor = results[0];
    callback(null, {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      specialization: "",
      availability: [],
      status: doctor.status,
      role: doctor.role
    });
  });
};

// Update doctor status
const updateDoctorStatus = (doctorId, status, callback) => {
  const query = "UPDATE users SET status = ? WHERE id = ? AND role = 'Doctor'";
  
  db.query(query, [status, doctorId], (err) => {
    if (err) {
      return callback(err);
    }

    callback(null, { id: doctorId, status });
  });
};

module.exports = {
  getDoctors,
  getDoctorById,
  updateDoctorStatus
};
