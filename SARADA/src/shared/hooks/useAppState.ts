import { useState, useEffect } from "react";
import { UserRole, Bed, Patient, Invoice, Appointment, Doctor, DischargeSummary as DischargeSummaryType, ClinicalData, LabTest } from "../types";
import { mapStaffRoleToUserRole } from "../../features/login/utils/loginCredentials";


export const useAppState = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  // Authentication state (do not persist in localStorage; rely on server/session)
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loggedInStaffName, setLoggedInStaffName] = useState<string | null>(null);
  const [registrationRequest, setRegistrationRequest] = useState<{
    doctorName: string;
  } | null>(null);
  const [universalSearchTerm, setUniversalSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Detailed Bed State
  // Start empty; prefer DB as source-of-truth. Use mock data only if DB unreachable.
  const [beds, setBeds] = useState<Bed[]>(() => []);

  // Shared state for patients
  const [patients, setPatients] = useState<Patient[]>(() => []);

  // Shared state for invoices
  const [invoices, setInvoices] = useState<Invoice[]>(() => []);

  // Shared state for appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Shared state for doctors
  const [doctors, setDoctors] = useState<Doctor[]>(() => []);

  // Shared state for staff
  const [staff, setStaff] = useState<any[]>(() => []);

  // Shared state for discharge summaries
  const [dischargeSummaries, setDischargeSummaries] = useState<DischargeSummaryType[]>(() => []);

  // Shared state for lab tests
  const [labTests, setLabTests] = useState<LabTest[]>(() => []);

  // Persistence Effects 
  // No localStorage persistence: rely on backend DB as source of truth.

  // Fetch real data from MySQL database on mount
  useEffect(() => {
    const fetchDBData = async () => {
      let loadedAny = false;
      try {
        const doctorsRes = await fetch("http://localhost:5000/api/doctors");
        if (doctorsRes.ok) {
          const docData = await doctorsRes.json();
          if (docData.success && Array.isArray(docData.doctors)) {
            setDoctors(docData.doctors);
            loadedAny = true;
          }
        }
      } catch (err) {
        console.error("Failed to fetch doctors from DB:", err);
      }

      let fetchedPatients: any[] = [];
      let fetchedBeds: any[] = [];

      try {
        const patientsRes = await fetch("http://localhost:5000/api/patients");
        if (patientsRes.ok) {
          const patData = await patientsRes.json();
          if (patData.success && Array.isArray(patData.patients)) {
            fetchedPatients = patData.patients.map((row: any) => ({
              id: row.patient_id,
              name: `${row.firstName} ${row.lastName}`.trim(),
              age: Number(row.age) || 0,
              gender: row.gender || "Other",
              blood: row.bloodGroup || "Unknown",
              bloodGroup: row.bloodGroup || "Unknown",
              weight: row.weight ? String(row.weight) : undefined,
              contact: row.contact || "",
              email: row.email || "",
              dob: row.dob ? new Date(row.dob).toISOString().split('T')[0] : "",
              emergencyContact: {
                name: row.emergencyName || "",
                phone: row.emergencyContact || ""
              },
              cause: row.reason || "",
              paymentMethod: row.paymentMethod || "",
              address: row.address || "",
              doctor: row.assignedDoctor || "",
              status: row.status || "Active",
              serial: row.serial || "",
              type: "OP",
              admissionDate: row.admissionDate ? new Date(row.admissionDate).toLocaleDateString() : new Date().toLocaleDateString(),
              admissionTime: row.admissionDate ? new Date(row.admissionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              history: []
            }));
            loadedAny = true;
          }
        }
      } catch (err) {
        console.error("Failed to fetch patients from DB:", err);
      }

      try {
        const apptsRes = await fetch("http://localhost:5000/api/appointments");
        if (apptsRes.ok) {
          const apptData = await apptsRes.json();
          if (apptData.success && Array.isArray(apptData.appointments)) {
            const mapped = apptData.appointments.map((row: any) => ({
              id: row.appointment_id || String(row.id),
              time: row.time || "",
              date: row.date ? new Date(row.date).toISOString().split('T')[0] : "",
              name: row.patient_name || "",
              patientId: row.patient_id || "",
              dr: row.doctor || "",
              type: row.type || "",
              urgent: !!row.urgent,
              reason: row.reason || "",
            }));
            setAppointments(mapped);
            loadedAny = true;
          }
        }
      } catch (err) {
        console.error("Failed to fetch appointments from DB:", err);
      }

      // Beds come from backend DB
      try {
        const bedsRes = await fetch("http://localhost:5000/api/beds");
        if (bedsRes.ok) {
          const bedData = await bedsRes.json();
          if (bedData.success && Array.isArray(bedData.data)) {
            fetchedBeds = bedData.data.map((row: any) => ({
              id: row.bed_id,
              wardType: row.ward_type || "General",
              wardNo: row.ward_no || "",
              isOccupied: !!row.is_occupied,
              isReserved: !!row.is_reserved,
              chargePerDay: Number(row.charge_per_day) || 0,
              patientName: row.patient_name || undefined,
              patientId: row.patient_id || undefined,
              estimatedDischarge: row.estimated_discharge || undefined,
              reservationExpiry: row.reservation_expiry || undefined,
            }));
            setBeds(fetchedBeds);
            loadedAny = true;
          }
        }
      } catch (err) {
        console.error("Failed to fetch beds from DB:", err);
      }

      try {
        const ledgerRes = await fetch("http://localhost:5000/list");
        if (ledgerRes.ok) {
          const ledgerData = await ledgerRes.json();
          if (ledgerData.success && Array.isArray(ledgerData.data)) {
            const mappedInvoices = ledgerData.data.map((row: any) => ({
              id: row.ledger_no,
              name: row.patient_name,
              patientId: row.patient_id ? `P-${row.patient_id}` : "GUEST",
              department: row.department || "",
              services: row.service_name,
              amount: `₹${Number(row.amount).toFixed(0)}`,
              status: row.payment_status,
              paymentMethod: row.payment_mode || row.paymentMethod || "N/A",
              date: row.created_at ? new Date(row.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
              time: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              charges: row.charges || undefined,
              

            }));
            setInvoices(mappedInvoices);
            loadedAny = true;
          }
        }
      } catch (err) {
        console.error("Failed to fetch ledger from DB:", err);
      }

      // Link patients and beds
      if (fetchedPatients.length > 0) {
        const updatedPatients = fetchedPatients.map((p) => {
          const bedAlloc = fetchedBeds.find((b) => b.patientId === p.id && b.isOccupied);
          if (bedAlloc) {
            return {
              ...p,
              type: "IP",
              status: "Admitted",
              ward: bedAlloc.wardType,
              room: bedAlloc.wardNo,
              bed: bedAlloc.id,
            };
          }
          return p;
        });
        setPatients(updatedPatients);
      }

      // If node is offline or backend fails, keep state empty and surface the data issue.
      if (!loadedAny) {
        console.warn("No backend data loaded; bed data may be unavailable.");
      }
    };

    fetchDBData();
  }, []);

  useEffect(() => {
    // Restore session from localStorage on mount
    const savedUserRole = localStorage.getItem("userRole");
    const savedStaffName = localStorage.getItem("loggedInStaffName");
    const savedActiveTab = localStorage.getItem("activeTab");

    if (savedUserRole) {
      const mapped = mapStaffRoleToUserRole(savedUserRole) || (savedUserRole as UserRole);
      setUserRole(mapped);
      setLoggedInStaffName(savedStaffName);
      if (savedActiveTab) {
        setActiveTab(savedActiveTab);
      }
    }

    setSessionChecked(true);
  }, []);

  const handleLoginSuccess = (role: UserRole, staffName?: string) => {
    const mappedRole = mapStaffRoleToUserRole(role as string) || role;
    setUserRole(mappedRole);
    setLoggedInStaffName(staffName || null);

    // Persist login to localStorage
    localStorage.setItem("userRole", mappedRole);
    if (staffName) {
      localStorage.setItem("loggedInStaffName", staffName);
    }

    // Route each role to its dedicated dashboard tab
    switch (mappedRole) {
      case UserRole.DOCTOR:
        setActiveTab("dashboard");
        break;
      case UserRole.RECEPTIONIST:
        setActiveTab("patients");
        break;
      case UserRole.PHARMACIST:
        setActiveTab("pharmacy");
        break;
      case UserRole.LABORATORY:
        setActiveTab("lab");
        break;
      default:
        // Admin, Nurse, etc. → Command Center
        setActiveTab("dashboard");
    }

    // Save the active tab to localStorage so it persists on refresh
    const targetTab = mappedRole === UserRole.DOCTOR ? "dashboard" : 
                      mappedRole === UserRole.RECEPTIONIST ? "patients" : 
                      mappedRole === UserRole.PHARMACIST ? "pharmacy" : 
                      mappedRole === UserRole.LABORATORY ? "lab" : 
                      "dashboard";
    localStorage.setItem("activeTab", targetTab);
  };

  const handleLogout = () => {
    setUserRole(null);
    setLoggedInStaffName(null);
    setActiveTab("dashboard");

    // Clear all session data from localStorage
    localStorage.removeItem("userRole");
    localStorage.removeItem("loggedInStaffName");
    localStorage.removeItem("activeTab");
  };

  // Save active tab to localStorage whenever it changes (while logged in)
  useEffect(() => {
    if (userRole) {
      localStorage.setItem("activeTab", activeTab);
    }
  }, [activeTab, userRole]);

  const updateDoctorStatus = (doctorId: string, status: string) => {
    setDoctors((prev) =>
      prev.map((doc) => (doc.id === doctorId ? { ...doc, status } : doc)),
    );
  };

  const addPatient = (patient: Patient) =>
    setPatients((prev) => [patient, ...prev]);

  const deletePatient = (patientId: string) =>
    setPatients((prev) => prev.filter((p) => p.id !== patientId));

  const addInvoice = async (invoice: Invoice) => {
    // Optimistic local state update
    setInvoices((prev) => [invoice, ...prev]);

    // Send to backend DB
    try {
      // Determine department based on invoice prefix or service description
      let department = "Other";
      const idUpper = invoice.id.toUpperCase();
      const servicesLower = invoice.services.toLowerCase();

      if (idUpper.startsWith("PH-")) {
        department = "Pharmacy";
      } else if (idUpper.startsWith("LB-") || idUpper.startsWith("RAD-") || servicesLower.includes("lab") || servicesLower.includes("diagnostic") || servicesLower.includes("test")) {
        department = "Laboratory";
      } else if (servicesLower.includes("consultation")) {
        department = "Consultation";
      } else if (servicesLower.includes("bed") || servicesLower.includes("room") || servicesLower.includes("accommodation")) {
        department = "Room / Bed Charge";
      } else if (servicesLower.includes("surgical") || servicesLower.includes("surgery")) {
        department = "Surgery";
      }

      let cleanAmount = invoice.amount.replace(/^,1/, "");
      cleanAmount = cleanAmount.replace(/,/g, "");
      const numberMatch = cleanAmount.match(/[-+]?[0-9]*\.?[0-9]+/);
      const amountVal = numberMatch ? parseFloat(numberMatch[0]) : 0;
      const patientIdNum = parseInt(invoice.patientId.replace(/\D/g, "")) || null;

      const payload = {
        patient_id: patientIdNum,
        patient_name: invoice.name,
        department: department,
        service_name: invoice.services,
        amount: amountVal,
        reference_id: invoice.id,
        charges: invoice.charges || null,
      };

      const res = await fetch("http://localhost:5000/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.success && resData.data) {
          const insertId = resData.data.insertId;

          // If the invoice is already marked paid, sync the status to database
          if (invoice.status === "Paid" && insertId) {
            await fetch(`http://localhost:5000/paid/${insertId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentMode: invoice.paymentMethod || "Cash",
                amount: amountVal,
              }),
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to sync invoice to database:", err);
    }
  };

  const deleteInvoice = (invoiceId: string) =>
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));

  const saveDischargeSummary = (summary: DischargeSummaryType) => {
    setDischargeSummaries((prev) => {
      const exists = prev.findIndex((s) => s.id === summary.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = summary;
        return updated;
      }
      return [summary, ...prev];
    });
  };

  const addAppointment = (appointment: Appointment) =>
    setAppointments((prev) => [appointment, ...prev]);

  const handleAddAdmission = (admissionData: any) => {
    const maxId = patients.reduce((max, p) => {
      const idNum = parseInt(p.id.replace(/\D/g, ""));
      return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 1000);
    const pId = `P-${maxId + 1}`;
    const newPatient: Patient = {
      id: pId,
      name: admissionData.patientName,
      age: 0,
      gender: "Other",
      blood: "Unknown",
      type: "IP",
      status: "Admitted",
      admissionDate: new Date().toLocaleDateString(),
      doctor: admissionData.doctor,
      serial: `QN-${Math.floor(100 + Math.random() * 900)}`,
      contact: "N/A",
      ward: admissionData.ward,
      room: admissionData.room,
      bed: admissionData.bed,
      history: [],
    };
    setPatients((prev) => [newPatient, ...prev]);
  };

  const handleBookBed = async (bedId: string, bookingData: any) => {
    let patient = patients.find(p => p.name === bookingData.patientName);
    const assignedBed = beds.find(b => b.id === bedId);
    
    if (!patient) {
      const maxId = patients.reduce((max, p) => {
        const idNum = parseInt(p.id.replace(/\D/g, ""));
        return !isNaN(idNum) && idNum > max ? idNum : max;
      }, 1000);
      const pId = `P-${maxId + 1}`;
      
      patient = {
        id: pId,
        name: bookingData.patientName,
        age: Number(bookingData.age) || 0,
        gender: bookingData.gender || "Other",
        blood: "Unknown",
        type: "IP",
        status: "Admitted",
        admissionDate: new Date().toLocaleDateString(),
        doctor: bookingData.doctor || "General",
        serial: `QN-${Math.floor(100 + Math.random() * 900)}`,
        contact: bookingData.emergencyContact || "N/A",
        ward: assignedBed?.wardType || "General",
        room: assignedBed?.wardNo || "Ward",
        bed: bedId,
        history: [],
      };

      // Persist the new IP patient to backend
      try {
        await fetch("http://localhost:5000/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id: pId,
            firstName: bookingData.patientName.split(" ")[0] || bookingData.patientName,
            lastName: bookingData.patientName.split(" ").slice(1).join(" ") || "",
            age: Number(bookingData.age) || 0,
            gender: bookingData.gender || "Other",
            contact: bookingData.emergencyContact || "N/A",
            bloodGroup: "Unknown",
            reason: "IP Admission",
            paymentMethod: "Cash",
            address: "N/A",
            assignedDoctor: bookingData.doctor || "General",
            serial: patient.serial,
          })
        });
      } catch (err) {
        console.error("Error creating patient for bed:", err);
      }
    }

    setBeds((prev) =>
      prev.map((bed) => {
        if (bed.id === bedId) {
          return {
            ...bed,
            isOccupied: true,
            isReserved: false,
            reservationExpiry: undefined,
            patientName: bookingData.patientName,
            patientId: patient!.id,
            estimatedDischarge: bookingData.estimatedDischarge,
          };
        }
        return bed;
      }),
    );

    // Persist bed booking to backend
    try {
      await fetch(`http://localhost:5000/api/beds/${bedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_occupied: true,
          is_reserved: false,
          patient_name: bookingData.patientName,
          patient_id: patient.id,
          estimated_discharge: bookingData.estimatedDischarge,
          reservation_expiry: null,
          status: "Occupied"
        })
      });
    } catch (err) {
      console.error("Error updating bed status:", err);
    }

    setPatients((prev) => {
      const existingIdx = prev.findIndex(p => p.id === patient!.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        const assignedBed = beds.find(b => b.id === bedId);
        updated[existingIdx] = {
          ...updated[existingIdx],
          type: "IP",
          status: "Admitted",
          ward: assignedBed?.wardType || "General",
          room: assignedBed?.wardNo || "Ward",
          bed: bedId,
        };
        return updated;
      } else {
        return [patient!, ...prev];
      }
    });
  };

  const handleReserveBed = async (bedId: string, patientName: string) => {
    const patient = patients.find(p => p.name === patientName);
    const expiry = Date.now() + 3600000; // 1 hour hold
    
    setBeds((prev) =>
      prev.map((bed) => {
        if (bed.id === bedId) {
          return {
            ...bed,
            isOccupied: false,
            isReserved: true,
            reservationExpiry: expiry,
            patientName: patientName,
            patientId: patient?.id,
          };
        }
        return bed;
      }),
    );

    try {
      await fetch(`http://localhost:5000/api/beds/${bedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_occupied: false,
          is_reserved: true,
          patient_name: patientName,
          patient_id: patient?.id || null,
          estimated_discharge: null,
          reservation_expiry: String(expiry),
          status: "Hold"
        })
      });
    } catch (err) {
      console.error("Error reserving bed:", err);
    }
  };

  const handleReleaseBed = async (bedId: string) => {
    const bedToRelease = beds.find(b => b.id === bedId);

    setBeds((prev) =>
      prev.map((bed) => {
        if (bed.id === bedId) {
          return {
            ...bed,
            isOccupied: false,
            isReserved: false,
            patientName: undefined,
            estimatedDischarge: undefined,
            reservationExpiry: undefined,
            patientId: undefined,
          };
        }
        return bed;
      }),
    );

    try {
      await fetch(`http://localhost:5000/api/beds/${bedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_occupied: false,
          is_reserved: false,
          patient_name: null,
          patient_id: null,
          estimated_discharge: null,
          reservation_expiry: null,
          status: "Vacant"
        })
      });
    } catch (err) {
      console.error("Error releasing bed:", err);
    }

    if (bedToRelease?.patientId) {
      setPatients((prev) => 
        prev.map((p) => {
          if (p.id === bedToRelease.patientId) {
            return {
              ...p,
              type: "OP",
              status: "Discharged",
              ward: undefined,
              room: undefined,
              bed: undefined,
            };
          }
          return p;
        })
      );
    }
  };

  const handleAddBed = async (bedData: Omit<Bed, "isOccupied" | "isReserved">) => {
    // Persist to backend then update local state
    try {
      await fetch("http://localhost:5000/api/beds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bed_id: bedData.id,
          ward_no: bedData.wardNo,
          ward_type: bedData.wardType,
          charge_per_day: bedData.chargePerDay,
        }),
      });
    } catch (err) {
      console.error("Failed to save bed to DB:", err);
    }

    const newBed: Bed = { ...bedData, isOccupied: false, isReserved: false };
    setBeds((prev) => [...prev, newBed]);
  };

  const handleUpdateBed = async (bedId: string, updates: Partial<Bed>) => {
    setBeds((prev) =>
      prev.map((bed) => (bed.id === bedId ? { ...bed, ...updates } : bed))
    );

    const existingBed = beds.find(b => b.id === bedId);
    if (!existingBed) return;
    const finalBed = { ...existingBed, ...updates };

    try {
      await fetch(`http://localhost:5000/api/beds/${bedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_occupied: finalBed.isOccupied,
          is_reserved: finalBed.isReserved,
          patient_name: finalBed.patientName || null,
          patient_id: finalBed.patientId || null,
          estimated_discharge: finalBed.estimatedDischarge || null,
          reservation_expiry: finalBed.reservationExpiry ? String(finalBed.reservationExpiry) : null,
          status: finalBed.isOccupied ? "Occupied" : finalBed.isReserved ? "Hold" : "Vacant"
        })
      });
    } catch (err) {
      console.error("Error updating bed:", err);
    }
  };

  const completeVisit = (appointmentId: string, clinicalData: ClinicalData) => {
    setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
  };

  const handleBookSlot = (doctorName: string) => {
    setRegistrationRequest({ doctorName });
    setActiveTab("patients");
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, ...updates } : apt))
    );
  };

  return {
    activeTab,
    setActiveTab,
    userRole,
    setUserRole,
    loggedInStaffName,
    registrationRequest,
    setRegistrationRequest,
    universalSearchTerm,
    setUniversalSearchTerm,
    showSearchResults,
    setShowSearchResults,
    beds,
    patients,
    invoices,
    appointments,
    doctors,
    labTests,
    setLabTests,
    staff,
    setStaff,
    setDoctors,
    dischargeSummaries,
    handleLoginSuccess,
    handleLogout,
    sessionChecked,
    updateDoctorStatus,
    addPatient,
    deletePatient,
    addInvoice,
    deleteInvoice,
    saveDischargeSummary,
    addAppointment,
    deleteAppointment,
    updateAppointment,
    handleAddAdmission,
    handleBookBed,
    handleReserveBed,
    handleReleaseBed,
    handleAddBed,
    handleUpdateBed,
    completeVisit,
    handleBookSlot,
  };
};
