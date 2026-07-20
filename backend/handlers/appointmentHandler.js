const db = require("../config/db");

const createAppointment = (req, res) => {
  const body = req.body || {};

  // Example incoming fields from the form:
  // { id, patientId, name, dr, date, time, type, reason, history, referral, preferredContact }
  // Normalize appointment id
  const apptId = body.id || body.appointment_id || body.appointmentId || `APT-${Date.now()}`;

  // patientId may be in the form "P-1001 - Name" when sent from the frontend datalist
  let patient_id = "";
  let patient_name = "";
  if (body.patientId) {
    const parts = String(body.patientId).split(" - ");
    patient_id = parts[0];
    patient_name = parts[1] || body.name || "";
  } else {
    patient_id = body.patient_id || "";
    patient_name = body.name || "";
  }

  const doctor = body.dr || body.doctor || "";
  const date = body.date || null;
  const time = body.time || body.selectedSlot || body.slot || "";
  const type = body.type || "OP";
  const reason = body.reason || "";
  const medical_history = body.history || body.medicalHistory || "";
  const referral_source = body.referral || body.referralSource || "";
  const preferred_contact = body.preferredContact || body.preferred_contact || "";

  const sql = `INSERT INTO appointments
    (appointment_id, patient_id, patient_name, doctor, date, time, type, reason, medical_history, referral_source, preferred_contact)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    apptId,
    patient_id,
    patient_name,
    doctor,
    date,
    time,
    type,
    reason,
    medical_history,
    referral_source,
    preferred_contact,
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Insert appointment error:", err);
      console.error("SQL:", sql);
      console.error("Params:", params);
      return res.status(500).json({ success: false, error: err.message });
    }
    return res.json({ success: true, insertedId: result.insertId, appointment_id: apptId });
  });
};

const getAllAppointments = (req, res) => {
  const sql = `SELECT *,DATE_FORMAT(date,'%Y-%m-%d') as date FROM appointments ORDER BY date DESC, time ASC`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Fetch appointments error:", err);
      console.error("SQL:", sql);
      return res.status(500).json({ success: false, error: err.message });
    }
    return res.json({ success: true, appointments: rows });
  });
};

const updateAppointment = (req, res) => {
  const { appointmentId } = req.params;
  const updates = req.body || {};

  const fields = [];
  const params = [];
  Object.keys(updates).forEach((k) => {
    if (k === "id") return;
    fields.push(`${k} = ?`);
    params.push(updates[k]);
  });
  if (fields.length === 0) return res.json({ success: true });
  params.push(appointmentId);
  const sql = `UPDATE appointments SET ${fields.join(", ")} WHERE appointment_id = ?`;
  db.query(sql, params, (err) => {
    if (err) {
      console.error("Update appointment error:", err);
      console.error("SQL:", sql);
      console.error("Params:", params);
      return res.status(500).json({ success: false, error: err.message });
    }
    return res.json({ success: true });
  });
};

const deleteAppointment = (req, res) => {
  const { appointmentId } = req.params;
  const sql = `DELETE FROM appointments WHERE appointment_id = ?`;
  db.query(sql, [appointmentId], (err) => {
    if (err) {
      console.error("Delete appointment error:", err);
      console.error("SQL:", sql);
      console.error("Params:", [appointmentId]);
      return res.status(500).json({ success: false, error: err.message });
    }
    return res.json({ success: true });
  });
};

const completeVisit = (req, res) => {
  const { appointmentId } = req.params;
  const clinicalData = req.body || {};
  const sql = `UPDATE appointments SET clinical_data = ?, status = 'Completed' WHERE appointment_id = ?`;
  db.query(sql, [JSON.stringify(clinicalData), appointmentId], (err) => {
    if (err) {
      console.error("Complete visit error:", err);
      console.error("SQL:", sql);
      console.error("Params:", [JSON.stringify(clinicalData), appointmentId]);
      return res.status(500).json({ success: false, error: err.message });
    }
    return res.json({ success: true });
  });
};

module.exports = {
  createAppointment,
  getAllAppointments,
  updateAppointment,
  deleteAppointment,
  completeVisit,
};
