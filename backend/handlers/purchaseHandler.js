const {
  createPurchase,
  getPurchases,
} = require("../business/purchaseBusiness");

exports.addPurchase = (req, res) => {
  createPurchase(req.body, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json({
      success: true,
      message: "Purchase Added Successfully",
    });
  });
};

exports.getAllPurchases = (req, res) => {
  getPurchases((err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json(result);
  });
};