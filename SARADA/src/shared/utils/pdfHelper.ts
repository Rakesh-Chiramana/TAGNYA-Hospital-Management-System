import { jsPDF } from "jspdf";
import {
  HOSPITAL_ADDRESS,
  HOSPITAL_EMAIL,
  HOSPITAL_FOOTER_CONTACT,
  HOSPITAL_NAME_LINE1,
  HOSPITAL_NAME_LINE2,
  HOSPITAL_WEBSITE,
  HOSPITAL_PHONE,
} from "../constants/hospitalBranding";

const LABEL_COLOR: [number, number, number] = [210, 185, 60];
const TEXT_COLOR: [number, number, number] = [0, 0, 0];
const RIGHT_MARGIN = 12;

const drawLabeledValueRight = (
  doc: jsPDF,
  label: string,
  value: string,
  rightX: number,
  y: number
) => {
  doc.setFont("times", "bold");
  doc.setTextColor(...TEXT_COLOR);
  const valueWidth = doc.getTextWidth(value);
  doc.text(value, rightX, y, { align: "right" });

  doc.setFont("times", "normal");
  doc.setTextColor(...LABEL_COLOR);
  doc.text(label, rightX - valueWidth, y, { align: "right" });
};

/** Letterhead layout: logo left, specialty + email + website on the right. */
export const addSaradaHospitalHeader = (doc: jsPDF, documentTitle: string, logoImage?: string) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const topY = 12;
  const rightX = pageWidth - RIGHT_MARGIN;
  const headerBandHeight = 30;
  const blockBottom = topY + headerBandHeight;

  // 1. Logo Icon (Square) on the Left
  if (logoImage) {
    doc.addImage(logoImage, "PNG", 12, topY + 2, 22, 22);
  }

  // 2. TAGNYA HOSPITAL title next to the logo
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("TAGNYA HOSPITAL", 38, topY + 15);

  // 3. Orange Divider vertical line
  doc.setDrawColor(226, 135, 67);
  doc.setLineWidth(0.6);
  doc.line(rightX - 54, topY + 4, rightX - 54, topY + 24);

  // 4. Services block on left of the divider
  doc.setTextColor(2, 132, 199);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("24/7", rightX - 58, topY + 12, { align: "right" });
  doc.setFontSize(8);
  doc.text("SERVICES", rightX - 58, topY + 19, { align: "right" });

  // 5. Contacts block on right of the divider
  doc.setTextColor(2, 132, 199);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("+91 9632203555", rightX - 50, topY + 11);
  doc.setFontSize(9);
  doc.text("Tagnyahealthcare@gmail.com", rightX - 50, topY + 18);

  let y = blockBottom + 2;

  // 6. Blue borders and Address text
  doc.setDrawColor(2, 132, 199);
  doc.setLineWidth(0.5);
  doc.line(10, y, pageWidth - 10, y);
  
  y += 5;
  doc.setTextColor(2, 132, 199);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text(HOSPITAL_ADDRESS, pageWidth / 2, y, { align: "center" });
  
  y += 3;
  doc.line(10, y, pageWidth - 10, y);
  
  y += 8;

  doc.setTextColor(...TEXT_COLOR);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(documentTitle.toUpperCase(), pageWidth / 2, y, { align: "center" });

  return y + 10;
};

export const addProfessionalHeader = (doc: jsPDF, documentTitle: string, logoImage?: string) => {
  return addSaradaHospitalHeader(doc, documentTitle, logoImage);
};

export const addProfessionalFooter = (doc: jsPDF, startY: number = 275) => {
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, startY - 5, 195, startY - 5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text(HOSPITAL_FOOTER_CONTACT, 105, startY, { align: "center" });
  doc.text(
    `This is a computer-generated official document from ${HOSPITAL_NAME_LINE1} ${HOSPITAL_NAME_LINE2}.`,
    105,
    startY + 5,
    { align: "center" }
  );
};

/** @deprecated Use addSaradaHospitalHeader */
export const addTagnyaHospitalHeader = addSaradaHospitalHeader;
