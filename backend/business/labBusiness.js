const db = require("../config/db");

const getPatientByIp = (ipNo, callback) => {
    const sql = `
        SELECT
            a.patient_name,
            a.age,
            COALESCE(p.gender, '') AS gender,
            a.primary_doctor
        FROM admissions a
        LEFT JOIN patients p ON p.patient_id = a.uhid
        WHERE a.ip_no = ?
        LIMIT 1
    `;

    db.query(sql, [ipNo], callback);
};

const getAllTests = (callback) => {
    db.query(
        "SELECT * FROM lab_test_master ORDER BY test_name",
        callback
    );
};

const getTestParameters = (testName, callback) => {
    db.query(
        "SELECT * FROM lab_test_parameters WHERE test_name = ?",
        [testName],
        callback
    );
};

const saveLabResults = (data, callback) => {
    const {
        orderId,
        testName,
        results
    } = data;

    const values = results.map(item => [
        orderId,
        testName,
        item.parameter_name,
        item.result_value,
        item.unit,
        item.reference_range
    ]);

    const sql = `
        INSERT INTO lab_results
        (
            order_id,
            test_name,
            parameter_name,
            result_value,
            unit,
            reference_range
        )
        VALUES ?
    `;

    db.query(sql, [values], callback);
};

module.exports = {
    getPatientByIp,
    getAllTests,
    getTestParameters,
    saveLabResults
};
