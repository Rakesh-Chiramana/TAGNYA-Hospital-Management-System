import { PharmacyBill } from "../services/pharmacyService";
import { getReportHeaderHtml, getReportHeaderStyles } from "../../../shared/utils/reportHeaderHtml";

export const printSalesReceipt = (bill: PharmacyBill | null, logoSrc: string) => {
  if (!bill) return;

  const itemRows = bill.items.map((item, i) => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:6px 8px;">${i + 1}</td>
      <td style="padding:6px 8px;font-weight:700;">${item.name}</td>
      <td style="padding:6px 8px;">${item.hsnCode || '-'}</td>
      <td style="padding:6px 8px;">${item.batchNo || '-'}</td>
      <td style="padding:6px 8px;">${item.qty}</td>
      <td style="padding:6px 8px;">&#8377;${Number(item.mrp || 0).toFixed(2)}</td>
      <td style="padding:6px 8px;">${item.discount || 0}%</td>
      <td style="padding:6px 8px;">${item.tax || 0}%</td>
      <td style="padding:6px 8px;font-weight:700;color:#059669;">&#8377;${Number(item.totalAmount || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const popup = window.open('', '_blank', 'width=950,height=1200,scrollbars=yes');
  if (!popup) {
    window.alert('Please allow popups for this site to print the receipt.');
    return;
  }

  popup.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Pharmacy Sales Receipt - ${bill.id}</title>
  <style>
    @page { margin: 10mm 12mm; size: A4; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: white; color: #1e293b; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 11px; }
    ${getReportHeaderStyles()}
    .receipt-title { text-align: center; font-size: 13px; font-weight: 900; color: #005c97; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; border-bottom: 1px dashed #94a3b8; padding-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; margin-bottom: 12px; padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
    .info-row { display: flex; gap: 6px; }
    .info-label { font-weight: 700; color: #64748b; min-width: 90px; }
    .info-value { font-weight: 800; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    thead tr { background: #005c97; color: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    th { padding: 7px 8px; text-align: left; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
    td { font-size: 10px; }
    .totals-box { margin-left: auto; width: 280px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
    .totals-row { display: flex; justify-content: space-between; padding: 5px 10px; border-bottom: 1px solid #f1f5f9; font-size: 10px; }
    .totals-row.grand { background: #005c97; color: white; font-weight: 900; font-size: 12px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .words-row { padding: 6px 10px; font-size: 9px; color: #475569; font-style: italic; border-bottom: 1px solid #f1f5f9; }
    .footer { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
    .sign-block { text-align: center; }
    .sign-line { border-top: 1px solid #0f172a; width: 120px; margin: 4px auto 0; }
    .sign-label { font-size: 9px; font-weight: 700; color: #475569; margin-top: 3px; }
    .payment-badge { display: inline-block; padding: 2px 8px; background: #dcfce7; color: #166534; border-radius: 20px; font-size: 9px; font-weight: 900; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  </style>
</head>
<body>
  ${getReportHeaderHtml(logoSrc)}

  <div class="receipt-title">&#127978; Pharmacy Sales Receipt</div>

  <div class="info-grid">
    <div class="info-row"><span class="info-label">Bill No</span><span class="info-value">#${bill.id}</span></div>
    <div class="info-row"><span class="info-label">Date</span><span class="info-value">${bill.date}</span></div>
    <div class="info-row"><span class="info-label">Patient Name</span><span class="info-value">${bill.patientName || 'Walk-in Customer'}</span></div>
    <div class="info-row"><span class="info-label">Time</span><span class="info-value">${bill.time}</span></div>
    <div class="info-row"><span class="info-label">Patient ID</span><span class="info-value">${bill.patientId || '-'}</span></div>
    <div class="info-row"><span class="info-label">Age / Gender</span><span class="info-value">${bill.ageGender || '-'}</span></div>
    <div class="info-row"><span class="info-label">Contact</span><span class="info-value">${bill.phone || '-'}</span></div>
    <div class="info-row"><span class="info-label">Payment Mode</span><span class="info-value"><span class="payment-badge">${bill.paymentMode}</span></span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30px;">#</th>
        <th>Medicine Name</th>
        <th>HSN</th>
        <th>Batch</th>
        <th>Qty</th>
        <th>MRP</th>
        <th>Disc</th>
        <th>Tax</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals-box">
    <div class="totals-row"><span>Subtotal</span><span>&#8377;${Number(bill.subtotal || 0).toFixed(2)}</span></div>
    <div class="totals-row"><span>GST / Tax</span><span>&#8377;${Number(bill.gstTotal || 0).toFixed(2)}</span></div>
    <div class="totals-row"><span>Paid Amount</span><span>&#8377;${Number(bill.paidAmount || 0).toFixed(2)}</span></div>
    <div class="totals-row" style="font-weight:700;color:${Number(bill.balance || 0) > 0 ? '#dc2626' : '#059669'};"><span>Balance Due</span><span>&#8377;${Number(bill.balance || 0).toFixed(2)}</span></div>
    <div class="totals-row grand"><span>GRAND TOTAL</span><span>&#8377;${Number(bill.total || 0).toFixed(2)}</span></div>
    <div class="words-row">In Words: ${bill.amountInWords || ''}</div>
  </div>

  <div class="footer">
    <div class="sign-block">
      <div class="sign-line"></div>
      <div class="sign-label">Patient / Customer Signature</div>
    </div>
    <div style="text-align:center;font-size:9px;color:#64748b;">
      <div>GSTIN: 29CAKPS8713C1ZD</div>
      <div>DL No: ${bill.dlNo}</div>
      <div style="margin-top:4px;font-weight:700;color:#0284c7;">Thank you for choosing Tagnya Hospital!</div>
    </div>
    <div class="sign-block">
      <div class="sign-line"></div>
      <div class="sign-label">Authorized Signatory</div>
    </div>
  </div>

  <script>window.onload = function() { window.print(); window.setTimeout(function() { window.close(); }, 1500); }<\/script>
</body>
</html>`);
  popup.document.close();
};

export const printBulkOrderReceipt = (bill: any, logoSrc: string) => {
  if (!bill) return;

  const itemRows = bill.items.map((item: any, i: number) => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:6px 8px;">${i + 1}</td>
      <td style="padding:6px 8px;font-weight:700;">${item.name}</td>
      <td style="padding:6px 8px;">${item.hsnCode || '-'}</td>
      <td style="padding:6px 8px;">${item.batchNo || '-'}</td>
      <td style="padding:6px 8px;">${item.qty}</td>
      <td style="padding:6px 8px;">${item.qtyFree || 0}</td>
      <td style="padding:6px 8px;">&#8377;${Number(item.buyPrice || 0).toFixed(2)}</td>
      <td style="padding:6px 8px;">&#8377;${Number(item.mrp || 0).toFixed(2)}</td>
      <td style="padding:6px 8px;">${item.tax || 0}%</td>
      <td style="padding:6px 8px;font-weight:700;color:#005c97;">&#8377;${Number(item.totalAmount || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const popup = window.open('', '_blank', 'width=950,height=1200,scrollbars=yes');
  if (!popup) {
    window.alert('Please allow popups for this site to print the purchase bill.');
    return;
  }

  popup.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Purchase Invoice / Procurement Receipt - ${bill.id}</title>
  <style>
    @page { margin: 10mm 12mm; size: A4; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: white; color: #1e293b; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 11px; }
    ${getReportHeaderStyles()}
    .receipt-title { text-align: center; font-size: 13px; font-weight: 900; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; border-bottom: 1px dashed #c084fc; padding-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; margin-bottom: 12px; padding: 8px; background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 6px; }
    .info-row { display: flex; gap: 6px; }
    .info-label { font-weight: 700; color: #6b21a8; min-width: 90px; }
    .info-value { font-weight: 800; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    thead tr { background: #7c3aed; color: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    th { padding: 7px 8px; text-align: left; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
    td { font-size: 10px; }
    .totals-box { margin-left: auto; width: 280px; border: 1px solid #f3e8ff; border-radius: 6px; overflow: hidden; }
    .totals-row { display: flex; justify-content: space-between; padding: 5px 10px; border-bottom: 1px solid #f3e8ff; font-size: 10px; }
    .totals-row.grand { background: #7c3aed; color: white; font-weight: 900; font-size: 12px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .words-row { padding: 6px 10px; font-size: 9px; color: #6b21a8; font-style: italic; border-bottom: 1px solid #f3e8ff; }
    .footer { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 10px; border-top: 1px solid #f3e8ff; }
    .sign-block { text-align: center; }
    .sign-line { border-top: 1px solid #7c3aed; width: 120px; margin: 4px auto 0; }
    .sign-label { font-size: 9px; font-weight: 700; color: #6b21a8; margin-top: 3px; }
    .payment-badge { display: inline-block; padding: 2px 8px; background: #f3e8ff; color: #6b21a8; border-radius: 20px; font-size: 9px; font-weight: 900; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  </style>
</head>
<body>
  ${getReportHeaderHtml(logoSrc)}

  <div class="receipt-title">&#128229; Purchase Entry / Procurement Receipt</div>

  <div class="info-grid">
    <div class="info-row"><span class="info-label">Internal Receipt ID</span><span class="info-value">#${bill.id}</span></div>
    <div class="info-row"><span class="info-label">Date</span><span class="info-value">${bill.date}</span></div>
    <div class="info-row"><span class="info-label">Supplier / Vendor</span><span class="info-value">${bill.vendor || 'General Supplier'}</span></div>
    <div class="info-row"><span class="info-label">Time</span><span class="info-value">${bill.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
    <div class="info-row"><span class="info-label">Invoice No</span><span class="info-value">${bill.invoiceNo || '-'}</span></div>
    <div class="info-row"><span class="info-label">Bill No</span><span class="info-value">${bill.billNo || '-'}</span></div>
    <div class="info-row"><span class="info-label">GSTIN</span><span class="info-value">${bill.gstNo || bill.vendorGstNo || '-'}</span></div>
    <div class="info-row"><span class="info-label">Drug Lic. No</span><span class="info-value">${bill.dlNo || bill.vendorDlNo || '-'}</span></div>
    <div class="info-row"><span class="info-label">Payment Mode</span><span class="info-value"><span class="payment-badge">${bill.paymentMode || 'Credit'}</span></span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30px;">#</th>
        <th>Medicine Name</th>
        <th>HSN</th>
        <th>Batch</th>
        <th>Qty</th>
        <th>Free</th>
        <th>Buy Price</th>
        <th>MRP</th>
        <th>Tax</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <div class="totals-box">
    <div class="totals-row"><span>Subtotal</span><span>&#8377;${Number(bill.subtotal || 0).toFixed(2)}</span></div>
    <div class="totals-row"><span>GST / Tax</span><span>&#8377;${Number(bill.gstTotal || 0).toFixed(2)}</span></div>
    <div class="totals-row"><span>Paid Amount</span><span>&#8377;${Number(bill.paidAmount || 0).toFixed(2)}</span></div>
    <div class="totals-row" style="font-weight:700;color:${Number(bill.balance || 0) > 0 ? '#b91c1c' : '#0369a1'};"><span>Balance Due</span><span>&#8377;${Number(bill.balance || 0).toFixed(2)}</span></div>
    <div class="totals-row grand"><span>GRAND TOTAL</span><span>&#8377;${Number(bill.total || 0).toFixed(2)}</span></div>
    <div class="words-row">In Words: ${bill.amountInWords || ''}</div>
  </div>

  <div class="footer">
    <div class="sign-block">
      <div class="sign-line"></div>
      <div class="sign-label">Prepared By (Pharmacist)</div>
    </div>
    <div style="text-align:center;font-size:9px;color:#64748b;">
      <div>GSTIN: ${bill.gstNo || bill.vendorGstNo || 'N/A'}</div>
      <div>DL No: ${bill.dlNo || bill.vendorDlNo || 'N/A'}</div>
    </div>
    <div class="sign-block">
      <div class="sign-line"></div>
      <div class="sign-label">Authorized Signatory</div>
    </div>
  </div>

  <script>window.onload = function() { window.print(); window.setTimeout(function() { window.close(); }, 1500); }<\/script>
</body>
</html>`);
  popup.document.close();
};
