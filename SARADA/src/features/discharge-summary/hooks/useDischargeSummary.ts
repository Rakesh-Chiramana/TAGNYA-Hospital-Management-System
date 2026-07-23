import  { useEffect, useState } from "react";
import { DischargeSummary as DischargeSummaryType, Patient, UserRole } from "../../../shared/types";
import { jsPDF } from "jspdf";
import { HOSPITAL_FOOTER_CONTACT } from "../../../shared/constants/hospitalBranding";
import hospitalLogo from "../../../assets/sarada_logo.png";
import {
  getPatients,
  getPatientById,
  saveDischarge,
} from "../services/dischargeService";

interface UseDischargeSummaryProps {
  onSave: (summary: DischargeSummaryType) => void;
  patients: Patient[];
  userRole: UserRole;
}

type DischargeSummaryFormData = DischargeSummaryType & {
  ipNo: string;
};

export const useDischargeSummary = ({ onSave, patients, userRole }: UseDischargeSummaryProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientList, setPatientList] = useState<Patient[]>(patients);
    const [editingSummary, setEditingSummary] = useState<DischargeSummaryType | null>(null); 

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await getPatients();
      if (res.success) {
        setPatientList(res.data);
      } else if (patients && patients.length) {
        setPatientList(patients);
      }
    } catch (error) {
      console.error("Failed to load discharge patients", error);
      if (patients && patients.length) {
        setPatientList(patients);
      }
    }
  
  };

  const canEdit = userRole === UserRole.ADMIN || userRole === UserRole.DOCTOR;

  const emptySummary: DischargeSummaryFormData = {
    id: `DS-${Math.floor(1000 + Math.random() * 9000)}`,
    patientId: "",
    patientName: "",
    age: "",
    gender: "",
    admissionDate: "",
    dischargeDate: new Date().toISOString().split("T")[0],
    consultant: "",
    chiefComplaints: "",
    relevantHistory: "",
    hospitalCourse: "",
    vitals: {
      temp: "",
      pulse: "",
      bp: "",
      resp: "",
      spo2: "",
      condition: "Stable",
    },
    finalDiagnosis: "",
    medications: [],
    advice: "",
    followUp: "",
    isReady: false,
    createdAt: new Date().toISOString(),
    ipNo: "",
  };

  const [formData, setFormData] = useState<DischargeSummaryFormData>(emptySummary);

  const handlePatientChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      patientId,
    }));

    if (!patientId) {
      setFormData((prev) => ({
        ...prev,
        patientName: "",
        age: "",
        gender: "",
        consultant: "",
        admissionDate: "",
        ipNo: "",
      }));
      return;
    }

    try {
      const res = await getPatientById(patientId);
      if (res.success && res.data) {
        const patient = res.data;
        setFormData((prev) => ({
          ...prev,
          patientId: String(patient.id),
          patientName: patient.patient_name || "",
          age: String(patient.age || ""),
          gender: patient.gender || "",
          consultant: patient.doctor_name || "",
          admissionDate: prev.admissionDate || "",
          ipNo: patient.ip_no || "",
          chiefComplaints: prev.chiefComplaints || patient.cause || patient.reason || "",
        }));
      }
    } catch (error) {
      console.error("Failed to load patient details", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("vitals.")) {
      const key = name.split(".")[1];
      setFormData({
        ...formData,
        vitals: { ...formData.vitals, [key]: value },
      });
      return;
    }

    setFormData({ ...formData, [name]: value } as DischargeSummaryFormData);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      patient_id: formData.patientId,
      ip_no: formData.ipNo,
      patient_name: formData.patientName,
      discharge_date: formData.dischargeDate,
      chief_complaints: formData.chiefComplaints,
      present_history: formData.relevantHistory,
      hospital_course: formData.hospitalCourse,
      temperature: formData.vitals.temp,
      pulse: formData.vitals.pulse,
      bp: formData.vitals.bp,
      resp: formData.vitals.resp,
      spo2: formData.vitals.spo2,
      condition_at_discharge: formData.vitals.condition,
      final_diagnosis: formData.finalDiagnosis,
      medications: JSON.stringify(formData.medications),
      discharge_advice: formData.advice,
      review_date: formData.followUp,
      finalize_report: formData.isReady,
    };

    try {
      const res = await saveDischarge(payload);
      alert(res.message || "Discharge summary saved.");
      if (res.success) {
        onSave({ ...formData, isReady: true });
        setIsModalOpen(false);
        setFormData(emptySummary);
        // setEditingSummary(null);
      }
    } catch (error) {
  console.error(error);

  if (error instanceof Error) {
    alert(error.message);
  } else {
    alert("Failed to save discharge summary.");
  }
}
  };

  const handleAddMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        { medicine: "", dose: "", freq: "", dur: "" },
      ],
    });
  };

  const handleMedChange = (index: number, field: string, value: string) => {
    const updatedMeds = [...formData.medications];
    updatedMeds[index] = { ...updatedMeds[index], [field]: value };
    setFormData({ ...formData, medications: updatedMeds });
  };

  const handleEdit = (summary: DischargeSummaryType) => {
    setFormData({ ...summary, ipNo: "" });
    setEditingSummary(summary); 
    setIsModalOpen(true);
  };

  const generatePDF = (summary: DischargeSummaryType) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header & Branding
    let currentY = addMonochromeHospitalHeader(doc, "DISCHARGE SUMMARY", hospitalLogo);
    currentY += 5;
    doc.setFillColor(0, 0, 0, 0.06);
    doc.rect(20, currentY, pageWidth - 40, 8, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 15, 15);
    doc.text("PATIENT INFORMATION", 25, currentY + 5.5);

    doc.setTextColor(0);
    currentY += 16;
    doc.setFontSize(10);
    // Row 1
    doc.setFont("helvetica", "bold");
    doc.text("Name:", 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(summary.patientName, 55, currentY);
    doc.setFont("helvetica", "bold");
    doc.text("Age/Gender:", 120, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`${summary.age} / ${summary.gender}`, 155, currentY);

    // Row 2
    currentY += 9;
    doc.setFont("helvetica", "bold");
    doc.text("Patient ID:", 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(summary.patientId, 55, currentY);
    doc.setFont("helvetica", "bold");
    doc.text("Admission:", 120, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(summary.admissionDate, 155, currentY);

    // Row 3
    currentY += 9;
    doc.setFont("helvetica", "bold");
    doc.text("Discharge Date:", 20, currentY);
    doc.setFont("helvetica", "normal");
    const genTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    doc.text(`${summary.dischargeDate}  (Time: ${genTime})`, 55, currentY);
    doc.setFont("helvetica", "bold");
    doc.text("Consultant:", 120, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(summary.consultant, 155, currentY);

    // 2. Clinical Summary
    currentY += 14;
    doc.setFillColor(0, 0, 0, 0.06);
    doc.rect(20, currentY, pageWidth - 40, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 15, 15);
    doc.text("CLINICAL SUMMARY", 25, currentY + 5.5);

    doc.setTextColor(0);
    currentY += 13;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Chief Complaints:", 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(summary.chiefComplaints, 55, currentY, { maxWidth: 135 });
    
    currentY += 11;
    doc.setFont("helvetica", "bold");
    doc.text("Relevant History:", 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(summary.relevantHistory, 55, currentY, { maxWidth: 135 });

    currentY += 11;
    doc.setFont("helvetica", "bold");
    doc.text("Hospital Course:", 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(summary.hospitalCourse, 55, currentY, { maxWidth: 135 });

    // 3. Vitals at Discharge
    currentY += 16;
    doc.setFillColor(0, 92, 151, 0.1);
    doc.rect(20, currentY, pageWidth - 40, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 92, 151);
    doc.text("OBSERVATIONS AT DISCHARGE", 25, currentY + 5.5);

    doc.setTextColor(0);
    currentY += 13;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Temp:`, 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`${summary.vitals.temp}°F`, 35, currentY);
    
    doc.setFont("helvetica", "bold");
    doc.text(`Pulse:`, 55, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`${summary.vitals.pulse} bpm`, 70, currentY);

    doc.setFont("helvetica", "bold");
    doc.text(`BP:`, 95, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`${summary.vitals.bp} mmHg`, 105, currentY);

    doc.setFont("helvetica", "bold");
    doc.text(`SpO2:`, 140, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(`${summary.vitals.spo2}%`, 152, currentY);

    doc.setFont("helvetica", "bold");
    doc.text(`Condition:`, 170, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(summary.vitals.condition, 188, currentY);

    // 4. Final Diagnosis
    currentY += 12;
    doc.setFillColor(0, 92, 151, 0.1);
    doc.rect(20, currentY, pageWidth - 40, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 92, 151);
    doc.text("FINAL DIAGNOSIS", 25, currentY + 5.5);

    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(summary.finalDiagnosis, 20, currentY + 14);

    // 5. Medications
    currentY += 24;
    doc.setFillColor(0, 92, 151, 0.1);
    doc.rect(20, currentY, pageWidth - 40, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 92, 151);
    doc.text("MEDICATIONS ADVISED", 25, currentY + 5.5);

    doc.setTextColor(0);
    currentY += 13;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("MEDICINE", 25, currentY);
    doc.text("DOSE", 90, currentY);
    doc.text("FREQ", 130, currentY);
    doc.text("DUR", 170, currentY);
    doc.setDrawColor(200);
    doc.line(20, currentY + 2, pageWidth - 20, currentY + 2);
    
    currentY += 9;
    doc.setTextColor(0);
    summary.medications.slice(0, 5).forEach((med) => {
      doc.setFont("helvetica", "normal");
      doc.text(med.medicine, 25, currentY);
      doc.text(med.dose, 90, currentY);
      doc.text(med.freq, 130, currentY);
      doc.text(med.dur, 170, currentY);
      currentY += 7;
    });

    // 6. Instructions & Follow-up
    currentY += 10;
    doc.setFillColor(0, 92, 151, 0.1);
    doc.rect(20, currentY, pageWidth - 40, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 92, 151);
    doc.text("INSTRUCTIONS & FOLLOW-UP", 25, currentY + 5.5);
    
    doc.setTextColor(0);
    currentY += 14;
    doc.setFontSize(10);
    // Advice (Left Column)
    doc.setFont("helvetica", "bold");
    doc.text("Advice:", 20, currentY);
    doc.setFont("helvetica", "normal");
    const adviceLines = doc.splitTextToSize(summary.advice, (pageWidth / 2) - 30);
    doc.text(adviceLines, 40, currentY);

    // Follow-up (Right Column)
    doc.setFont("helvetica", "bold");
    doc.text("Follow-up:", pageWidth / 2 + 10, currentY);
    doc.setFont("helvetica", "normal");
    const followUpLines = doc.splitTextToSize(summary.followUp, (pageWidth / 2) - 35);
    doc.text(followUpLines, pageWidth / 2 + 35, currentY);

    // Signatures - Balanced Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    let sigY = pageHeight - 42; 

    // If content is very long, push signatures further down
    if (currentY + 25 > sigY) {
      sigY = currentY + 25;
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    
    // Patient Signature
    doc.line(20, sigY, 70, sigY);
    doc.text("Patient Signature", 45, sigY + 5, { align: "center" });
    
    // Medical Superintendent
    doc.line( pageWidth / 2 - 25, sigY, pageWidth / 2 + 25, sigY);
    doc.text("Medical Superintendent", pageWidth / 2, sigY + 5, { align: "center" });

    // Doctor Signature - Right Aligned
    doc.line(pageWidth - 75, sigY, pageWidth - 20, sigY);
    doc.text("Doctor Signature", pageWidth - 47.5, sigY + 5, { align: "center" });

    // Footer Banner
    const footerY = pageHeight - 15;
    doc.setFillColor(0, 0, 0, 0.02);
    doc.rect(0, footerY, pageWidth, 15, "F");
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 15, 15);
    doc.text("WISHING YOU A SPEEDY RECOVERY", pageWidth / 2, footerY + 5, { align: "center" });
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(HOSPITAL_FOOTER_CONTACT, pageWidth / 2, footerY + 9, { align: "center" });
    doc.text("This is a computer-generated report. Valid without physical signature and stamp.", pageWidth / 2, footerY + 13, { align: "center" });

    doc.save(`${summary.patientName}_Discharge_Summary.pdf`);
  };

  return {
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    canEdit,
    emptySummary,
    patientList,
    handlePatientChange,
    handleAddMedication,
    handleMedChange,
    handleSave,
    handleEdit,
    generatePDF,
    editingSummary,  
    setEditingSummary
  };
};

const addMonochromeHospitalHeader = (doc: jsPDF, documentTitle: string, logoImage: string) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const topY = 12;
  const logoSize = 22;

  if (logoImage) {
    doc.addImage(logoImage, "PNG", 12, topY, logoSize, logoSize);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("TAGNYA HOSPITAL", 12 + logoSize + 6, topY + 15);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Tagnyahealthcare@gmail.com", 12 + logoSize + 6, topY + 24);

  doc.setDrawColor(150);
  doc.setLineWidth(0.4);
  doc.line(10, topY + logoSize + 4, pageWidth - 10, topY + logoSize + 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(documentTitle.toUpperCase(), pageWidth / 2, topY + logoSize + 18, { align: "center" });

  return topY + logoSize + 26;
};
