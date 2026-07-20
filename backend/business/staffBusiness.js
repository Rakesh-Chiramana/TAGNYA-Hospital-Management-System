const db = require("../config/db");

const createStaff = async (staffData) => {
const {
name,
role,
phone,
email,
age,
emergency,
experience,
study,
joiningDate,
username,
password,
status,
} = staffData;

const [rows] = await db.promise().query(
"SELECT staff_id FROM staff ORDER BY id DESC LIMIT 1"
);

let nextId = "S-1001";

if (rows.length > 0) {
const lastId = rows[0].staff_id;
const num = parseInt(lastId.split("-")[1]) + 1;
nextId = `S-${num}`;
}

const sql = `     INSERT INTO staff (
      staff_id,
      name,
      role,
      phone,
      email,
      age,
      emergency_contact,
      experience,
      study,
      joining_date,
      username,
      password,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

const [result] = await db.promise().query(sql, [
nextId,
name,
role,
phone,
email || null,
age || null,
emergency || null,
experience || null,
study || null,
joiningDate,
username,
password,
status || "Active",
]);

return {
insertId: result.insertId,
staff_id: nextId,
};
};

// Get All Staff
const getAllStaff = async () => {
const [rows] = await db.promise().query(
"SELECT * FROM staff ORDER BY id DESC"
);

return rows;
};

// Get Staff By Id
const getStaffById = async (staffId) => {
const [rows] = await db.promise().query(
"SELECT * FROM staff WHERE staff_id = ?",
[staffId]
);

return rows[0];
};

// Delete Staff
const deleteStaff = async (staffId) => {
const [result] = await db.promise().query(
"DELETE FROM staff WHERE staff_id = ?",
[staffId]
);

return result;
};

// Update staff by staff_id
const updateStaff = async (staffId, data) => {
  const fields = [];
  const values = [];

  const mapping = {
    name: 'name',
    role: 'role',
    phone: 'phone',
    email: 'email',
    age: 'age',
    emergency: 'emergency_contact',
    experience: 'experience',
    study: 'study',
    joiningDate: 'joining_date',
    username: 'username',
    password: 'password',
    status: 'status',
    avatar: 'avatar',
  };

  Object.keys(mapping).forEach((k) => {
    if (data[k] !== undefined) {
      fields.push(`${mapping[k]} = ?`);
      values.push(data[k]);
    }
  });

  if (fields.length === 0) return null;

  values.push(staffId);
  const sql = `UPDATE staff SET ${fields.join(', ')} WHERE staff_id = ?`;
  const [result] = await db.promise().query(sql, values);
  return result;
};

// Update status only
const updateStaffStatus = async (staffId, status) => {
  const [result] = await db.promise().query(
    "UPDATE staff SET status = ? WHERE staff_id = ?",
    [status, staffId]
  );
  return result;
};

module.exports = {
createStaff,
getAllStaff,
getStaffById,
deleteStaff,
 updateStaff,
 updateStaffStatus,
};
