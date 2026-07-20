const db = require("../config/db");

const saveExpenseBill = (data) => {
    return new Promise((resolve, reject) => {
        const sql = `
INSERT INTO expense_bills
(doctor_name, from_date, to_date, bill_date, doctor_fee, snacks, food, accommodation, medicine, other_expense, total)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
        db.query(sql, [
            data.doctor_name,
            data.from_date,
            data.to_date,
            data.bill_date,
            data.doctor_fee,
            data.snacks,
            data.food,
            data.accommodation,
            data.medicine,
            data.other_expense,
            data.total
        ], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const getExpenseBills = () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM expense_bills ORDER BY created_at DESC", (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const deleteExpenseBill = (doctorName, fromDate, toDate) => {
    return new Promise((resolve, reject) => {
        db.query(
            "DELETE FROM expense_bills WHERE doctor_name = ? AND from_date = ? AND to_date = ?",
            [doctorName, fromDate, toDate],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
};

const deleteExpenseBillsByIds = (ids) => {
    return new Promise((resolve, reject) => {
        if (!ids || ids.length === 0) {
            return resolve({ affectedRows: 0 });
        }
        db.query(
            "DELETE FROM expense_bills WHERE id IN (?)",
            [ids],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
};

module.exports = {
    saveExpenseBill,
    getExpenseBills,
    deleteExpenseBill,
    deleteExpenseBillsByIds
};