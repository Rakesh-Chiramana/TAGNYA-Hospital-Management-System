const revenueBusiness = require("../business/revenueBusiness");

// Create Revenue Entry
const createRevenue = (req, res) => {
  revenueBusiness.createRevenue(
    req.body,
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Failed to create revenue entry",
        });
      }

      res.status(201).json({
        success: true,
        message: "Revenue entry created successfully",
        data: result,
      });
    }
  );
};

// Get All Revenue Entries
const getRevenueList = (req, res) => {
  revenueBusiness.getRevenueList(
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch revenue records",
        });
      }

      res.json({
        success: true,
        count: result.length,
        data: result,
      });
    }
  );
};

// Mark Revenue Paid
const markPaid = (req, res) => {
  const { id } = req.params;
  const { paymentMode, amount } = req.body;

  revenueBusiness.markPaid(
    id,
    paymentMode,
    amount,
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: "Failed to update payment status",
        });
      }

      res.json({
        success: true,
        message: "Payment updated successfully",
        data: result,
      });
    }
  );
};

module.exports = {
  createRevenue,
  getRevenueList,
  markPaid,
};