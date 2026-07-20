const expenseBusiness = require("../business/expenseBusiness");

const saveExpenseBill = async (req, res) => {
    try {
        const result = await expenseBusiness.saveExpenseBill(req.body);
        res.status(201).json({
            success: true,
            message: "Expense Bill Saved Successfully",
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to save expense bill"
        });
    }
};

const getExpenseBills = async (req, res) => {
    try {
        const data = await expenseBusiness.getExpenseBills();
        res.status(200).json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch expense bills"
        });
    }
};

const deleteExpenseBill = async (req, res) => {
    try {
        const { doctorName, fromDate, toDate } = req.query;
        const result = await expenseBusiness.deleteExpenseBill(doctorName, fromDate, toDate);
        res.status(200).json({
            success: true,
            message: "Expense Bill Deleted Successfully",
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete expense bill"
        });
    }
};

const deleteExpenseBillsByIds = async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids) {
            return res.status(400).json({ success: false, message: "No ids provided" });
        }
        const idList = ids.split(",").map((id) => Number(id)).filter((id) => !isNaN(id));

        const result = await expenseBusiness.deleteExpenseBillsByIds(idList);

        res.status(200).json({
            success: true,
            message: `${result.affectedRows} row(s) deleted`,
            deletedCount: result.affectedRows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete expense bill rows"
        });
    }
};

module.exports = {
    saveExpenseBill,
    getExpenseBills,
    deleteExpenseBill,
    deleteExpenseBillsByIds
};