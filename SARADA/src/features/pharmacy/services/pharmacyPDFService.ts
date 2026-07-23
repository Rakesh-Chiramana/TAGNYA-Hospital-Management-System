import { jsPDF } from "jspdf";
import { addProfessionalFooter, addSaradaHospitalHeader } from "../../../shared/utils/pdfHelper";
import hospitalLogo from "../../../assets/sarada_logo.png";
import { PharmacyBill } from "./pharmacyService";

export const generatePharmacyReceiptPDF = (bill: PharmacyBill) => {
  const doc = new jsPDF();

  let y = addSaradaHospitalHeader(doc, "PHARMACY DISPENSATION RECEIPT", hospitalLogo);

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
  addRow("Patient Name", bill.patientName, 105, "Patient ID", bill.patientId || "N/A");
  addRow("Phone", bill.phone || "N/A", 105, "Date", bill.date);
  addRow("Age/Gender", bill.ageGender || "N/A", 105, "Bill No", bill.id);

  y += 5;
  addSection("Items Dispensed");
  
  if (bill.items) {
    bill.items.forEach((item) => {
      addRow("Item", item.name, 105, "Qty", String(item.qty));
    });
  }

  y += 5;
  addSection("Financial Summary");
  addRow("Total", `INR ${bill.total}`, 105, "Payment Method", bill.paymentMode || "Cash");
  if (bill.total) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(`Amount in words: ${bill.amountInWords}`, 20, y);
    y += 10;
  }

  y += 20;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("__________________________", 140, y);
  doc.text("Pharmacist Signature", 140, y + 5);

  addProfessionalFooter(doc, y + 20 > 275 ? y + 20 : 275);

  doc.save(`${bill.id}_${bill.patientName.replace(/\s+/g, "_")}.pdf`);
};

export const generateBulkOrderPDF = (order: unknown) => {
  const doc = new jsPDF();
  doc.text("Bulk Order Report", 20, 20);
  doc.save("bulk_order.pdf");
};

export const generatePharmacyBillPDF = generatePharmacyReceiptPDF;

export const generateMedicinePDF = (med: any) => {
  const doc = new jsPDF();

  let y = addSaradaHospitalHeader(doc, "MEDICINE INFORMATION DETAILS", hospitalLogo);

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

  const addRow = (label: string, value: string | number | undefined, x2: number = 110, label2?: string, value2?: string | number | undefined) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");

    const leftLabelX = 20;
    const leftValueX = 70;
    const rightLabelX = x2;
    const rightValueX = x2 + 45;

    doc.text(`${label}:`, leftLabelX, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value ?? "N/A"), leftValueX, y);

    if (label2) {
      doc.setFont("helvetica", "bold");
      doc.text(`${label2}:`, rightLabelX, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value2 ?? "N/A"), rightValueX, y);
    }
    y += 10;
  };

  // Medicine Basic Details
  addSection("Medicine Information");
  addRow("Medicine Name", med.name || med.medicine_name || "N/A", 105, "Medicine ID", med.id || med.medicine_id || "N/A");
  addRow("Category", med.category || "General", 105, "Dosage", med.dosage || "N/A");
  addRow("Company Name", med.companyName || med.company_name || "N/A", 105, "HSN Code", med.hsnCode || med.hsn_code || "N/A");
  addRow("Pack", med.pack || "N/A", 105, "Tax %", med.taxPercentage || med.tax_percentage || "0%");

  // Pricing Information
  y += 5;
  addSection("Pricing Details");
  
  const buyPrice = parseFloat(String(med.buyPrice ?? med.purchasePrice ?? med.latest_buy_price ?? 0)) || 0;
  const sellingPrice = parseFloat(String(med.sellPrice ?? med.price ?? med.latest_sell_price ?? med.mrp ?? med.latest_mrp ?? 0)) || 0;
  const mrp = parseFloat(String(med.mrp ?? med.latest_mrp ?? 0)) || 0;
  const stock = parseInt(String(med.stock ?? med.stockStrips ?? med.qty ?? 0), 10) || 0;
  const discount = parseFloat(String(med.discount ?? 0)) || 0;
  const totalAmount = sellingPrice * stock;
  
  addRow("MRP ₹", mrp.toFixed(2), 105, "Buying Price ₹", buyPrice.toFixed(2));
  addRow("Selling Price ₹", sellingPrice.toFixed(2), 105, "Discount %", discount.toFixed(2));
  addRow("Total Amount ₹", totalAmount.toFixed(2), 105, "Stock Units", stock.toString());

  // Stock and Batch Information
  y += 5;
  addSection("Stock & Batch Information");
  addRow("Current Stock", String(stock), 105, "Batch No", med.batchNo || med.latest_batch_no || "N/A");
  addRow("Expiry Date", med.expiry || med.latest_expiry || "N/A", 105, "Unit", med.unit || "TABLETS");

  // Vendor Information
  y += 5;
  addSection("Vendor Information");
  addRow("Vendor Name", med.vendorName || med.vendor_name || "N/A", 105, "GSTIN", med.vendorGstNo || med.vendor_gst_no || "N/A");
  addRow("Mobile No", med.vendorPhone || med.vendor_mobile || "N/A", 105, "Contact Person", med.vendorContactPerson || med.vendor_contact_person || "N/A");
  addRow("Address", med.vendorAddress || med.vendor_address || "N/A");

  // Amount Status
  y += 5;
  addSection("Amount Status");
  const amountStatus = stock > 0 ? "IN STOCK" : "OUT OF STOCK";
  const amountValue = totalAmount > 0 ? `₹ ${totalAmount.toFixed(2)}` : "₹ 0.00";
  const profitMargin = buyPrice > 0 ? ((sellingPrice - buyPrice) / buyPrice * 100) : 0;
  addRow("Stock Status", amountStatus, 105, "Total Value", amountValue);
  addRow("Medicines Count", String(stock), 105, "Profit Margin", `${profitMargin.toFixed(2)}%`);

  // Summary Section
  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(15, 23, 42);
  doc.setTextColor(255, 255, 255);
  doc.rect(15, y, 180, 25, "F");
  
  doc.text("SUMMARY", 20, y + 8);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Stock: ${stock} units | Total Value: ₹${totalAmount.toFixed(2)} | MRP: ₹${mrp.toFixed(2)} | Buying: ₹${buyPrice.toFixed(2)} | Selling: ₹${sellingPrice.toFixed(2)}`, 20, y + 18);

  addProfessionalFooter(doc, y + 40 > 275 ? y + 40 : 275);

  doc.save(`${med.id || med.medicine_id}_${(med.name || med.medicine_name || "medicine").replace(/\s+/g, "_")}_details.pdf`);
};
