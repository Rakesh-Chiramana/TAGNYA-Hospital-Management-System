const bedBusiness = require("../business/bedBusiness");

const createBed = (req, res) => {

    bedBusiness.createBed(
        req.body,
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: "Bed Created Successfully"
            });
        }
    );
};

const getBeds = (req, res) => {

    bedBusiness.getBeds(
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false
                });
            }

            res.json({
                success: true,
                data: result
            });
        }
     );
 };

const updateBed = (req, res) => {
    const { bedId } = req.params;
    console.log("updateBed called with bedId:", bedId, "body:", req.body);
    bedBusiness.updateBed(
        bedId,
        req.body,
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: "Bed Updated Successfully"
            });
        }
    );
};
 
 module.exports = {
     createBed,
     getBeds,
     updateBed
 };