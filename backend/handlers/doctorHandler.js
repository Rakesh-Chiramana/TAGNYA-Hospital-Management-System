const db = require("../config/db");

// Add Doctor
exports.createDoctor = (req, res) => {
  const {
    name,
    specialization,
    qualification,
    experience,
    fee,
    email,
    kmc,
    designation,
    username,
    password,
    phone,
    availability,
    image,
  } = req.body;

  const nameValue = name?.trim() || "";
  const usernameValue = username?.trim() || "";
  const passwordValue = password || "";
  const phoneValue = phone?.trim() || "";
  const emailValue = email?.trim() || null;
  const kmcValue = kmc?.trim() || null;
  const designationValue = designation || specialization || null;
  const qualificationValue = qualification || null;
  const feeValue = fee != null && fee !== "" ? String(fee) : "0";

  if (!nameValue || !usernameValue || !passwordValue || !phoneValue || !emailValue) {
    return res.status(400).json({
      success: false,
      message: "Name, username, password, phone and email are required",
    });
  }

  // 1. Check if user already exists
  db.query("SELECT id FROM users WHERE username = ?", [usernameValue], (err, users) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Database error", error: err });
    }
    if (users && users.length > 0) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }

    // 2. Insert into users table
    const insertUserSql = `
      INSERT INTO users (username, password, name, email, role, status)
      VALUES (?, ?, ?, ?, 'Doctor', 'Active')
    `;
    db.query(insertUserSql, [usernameValue, passwordValue, nameValue, emailValue], (err, userResult) => {
      if (err) {
        console.error(err);
        const isDuplicate = err.code === 'ER_DUP_ENTRY';
        return res.status(isDuplicate ? 400 : 500).json({
          success: false,
          message: isDuplicate ? 'Username already exists' : 'Failed to create user account',
          error: err,
        });
      }

      // Convert availability AM/PM times to 24h
      const convert12to24 = (time12h) => {
        if (!time12h) return null;
        const parts = time12h.split(' ');
        if (parts.length < 2) return null;
        const time = parts[0];
        const modifier = parts[1];
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
          hours = '00';
        }
        if (modifier === 'PM') {
          hours = parseInt(hours, 10) + 12;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
      };

      const availabilityMap = {};
      if (Array.isArray(availability)) {
        availability.forEach(avail => {
          const dayLower = avail.day.toLowerCase();
          availabilityMap[`${dayLower}_from`] = convert12to24(avail.fromTime);
          availabilityMap[`${dayLower}_to`] = convert12to24(avail.toTime);
        });
      }

      const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      const scheduleValues = [];
      days.forEach(day => {
        scheduleValues.push(availabilityMap[`${day}_from`] || null);
        scheduleValues.push(availabilityMap[`${day}_to`] || null);
      });

      const parsedExp = parseInt(experience) || 0;

      // 3. Insert into doctors table
      const doctorColumns = [
        'doctor_name', 'email', 'mobile_no', 'username', 'password', 'designation', 'study', 'experience', 'consultancy', 'kmc', 'image', 'status',
        'monday_from', 'monday_to', 'tuesday_from', 'tuesday_to', 'wednesday_from', 'wednesday_to', 'thursday_from', 'thursday_to',
        'friday_from', 'friday_to', 'saturday_from', 'saturday_to', 'sunday_from', 'sunday_to'
      ];
      const insertDoctorSql = `
        INSERT INTO doctors (${doctorColumns.join(', ')})
        VALUES (${doctorColumns.map(() => '?').join(', ')})
      `;

      const doctorParams = [
        nameValue,
        emailValue,
        phoneValue,
        usernameValue,
        passwordValue,
        designationValue,
        qualificationValue,
        parsedExp,
        feeValue,
        kmcValue,
        image || null,
        'Available',
        ...scheduleValues
      ];

        db.query(insertDoctorSql, doctorParams, (err, doctorResult) => {
        if (err) {
          console.error(err);
          // Rollback user insertion
          db.query("DELETE FROM users WHERE id = ?", [userResult.insertId]);

          const isDuplicate = err.code === 'ER_DUP_ENTRY';
          return res.status(isDuplicate ? 400 : 500).json({
            success: false,
            message: isDuplicate ? 'Doctor email or username already exists' : 'Failed to create doctor details',
            error: err,
          });
        }
          const doctorPayload = {
            id: `d${doctorResult.insertId}`,
            name,
            specialization: designation || specialization,
            qualification,
            experience: experience ? `${experience} Years` : '',
            fee: Number(fee) || 0,
            image: image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=150&h=150&auto=format&fit=crop",
            status: "Available",
            email,
            kmc,
            designation,
            availability
          };

          console.log('Doctor created:', doctorPayload);

          res.json({
            success: true,
            message: "Doctor Added Successfully",
            doctor: doctorPayload,
          });
      });
    });
  });
};

// Get All Doctors
exports.getAllDoctors = (req, res) => {
  db.query("SELECT * FROM doctors", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    const convert24to12 = (time24h) => {
      if (!time24h) return "07:00 AM";
      const [hoursStr, minutesStr] = time24h.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = minutesStr;
      const modifier = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours.toString().padStart(2, '0')}:${minutes} ${modifier}`;
    };

    const DAYS = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const mappedDoctors = result.map(row => {
      const availability = DAYS.map(day => {
        const dayLower = day.toLowerCase();
        const fromTime = row[`${dayLower}_from`] ? convert24to12(row[`${dayLower}_from`]) : "07:00 AM";
        const toTime = row[`${dayLower}_to`] ? convert24to12(row[`${dayLower}_to`]) : "07:00 PM";
        return { day, fromTime, toTime };
      });

      return {
        id: `d${row.id}`,
        name: row.doctor_name,
        specialization: row.designation || "",
        qualification: row.study || "",
        experience: row.experience ? `${row.experience} Years` : "",
        fee: Number(row.consultancy) || 0,
        image: row.image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=150&h=150&auto=format&fit=crop",
        status: row.status || "Available",
        email: row.email,
        kmc: row.kmc,
        designation: row.designation,
        availability: availability
      };
    });

    res.json({
      success: true,
      count: mappedDoctors.length,
      doctors: mappedDoctors
    });
  });
};

// Get Single Doctor
exports.getDoctor = (req, res) => {
  const { doctorId } = req.params;
  const numericId = doctorId.startsWith('d') ? doctorId.substring(1) : doctorId;

  db.query(
    "SELECT * FROM doctors WHERE id = ?",
    [numericId],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      if (!result || result.length === 0) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }

      const row = result[0];
      const convert24to12 = (time24h) => {
        if (!time24h) return "07:00 AM";
        const [hoursStr, minutesStr] = time24h.split(':');
        let hours = parseInt(hoursStr, 10);
        const minutes = minutesStr;
        const modifier = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours.toString().padStart(2, '0')}:${minutes} ${modifier}`;
      };

      const DAYS = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      const availability = DAYS.map(day => {
        const dayLower = day.toLowerCase();
        const fromTime = row[`${dayLower}_from`] ? convert24to12(row[`${dayLower}_from`]) : "07:00 AM";
        const toTime = row[`${dayLower}_to`] ? convert24to12(row[`${dayLower}_to`]) : "07:00 PM";
        return { day, fromTime, toTime };
      });

      res.json({
        id: `d${row.id}`,
        name: row.doctor_name,
        specialization: row.designation || "",
        qualification: row.study || "",
        experience: row.experience ? `${row.experience} Years` : "",
        fee: Number(row.consultancy) || 0,
        image: row.image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=150&h=150&auto=format&fit=crop",
        status: row.status || "Available",
        email: row.email,
        kmc: row.kmc,
        designation: row.designation,
        availability: availability
      });
    }
  );
};

// Update Status
exports.updateStatus = (req, res) => {
  const { doctorId } = req.params;
  const { status } = req.body;
  const numericId = doctorId.startsWith('d') ? doctorId.substring(1) : doctorId;

  db.query(
    "UPDATE doctors SET status = ? WHERE id = ?",
    [status, numericId],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Status Updated",
      });
    }
  );
};

// Delete Doctor
exports.deleteDoctor = (req, res) => {
  const { doctorId } = req.params;
  const numericId = doctorId.startsWith('d') ? doctorId.substring(1) : doctorId;

  // First get the username so we can delete from users table too
  db.query("SELECT username FROM doctors WHERE id = ?", [numericId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "DB error", error: err });
    }

    const username = rows && rows[0] ? rows[0].username : null;

    // Delete from doctors table
    db.query("DELETE FROM doctors WHERE id = ?", [numericId], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ success: false, message: "Failed to delete doctor", error: err2 });
      }

      // Also delete from users table if username found
      if (username) {
        db.query("DELETE FROM users WHERE username = ?", [username], (err3) => {
          if (err3) console.error("Failed to delete user account:", err3);
        });
      }

      res.json({ success: true, message: "Doctor deleted permanently" });
    });
  });
};