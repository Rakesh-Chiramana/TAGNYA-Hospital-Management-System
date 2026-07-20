const labBusiness = require("../business/labBusiness");

const getPatient = (req, res) => {
    const { ipNo } = req.params;

    labBusiness.getPatientByIp(ipNo, (err, result) => {
        if (err)
            return res.status(500).json({ success: false });

        res.json(result[0]);
    });
};

const getTests = (req, res) => {
    labBusiness.getAllTests((err, result) => {
        if (err)
            return res.status(500).json({ success: false });

        res.json(result);
    });
};

const getParameters = (req, res) => {
    const { testName } = req.params;

    labBusiness.getTestParameters(
        testName,
        (err, result) => {
            if (err)
                return res.status(500).json({ success: false });

            res.json(result);
        }
    );
};

const saveResults = (req, res) => {
    labBusiness.saveLabResults(
        req.body,
        (err, result) => {
            if (err)
                return res.status(500).json({ success: false });

            res.json({
                success: true,
                message: "Results Saved"
            });
        }
    );
};

module.exports = {
    getPatient,
    getTests,
    getParameters,
    saveResults
};