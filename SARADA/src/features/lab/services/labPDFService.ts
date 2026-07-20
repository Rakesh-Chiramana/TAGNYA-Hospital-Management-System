import { jsPDF } from "jspdf";
import { addProfessionalHeader, addProfessionalFooter, addSaradaHospitalHeader } from "../../../shared/utils/pdfHelper";
import hospitalLogo from "../../../assets/sarada_logo.png";
import { LabTest } from "../../../shared/types";

export const generateLabReportPDF = (report: LabTest, numberToWords: (num: number) => string) => {
  const doc = new jsPDF();

  let y = addSaradaHospitalHeader(doc, report.type === "Pathology" ? "LABORATORY DIAGNOSTICS REPORT" : "RADIOLOGY REPORT", hospitalLogo);

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

  addSection("Patient Details");
  addRow("Patient Name", report.patient, 105, "Patient ID", report.pid || "N/A");
  addRow("Age", `${report.age} Years`, 105, "Gender", report.sex);
  addRow("Mobile No", report.mobile || "N/A", 105, "Doctor", report.doctor);

  y += 5;
  addSection("Test Details");
  addRow("Report ID", report.id, 105, "Date", report.date);
  addRow("Test Name", report.test, 105, "Status", report.status);

  y += 5;
  addSection("Results");
  
  if (report.resultData) {
    Object.entries(report.resultData).forEach(([key, value]) => {
      addRow(key, String(value));
    });
  }

  y += 5;
  addSection("Financial Summary");
  addRow("Total Cost", `INR ${report.totalCost}`, 105, "Payment Method", report.paymentMethod || "Cash");
  if (report.totalCost) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(`Amount in words: ${numberToWords(report.totalCost)}`, 20, y);
    y += 10;
  }

  y += 20;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("__________________________", 140, y);
  doc.text("Authorized Signatory", 140, y + 5);

  addProfessionalFooter(doc, y + 20 > 275 ? y + 20 : 275);

  doc.save(`${report.id}_${report.patient.replace(/\s+/g, "_")}.pdf`);
};