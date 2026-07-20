import React, { useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./shared/components/Sidebar";
import LoginForm from "./features/login/Login";
import AppRouter from "./routes/AppRoutes";
import PageTransition from "./shared/components/PageTransition";
import { useAppState } from "./shared/hooks/useAppState";
import { Bell, LogOut, ClipboardList, TrendingUp, Download, Clock, IndianRupee, User, FlaskConical, Bed, Pill } from "./shared/utils/icons";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Modal from "./shared/components/Modal";
import { UserRole } from "./shared/types";
import hospitalLogo from "./assets/sarada_logo.png";
import {
  HOSPITAL_NAME_LINE1,
  HOSPITAL_ADDRESS,
  HOSPITAL_PHONE,
  HOSPITAL_EMAIL,
} from "./shared/constants/hospitalBranding";

const parseInvoiceDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  // Try direct parsing (e.g. "2026-05-18" or "14 May 2026")
  let parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Try parsing DD/MM/YYYY or DD-MM-YYYY (e.g. "14/05/2026")
  const dmyMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1; // Date month is 0-indexed
    const year = parseInt(dmyMatch[3], 10);
    parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Try parsing MM/DD/YYYY if DD/MM/YYYY didn't make a valid date
  const mdyMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mdyMatch) {
    const month = parseInt(mdyMatch[1], 10) - 1;
    const day = parseInt(mdyMatch[2], 10);
    const year = parseInt(mdyMatch[3], 10);
    parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
};

const isInvoiceInDateRange = (invoiceDateStr: string, startStr: string, endStr: string): boolean => {
  const invDate = parseInvoiceDate(invoiceDateStr);
  if (!invDate) return true; // Keep it if we can't parse it, so we don't hide data erroneously

  // Reset hours/minutes/seconds for date-only comparison
  invDate.setHours(0, 0, 0, 0);

  if (startStr) {
    const startDate = new Date(startStr);
    startDate.setHours(0, 0, 0, 0);
    if (invDate < startDate) return false;
  }

  if (endStr) {
    const endDate = new Date(endStr);
    endDate.setHours(0, 0, 0, 0);
    if (invDate > endDate) return false;
  }

  return true;
};

const App: React.FC = () => {
  const appState = useAppState();
  const {
    activeTab,
    setActiveTab,
    userRole,
    loggedInStaffName,
    handleLoginSuccess,
    handleLogout,
    invoices,
    userRole: role,
    patients,
  } = appState;

  const [isSettlementModalOpen, setIsSettlementModalOpen] = React.useState(false);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  const filteredInvoices = React.useMemo(() => {
    if (userRole === UserRole.ADMIN) return invoices;
    if (userRole === UserRole.PHARMACIST) return invoices.filter(inv => inv.id.startsWith("PH") || inv.services === "Pharmacy");
    if (userRole === UserRole.LABORATORY) return invoices.filter(inv => inv.id.startsWith("LB") || inv.services === "Lab");
    if (userRole === UserRole.RECEPTIONIST) return invoices.filter(inv => !inv.id.startsWith("PH") && !inv.id.startsWith("LB") && inv.services !== "Pharmacy" && inv.services !== "Lab");
    return [];
  }, [invoices, userRole]);

  const revenueReportInvoices = React.useMemo(() => {
    return filteredInvoices.filter(inv => isInvoiceInDateRange(inv.date, startDate, endDate));
  }, [filteredInvoices, startDate, endDate]);

  const revenueStats = React.useMemo(() => {
    const stats = {
      total: 0, pharmacy: 0, lab: 0, consultation: 0, ipd: 0,
      payments: { Cash: 0, Card: 0, UPI: 0, Insurance: 0, Other: 0 } as Record<string, number>
    };
    revenueReportInvoices.forEach((inv) => {
      const amount = parseFloat((inv.amount || "0").replace(/[^\d.-]/g, "")) || 0;
      stats.total += amount;
      if (inv.id.startsWith("PH") || inv.services === "Pharmacy") stats.pharmacy += amount;
      else if (inv.id.startsWith("LB") || inv.services === "Lab") stats.lab += amount;
      else if (inv.services === "Bed") stats.ipd += amount;
      else stats.consultation += amount;

      const method = inv.paymentMethod || "Other";
      if (stats.payments[method] !== undefined) stats.payments[method] += amount;
      else stats.payments.Other += amount;
    });
    return stats;
  }, [revenueReportInvoices]);

  const generateRevenueReportPDF = () => {
    const doc = new jsPDF();

    // --- BRANDED HEADER SECTION (Tagnya Hospital Letterhead) ---
    const imgElement = document.getElementById('hospital-logo-img') as HTMLImageElement;
    if (imgElement) {
      doc.addImage(imgElement, "PNG", 14, 13, 16, 16);
    }

    doc.setTextColor(6, 57, 112); // Deep Navy Blue
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("TAGNYA HOSPITAL", 32, 24);

    // "24/7 SERVICES" (Middle block)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("24/7", 112, 21, { align: "right" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("SERVICES", 112, 26, { align: "right" });

    // Gold/Orange vertical separator line
    doc.setDrawColor(218, 145, 0); // Gold/Orange
    doc.setLineWidth(0.8);
    doc.line(116, 14, 116, 29);

    // Phone & Email contact details (Right side)
    doc.setTextColor(6, 57, 112);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("+91 9632203555", 120, 20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Tagnyahealthcare@gmail.com", 120, 26);

    // Full width divider above address
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(15, 32, 195, 32);

    // Centered address bar
    doc.setTextColor(10, 80, 130);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("Nandish Complex, Next to Venugopal Swamy Temple, Varanasi Main Road, Jinkethimmanhalli, Tc Palya Post, Bangalore-560036.", 105, 36, { align: "center" });

    // Full width divider below address
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(15, 39, 195, 39);
    // --- END OF BRANDED HEADER SECTION ---

    // Document Title Block
    doc.setTextColor(6, 57, 112);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Complete Revenue & Financial Audit Report", 105, 48, { align: "center" });

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 53, { align: "center" });

    if (startDate || endDate) {
      const startText = startDate ? new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Beginning";
      const endText = endDate ? new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Present";
      doc.setFont("helvetica", "bold");
      doc.text(`Period: ${startText} to ${endText}`, 105, 59, { align: "center" });
    }

    const startY = (startDate || endDate) ? 66 : 58;
    const boxWidth = 42;
    const boxHeight = 25;
    const gap = 5;
    const drawSummaryBox = (x: number, y: number, label: string, value: string) => {
      doc.setDrawColor(230, 230, 230);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, boxWidth, boxHeight, 3, 3, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(label.toUpperCase(), x + 5, y + 10);
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text(value, x + 5, y + 18);
    };

    drawSummaryBox(15, startY, "Consultation", `Rs. ${revenueStats.consultation.toLocaleString('en-IN')}`);
    drawSummaryBox(15 + boxWidth + gap, startY, "Lab", `Rs. ${revenueStats.lab.toLocaleString('en-IN')}`);
    drawSummaryBox(15 + (boxWidth + gap) * 2, startY, "Bed", `Rs. ${revenueStats.ipd.toLocaleString('en-IN')}`);
    drawSummaryBox(15 + (boxWidth + gap) * 3, startY, "Pharmacy", `Rs. ${revenueStats.pharmacy.toLocaleString('en-IN')}`);

    // Payment Method Summary Section
    const paymentY = startY + boxHeight + 15;
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT METHOD DISTRIBUTION", 15, paymentY);

    let currentX = 15;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    Object.entries(revenueStats.payments).forEach(([method, amount]) => {
      if (amount > 0) {
        doc.text(`${method}: Rs. ${amount.toLocaleString('en-IN')}`, currentX, paymentY + 7);
        currentX += 45;
      }
    });

    const totalY = paymentY + 20;
    doc.setFillColor(0, 112, 187);
    doc.roundedRect(15, totalY, 70, 35, 5, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL REVENUE", 25, totalY + 12);
    doc.setFontSize(24);
    doc.text(`Rs. ${revenueStats.total.toLocaleString('en-IN')}`, 25, totalY + 26);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Itemized Invoice List", 15, totalY + 50);

    const tableData = revenueReportInvoices.map(inv => [
      `${inv.date} ${inv.time}`,
      inv.id,
      inv.name,
      inv.id.startsWith("PH") ? "Pharmacy" : inv.id.startsWith("LB") ? "Lab" : "Consultation",
      `Rs. ${parseFloat((inv.amount || "0").replace(/[^\d.-]/g, "")).toLocaleString('en-IN')}`,
      inv.paymentMethod || "N/A"
    ]);

    autoTable(doc, {
      startY: totalY + 55,
      head: [['DATE/TIME', 'INVOICE ID', 'PATIENT NAME', 'BILL TYPE', 'AMOUNT', 'PAYMENT']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85],
        cellPadding: 4
      },
      columnStyles: {
        4: { fontStyle: 'bold', halign: 'right' },
        0: { halign: 'center' },
        1: { halign: 'center' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 25;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text("Authorized Signature: _______________________", 195, finalY, { align: "right" });
    doc.text("Finance Department — Accendia Health Care PRO", 195, finalY + 8, { align: "right" });
    doc.autoPrint();
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');

  };

  const BED_PRINT_STYLES = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#fff;padding:0}
    .header{display:flex;justify-content:space-between;align-items:flex-start;padding:20px 24px 16px;border-bottom:1px solid #e2e8f0}
    .logo{width:60px;height:60px;object-fit:contain;margin-right:12px}
    .hosp-name{font-size:16px;font-weight:800;color:#0f2c59}
    .hosp-sub{font-size:10px;color:#94a3b8;margin-top:4px;max-width:380px}
    .inv-label{font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em}
    .inv-no{font-size:15px;font-weight:900;color:#1e293b;margin-top:4px}
    .inv-date{font-size:9px;color:#94a3b8;margin-top:2px}
    .pat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:14px 24px;border-bottom:1px solid #e2e8f0}
    .pat-label{font-size:8px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em}
    .pat-value{font-weight:800;color:#1e293b;margin-top:3px;font-size:11px}
    .section-title{font-size:11px;font-weight:700;color:#0f2c59;padding:14px 24px 6px;text-transform:uppercase;letter-spacing:.08em;margin-top:16px}
    .table-wrap{padding:0 24px 0}
    table{width:100%;border-collapse:collapse;font-size:11px}
    thead tr{background:#0f2c59;color:#fff}
    th{padding:8px 14px;font-size:9px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;text-align:left}
    th:last-child,td:last-child{text-align:right}
    th:nth-child(2),td:nth-child(2),th:nth-child(3),td:nth-child(3){text-align:center}
    tbody tr{border-bottom:1px solid #f1f5f9}
    td{padding:10px 14px}
    td:nth-child(2),td:nth-child(3){text-align:center}
    .totals{display:flex;flex-direction:column;align-items:flex-end;padding:14px 24px 0;gap:6px;border-top:1px solid #e2e8f0;margin-top:14px}
    .t-row{display:flex;justify-content:space-between;width:260px;font-size:11px}
    .t-grand{font-size:14px;font-weight:900;color:#0f2c59;border-top:1px solid #e2e8f0;padding-top:8px;margin-top:4px}
    .sig{display:flex;justify-content:flex-end;padding:40px 24px 0}
    .sig-line{border-top:1px solid #94a3b8;width:160px;text-align:center;padding-top:4px;font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;font-weight:700}
    .footer-note{font-size:8px;color:#94a3b8;line-height:1.6;text-align:justify;padding:24px 24px 16px;border-top:1px solid #f1f5f9;margin-top:16px}
    @media print{body{padding:0}}
  `;

  const generateBedChargeReport = () => {
    const isBedInvoice = (inv: any) => {
      const services = (inv.services || "").toString().toLowerCase();
      const id = (inv.id || "").toString().toLowerCase();
      return services.includes("bed") || services.includes("room") || services.includes("accommodation") || id.startsWith("bd-") || services === "bed";
    };

    const bedInvoices = revenueReportInvoices.filter(isBedInvoice);
    const total = bedInvoices.reduce((acc, inv) => acc + parseFloat((inv.amount || '0').replace(/[^\d.-]/g, '')), 0);
    const invNo = `RPT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const issuedAt = new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const periodText = (startDate || endDate)
      ? `${startDate ? new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Beginning'} — ${endDate ? new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Present'}`
      : 'All Dates';

    const parseBedService = (serviceText: string, amt: number) => {
      const regex = /Bed Charge\s*[—-]\s*([^(]+)\s*(?:\((\d+)\s*days?\s*@\s*₹?([\d.]+)\/day\))?/i;
      const match = serviceText.match(regex);
      if (match) {
        const ward = match[1].trim();
        const days = match[2] ? `${match[2]} days` : "1 day";
        const rate = match[3] ? `₹${parseFloat(match[3]).toFixed(2)}` : `₹${amt.toFixed(2)}`;
        return {
          desc: `Bed charge (${ward})`,
          qty: days,
          rate: rate,
          amount: amt
        };
      }
      return {
        desc: serviceText || "Room/Bed charge",
        qty: "1 day",
        rate: `₹${amt.toFixed(2)}`,
        amount: amt
      };
    };

    const rows = bedInvoices.map(inv => {
      const amt = parseFloat((inv.amount || '0').replace(/[^\d.-]/g, ''));
      const parsed = parseBedService(inv.services, amt);
      return `<tr>
        <td><b>${parsed.desc}</b><br/><span style="font-size:9px;color:#64748b">Patient: ${inv.name || '—'} | Ref: ${inv.id || '—'} | Date: ${inv.date || '—'}</span></td>
        <td>${parsed.qty}</td>
        <td>${parsed.rate}</td>
        <td>₹${parsed.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Bed Charge Report</title><style>${BED_PRINT_STYLES}</style></head><body>
      <div class="header">
        <div style="display:flex;align-items:center;gap:14px">
          <img src="${hospitalLogo}" class="logo" alt="logo"/>
          <div>
            <div class="hosp-name">${HOSPITAL_NAME_LINE1}</div>
            <div class="hosp-sub">${HOSPITAL_ADDRESS}</div>
            <div class="hosp-sub">Phone: ${HOSPITAL_PHONE} | Email: ${HOSPITAL_EMAIL}</div>
          </div>
        </div>
        <div style="text-align:right">
          <div class="inv-label">BED CHARGE STATEMENT</div>
          <div class="inv-no">${invNo}</div>
          <div class="inv-date">Issued ${issuedAt}</div>
        </div>
      </div>

      <div class="pat-row">
        <div><div class="pat-label">REPORT NAME</div><div class="pat-value">Room/Bed Charge Audit</div></div>
        <div><div class="pat-label">PERIOD</div><div class="pat-value">${periodText}</div></div>
        <div><div class="pat-label">TOTAL ENTRIES</div><div class="pat-value">${bedInvoices.length}</div></div>
        <div><div class="pat-label">DEPARTMENT</div><div class="pat-value">IPD / Bed Management</div></div>
      </div>

      <div class="section-title">Itemized Bed / Room Charges</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>DESCRIPTION</th><th>QTY</th><th>RATE</th><th>AMOUNT</th></tr></thead>
          <tbody>${rows.length ? rows : '<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:20px">No bed/room charge records found for this period.</td></tr>'}</tbody>
        </table>
      </div>

      <div class="totals">
        <div class="t-row"><span>Subtotal</span><span>₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        <div class="t-row"><span>Tax (exempt — medical services)</span><span>₹0.00</span></div>
        <div class="t-row t-grand"><span>Total payable</span><span>₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
      </div>

      <div class="sig"><div class="sig-line">AUTHORIZED SIGNATORY</div></div>
      <div class="footer-note">This is a system-generated statement issued at the time of audit. It serves as an official record of room/bed charges. For queries, please contact the hospital billing desk quoting the report number above.</div>
    </body></html>`;

    const win = window.open('', '_blank', 'width=950,height=750');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 600);
  };

  const printSingleBedInvoiceHTML = (inv: any) => {
    const patient = patients.find(p => p.id === inv.patientId || p.id.replace('P-', '') === inv.patientId.replace('P-', '') || p.name.toLowerCase() === inv.name.toLowerCase());
    const patientName = inv.name;
    const patientId = patient?.id || inv.patientId || '—';
    const age = patient?.age || '—';
    const mobile = patient?.contact || '—';
    const invNo = inv.id;
    const issuedAt = `${inv.date}, ${inv.time}`;
    const totalAmount = parseFloat((inv.amount || '0').replace(/[^\d.-]/g, '')) || 0;

    const parseBedService = (serviceText: string, amt: number) => {
      const regex = /Bed Charge\s*[—-]\s*([^(]+)\s*(?:\((\d+)\s*days?\s*@\s*₹?([\d.]+)\/day\))?/i;
      const match = serviceText.match(regex);
      if (match) {
        const ward = match[1].trim();
        const days = match[2] ? `${match[2]} days` : "1 day";
        const rate = match[3] ? `₹${parseFloat(match[3]).toFixed(2)}` : `₹${amt.toFixed(2)}`;
        return {
          desc: `Bed charge (${ward})`,
          qty: days,
          rate: rate,
          amount: amt
        };
      }
      return {
        desc: serviceText || "Room/Bed charge",
        qty: "1 day",
        rate: `₹${amt.toFixed(2)}`,
        amount: amt
      };
    };

    const parsed = parseBedService(inv.services, totalAmount);
    const bedRows = `<tr>
      <td><b>${parsed.desc}</b></td>
      <td>${parsed.qty}</td>
      <td>${parsed.rate}</td>
      <td>₹${parsed.amount.toFixed(2)}</td>
    </tr>`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Discharge Invoice</title><style>${BED_PRINT_STYLES}</style></head><body>
      <div class="header">
        <div style="display:flex;align-items:center;gap:14px">
          <img src="${hospitalLogo}" class="logo" alt="logo"/>
          <div>
            <div class="hosp-name">${HOSPITAL_NAME_LINE1}</div>
            <div class="hosp-sub">${HOSPITAL_ADDRESS}</div>
            <div class="hosp-sub">Phone: ${HOSPITAL_PHONE} | Email: ${HOSPITAL_EMAIL}</div>
          </div>
        </div>
        <div style="text-align:right">
          <div class="inv-label">DISCHARGE INVOICE</div>
          <div class="inv-no">${invNo}</div>
          <div class="inv-date">Issued ${issuedAt}</div>
        </div>
      </div>

      <div class="pat-row">
        <div><div class="pat-label">PATIENT NAME</div><div class="pat-value">${patientName}</div></div>
        <div><div class="pat-label">PATIENT ID</div><div class="pat-value">${patientId}</div></div>
        <div><div class="pat-label">AGE</div><div class="pat-value">${age}</div></div>
        <div><div class="pat-label">MOBILE</div><div class="pat-value">${mobile}</div></div>
      </div>

      <div class="table-wrap" style="padding-top:20px">
        <table>
          <thead><tr><th>DESCRIPTION</th><th>QTY</th><th>RATE</th><th>AMOUNT</th></tr></thead>
          <tbody>
            ${bedRows}
            <tr><td><b>Pharmacy charge</b></td><td>—</td><td>—</td><td>₹0.00</td></tr>
            <tr><td><b>Nursing charge</b></td><td>—</td><td>—</td><td>₹0.00</td></tr>
            <tr><td><b>Miscellaneous charge</b></td><td>—</td><td>—</td><td>₹0.00</td></tr>
          </tbody>
        </table>
      </div>

      <div class="totals">
        <div class="t-row"><span>Subtotal</span><span>₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        <div class="t-row"><span>Tax (exempt — medical services)</span><span>₹0.00</span></div>
        <div class="t-row t-grand"><span>Total payable</span><span>₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
      </div>

      <div class="sig"><div class="sig-line">AUTHORIZED SIGNATORY</div></div>
      <div class="footer-note">This is a system-generated invoice issued at the time of patient discharge. It serves as an official record of charges and payment for insurance, reimbursement, or personal records. For billing queries, please contact the hospital billing desk quoting the invoice number above.</div>
    </body></html>`;

    const win = window.open('', '_blank', 'width=950,height=750');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 600);
  };

  if (!userRole) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole!}
        loggedInStaffName={loggedInStaffName}
        onRevenueReport={() => setIsSettlementModalOpen(true)}
      />

      <main className="ml-72 p-10 min-h-screen">
        <header className="flex justify-between items-center mb-10 print:hidden relative">
          <div className="flex-1 flex items-center space-x-4">
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-50 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 tracking-tight leading-none">
                  {loggedInStaffName ? loggedInStaffName : `${userRole} Node`}
                </p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                  {loggedInStaffName ? userRole : "Accendia-DX-4"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-50"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <PageTransition tab={activeTab}>
          <AppRouter
            {...appState}
            onRevenueReport={() => setIsSettlementModalOpen(true)}
          />
        </PageTransition>
      </main>

      <Modal isOpen={isSettlementModalOpen} onClose={() => { setIsSettlementModalOpen(false); setStartDate(""); setEndDate(""); }} title="Revenue Report" size="lg">
        <div className="space-y-8 h-[72vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Clinical Header - Minimalist */}
          <div className="flex flex-col md:flex-row justify-between items-center pb-6 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img id="hospital-logo-img" src={hospitalLogo} alt="Hospital Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">TAGNYA HOSPITAL</h2>
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Financial Audit Statement</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => generateRevenueReportPDF()}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-md"
              >
                <Download className="w-3 h-3" />
                <span>Print Revenue Statement</span>
              </button>
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded flex items-center space-x-2">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-600">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold uppercase">Verified</span>
            </div>
          </div>

          {/* Compact Metric Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Consultation", val: revenueStats.consultation, icon: User },
              { label: "Laboratory", val: revenueStats.lab, icon: FlaskConical },
              { label: "Bed/IPD", val: revenueStats.ipd, icon: Bed },
              { label: "Pharmacy", val: revenueStats.pharmacy, icon: Pill },
            ].filter(stat => userRole === UserRole.ADMIN || stat.val > 0).map((stat, i) => (
              <div key={i} className="p-5 bg-white border border-slate-200 rounded hover:border-slate-400 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded flex items-center justify-center text-slate-600">
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    {stat.label === "Bed/IPD" && (
                      <button
                        onClick={generateBedChargeReport}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded text-[8px] font-bold text-slate-600 uppercase tracking-wider transition-colors"
                      >
                        Report
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-xs font-medium text-slate-400">₹</span>
                  <h4 className="text-lg font-bold text-slate-900">
                    {stat.val.toLocaleString('en-IN')}
                  </h4>
                </div>
              </div>
            ))}
          </div>

          {/* Master Revenue Summary - Clean & Flat */}
          <div className="p-8 bg-slate-900 rounded text-white flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Total Consolidated Revenue</p>
              <div className="flex items-baseline space-x-3">
                <span className="text-2xl font-light text-slate-500">₹</span>
                <h1 className="text-5xl font-bold tracking-tight">
                  {revenueStats.total.toLocaleString('en-IN')}
                </h1>
              </div>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded">
                  <p className="text-[8px] font-bold text-slate-500 uppercase">Estimated Tax</p>
                  <p className="text-sm font-bold">₹ {(revenueStats.total * 0.05).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded">
                  <p className="text-[8px] font-bold text-slate-500 uppercase">Status</p>
                  <p className="text-sm font-bold text-emerald-400">Balanced</p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-64 space-y-3">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-white/10 pb-2">Settlement Mode</p>
              {Object.entries(revenueStats.payments).map(([method, amount]) => amount > 0 && (
                <div key={method} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">{method}</span>
                  <span className="font-bold">₹ {amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Minimalist Ledger */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Transaction Ledger</h3>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest">Audit history for current cycle</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-slate-500">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-2.5 py-1 text-[11px] font-semibold border border-slate-200 rounded focus:outline-none focus:border-slate-400 bg-slate-50 text-slate-700"
                  />
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-slate-500">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-2.5 py-1 text-[11px] font-semibold border border-slate-200 rounded focus:outline-none focus:border-slate-400 bg-slate-50 text-slate-700"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => { setStartDate(""); setEndDate(""); }}
                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded text-[9px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
                <span className="text-[9px] font-bold text-slate-500 ml-1 bg-slate-100 px-2.5 py-1 rounded">
                  {revenueReportInvoices.length} Entries
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Reference</th>
                    <th className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Patient</th>
                    <th className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Dept.</th>
                    <th className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                    <th className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {revenueReportInvoices.slice(0, 50).map((inv, i) => {
                    const isBedInvoice = inv.id.startsWith("BD") || (inv.services || "").toLowerCase().includes("bed") || (inv.services || "").toLowerCase().includes("room");
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-[10px] text-slate-600 font-medium">{inv.date}</td>
                        <td className="px-4 py-3 text-[10px] font-bold text-slate-900">{inv.id}</td>
                        <td className="px-4 py-3 text-[10px] text-slate-600 font-bold">{inv.name}</td>
                        <td className="px-4 py-3 text-[9px] font-bold text-slate-400 uppercase">
                          {isBedInvoice ? "Bed/IPD" : inv.id.startsWith("PH") ? "Pharma" : inv.id.startsWith("LB") ? "Lab" : "OPD"}
                        </td>
                        <td className="px-4 py-3 text-[10px] font-bold text-slate-900">₹ {(parseFloat((inv.amount || "0").replace(/[^\d.-]/g, ""))).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            <span className="text-[9px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded">{inv.paymentMethod || "N/A"}</span>
                            {isBedInvoice && (
                              <button
                                onClick={() => printSingleBedInvoiceHTML(inv)}
                                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[8px] font-bold uppercase tracking-wider transition-all"
                              >
                                Print Bill
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={() => { setIsSettlementModalOpen(false); setStartDate(""); setEndDate(""); }}
              className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Exit Audit
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default App;
