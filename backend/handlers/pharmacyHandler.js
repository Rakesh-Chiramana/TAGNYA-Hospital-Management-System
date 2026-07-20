const {
  getAllMedicines,
  createMedicine,
  getVendors,
  addVendor,
  toggleVendorStatus,
  getPurchaseOrders,
  createPurchaseOrder,
  addPurchasePayment
} = require("../business/pharmacyBusiness");

const fetchMedicines = (req, res) => {
  getAllMedicines((err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Unable to fetch medicines",
      });
    }

    res.json({
      success: true,
      medicines: result,
    });
  });
};

const addMedicine = (req, res) => {
  // Enforce JSON-only requests
  const contentType = req.headers && req.headers['content-type'] ? String(req.headers['content-type']) : '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return res.status(415).json({ success: false, message: 'Unsupported Media Type - application/json required' });
  }

  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  }

  const body = req.body;

  createMedicine(body, (err, result) => {
    if (err) {
      console.error('Error creating medicine:', err);
      return res.status(500).json({ success: false, message: 'Failed to create medicine' });
    }

    res.json({ success: true, message: 'Medicine saved', data: { medicine_id: result.medicine_id, insertId: result.id } });
  });
};

const fetchVendors = (req, res) => {
  getVendors((err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, vendors: result });
  });
};

const createVendor = (req, res) => {
  addVendor(req.body, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Vendor created successfully", id: result.insertId });
  });
};

const toggleVendor = (req, res) => {
  const { id } = req.params;
  toggleVendorStatus(id, (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Vendor status toggled successfully" });
  });
};

const fetchPurchaseOrders = (req, res) => {
  getPurchaseOrders((err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, purchaseOrders: result });
  });
};

const recordPurchaseOrder = (req, res) => {
  createPurchaseOrder(req.body, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Purchase order saved successfully", id: result.id });
  });
};

const recordPaymentTerm = (req, res) => {
  const { id } = req.params;
  addPurchasePayment(id, req.body, (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Payment term recorded successfully" });
  });
};

module.exports = {
  fetchMedicines,
  addMedicine,
  fetchVendors,
  createVendor,
  toggleVendor,
  fetchPurchaseOrders,
  recordPurchaseOrder,
  recordPaymentTerm
};