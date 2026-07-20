import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import { Patient, Appointment, Invoice } from "../../../shared/types";
import { addProfessionalHeader, addProfessionalFooter, addSaradaHospitalHeader } from "../../../shared/utils/pdfHelper";
import hospitalLogo from "../../../assets/sarada_logo.png";

interface UsePatientManagementProps {
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];
  onAddPatient: (p: Patient) => void;
  onDeletePatient: (id: string) => void;
  onAddInvoice: (i: Invoice) => void;
  doctors: any[];
  registrationRequest?: { doctorName: string } | null;
  onRegistrationHandled?: () => void;
}

export const usePatientManagement = ({
  patients,
  appointments,
  invoices,
  onAddPatient,
  onDeletePatient,
  onAddInvoice,
  doctors = [],
  registrationRequest,
  onRegistrationHandled,
}: UsePatientManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [latestPatient, setLatestPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedHistoryPatient, setSelectedHistoryPatient] = useState<Patient | null>(null);
  const [selectedPrescriptionPatient, setSelectedPrescriptionPatient] = useState<Patient | null>(null);
  const [patientFirstName, setPatientFirstName] = useState("");
  const [patientLastName, setPatientLastName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const filteredPatients = patients.filter(
    (p) =>
      (p.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const followUp = React.useMemo(() => {
    if (!selectedDoctor)
      return { fee: 0, status: "Select Doctor", discount: 0 };

    const doctorObj = doctors.find(d => d.name === selectedDoctor);
    const baseFee = doctorObj ? doctorObj.fee : 0;
    
    if (!patientFirstName || !patientLastName)
      return { fee: baseFee, status: "New Patient", discount: 0 };

    const fullName = `${patientFirstName} ${patientLastName}`;
    const existingPatient = patients.find(
      (p) => p.name?.toLowerCase() === fullName.toLowerCase(),
    );

    if (existingPatient) {
      const lastVisit = new Date(existingPatient.admissionDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastVisit.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 5) {
        return {
          fee: 0,
          status: "Free Follow-up (Within 5 Days)",
          discount: 100,
        };
      } else if (diffDays <= 10) {
        return {
          fee: baseFee * 0.5,
          status: "Discounted Follow-up (Within 10 Days)",
          discount: 50,
        };
      }
    }

    return { fee: baseFee, status: "Standard Consultation", discount: 0 };
  }, [selectedDoctor, patientFirstName, patientLastName, patients]);

  useEffect(() => {
    if (registrationRequest) {
      setSelectedDoctor(registrationRequest.doctorName);
      setIsModalOpen(true);
      if (onRegistrationHandled) onRegistrationHandled();
    }
  }, [registrationRequest, onRegistrationHandled]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const doctor = formData.get("doctor") as string;
    const cause = formData.get("cause") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const address = formData.get("address") as string;
    const weight = formData.get("weight") as string;
    const emergencyName = formData.get("emergencyName") as string;
    const emergencyContact = formData.get("emergencyContact") as string;
    const age = Number(formData.get("age"));
    const gender = formData.get("gender") as string;
    const bloodGroup = formData.get("bloodGroup") as string;
    const contact = formData.get("contact") as string;
    const email = formData.get("email") as string;
    const dob = formData.get("dob") as string;

    const signature = canvasRef.current?.toDataURL();
    const { fee } = followUp;
    const queueNum = Math.floor(100 + Math.random() * 900);
    const serial = `QN-${queueNum}`;

    const maxId = patients.reduce((max, p) => {
      const idNum = parseInt(p.id.replace(/\D/g, ""));
      return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 1000);
    const pId = `P-${maxId + 1}`;
    const patientName = `${firstName} ${lastName}`;

    // Data to send to backend
    const patientDataForDB = {
      firstName,
      lastName,
      age,
      gender,
      weight: weight ? parseFloat(weight) : null,
      contact,
      email: email || null,
      dob: dob || null,
      bloodGroup: bloodGroup || "Unknown",
      emergencyName: emergencyName || null,
      emergencyContact: emergencyContact || null,
      reason: cause,
      paymentMethod,
      address,
      assignedDoctor: doctor,
      serial,
    };

    let savedPatientId = pId;

    // Send to backend API
    try {
      const response = await fetch("http://localhost:5000/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientDataForDB),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("✅ Patient saved to database:", result);
      if (result.success && result.patient && result.patient.patient_id) {
        savedPatientId = result.patient.patient_id;
      }
    } catch (error) {
      console.error("❌ Error saving patient to database:", error);
      alert("Error saving patient. Data saved locally but not to database.");
    }

    // Also create frontend Patient object for local state
    const newPatient: Patient = {
      id: savedPatientId,
      name: patientName,
      age,
      gender,
      blood: bloodGroup,
      weight: weight,
      address: address,
      emergencyContact: { name: emergencyName, phone: emergencyContact },
      type: "OP",
      status: "Consulting",
      admissionDate: new Date().toLocaleDateString(),
      admissionTime: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      doctor: doctor,
      serial: serial,
      contact: contact,
      dob: dob,
      email: email,
      fee: fee,
      paymentMethod: paymentMethod,
      cause: cause,
      signature: signature,
    };

    onAddPatient(newPatient);

    onAddInvoice({
      id: `INV-B${Math.floor(1000 + Math.random() * 8999)}`,
      name: patientName,
      patientId: savedPatientId,
      services: `Consultation - ${doctor}`,
      amount: `₹${fee.toFixed(0)}`,
      status: "Paid",
      paymentMethod: paymentMethod,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    setLatestPatient(newPatient);
    setIsModalOpen(false);
    setShowReceipt(true);
  };

  const handleDeletePatient = (patient: Patient) => {
    if (!window.confirm(`Are you sure you want to delete ${patient.name} (${patient.id})?`)) return;

    // Attempt server-side deletion first so deletion persists across refresh
    (async () => {
      try {
        const resp = await fetch(`http://localhost:5000/api/patients/${patient.id}`, {
          method: "DELETE",
        });

        const result = await resp.json().catch(() => null);

        if (resp.ok && result && result.success) {
          // update local UI
          onDeletePatient(patient.id);
        } else {
          const msg = (result && result.message) || resp.statusText || "Failed to delete patient";
          alert(`Server deletion failed: ${msg}`);
        }
      } catch (err) {
        console.error("Failed to delete patient on server:", err);
        alert("Could not reach server to delete patient. Try again when online.");
      }
    })();
  };

  const generateAdmissionPDF = (patient: Patient) => {
    const doc = new jsPDF();
    
    // Header
    let y = addSaradaHospitalHeader(doc, "OFFICIAL ADMISSION & REGISTRATION FORM", hospitalLogo);
    
    // Content
    doc.setTextColor(15, 23, 42);
    y += 5;
    
    const addSection = (title: string) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y - 5, 180, 8, "F");
      doc.text(title.toUpperCase(), 20, y);
      y += 12;
    };
    
    const addRow = (label: string, value: string, x2: number = 105, label2?: string, value2?: string) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value || "N/A"), 55, y);
      
      if (label2) {
        doc.setFont("helvetica", "bold");
        doc.text(`${label2}:`, x2, y);
        doc.setFont("helvetica", "normal");
        doc.text(String(value2 || "N/A"), x2 + 35, y);
      }
      y += 10;
    };
    
    addSection("Patient Information");
    addRow("Full Name", patient.name, 105, "Patient ID", patient.id);
    addRow("Age", `${patient.age} Years`, 105, "Gender", patient.gender);
    addRow("Blood Group", patient.blood, 105, "Weight", `${patient.weight} KG`);
    addRow("Contact", patient.contact, 105, "Email", patient.email);
    addRow("DOB", patient.dob);
    
    y += 5;
    addSection("Admission Details");
    addRow("Admission Date", patient.admissionDate, 105, "Admission Time", patient.admissionTime);
    addRow("Serial/Queue", patient.serial, 105, "Assigned Doctor", patient.doctor);
    addRow("Cause of Visit", patient.cause);
    
    y += 5;
    addSection("Emergency Contact");
    addRow("Contact Name", patient.emergencyContact?.name || "N/A", 105, "Phone", patient.emergencyContact?.phone || "N/A");
    
    y += 5;
    addSection("Billing Summary");
    addRow("Consultation Fee", `INR ${Number(patient.fee || 0).toFixed(0)}`, 105, "Payment Method", patient.paymentMethod || "N/A");
    
    // Address
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Address/Notes:", 20, y);
    doc.setFont("helvetica", "normal");
    const splitAddress = doc.splitTextToSize(patient.address || "N/A", 150);
    doc.text(splitAddress, 55, y);
    y += (splitAddress.length * 5) + 10;
    
    // Signature
    if (patient.signature) {
      try {
        doc.addImage(patient.signature, "PNG", 140, y, 40, 15);
      } catch (e) {
        console.error("Signature image error", e);
      }
    }
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("__________________________", 140, y + 20);
    doc.text("Authorized Signatory", 140, y + 25);
    
    addProfessionalFooter(doc, y + 40 > 275 ? y + 40 : 275);
    
    doc.save(`Admission_Form_${patient.id}_${patient.name.replace(/\s+/g, '_')}.pdf`);
  };

  const getPatientHistory = (patient: Patient) => {
    const patientAppointments = appointments.filter(
      (a) => a.patientId === patient.id || a.name === patient.name,
    );
    const patientInvoices = invoices.filter((i) => i.patientId === patient.id || i.name === patient.name);
    return { appointments: patientAppointments, invoices: patientInvoices };
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredPatients,
    isModalOpen,
    setIsModalOpen,
    showReceipt,
    setShowReceipt,
    latestPatient,
    selectedDoctor,
    setSelectedDoctor,
    selectedHistoryPatient,
    setSelectedHistoryPatient,
    selectedPrescriptionPatient,
    setSelectedPrescriptionPatient,
    patientFirstName,
    setPatientFirstName,
    patientLastName,
    setPatientLastName,
    canvasRef,
    startDrawing,
    draw,
    stopDrawing,
    clearSignature,
    followUp,
    handleRegister,
    handleDeletePatient,
    generateAdmissionPDF,
    getPatientHistory,
  };

};
