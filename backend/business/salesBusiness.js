const db = require("../config/db");

const createSale = (saleData, callback) => {

  const {
    billNo,
    patientId,
    patientName,
    paymentMode,
    totalAmount,
    items
  } = saleData;

  const saleSql = `
        INSERT INTO sales
        (
            bill_no,
            patient_id,
            patient_name,
            payment_mode,
            total_amount
        )
        VALUES (?, ?, ?, ?, ?)
    `;

  db.query(
    saleSql,
    [
      billNo,
      patientId,
      patientName,
      paymentMode,
      totalAmount
    ],
    (err, result) => {

      if (err) {
        return callback(err, null);
      }

      const saleId = result.insertId;

      items.forEach((item) => {

        const itemSql = `
                    INSERT INTO sale_items
                    (
                        sale_id,
                        medicine_id,
                        medicine_name,
                        batch_no,
                        qty,
                        mrp,
                        discount,
                        tax,
                        total
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

        db.query(
          itemSql,
          [
            saleId,
            item.medicineId,
            item.medicine,
            item.batch,
            item.qty,
            item.mrp,
            item.discount,
            item.tax,
            item.total
          ]
        );

        db.query(
          `
                    UPDATE stock
                    SET available_qty =
                    available_qty - ?
                    WHERE medicine_id = ?
                    `,
          [
            item.qty,
            item.medicineId
          ]
        );
      });

      callback(null, result);
    }
  );
};

const listSales = (callback) => {
  const query = `
    SELECT s.id, s.bill_no, s.patient_id, s.patient_name, s.payment_mode, s.total_amount, s.created_at,
      COUNT(si.id) AS itemCount
    FROM sales s
    LEFT JOIN sale_items si ON s.id = si.sale_id
    GROUP BY s.id
    ORDER BY s.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};

const getSalesItems = (filters, callback) => {
  const { patientId, ipNo, patientName } = filters;
  let query = `
    SELECT si.medicine_name, si.batch_no, si.qty, si.mrp, si.discount, si.tax, si.total
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE 1=0
  `;
  const params = [];
  if (patientId) {
    query += ` OR s.patient_id = ?`;
    params.push(patientId);
  }
  if (ipNo) {
    query += ` OR s.patient_id = ?`;
    params.push(ipNo);
  }
  if (patientName) {
    query += ` OR s.patient_name = ?`;
    params.push(patientName);
  }

  db.query(query, params, (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};

module.exports = {
  createSale,
  listSales,
  getSalesItems
};