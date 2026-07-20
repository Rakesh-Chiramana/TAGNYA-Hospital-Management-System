const db = require("../config/db");

const getAllMedicines = (callback) => {
  const sql = `
    SELECT
      m.id,
      m.medicine_id,
      m.medicine_name,
      m.hsn_code,
      m.company_name,
      m.tax_percentage,
      m.dosage,
      m.pack,
      m.vendor_name,
      COALESCE((
        SELECT SUM(p2.qty)
        FROM purchases p2
        WHERE LOWER(p2.medicine_name) = LOWER(m.medicine_name)
      ), 0) -
      COALESCE((
        SELECT SUM(si.qty)
        FROM sale_items si
        WHERE LOWER(si.medicine_name) = LOWER(m.medicine_name)
      ), 0) AS stock,
      (
        SELECT p3.purchase_price
        FROM purchases p3
        WHERE LOWER(p3.medicine_name) = LOWER(m.medicine_name)
        ORDER BY p3.id DESC LIMIT 1
      ) AS latest_buy_price,
      (
        SELECT p3.mrp
        FROM purchases p3
        WHERE LOWER(p3.medicine_name) = LOWER(m.medicine_name)
        ORDER BY p3.id DESC LIMIT 1
      ) AS latest_mrp,
      (
        SELECT p3.mrp
        FROM purchases p3
        WHERE LOWER(p3.medicine_name) = LOWER(m.medicine_name)
        ORDER BY p3.id DESC LIMIT 1
      ) AS latest_sell_price,
      (
        SELECT p3.batch_no
        FROM purchases p3
        WHERE LOWER(p3.medicine_name) = LOWER(m.medicine_name)
        ORDER BY p3.id DESC LIMIT 1
      ) AS latest_batch_no,
      (
        SELECT p3.expiry_date
        FROM purchases p3
        WHERE LOWER(p3.medicine_name) = LOWER(m.medicine_name)
        ORDER BY p3.id DESC LIMIT 1
      ) AS latest_expiry,
      (
        SELECT p3.discount_percent
        FROM purchases p3
        WHERE LOWER(p3.medicine_name) = LOWER(m.medicine_name)
        ORDER BY p3.id DESC LIMIT 1
      ) AS latest_discount,
      s.mobile AS vendor_mobile,
      s.email AS vendor_email,
      s.address AS vendor_address,
      s.contact_person AS vendor_contact_person,
      s.dl_no AS vendor_dl_no,
      s.gst_no AS vendor_gst_no,
      s.status AS vendor_status
    FROM medicines m
    LEFT JOIN suppliers s ON LOWER(s.supplier_name) = LOWER(m.vendor_name)
    ORDER BY m.medicine_name ASC
  `;

  db.query(sql, (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
};

const createMedicine = (medicine, callback) => {
  // generate a simple medicine_id if not provided
  const medicineId = medicine.medicine_id || `MED${Date.now().toString().slice(-8)}`;
  const sql = `
    INSERT INTO medicines (medicine_id, medicine_name, hsn_code, tax_percentage, dosage, pack, company_name, vendor_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    medicineId,
    medicine.medicine_name || medicine.name || null,
    medicine.hsn_code || medicine.hsnCode || null,
    medicine.tax_percentage || medicine.tax || null,
    medicine.dosage || null,
    medicine.pack || medicine.quantity || null,
    medicine.company_name || medicine.company || null,
    medicine.vendor_name || medicine.vendorName || null,
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('pharmacyBusiness.createMedicine SQL Error', { sql: sql.trim(), params, err });
      return callback(err, null);
    }
    // return the inserted id and medicine id
    callback(null, { id: result.insertId, medicine_id: medicineId });
  });
};

const getVendors = (callback) => {
  db.query("SELECT * FROM suppliers ORDER BY id DESC", (err, result) => {
    if (err) return callback(err, null);
    const mapped = result.map(v => ({
      id: v.supplier_id || String(v.id),
      dbId: v.id,
      name: v.supplier_name,
      contactPerson: v.contact_person,
      phone: v.mobile,
      email: v.email,
      address: v.address,
      dlNo: v.dl_no,
      gstNo: v.gst_no,
      status: v.status || 'Active',
      createdAt: v.created_at ? new Date(v.created_at).toISOString().split('T')[0] : ''
    }));
    callback(null, mapped);
  });
};

const addVendor = (vendor, callback) => {
  const supplierId = `V${Math.floor(100 + Math.random() * 900)}`;
  const sql = `
    INSERT INTO suppliers (supplier_id, supplier_name, mobile, email, address, contact_person, dl_no, gst_no, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
  `;
  db.query(sql, [
    supplierId,
    vendor.name || null,
    vendor.phone || null,
    vendor.email || null,
    vendor.address || null,
    vendor.contactPerson || null,
    vendor.dlNo || null,
    vendor.gstNo || null
  ], callback);
};

const toggleVendorStatus = (id, callback) => {
  db.query("UPDATE suppliers SET status = IF(status = 'Active', 'Inactive', 'Active') WHERE supplier_id = ? OR id = ?", [id, id], callback);
};

const getPurchaseOrders = (callback) => {
  db.query("SELECT * FROM purchase_orders ORDER BY id DESC", (err, orders) => {
    if (err) return callback(err, null);
    if (orders.length === 0) return callback(null, []);

    db.query("SELECT * FROM purchase_items", (err, items) => {
      if (err) return callback(err, null);

      db.query("SELECT * FROM purchase_payments ORDER BY id DESC", (err, payments) => {
        if (err) return callback(err, null);

        // Map items and payments to orders
        const results = orders.map(order => {
          const orderItems = items.filter(it => it.purchase_id === order.id).map(it => ({
            name: it.medicine_name,
            hsnCode: it.hsn_code,
            batchNo: it.batch_no,
            qty: it.qty,
            qtyFree: it.free_qty,
            buyPrice: Number(it.purchase_price),
            mrp: Number(it.mrp),
            expiry: it.expiry_date,
            tax: Number(it.tax_percentage),
            totalAmount: Number(it.total_amount)
          }));

          const orderPayments = payments.filter(p => p.purchase_id === order.id).map(p => ({
            date: p.payment_date,
            amountPaid: Number(p.amount_paid),
            itemsPaidCount: p.items_paid_count,
            notes: p.notes
          }));

          return {
            id: `STK-${order.id}`,
            dbId: order.id,
            vendorName: order.supplier_name,
            vendor: order.supplier_name,
            date: order.invoice_date,
            invoiceNo: order.invoice_no,
            invoiceDate: order.invoice_date,
            dlNo: order.dl_no,
            billNo: order.bill_no,
            paymentMode: order.payment_mode,
            paidAmount: Number(order.paid_amount),
            balance: Number(order.balance_amount),
            total: Number(order.grand_total),
            status: order.status || 'Active',
            totalDeliveredQty: order.total_delivered_qty,
            totalPaidQty: order.total_paid_qty,
            items: orderItems,
            paymentHistory: orderPayments
          };
        });

        callback(null, results);
      });
    });
  });
};

const createPurchaseOrder = (orderData, callback) => {
  const sqlOrder = `
    INSERT INTO purchase_orders 
    (purchase_no, supplier_name, invoice_no, invoice_date, bill_no, dl_no, payment_mode, paid_amount, grand_total, balance_amount, status, total_delivered_qty, total_paid_qty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const totalDelivered = orderData.items.reduce((acc, it) => acc + Number(it.qty || 0), 0);
  const paidRatio = orderData.total > 0 ? Math.min(1, Number(orderData.paidAmount || 0) / orderData.total) : 1;
  const totalPaid = Math.round(totalDelivered * paidRatio);
  const balance = Math.max(0, Number(orderData.total || 0) - Number(orderData.paidAmount || 0));

  db.query(sqlOrder, [
    `PO-${Date.now()}`,
    orderData.vendorName || orderData.vendor || "",
    orderData.invoiceNo || "",
    orderData.invoiceDate || new Date().toISOString().split("T")[0],
    orderData.billNo || "",
    orderData.dlNo || "",
    orderData.paymentMode || "",
    Number(orderData.paidAmount || 0),
    Number(orderData.total || 0),
    balance,
    balance <= 0 ? "Completed" : "Active",
    totalDelivered,
    totalPaid
  ], (err, resOrder) => {
    if (err) return callback(err, null);
    const purchaseId = resOrder.insertId;

    // Insert items into purchase_items (new table)
    if (orderData.items && orderData.items.length > 0) {
      const sqlItem = `
        INSERT INTO purchase_items 
        (purchase_id, medicine_name, batch_no, qty, free_qty, purchase_price, mrp, expiry_date, tax_percentage, total_amount)
        VALUES ?
      `;
      const itemRows = orderData.items.map(it => [
        purchaseId,
        it.name,
        it.batchNo,
        Number(it.qty || 0),
        Number(it.qtyFree || 0),
        Number(it.buyPrice || 0),
        Number(it.mrp || 0),
        it.expiry,
        Number(it.tax || 0),
        Number(it.totalAmount || 0)
      ]);
      db.query(sqlItem, [itemRows], (errItems) => {
        if (errItems) console.error("Error inserting purchase items", errItems);
      });

      // Auto-register each item into medicines table (INSERT IGNORE so duplicates are skipped)
      orderData.items.forEach(it => {
        if (!it.name) return;
        const medicineId = `MED${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`;
        const sqlMed = `
          INSERT IGNORE INTO medicines (medicine_id, medicine_name, hsn_code, tax_percentage, dosage, pack, company_name, vendor_name)
          SELECT ?, ?, ?, ?, ?, ?, ?, ?
          FROM DUAL
          WHERE NOT EXISTS (
            SELECT 1 FROM medicines WHERE LOWER(medicine_name) = LOWER(?)
          )
        `;
        db.query(sqlMed, [
          medicineId,
          it.name,
          it.hsnCode || "",
          Number(it.tax || 0),
          it.dosage || "",
          it.pack || "",
          it.company || "",
          orderData.vendorName || orderData.vendor || ""
        ].concat([it.name]), (errMed) => {
          if (errMed) console.error("Error auto-registering medicine:", it.name, errMed);
        });
      });

      // ALSO insert each item into the old purchases table so stock query always works
      orderData.items.forEach(it => {
        if (!it.name) return;
        const sqlOld = `
          INSERT INTO purchases
          (medicine_name, hsn_code, batch_no, qty, qty_free, purchase_price, mrp, expiry_date, tax_percent,
           supplier_name, invoice_no, invoice_date, payment_mode, paid_amount, grand_total)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sqlOld, [
          it.name,
          it.hsnCode || "",
          it.batchNo || "",
          Number(it.qty || 0),
          Number(it.qtyFree || 0),
          Number(it.buyPrice || 0),
          Number(it.mrp || 0),
          it.expiry || "",
          Number(it.tax || 0),
          orderData.vendorName || orderData.vendor || "",
          orderData.invoiceNo || "",
          orderData.invoiceDate || new Date().toISOString().split("T")[0],
          orderData.paymentMode || "",
          Number(orderData.paidAmount || 0),
          Number(it.totalAmount || 0)
        ], (errOld) => {
          if (errOld) console.error("Error inserting into purchases table", errOld);
        });
      });
    }

    // Insert initial payment if paidAmount > 0
    if (Number(orderData.paidAmount || 0) > 0) {
      const sqlPay = `
        INSERT INTO purchase_payments (purchase_id, payment_date, amount_paid, items_paid_count, notes)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(sqlPay, [
        purchaseId,
        orderData.invoiceDate || new Date().toISOString().split("T")[0],
        Number(orderData.paidAmount || 0),
        totalPaid,
        "Initial purchase payment"
      ], (errPay) => {
        if (errPay) console.error("Error inserting initial purchase payment", errPay);
      });
    }

    callback(null, { id: purchaseId });
  });
};

const addPurchasePayment = (purchaseId, payment, callback) => {
  const sqlPay = `
    INSERT INTO purchase_payments (purchase_id, payment_date, amount_paid, items_paid_count, notes)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sqlPay, [
    purchaseId,
    new Date().toISOString().split("T")[0],
    Number(payment.amountPaid),
    Number(payment.itemsPaidCount),
    payment.notes || "Term installment payment"
  ], (errPay) => {
    if (errPay) return callback(errPay, null);

    // Get order info to update totals
    db.query("SELECT * FROM purchase_orders WHERE id = ?", [purchaseId], (errGet, orders) => {
      if (errGet || orders.length === 0) return callback(errGet || new Error("Order not found"), null);
      const order = orders[0];

      const newPaid = Number(order.paid_amount || 0) + Number(payment.amountPaid);
      const newBal = Math.max(0, Number(order.grand_total || 0) - newPaid);
      const updatedPaidQty = Math.min(Number(order.total_delivered_qty || 0), Number(order.total_paid_qty || 0) + Number(payment.itemsPaidCount));
      const newStatus = newBal <= 0 ? "Completed" : "Active";

      db.query(`
        UPDATE purchase_orders
        SET paid_amount = ?, balance_amount = ?, total_paid_qty = ?, status = ?
        WHERE id = ?
      `, [newPaid, newBal, updatedPaidQty, newStatus, purchaseId], callback);
    });
  });
};

module.exports = {
  getAllMedicines,
  createMedicine,
  getVendors,
  addVendor,
  toggleVendorStatus,
  getPurchaseOrders,
  createPurchaseOrder,
  addPurchasePayment
};