import { Bed as BedInterface, WardType } from "../../../shared/types";
import hospitalLogo from "../../../assets/sarada_logo.png";
import { jsPDF } from "jspdf";
import { addProfessionalHeader, addProfessionalFooter } from "../../../shared/utils/pdfHelper";
import {
  HOSPITAL_NAME_LINE1,
  HOSPITAL_ADDRESS,
  HOSPITAL_PHONE,
  HOSPITAL_EMAIL,
} from "../../../shared/constants/hospitalBranding";

const PRINT_STYLES = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:#fff;padding:0}
  .top-bar{background:#0f2c59;color:#fff;padding:6px 16px;display:flex;justify-content:space-between;font-size:9px;text-transform:uppercase;letter-spacing:.08em;font-weight:600}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding:20px 24px 16px;border-bottom:1px solid #e2e8f0}
  .logo{width:60px;height:60px;object-fit:contain;margin-right:12px}
  .hosp-name{font-size:16px;font-weight:800;color:#0f2c59}
  .hosp-sub{font-size:10px;color:#94a3b8;margin-top:4px;max-width:380px}
  .inv-label{font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em}
  .inv-no{font-size:15px;font-weight:900;color:#1e293b;margin-top:4px}
  .inv-date{font-size:9px;color:#94a3b8;margin-top:2px}
  .pat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:14px 24px;border-bottom:1px solid #e2e8f0}
  .pat-label{font-size:8px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em}
  .pat-value{font-weight:800;color:#1e293b;margin-top:3px;font-size:12px}
  .table-wrap{padding:20px 24px 0}
  table{width:100%;border-collapse:collapse;font-size:11px}
  thead tr{background:#0f2c59;color:#fff}
  th{padding:8px 14px;font-size:9px;text-transform:uppercase;letter-spacing:.08em;font-weight:700;text-align:left}
  th:last-child,td:last-child{text-align:right}
  th:nth-child(2),td:nth-child(2),th:nth-child(3),td:nth-child(3){text-align:center}
  tbody tr{border-bottom:1px solid #f1f5f9}
  td{padding:10px 14px}
  td:nth-child(2),td:nth-child(3){text-align:center}
  .sub-row td{color:#64748b;font-size:10px;padding:4px 14px 6px 28px;text-align:left}
  .totals{display:flex;flex-direction:column;align-items:flex-end;padding:14px 24px 0;gap:6px;border-top:1px solid #e2e8f0;margin-top:14px}
  .t-row{display:flex;justify-content:space-between;width:240px;font-size:11px}
  .t-grand{font-size:14px;font-weight:900;color:#0f2c59;border-top:1px solid #e2e8f0;padding-top:8px;margin-top:4px}
  .med-title{font-size:12px;font-weight:700;padding:20px 24px 8px}
  .sig{display:flex;justify-content:flex-end;padding:40px 24px 0}
  .sig-line{border-top:1px solid #94a3b8;width:160px;text-align:center;padding-top:4px;font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.06em;font-weight:700}
  .footer-note{font-size:8px;color:#94a3b8;line-height:1.6;text-align:justify;padding:24px 24px 16px;border-top:1px solid #f1f5f9;margin-top:16px}
  @media print{body{padding:0}}
`;

export const generateAdmissionPDF = (bed: BedInterface, data: any) => {
  const doc = new jsPDF();

  let y = addProfessionalHeader(doc, "HOSPITAL ADMISSION SLIP", hospitalLogo);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);

  y += 5;
  const addRow = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), 80, y);
    y += 12;
  };

  addRow("Patient Name", data.patientName);
  if (data.age) addRow("Age", data.age);
  if (data.gender) addRow("Gender", data.gender);
  addRow("Emergency Contact", data.emergencyContact);
  addRow("Assigned Doctor", data.doctor);
  addRow("Admission Date", new Date().toLocaleString());
  addRow("Ward Type", bed.wardType);
  addRow("Bed ID", bed.id);
  addRow("Ward No", bed.wardNo);
  addRow("Charge Per Day", `INR ${data.chargePerDay}`);
  addRow("Discharge Forecast", data.discharge);

  // Footer
  addProfessionalFooter(doc, 220);

  doc.save(`Admission_${data.patientName}_${bed.id}.pdf`);
};

export const generateReleaseBillPDF = (bed: BedInterface, patient: any, formData?: any, pharmacyItems?: any[]) => {

  const daysStayed = formData?.daysStayed ?? 1;
  const chargePerDay = formData?.chargePerDay ?? (bed.chargePerDay || 500);
  const totalBedCharge = formData?.totalBedCharge ?? (daysStayed * chargePerDay);
  const pharmacyCharge = formData?.pharmacyCharge ?? 0;
  const nursingCharge = formData?.nursingCharge ?? 0;
  const miscCharge = formData?.miscCharge ?? 0;
  const discountAmount = formData?.discountAmount ?? 0;
  const subtotal = totalBedCharge + pharmacyCharge + nursingCharge + miscCharge;
  const finalTotal = subtotal - discountAmount;
  const invNo = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const issuedAt = new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const patientName = formData?.patientName || bed.patientName || 'Unknown';
  const patientId = formData?.patientId || patient?.id || '—';
  const age = formData?.age || patient?.age || '—';
  const mobile = formData?.mobileNo || patient?.contact || '—';

  // Build bed charge rows
  let bedRows = '';
  if (formData?.segments && formData.segments.length > 0) {
    formData.segments.forEach((seg: any) => {
      bedRows += `<tr><td>Bed charge (${seg.wardType})</td><td>${seg.days} ${seg.days === 1 ? 'day' : 'days'}</td><td>₹${Number(seg.chargePerDay).toFixed(2)}</td><td>₹${Number(seg.amount).toFixed(2)}</td></tr>`;
    });
  } else {
    bedRows = `<tr><td>Bed charge (${bed.wardType})</td><td>${daysStayed} ${daysStayed === 1 ? 'day' : 'days'}</td><td>₹${Number(chargePerDay).toFixed(2)}</td><td>₹${Number(totalBedCharge).toFixed(2)}</td></tr>`;
  }

  // Pharmacy sub-items
  let pharmaSubRows = '';
  if (pharmacyItems && pharmacyItems.length > 0) {
    pharmacyItems.forEach((item: any) => {
      pharmaSubRows += `<tr class="sub-row"><td>${item.medicine_name || item.name}</td><td>${item.qty} × ₹${Number(item.mrp).toFixed(2)} = ₹${Number(item.total).toFixed(2)}</td><td></td><td></td></tr>`;
    });
  }

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Discharge Invoice</title><style>${PRINT_STYLES}</style></head><body>
    <div class="header">
      <div style="display:flex;align-items:center;gap:14px">
        <img src="${hospitalLogo}" class="logo" alt="logo"/>
        <div><div class="hosp-name">${HOSPITAL_NAME_LINE1}</div><div class="hosp-sub">${HOSPITAL_ADDRESS}</div><div class="hosp-sub">Phone: ${HOSPITAL_PHONE} | Email: ${HOSPITAL_EMAIL}</div></div>
      </div>
      <div style="text-align:right"><div class="inv-label">Discharge Invoice</div><div class="inv-no">${invNo}</div><div class="inv-date">Issued ${issuedAt}</div></div>
    </div>
    <div class="pat-row">
      <div><div class="pat-label">Patient Name</div><div class="pat-value">${patientName}</div></div>
      <div><div class="pat-label">Patient ID</div><div class="pat-value">${patientId}</div></div>
      <div><div class="pat-label">Age</div><div class="pat-value">${age}</div></div>
      <div><div class="pat-label">Mobile</div><div class="pat-value">${mobile}</div></div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>DESCRIPTION</th><th>QTY</th><th>RATE</th><th>AMOUNT</th></tr></thead>
        <tbody>
          ${bedRows}
          <tr><td><b>Pharmacy charge</b></td><td>—</td><td>—</td><td>₹${Number(pharmacyCharge).toFixed(2)}</td></tr>
          ${pharmaSubRows}
          <tr><td><b>Nursing charge</b></td><td>—</td><td>—</td><td>₹${Number(nursingCharge).toFixed(2)}</td></tr>
          <tr><td><b>Miscellaneous charge</b></td><td>—</td><td>—</td><td>₹${Number(miscCharge).toFixed(2)}</td></tr>
          ${discountAmount > 0 ? `<tr><td><b>Discount</b></td><td>—</td><td>—</td><td>-₹${Number(discountAmount).toFixed(2)}</td></tr>` : ''}
        </tbody>
      </table>
    </div>
    <div class="totals">
      <div class="t-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
      <div class="t-row"><span>Tax (exempt — medical services)</span><span>₹0.00</span></div>
      <div class="t-row t-grand"><span>Total payable</span><span>₹${finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
    </div>
    <div class="sig"><div class="sig-line">AUTHORIZED SIGNATORY</div></div>
    <div class="footer-note">This is a system-generated invoice issued at the time of patient discharge. It serves as an official record of charges and payment for insurance, reimbursement, or personal records. For billing queries, please contact the hospital billing desk quoting the invoice number above.</div>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=750');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 600);
};

export const generateInvoicePDF = (bed: BedInterface, data: any) => {
  const chargePerDay = Number(data.chargePerDay || bed.chargePerDay || 500);
  const daysStayed = Number(data.daysStayed || 1);
  const totalAmount = daysStayed * chargePerDay;
  const invNo = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const issuedAt = new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const patientName = data.patientName || bed.patientName || 'Unknown';
  const patientId = data.patientId || bed.patientId || '—';
  const age = data.age || '—';
  const mobile = data.mobileNo || '—';

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice</title><style>${PRINT_STYLES}</style></head><body>
    <div class="header">
      <div style="display:flex;align-items:center;gap:14px">
        <img src="${hospitalLogo}" class="logo" alt="logo"/>
        <div><div class="hosp-name">${HOSPITAL_NAME_LINE1}</div><div class="hosp-sub">${HOSPITAL_ADDRESS}</div><div class="hosp-sub">Phone: ${HOSPITAL_PHONE} | Email: ${HOSPITAL_EMAIL}</div></div>
      </div>
      <div style="text-align:right"><div class="inv-label">Pro-Forma Invoice</div><div class="inv-no">${invNo}</div><div class="inv-date">Issued ${issuedAt}</div></div>
    </div>
    <div class="pat-row">
      <div><div class="pat-label">Patient Name</div><div class="pat-value">${patientName}</div></div>
      <div><div class="pat-label">Patient ID</div><div class="pat-value">${patientId}</div></div>
      <div><div class="pat-label">Age</div><div class="pat-value">${age}</div></div>
      <div><div class="pat-label">Mobile</div><div class="pat-value">${mobile}</div></div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>DESCRIPTION</th><th>QTY</th><th>RATE</th><th>AMOUNT</th></tr></thead>
        <tbody>
          <tr><td><b>Bed charge (${bed.wardType})</b></td><td>${daysStayed} ${daysStayed === 1 ? 'day' : 'days'}</td><td>₹${chargePerDay.toFixed(2)}</td><td>₹${totalAmount.toFixed(2)}</td></tr>
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
    <div class="footer-note">This is a system-generated invoice. For billing queries, please contact the hospital billing desk quoting the invoice number above.</div>
  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=750');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 600);
};

export const getStatusColor = (bed: BedInterface) => {
  if (bed.isReserved) return "bg-indigo-500";
  if (!bed.isOccupied)
    return "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]";
  switch (bed.estimatedDischarge) {
    case "Today":
      return "bg-amber-500";
    case "Tomorrow":
      return "bg-blue-500";
    default:
      return "bg-cyan-500";
  }
};

export const filterBeds = (
  beds: BedInterface[],
  activeWard: WardType | "All",
  searchTerm: string,
  showOnlyAvailable: boolean
) => {
  return beds.filter((bed: BedInterface) => {
    if (activeWard !== "All" && bed.wardType !== activeWard) return false;

    const search = searchTerm.toLowerCase();
    if (
      search &&
      !(bed.id?.toLowerCase() || "").includes(search) &&
      !(bed.patientName?.toLowerCase() || "").includes(search) &&
      !(bed.patientId?.toLowerCase() || "").includes(search)
    )
      return false;

    if (showOnlyAvailable && (bed.isOccupied || bed.isReserved)) return false;

    return true;
  });
};

export const calculateStats = (beds: BedInterface[]) => {
  const counts = {
    total: beds.length,
    vacant: 0,
    reserved: 0,
    occupied: 0,
    icuAvailable: 0,
  };
  beds.forEach((b: BedInterface) => {
    if (b.isReserved) counts.reserved++;
    else if (b.isOccupied) counts.occupied++;
    else counts.vacant++;

    if (b.wardType === WardType.ICU && !b.isOccupied) {
      counts.icuAvailable++;
    }
  });
  return counts;
};
