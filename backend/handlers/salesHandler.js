const {
    createSale,
    listSales,
    getSalesItems
} = require("../business/salesBusiness");

exports.saveSale = (req, res) => {

    createSale(req.body, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false
            });
        }

        res.json({
            success: true,
            message: "Sale Saved Successfully"
        });

    });

};

exports.listSales = (req, res) => {

    listSales((err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to load sales"
            });
        }

        res.json({
            success: true,
            sales: results
        });
    });

};

exports.fetchSalesItems = (req, res) => {
    const { patientId, ipNo, patientName } = req.query;
    getSalesItems({ patientId, ipNo, patientName }, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to load sales items"
            });
        }
        res.json({
            success: true,
            items: results
        });
    });
};