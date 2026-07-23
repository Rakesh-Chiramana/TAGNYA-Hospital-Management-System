import React, { useRef, useState, useEffect } from "react";
import Modal from "../../../shared/components/Modal";
import { MasterBill } from "../hooks/useBillingManagement";
import hospitalLogo from "../../../assets/sarada_logo.png";
import {
  HOSPITAL_NAME_LINE1,
  HOSPITAL_ADDRESS,
  HOSPITAL_PHONE,
  HOSPITAL_EMAIL,
} from "../../../shared/constants/hospitalBranding";

interface Props {
  selectedPatientBill: MasterBill | null;
  setSelectedPatientBill: (v: MasterBill | null) => void;
  totalSum?: number;
}

const PRINT_STYLES = `
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
  .sig{display:flex;justify-content:flex-end;padding:40px 24px 0}
  .sig-line{border-top:1px solid #94a3b8;width:160px;text-align:center;padding-top:4px;font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.06em;font-weight:700}
  .footer-note{font-size:8px;color:#94a3b8;line-height:1.6;text-align:justify;padding:24px 24px 16px;border-top:1px solid #f1f5f9;margin-top:16px}
  @media print{body{padding:0}}
`;



const MasterBillOverlay: React.FC<Props> = ({
  selectedPatientBill,
  setSelectedPatientBill,
  totalSum = 0,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [dbPharmacyItems, setDbPharmacyItems] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedPatientBill) {
      setDbPharmacyItems([]);
      return;
    }

    const patientId = selectedPatientBill.patient?.id || "";
    const patientName = selectedPatientBill.patient?.name || "";
    let ipNo = "";

    if (selectedPatientBill.reportType !== "bed" && selectedPatientBill.reportType !== "pharmacy") {
      setDbPharmacyItems([]);
      return;
    }

    // Resolve ipNo from backend (DB) instead of scanning client localStorage
    const resolveIpNo = async () => {
      if (!patientId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/admissions/ipByUhid?uhid=${encodeURIComponent(patientId)}`);
        if (res.ok) {
          const data = await res.json();
          // expected response: { success: true, ipNo: 'IP1234' }
          if (data && data.ipNo) {
            ipNo = String(data.ipNo);
          }
        }
      } catch (err) {
        // fallback: leave ipNo empty
        console.error('Failed to resolve ipNo from server:', err);
      }
    };

    const fetchPharmacyItems = async () => {
      try {
        const url = `http://localhost:5000/api/sales/items?patientId=${encodeURIComponent(patientId)}&ipNo=${encodeURIComponent(ipNo)}&patientName=${encodeURIComponent(patientName)}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.items)) {
            setDbPharmacyItems(data.items);
          }
        }
      } catch (err) {
        console.error("Error fetching pharmacy items in MasterBillOverlay:", err);
      }
    };

    (async () => {
      await resolveIpNo();
      await fetchPharmacyItems();
    })();
  }, [selectedPatientBill]);

  if (!selectedPatientBill) return null;

  const { patient, bed, days, bedCharge, items, chargesBreakdown, reportType, paymentMethod } = selectedPatientBill;

  const useBreakdown = !reportType && !!chargesBreakdown;
  const showBed = !reportType || reportType === "bed";
  const showPharmacy = !reportType || reportType === "bed" || reportType === "pharmacy";
  const showAdditionalCharges = !reportType || reportType === "bed";

const breakdownBedRows = useBreakdown
  ? chargesBreakdown!.bedCharges.map(bc => ({
      wardType: bc.type,
      days: bc.days,
      rate: bc.rate,
      amount: bc.amount,
    }))
  : [];

const breakdownPharmacyItems = useBreakdown
  ? chargesBreakdown!.pharmacyCharges.map(p => ({
      medicine_name: p.medicine,
      qty: p.quantity,
      mrp: p.rate,
      total: p.amount,
    }))
  : [];

const breakdownPharmacyTotal = useBreakdown
  ? chargesBreakdown!.pharmacyCharges.reduce((s, p) => s + p.amount, 0)
  : 0;

const breakdownNursing = useBreakdown ? chargesBreakdown!.nursingCharge : 0;
const breakdownMisc = useBreakdown ? chargesBreakdown!.miscCharge : 0;
const breakdownDiscount = useBreakdown ? chargesBreakdown!.discount : 0;
const breakdownSubtotal = useBreakdown ? chargesBreakdown!.subtotal : 0;
const breakdownTotal = useBreakdown ? chargesBreakdown!.total : 0;
const reportNursing = reportType === "bed" ? chargesBreakdown?.nursingCharge || 0 : breakdownNursing;
const reportMisc = reportType === "bed" ? chargesBreakdown?.miscCharge || 0 : breakdownMisc;
const reportDiscount = reportType === "bed" ? chargesBreakdown?.discount || 0 : breakdownDiscount;

  const invoiceNo = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const issuedDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const issuedTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Separate bed charges and other items
  const bedItems = items.filter(item => {
    const desc = (item.description || "").toLowerCase();
    return reportType === "bed" || (!reportType && (desc.includes("bed") || desc.includes("room") || desc.includes("ward")));
  });

  const otherItems = items.filter(item => {
    const desc = (item.description || "").toLowerCase();
    return reportType === "consultation" || (!reportType && !desc.includes("bed") && !desc.includes("room") && !desc.includes("ward") &&
      !desc.includes("pharma") && !desc.includes("medicine") && !desc.includes("drug"));
  });

  // Calculate Pharmacy total: preference to database actual pharmacy items if loaded, else fallback to ledger items
  const ledgerPharmacyItems = items.filter(item => {
    const desc = (item.description || "").toLowerCase();
    return reportType === "pharmacy" || (!reportType && desc.includes("pharma") && !desc.includes("bed") && !desc.includes("room"));
  });

  const pharmacyTotal = dbPharmacyItems.length > 0
    ? dbPharmacyItems.reduce((sum, item) => sum + Number(item.total || 0), 0)
    : ledgerPharmacyItems.reduce((sum, item) => sum + item.amount, 0);

  // Recalculate Subtotal based on bed charge + pharmacy total + other items
  const rawBedCharge = reportType === "consultation" || reportType === "pharmacy"
    ? 0
    : bedItems.length > 0
      ? bedItems.reduce((sum, item) => sum + item.amount, 0)
      : (bed ? (days || 1) * (bedCharge || bed.chargePerDay || 0) : 0);

  const calculatedBedCharge = bedItems.length > 0
    ? Math.max(0, rawBedCharge - pharmacyTotal)
    : rawBedCharge;

  const otherTotal = otherItems.reduce((sum, item) => sum + item.amount, 0);
  const subtotal =
  calculatedBedCharge +
  pharmacyTotal +
  otherTotal +
  reportNursing +
  reportMisc;

  const finalTotal =
  subtotal - reportDiscount;

  const handlePrint = () => {
  // Build bed charge rows
  let bedRows = '';
  if (useBreakdown) {
    breakdownBedRows.forEach(row => {
      bedRows += `<tr><td>Bed charge (${row.wardType})</td><td>${row.days} ${row.days === 1 ? 'day' : 'days'}</td><td>₹${Number(row.rate).toFixed(2)}</td><td>₹${Number(row.amount).toFixed(2)}</td></tr>`;
    });
  } else if (bedItems.length > 0) {
    bedItems.forEach(item => {
      const wardType = bed?.wardType || 'General';
      const daysVal = days || 1;
      const itemAmount = Math.max(0, item.amount - pharmacyTotal);
      const chargePerDay = itemAmount / daysVal;
      bedRows += `<tr><td>Bed charge (${wardType})</td><td>${daysVal} ${daysVal === 1 ? 'day' : 'days'}</td><td>₹${Number(chargePerDay).toFixed(2)}</td><td>₹${Number(itemAmount).toFixed(2)}</td></tr>`;
    });
  } else if (bed) {
    const daysVal = days || 1;
    const chargePerDay = bedCharge || bed.chargePerDay || 0;
    const total = daysVal * chargePerDay;
    bedRows = `<tr><td>Bed charge (${bed.wardType})</td><td>${daysVal} ${daysVal === 1 ? 'day' : 'days'}</td><td>₹${Number(chargePerDay).toFixed(2)}</td><td>₹${Number(total).toFixed(2)}</td></tr>`;
  }

  // Pharmacy sub-rows
  let pharmaSubRows = '';
  if (useBreakdown && breakdownPharmacyItems.length > 0) {
    breakdownPharmacyItems.forEach(item => {
      pharmaSubRows += `<tr class="sub-row"><td>${item.medicine_name}</td><td>${item.qty} × ₹${Number(item.mrp || 0).toFixed(2)} = ₹${Number(item.total || 0).toFixed(2)}</td><td></td><td></td></tr>`;
    });
  } else if (dbPharmacyItems.length > 0) {
    dbPharmacyItems.forEach(item => {
      pharmaSubRows += `<tr class="sub-row"><td>${item.medicine_name || item.name}</td><td>${item.qty} × ₹${Number(item.mrp || 0).toFixed(2)} = ₹${Number(item.total || 0).toFixed(2)}</td><td></td><td></td></tr>`;
    });
  } else if (ledgerPharmacyItems.length > 0) {
    ledgerPharmacyItems.forEach(item => {
      pharmaSubRows += `<tr class="sub-row"><td>&nbsp;&nbsp;${item.description}</td><td colspan="2">${item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td><td>₹${Number(item.amount).toFixed(2)}</td></tr>`;
    });
  }

  // Discount row (only if breakdown present and discount > 0)
  const discountRow = (showAdditionalCharges && reportDiscount > 0)
    ? `<tr><td><b>Discount</b></td><td>—</td><td>—</td><td>-₹${Number(reportDiscount).toFixed(2)}</td></tr>`
    : '';

  // Other items as misc
  let otherRows = '';
  otherItems.forEach(item => {
    otherRows += `<tr><td><b>${item.description}</b></td><td>—</td><td>—</td><td>₹${Number(item.amount).toFixed(2)}</td></tr>`;
  });

  const finalSubtotal = useBreakdown ? breakdownSubtotal : subtotal;
  const finalGrandTotal = useBreakdown ? breakdownTotal : finalTotal;
  const finalPharmacyTotal = useBreakdown ? breakdownPharmacyTotal : pharmacyTotal;
  const finalNursing = useBreakdown ? breakdownNursing : reportNursing;
  const finalMisc = useBreakdown ? breakdownMisc : reportMisc;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Discharge Invoice</title><style>${PRINT_STYLES}</style></head><body>
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
        <div class="inv-no">${invoiceNo}</div>
        <div class="inv-date">Issued ${issuedDate}, ${issuedTime}</div>
      </div>
    </div>

    <div class="pat-row">
      <div><div class="pat-label">PATIENT NAME</div><div class="pat-value">${patient?.name || '—'}</div></div>
      <div><div class="pat-label">PATIENT ID</div><div class="pat-value">${patient?.id || '—'}</div></div>
      <div><div class="pat-label">AGE</div><div class="pat-value">${patient?.age || '—'}</div></div>
      <div><div class="pat-label">MOBILE</div><div class="pat-value">${patient?.contact || '—'}</div></div>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr><th>DESCRIPTION</th><th>QTY</th><th>RATE</th><th>AMOUNT</th></tr></thead>
        <tbody>
          ${showBed ? bedRows : ''}
          ${showPharmacy ? `<tr><td><b>Pharmacy charge</b></td><td>—</td><td>—</td><td>₹${Number(finalPharmacyTotal).toFixed(2)}</td></tr>${pharmaSubRows}` : ''}
          ${showAdditionalCharges ? `<tr><td><b>Nursing charge</b></td><td>—</td><td>—</td><td>₹${Number(finalNursing).toFixed(2)}</td></tr><tr><td><b>Miscellaneous charge</b></td><td>—</td><td>—</td><td>₹${Number(finalMisc).toFixed(2)}</td></tr>${discountRow}` : ''}
          ${showAdditionalCharges ? `<tr><td><b>Payment mode</b></td><td>—</td><td>—</td><td>${paymentMethod || 'N/A'}</td></tr>` : ''}
          ${otherRows}
        </tbody>
      </table>
    </div>

    <div class="totals">
      <div class="t-row"><span>Subtotal</span><span>₹${finalSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
      <div class="t-row"><span>Tax (exempt — medical services)</span><span>₹0.00</span></div>
      <div class="t-row t-grand"><span>Total payable</span><span>₹${finalGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
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

  return (
    <Modal
      isOpen={!!selectedPatientBill}
      onClose={() => setSelectedPatientBill(null)}
      title=""
      hideHeader={true}
      size="lg"
    >
      {/* Printable Invoice Area */}
      <div
        ref={printRef}
        className="bg-white text-slate-800 p-8 border border-slate-200 shadow-xl max-h-[80vh] overflow-y-auto select-text font-sans"
      >
        {/* Hospital Brand + Invoice Number */}
        <div className="flex justify-between items-start border-b pb-6 border-slate-200">
          <div className="flex items-center gap-4">
            <img
              src={hospitalLogo}
              alt="Hospital Logo"
              className="w-[70px] h-[70px] object-contain shrink-0"
            />
            <div>
              <h2 className="text-lg font-bold text-[#0f2c59] tracking-tight leading-tight">
                {HOSPITAL_NAME_LINE1}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-[400px]">
                {HOSPITAL_ADDRESS}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Phone: {HOSPITAL_PHONE} | Email: {HOSPITAL_EMAIL}
              </p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              DISCHARGE INVOICE
            </h3>
            <p className="text-base font-extrabold text-slate-900 mt-1">
              {invoiceNo}
            </p>
            <p className="text-[9px] text-slate-400 mt-1">
              Issued {issuedDate}, {issuedTime}
            </p>
          </div>
        </div>

        {/* Patient Details Row */}
        <div className="grid grid-cols-4 border-b border-slate-200 py-4 text-xs gap-4">
          <div>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">
              PATIENT NAME
            </p>
            <p className="font-extrabold text-slate-800 mt-1">
              {patient?.name || "—"}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">
              PATIENT ID
            </p>
            <p className="font-extrabold text-slate-800 mt-1">
              {patient?.id || "—"}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">
              AGE
            </p>
            <p className="font-extrabold text-slate-800 mt-1">
              {patient?.age || "—"}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">
              MOBILE
            </p>
            <p className="font-extrabold text-slate-800 mt-1">
              {patient?.contact || "—"}
            </p>
          </div>
        </div>

        {/* Invoice Table — Discharge Invoice format */}
        <table className="w-full mt-6 text-xs text-left border-collapse">
          <thead>
            <tr className="bg-[#0f2c59] text-white uppercase text-[9px] tracking-wider">
              <th className="px-4 py-2.5">DESCRIPTION</th>
              <th className="px-4 py-2.5 text-center">QTY</th>
              <th className="px-4 py-2.5 text-center">RATE</th>
              <th className="px-4 py-2.5 text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
  {/* Bed charge rows */}
  {showBed && (useBreakdown ? (
    breakdownBedRows.map((row, idx) => (
      <tr key={`bd-${idx}`}>
        <td className="px-4 py-3 font-bold text-slate-800">Bed charge ({row.wardType})</td>
        <td className="px-4 py-3 text-center text-slate-600">{row.days} {row.days === 1 ? 'day' : 'days'}</td>
        <td className="px-4 py-3 text-center text-slate-600">₹{Number(row.rate).toFixed(2)}</td>
        <td className="px-4 py-3 text-right font-bold text-slate-800">₹{Number(row.amount).toFixed(2)}</td>
      </tr>
    ))
  ) : bedItems.length > 0 ? bedItems.map((item, idx) => {
    const itemAmount = Math.max(0, item.amount - pharmacyTotal);
    const chargePerDay = itemAmount / (days || 1);
    return (
      <tr key={`bed-${idx}`}>
        <td className="px-4 py-3 font-bold text-slate-800">Bed charge ({bed?.wardType || 'General'})</td>
        <td className="px-4 py-3 text-center text-slate-600">{days || 1} {(days || 1) === 1 ? 'day' : 'days'}</td>
        <td className="px-4 py-3 text-center text-slate-600">₹{Number(chargePerDay).toFixed(2)}</td>
        <td className="px-4 py-3 text-right font-bold text-slate-800">₹{Number(itemAmount).toFixed(2)}</td>
      </tr>
    );
  }) : bed ? (
    <tr>
      <td className="px-4 py-3 font-bold text-slate-800">Bed charge ({bed.wardType})</td>
      <td className="px-4 py-3 text-center text-slate-600">{days || 1} {(days || 1) === 1 ? 'day' : 'days'}</td>
      <td className="px-4 py-3 text-center text-slate-600">₹{Number(bedCharge || bed.chargePerDay || 0).toFixed(2)}</td>
      <td className="px-4 py-3 text-right font-bold text-slate-800">₹{Number((days || 1) * (bedCharge || bed.chargePerDay || 0)).toFixed(2)}</td>
    </tr>
  ) : null)}

            {/* Pharmacy charge */}
            {showPharmacy && <tr>
              <td className="px-4 py-3 font-bold text-slate-800">Pharmacy charge</td>
              <td className="px-4 py-3 text-center text-slate-500">—</td>
              <td className="px-4 py-3 text-center text-slate-500">—</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-800">₹{Number(useBreakdown ? breakdownPharmacyTotal : pharmacyTotal).toFixed(2)}</td>

            </tr>}
            {/* Pharmacy sub-items */}
            {showPharmacy && (dbPharmacyItems.length > 0 ? dbPharmacyItems.map((item, idx) => (
              <tr key={`pharma-${idx}`}>
                <td className="px-4 py-2 text-slate-500 text-[10px] pl-7">{item.medicine_name || item.name}</td>
                <td className="px-4 py-2 text-center text-slate-500 text-[10px]">
                  {item.qty} × ₹{Number(item.mrp || 0).toFixed(2)} = ₹{Number(item.total || 0).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-center text-slate-400 text-[10px]"></td>
                <td className="px-4 py-2 text-right text-slate-400 text-[10px]"></td>
              </tr>
            )) : ledgerPharmacyItems.map((item, idx) => (
              <tr key={`pharma-ledger-${idx}`}>
                <td className="px-4 py-2 text-slate-500 text-[10px] pl-7">{item.description}</td>
                <td className="px-4 py-2 text-center text-slate-400 text-[10px]">
                  {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td className="px-4 py-2 text-center text-slate-400 text-[10px]"></td>
                <td className="px-4 py-2 text-right text-slate-400 text-[10px]"></td>
              </tr>
            )))}

           {showAdditionalCharges && <>
           {/* Nursing charge */}
            <tr>
              <td className="px-4 py-3 font-bold text-slate-800">Nursing charge</td>
              <td className="px-4 py-3 text-center text-slate-500">—</td>
              <td className="px-4 py-3 text-center text-slate-500">—</td>
              <td className="px-4 py-3 text-right font-bold text-slate-800">₹{Number(reportNursing).toFixed(2)}</td>
            </tr>

            {/* Miscellaneous charge */}
            <tr>
              <td className="px-4 py-3 font-bold text-slate-800">Miscellaneous charge</td>
              <td className="px-4 py-3 text-center text-slate-500">—</td>
              <td className="px-4 py-3 text-center text-slate-500">—</td>
              <td className="px-4 py-3 text-right font-bold text-slate-800">₹{Number(reportMisc).toFixed(2)}</td>
            </tr>
            </>}

            {/* Discount */}
            {showAdditionalCharges && reportDiscount > 0 && (
              <tr>
                <td className="px-4 py-3 font-bold text-slate-800">Discount</td>
                <td className="px-4 py-3 text-center text-slate-500">—</td>
                <td className="px-4 py-3 text-center text-slate-500">—</td>
                <td className="px-4 py-3 text-right font-bold text-red-600">-₹{Number(reportDiscount).toFixed(2)}</td>
              </tr>
            )}

            {showAdditionalCharges && (
              <tr>
                <td className="px-4 py-3 font-bold text-slate-800">Payment mode</td>
                <td className="px-4 py-3 text-center text-slate-500">—</td>
                <td className="px-4 py-3 text-center text-slate-500">—</td>
                <td className="px-4 py-3 text-right font-bold text-slate-800">{paymentMethod || "N/A"}</td>
              </tr>
            )}

            {/* Other items */}

            {/* Other items */}
            {otherItems.map((item, idx) => (
              <tr key={`other-${idx}`}>
                <td className="px-4 py-3 font-bold text-slate-800">{item.description}</td>
                <td className="px-4 py-3 text-center text-slate-500">—</td>
                <td className="px-4 py-3 text-center text-slate-500">—</td>
                <td className="px-4 py-3 text-right font-bold text-slate-800">₹{Number(item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

       {/* Subtotals & Total */}
        <div className="flex flex-col items-end mt-4 pr-4 text-xs space-y-1.5 border-t border-slate-100 pt-4">
          <div className="flex justify-between w-64">
            <span className="text-slate-500 font-medium">Subtotal</span>
            <span className="font-bold text-slate-800">
              ₹{Number(useBreakdown ? breakdownSubtotal : subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between w-64">
            <span className="text-slate-500 font-medium">
              Tax (exempt — medical services)
            </span>
            <span className="font-bold text-slate-800">₹0.00</span>
          </div>
          <div className="flex justify-between w-64 border-t border-slate-200 pt-2 text-sm">
            <span className="font-extrabold text-slate-800">Total payable</span>
            <span className="font-black text-[#0f2c59] text-base">
              ₹{Number(finalTotal).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Signature */}
        <div className="flex justify-end mt-10 pr-4">
          <div>
            <div className="border-t border-slate-300 w-48 mt-12"></div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1 text-center">
              AUTHORIZED SIGNATORY
            </p>
          </div>
        </div>

        {/* Bottom Note */}
        <p className="text-[9px] text-slate-400 leading-relaxed text-justify mt-8 border-t pt-4 border-slate-100">
          This is a system-generated invoice issued at the time of patient discharge. It serves as an official record of charges and payment for insurance, reimbursement, or personal records. For billing queries, please contact the hospital billing desk quoting the invoice number above.
        </p>
      </div>

      {/* Action Buttons (outside printable area) */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setSelectedPatientBill(null)}
          className="flex-1 px-6 py-4 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
        >
          Close
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 px-6 py-4 bg-[#0f2c59] text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-900 transition-all shadow-lg flex items-center justify-center space-x-2"
        >
          <span>Print Bill</span>
        </button>
      </div>
    </Modal>
  );
};

export default MasterBillOverlay;
