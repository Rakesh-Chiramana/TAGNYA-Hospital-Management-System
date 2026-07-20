const db = require("../config/db");

const createRevenue = (data, callback) => {
  const {
    patient_id,
    patient_name,
    department,
    service_name,
    amount,
    reference_id,
    charges
  } = data;

  db.query(
    "SELECT ledger_no FROM revenue_ledger ORDER BY id DESC LIMIT 1",
    (err, rows) => {

      let nextNo = 1;

      if (!err && rows.length > 0) {
        const lastNo = rows[0].ledger_no;
        const num = parseInt(lastNo.replace("LED", ""));
        nextNo = num + 1;
      }

      const ledgerNo =
        "LED" +
        String(nextNo).padStart(6, "0");

      const sql = `
      INSERT INTO revenue_ledger
      (
        ledger_no,
        patient_id,
        patient_name,
        department,
        service_name,
        amount,
        reference_id,
        charges
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [
          ledgerNo,
          patient_id,
          patient_name,
          department,
          service_name,
          amount,
          reference_id,
          charges ? JSON.stringify(charges) : null
        ],
        callback
      );
    }
  );
};

const getRevenueList = (callback) => {
  db.query(
    `
      SELECT
        r.*,
        (
          SELECT payment_mode
          FROM revenue_payments rp
          WHERE rp.ledger_id = r.id
          ORDER BY rp.payment_date DESC
          LIMIT 1
        ) AS payment_mode
      FROM revenue_ledger r
      ORDER BY r.id DESC
    `,
    (err, rows) => {
      if (err) return callback(err);

      // Parse charges JSON string back into object for each row
      const parsed = rows.map((row) => {
        let chargesObj = null;
        if (row.charges) {
          try {
            chargesObj = JSON.parse(row.charges);
          } catch (e) {
            chargesObj = null;
          }
        }
        return { ...row, charges: chargesObj };
      });

      callback(null, parsed);
    }
  );
};

const markPaid = (
  ledgerId,
  paymentMode,
  amount,
  callback
) => {

  db.query(
    `
    INSERT INTO revenue_payments
    (
      ledger_id,
      payment_mode,
      paid_amount
    )
    VALUES (?, ?, ?)
    `,
    [ledgerId, paymentMode, amount],
    (err) => {

      if (err)
        return callback(err);

      db.query(
        `
        UPDATE revenue_ledger
        SET payment_status='Paid'
        WHERE id=?
        `,
        [ledgerId],
        callback
      );
    }
  );
};

module.exports = {
  createRevenue,
  getRevenueList,
  markPaid
};