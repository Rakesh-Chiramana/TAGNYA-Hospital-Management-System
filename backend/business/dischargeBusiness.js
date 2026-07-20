const db = require("../config/db");

// ===============================
// Get Patient List
// ===============================
const getPatients = () => {
    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                id,
                patient_name,
                ip_no,
                uhid
            FROM patients
            ORDER BY patient_name ASC
        `;

        db.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });

    });
};

// ===============================
// Get Selected Patient Details
// ===============================
const getPatientById = (patientId) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                p.id,
                p.patient_name,
                p.ip_no,
                p.uhid,
                p.age,
                p.reason AS cause,
                d.doctor_name
            FROM patients p
            LEFT JOIN doctors d
            ON p.doctor_id = d.id
            WHERE p.id = ?
        `;

        db.query(sql, [patientId], (err, result) => {

            if (err) return reject(err);

            resolve(result[0]);

        });

    });

};

// ===============================
// Save Discharge Summary
// ===============================
const saveDischarge = (data) => {

    return new Promise((resolve, reject) => {

        const sql = `
        INSERT INTO discharge_summary
        (
            patient_id,
            ip_no,
            patient_name,
            discharge_date,
            chief_complaints,
            present_history,
            hospital_course,
            temperature,
            pulse,
            bp,
            resp,
            spo2,
            condition_at_discharge,
            final_diagnosis,
            medications,
            discharge_advice,
            review_date,
            finalize_report
        )

        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        db.query(sql, [

            data.patient_id,
            data.ip_no,
            data.patient_name,
            data.discharge_date,
            data.chief_complaints,
            data.present_history,
            data.hospital_course,
            data.temperature,
            data.pulse,
            data.bp,
            data.resp,
            data.spo2,
            data.condition_at_discharge,
            data.final_diagnosis,
            data.medications,
            data.discharge_advice,
            data.review_date,
            data.finalize_report

        ], (err, result) => {

            if (err) return reject(err);

            resolve(result);

        });

    });

};

// ===============================
// Update
// ===============================
const updateDischarge = (id, data) => {

    return new Promise((resolve, reject) => {

        const sql = `
        UPDATE discharge_summary

        SET

        chief_complaints=?,
        present_history=?,
        hospital_course=?,
        temperature=?,
        pulse=?,
        bp=?,
        resp=?,
        spo2=?,
        condition_at_discharge=?,
        final_diagnosis=?,
        medications=?,
        discharge_advice=?,
        review_date=?,
        finalize_report=?

        WHERE discharge_id=?
        `;

        db.query(sql, [

            data.chief_complaints,
            data.present_history,
            data.hospital_course,
            data.temperature,
            data.pulse,
            data.bp,
            data.resp,
            data.spo2,
            data.condition_at_discharge,
            data.final_diagnosis,
            data.medications,
            data.discharge_advice,
            data.review_date,
            data.finalize_report,
            id

        ], (err, result) => {

            if (err) return reject(err);

            resolve(result);

        });

    });

};

// ===============================
// Delete
// ===============================
const deleteDischarge = (id) => {

    return new Promise((resolve, reject) => {

        db.query(
            "DELETE FROM discharge_summary WHERE discharge_id=?",
            [id],
            (err, result) => {

                if (err) return reject(err);

                resolve(result);

            }
        );

    });

};

module.exports = {
    getPatients,
    getPatientById,
    saveDischarge,
    updateDischarge,
    deleteDischarge
};