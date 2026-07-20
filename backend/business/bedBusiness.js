const db = require("../config/db");

// Create Bed
const createBed = (bedData, callback) => {
    const {
        bed_id,
        ward_no,
        ward_type,
        charge_per_day
    } = bedData;

    const sql = `
        INSERT INTO beds
        (
            bed_id,
            ward_no,
            ward_type,
            charge_per_day
        )
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            bed_id,
            ward_no,
            ward_type,
            charge_per_day
        ],
        callback
    );
};

// Get All Beds
const getBeds = (callback) => {
    db.query(
        "SELECT * FROM beds ORDER BY bed_id ASC",
        callback
    );
};

// Update Bed Status and Patient Details
const updateBed = (bedId, updateData, callback) => {
    const {
        is_occupied,
        is_reserved,
        patient_name,
        patient_id,
        estimated_discharge,
        reservation_expiry,
        status
    } = updateData;

    const sql = `
        UPDATE beds
        SET is_occupied = ?,
            is_reserved = ?,
            patient_name = ?,
            patient_id = ?,
            estimated_discharge = ?,
            reservation_expiry = ?,
            status = ?
        WHERE bed_id = ?
    `;

    db.query(
        sql,
        [
            is_occupied ? 1 : 0,
            is_reserved ? 1 : 0,
            patient_name || null,
            patient_id || null,
            estimated_discharge || null,
            reservation_expiry || null,
            status || 'Vacant',
            bedId
        ],
        (err, result) => {
            if (err) return callback(err);

            if (is_occupied) {
                // Insert into bed_allocations if not already active
                db.query(
                    "SELECT id FROM bed_allocations WHERE bed_id = ? AND status = 'Active'",
                    [bedId],
                    (errAlloc, allocs) => {
                        if (errAlloc) {
                            console.error("Error checking active bed allocation:", errAlloc);
                        } else if (!allocs || allocs.length === 0) {
                            db.query(
                                "INSERT INTO bed_allocations (bed_id, ip_no, patient_name, allocated_date, status) VALUES (?, ?, ?, NOW(), 'Active')",
                                [bedId, patient_id || 'N/A', patient_name || 'N/A'],
                                (errInsert) => {
                                    if (errInsert) console.error("Error inserting bed allocation:", errInsert);
                                    else console.log("Bed allocation inserted successfully for bed:", bedId);
                                }
                            );
                        }
                    }
                );
            } else if (status === 'Vacant') {
    // Step 1: Fetch the active allocation BEFORE completing it (need its data for bills/history)
    db.query(
        "SELECT * FROM bed_allocations WHERE bed_id = ? AND status = 'Active' ORDER BY id DESC LIMIT 1",
        [bedId],
        (errFetch, activeRows) => {
            if (errFetch) {
                console.error("Error fetching active allocation before release:", errFetch);
                return;
            }
            if (!activeRows || activeRows.length === 0) {
                console.log("No active allocation found for bed:", bedId, "— skipping bill/history insert.");
                return;
            }

            const alloc = activeRows[0];

            // Step 2: Mark allocation as Completed
            db.query(
                "UPDATE bed_allocations SET status = 'Completed', discharge_date = NOW(), total_days = GREATEST(1, TIMESTAMPDIFF(DAY, allocated_date, NOW())) WHERE id = ?",
                [alloc.id],
                (errUpdate) => {
                    if (errUpdate) {
                        console.error("Error completing bed allocation:", errUpdate);
                        return;
                    }
                    console.log("Bed allocation completed successfully for bed:", bedId);

                    // Step 3: Fetch bed's ward_type & charge_per_day
                    db.query(
                        "SELECT ward_type, charge_per_day FROM beds WHERE bed_id = ?",
                        [bedId],
                        (errBed, bedRows) => {
                            if (errBed || !bedRows || bedRows.length === 0) {
                                console.error("Error fetching bed info for bill/history:", errBed);
                                return;
                            }

                            const bedInfo = bedRows[0];
                            const daysStayed = Math.max(
                                1,
                                Math.ceil(
                                    (new Date() - new Date(alloc.allocated_date)) / (1000 * 60 * 60 * 24)
                                )
                            );
                            const chargePerDay = Number(bedInfo.charge_per_day) || 0;
                            const totalAmount = daysStayed * chargePerDay;
                            const billNo = "BB" + String(Date.now()).slice(-8);

                            // Step 4: Insert into bed_bills
                            db.query(
                                `INSERT INTO bed_bills
                                (bill_no, ip_no, patient_name, bed_id, ward_type, days_stayed, charge_per_day, total_amount)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    billNo,
                                    alloc.ip_no,
                                    alloc.patient_name,
                                    bedId,
                                    bedInfo.ward_type,
                                    daysStayed,
                                    chargePerDay,
                                    totalAmount
                                ],
                                (errBill) => {
                                    if (errBill) console.error("Error inserting bed_bills:", errBill);
                                    else console.log("bed_bills inserted for bed:", bedId);
                                }
                            );

                            // Step 5: Insert into bed_history
                            db.query(
                                `INSERT INTO bed_history
                                (patient_id, bed_type, ward_name, charge_per_day, from_date, to_date, days_stayed)
                                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    alloc.ip_no,
                                    bedInfo.ward_type,
                                    bedId,
                                    chargePerDay,
                                    alloc.allocated_date,
                                    new Date(),
                                    daysStayed
                                ],
                                (errHist) => {
                                    if (errHist) console.error("Error inserting bed_history:", errHist);
                                    else console.log("bed_history inserted for bed:", bedId);
                                }
                            );
                        }
                    );
                }
            );
        }
    );
}

            callback(null, result);
        }
    );
};

module.exports = {
    createBed,
    getBeds,
    updateBed
};