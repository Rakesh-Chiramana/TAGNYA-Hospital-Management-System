const db = require("../config/db");

const registerPatient = (patientData, callback) => {
  const {
    firstName,
    lastName,
    age,
    gender,
    weight,
    contact,
    email,
    dob,
    bloodGroup,
    emergencyName,
    emergencyContact,
    reason,
    paymentMethod,
    address,
    assignedDoctor,
    serial,
  } = patientData;

  db.query("SELECT patient_id FROM patients WHERE patient_id LIKE 'P-%' ORDER BY id DESC LIMIT 1", (err, rows) => {
    let nextIdNum = 1001;
    if (!err && rows && rows.length > 0) {
      const lastId = rows[0].patient_id;
      const match = lastId.match(/\d+/);
      if (match) {
        nextIdNum = parseInt(match[0], 10) + 1;
      }
    }

    const patientIdVal = patientData.patient_id || `P-${nextIdNum}`;

    const sql = `
      INSERT INTO patients (
        patient_id, firstName, lastName, age, gender, weight, 
        contact, email, dob, bloodGroup, emergencyName, emergencyContact,
        reason, paymentMethod, address, assignedDoctor, serial, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
    `;

    const values = [
      patientIdVal,
      firstName,
      lastName,
      age,
      gender,
      weight || null,
      contact,
      email || null,
      dob || null,
      bloodGroup || "Unknown",
      emergencyName || null,
      emergencyContact || null,
      reason,
      paymentMethod,
      address,
      assignedDoctor,
      serial,
    ];

    db.query(sql, values, (errInsert, result) => {
      if (errInsert) {
        return callback(errInsert, null);
      }

      // Fetch and return the newly created patient
      const selectSql = "SELECT * FROM patients WHERE patient_id = ?";
      db.query(selectSql, [patientIdVal], (errSelect, patientResult) => {
        if (errSelect) {
          return callback(errSelect, null);
        }
        callback(null, patientResult[0]);
      });
    });
  });
};

const getPatients = (callback) => {
  const sql = "SELECT * FROM patients ORDER BY admissionDate DESC";
  db.query(sql, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};

const getPatientById = (patientId, callback) => {
  const sql = "SELECT * FROM patients WHERE patient_id = ?";
  db.query(sql, [patientId], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result[0]);
  });
};

const updatePatient = (patientId, patientData, callback) => {
  const {
    firstName,
    lastName,
    age,
    gender,
    weight,
    contact,
    email,
    dob,
    bloodGroup,
    emergencyName,
    emergencyContact,
    reason,
    paymentMethod,
    address,
    assignedDoctor,
  } = patientData;

  const sql = `
    UPDATE patients SET 
      firstName = ?, lastName = ?, age = ?, gender = ?, weight = ?,
      contact = ?, email = ?, dob = ?, bloodGroup = ?, 
      emergencyName = ?, emergencyContact = ?, reason = ?, 
      paymentMethod = ?, address = ?, assignedDoctor = ?
    WHERE patient_id = ?
  `;

  const values = [
    firstName,
    lastName,
    age,
    gender,
    weight || null,
    contact,
    email || null,
    dob || null,
    bloodGroup || "Unknown",
    emergencyName || null,
    emergencyContact || null,
    reason,
    paymentMethod,
    address,
    assignedDoctor,
    patientId,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    // Fetch and return the updated patient
    const selectSql = "SELECT * FROM patients WHERE patient_id = ?";
    db.query(selectSql, [patientId], (err, patientResult) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, patientResult[0]);
    });
  });
};

const deletePatient = (patientId, callback) => {
  const sql = "DELETE FROM patients WHERE patient_id = ?";
  db.query(sql, [patientId], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, { success: true, message: "Patient deleted successfully" });
  });
};

module.exports = {
  registerPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
