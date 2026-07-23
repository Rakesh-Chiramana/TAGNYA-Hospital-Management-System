import React from "react";
import { ArrowLeft, Trash2, ShieldCheck } from "../../../shared/utils/icons";
import { BulkOrderItem } from "../services/pharmacyService";
type PharmacyView =
 | "dashboard"
 | "createMedicine"
 | "purchaseEntry"
 | "salesEntry"
 | "salesBills"
 | "purchaseBills"
 | "vendors"
 | "vendorBills";

interface Medicine {
  id: string | number;
  medicine_name?: string;
  name?: string;
  hsn_code?: string;
  hsnCode?: string;
  company_name?: string;
  companyName?: string;
  gst_percentage?: number;
  taxPercentage?: number;
}

interface Vendor {
  id: string | number;
  name: string;
  status?: string;
  dlNo?: string;
  gstNo?: string;
}

interface PurchaseEntryViewProps {
  purchaseCurrentItem: BulkOrderItem;
  updatePurchaseCurrentItem: (field: keyof BulkOrderItem, value: string | number) => void;
  addCurrentItemToOrder: () => void;
  bulkOrderItems: BulkOrderItem[];
  removeBulkOrderItem: (index: number) => void;

  vendors?: Vendor[];
  purchaseSupplierName: string;
  setPurchaseSupplierName: (val: string) => void;
  purchaseInvoiceNo: string;
  setPurchaseInvoiceNo: (val: string) => void;
  purchaseInvoiceDate: string;
  setPurchaseInvoiceDate: (val: string) => void;
  purchaseLRDate: string;
  setPurchaseLRDate: (val: string) => void;
  purchaseBillNo: string;
  setPurchaseBillNo: (val: string) => void;
  purchaseDLNo: string;
  setPurchaseDLNo: (val: string) => void;
  purchaseGstNo: string;
  setPurchaseGstNo: (val: string) => void;
  purchasePaymentMode: string;
  setPurchasePaymentMode: (val: string) => void;
  purchasePaidAmount: number;
  setPurchasePaidAmount: (val: number) => void;

  handleBulkOrderSubmit: (e: React.FormEvent) => void;
  

setPharmacyView: (view: PharmacyView) => void;
}

const PurchaseEntryView: React.FC<PurchaseEntryViewProps> = ({
  purchaseCurrentItem,
  updatePurchaseCurrentItem,
  addCurrentItemToOrder,
  bulkOrderItems,
  removeBulkOrderItem,
  vendors = [],
  purchaseSupplierName,
  setPurchaseSupplierName,
  purchaseInvoiceNo,
  setPurchaseInvoiceNo,
  purchaseInvoiceDate,
  setPurchaseInvoiceDate,
  purchaseLRDate,
  setPurchaseLRDate,
  purchaseBillNo,
  setPurchaseBillNo,
  purchaseDLNo,
  setPurchaseDLNo,
  purchaseGstNo,
  setPurchaseGstNo,
  purchasePaymentMode,
  setPurchasePaymentMode,
  purchasePaidAmount,
  setPurchasePaidAmount,
  handleBulkOrderSubmit,
  setPharmacyView
}) => {
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);

  React.useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/medicines");
      const data = await response.json();
      if (data.success) {
        setMedicines(data.medicines || []);
      } else {
        setMedicines(data.medicines || data || []);
      }
    } catch (err) {
      console.error("Failed to load medicines", err);
    }
  };

  const getNumberInputValue = (value: number | string | undefined) => {
    if (value === undefined || value === null || value === "") return "";
    return String(value);
  };

  const getMedicineSelectValue = () => {
    if (!purchaseCurrentItem.name) return "";
    const selected = medicines.find(
      (m: Medicine) => (m.medicine_name || m.name) === purchaseCurrentItem.name
    );
    return selected ? String(selected.id) : "";
  };

  const handleMedicineSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const selected = medicines.find((m: Medicine) => String(m.id) === String(val));
    if (selected) {
      updatePurchaseCurrentItem("name", selected.medicine_name || selected.name || "");
      updatePurchaseCurrentItem("hsnCode", selected.hsn_code || selected.hsnCode || "");
      updatePurchaseCurrentItem("company", selected.company_name || selected.companyName || "");
      updatePurchaseCurrentItem("tax", selected.gst_percentage || selected.taxPercentage || 0);
    }
  };

  const handleVendorNameChange = (value: string) => {
    setPurchaseSupplierName(value);
    const selectedVendor = vendors.find((v: any) => v.name === value);
    if (selectedVendor) {
      setPurchaseDLNo(selectedVendor.dlNo || "");
      setPurchaseGstNo(selectedVendor.gstNo || "");
    } else {
      setPurchaseDLNo("");
      setPurchaseGstNo("");
    }
  };

  const handleSubmitPurchase = async () => {
    try {
      const payload = {
        medicine_name: purchaseCurrentItem.name || "",
        hsn_code: purchaseCurrentItem.hsnCode || "",
        company: purchaseCurrentItem.company || "",
        batch_no: purchaseCurrentItem.batchNo || "",
        qty: Number(purchaseCurrentItem.qty || 0),
        qty_free: Number(purchaseCurrentItem.qtyFree || 0),
        purchase_price: Number(purchaseCurrentItem.buyPrice || 0),
        mrp: Number(purchaseCurrentItem.mrp || 0),
        expiry_date: purchaseCurrentItem.expiry || "",
        discount_percent: Number(purchaseCurrentItem.discount || 0),
        tax_percent: Number(purchaseCurrentItem.tax || 0),
        supplier_name: purchaseSupplierName,
        invoice_no: purchaseInvoiceNo,
        invoice_date: purchaseInvoiceDate,
        payment_mode: purchasePaymentMode,
        paid_amount: Number(purchasePaidAmount || 0),
        dl_no: purchaseDLNo,
        gst_no: purchaseGstNo,
        grand_total: Number(
          bulkOrderItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0).toFixed(2)
        ),
      };

      const response = await fetch("http://localhost:5000/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert("Purchase Saved Successfully");
      } else {
        alert(data?.message || data?.error || "Failed to save purchase");
      }
    } catch (error) {
      console.log(error);
      alert("There was an error saving the purchase.");
    }
  };
  const currentTotalAmount = bulkOrderItems.reduce((acc, i) => acc + (i.totalAmount || 0), 0);
  const balanceDue = currentTotalAmount - purchasePaidAmount;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPharmacyView("dashboard")}
          className="flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Purchase Entry Form */}
      <div className="bg-white border-t-[6px] border-purple-600 shadow-sm rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">PURCHASE ENTRY</h3>
        </div>
        <div className="p-6 space-y-8">
          {/* Top Item Entry Form */}
          <div className="grid grid-cols-7 gap-4">
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">Medicine Name</label>
                <select
                  name="medicineName"
                  value={getMedicineSelectValue()}
                  onChange={handleMedicineSelect}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-purple-400 outline-none bg-white"
                >
                  <option value="">Select Medicine</option>
                  {medicines.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.medicine_name || med.name}
                    </option>
                  ))}
                </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">HSN Code</label>
              <input
                name="hsnCode"
                type="text"
                value={purchaseCurrentItem.hsnCode || ""}
                readOnly
                placeholder="HSN Code"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Company</label>
              <input
                name="company"
                type="text"
                value={purchaseCurrentItem.company || ""}
                readOnly
                placeholder="Company"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Pack</label>
              <input
                name="pack"
                type="text"
                value={purchaseCurrentItem.pack || ""}
                onChange={(e) => updatePurchaseCurrentItem("pack", e.target.value)}
                placeholder="Enter Pack"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-purple-400 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Batch NO</label>
              <input
                name="batchNo"
                type="text"
                value={purchaseCurrentItem.batchNo || ""}
                onChange={(e) => updatePurchaseCurrentItem("batchNo", e.target.value)}
                placeholder="Enter Batch"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-purple-400 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Qty</label>
              <input
                name="qty"
                type="text"
                inputMode="decimal"
                value={purchaseCurrentItem.qty === 0 ? "" : String(purchaseCurrentItem.qty)}
                onChange={(e) => updatePurchaseCurrentItem("qty", e.target.value)}
                placeholder="Enter Qty"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-purple-400 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 flex items-center">
                Qty Free <input type="checkbox" className="ml-2" />
              </label>
              <input
                name="qtyFree"
                type="text"
                inputMode="decimal"
                value={purchaseCurrentItem.qtyFree === 0 ? "" : String(purchaseCurrentItem.qtyFree)}
                onChange={(e) => updatePurchaseCurrentItem("qtyFree", e.target.value)}
                placeholder="Free Qty"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-purple-400 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Purchase Price</label>
              <input
                name="purchasePrice"
                type="text"
                inputMode="decimal"
                value={purchaseCurrentItem.buyPrice === 0 ? "" : String(purchaseCurrentItem.buyPrice)}
                onChange={(e) => updatePurchaseCurrentItem("buyPrice", e.target.value)}
                placeholder="Enter Purchase Price"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-purple-400 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">MRP</label>
              <input
                name="mrp"
                type="text"
                inputMode="decimal"
                value={purchaseCurrentItem.mrp === 0 ? "" : String(purchaseCurrentItem.mrp)}
                onChange={(e) => updatePurchaseCurrentItem("mrp", e.target.value)}
                placeholder="Enter MRP"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-purple-400 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Expiry Date</label>
              <input
                name="expiryDate"
                type="text"
                value={purchaseCurrentItem.expiry || ""}
                onChange={(e) => updatePurchaseCurrentItem("expiry", e.target.value)}
                placeholder="MM-YYYY or any text"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-purple-400 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Discount (%)</label>
              <input
                name="discount"
                type="text"
                inputMode="decimal"
                value={purchaseCurrentItem.discount === 0 ? "" : String(purchaseCurrentItem.discount)}
                onChange={(e) => updatePurchaseCurrentItem("discount", e.target.value)}
                placeholder="Enter Discount"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-purple-400 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Discount Amount</label>
              <input
                readOnly
                value={purchaseCurrentItem.discountAmount?.toFixed(2) || "0.00"}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Tax (%)</label>
              <input
                name="tax"
                type="text"
                inputMode="decimal"
                value={getNumberInputValue(purchaseCurrentItem.tax)}
                readOnly
                placeholder="Tax Percentage"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Tax Amount</label>
              <input
                readOnly
                value={purchaseCurrentItem.taxAmount?.toFixed(2) || "0.00"}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600">Total Amount</label>
              <input
                readOnly
                value={purchaseCurrentItem.totalAmount?.toFixed(2) || "0.00"}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 outline-none font-bold"
              />
            </div>
            <div className="col-span-1">
              <button
                onClick={addCurrentItemToOrder}
                className="px-8 py-2 bg-purple-600 text-white text-[10px] font-bold rounded-xl hover:bg-purple-700 transition-all"
              >
                Next Item
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
            <table className="w-full text-[10px] text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-widest font-black">
                <tr>
                  <th className="px-4 py-3">S.No</th>
                  <th className="px-4 py-3">Medicine</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">MRP</th>
                  <th className="px-4 py-3">Expiry</th>
                  <th className="px-4 py-3">Tax</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {bulkOrderItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-black text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 font-bold text-purple-600">{item.batchNo}</td>
                    <td className="px-4 py-3 font-black">{item.qty}</td>
                    <td className="px-4 py-3">₹{item.buyPrice}</td>
                    <td className="px-4 py-3">₹{item.mrp}</td>
                    <td className="px-4 py-3 text-slate-500">{item.expiry}</td>
                    <td className="px-4 py-3 text-slate-500">{item.tax}%</td>
                    <td className="px-4 py-3 font-black text-hospital-blue">
                      ₹{item.totalAmount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeBulkOrderItem(idx)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {bulkOrderItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-10 text-center text-slate-300 font-black uppercase tracking-widest text-[9px]"
                    >
                      No items added to this purchase order yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Form */}
          <div className="space-y-6 pt-8 border-t border-slate-100">
            <div className="grid grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">Supplier Name</label>
                <input
                  type="text"
                  list="purchase-vendors-datalist"
                  value={purchaseSupplierName}
                  onChange={(e) => handleVendorNameChange(e.target.value)}
                  placeholder="Type or select Vendor"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-400 font-medium text-slate-700"
                />
                <datalist id="purchase-vendors-datalist">
                  {vendors.filter((v: Vendor) => v.status === "Active").map((v: Vendor) => (
                    <option key={v.id} value={v.name} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">Invoice No</label>
                <input
                  type="text"
                  value={purchaseInvoiceNo}
                  onChange={(e) => setPurchaseInvoiceNo(e.target.value)}
                  placeholder="Invoice No"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">Invoice Date</label>
                <input
                  type="date"
                  value={purchaseInvoiceDate}
                  onChange={(e) => setPurchaseInvoiceDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">LR Date</label>
                <input
                  type="date"
                  value={purchaseLRDate}
                  onChange={(e) => setPurchaseLRDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">Bill No</label>
                <input
                  type="text"
                  value={purchaseBillNo}
                  onChange={(e) => setPurchaseBillNo(e.target.value)}
                  placeholder="Bill No"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">DL No</label>
                <input
                  type="text"
                  value={purchaseDLNo}
                  onChange={(e) => setPurchaseDLNo(e.target.value)}
                  placeholder="DL No"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">GSTIN</label>
                <input
                  type="text"
                  value={purchaseGstNo}
                  onChange={(e) => setPurchaseGstNo(e.target.value)}
                  placeholder="GSTIN"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">Payment Mode</label>
                <select
                  value={purchasePaymentMode}
                  onChange={(e) => setPurchasePaymentMode(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-400"
                >
                  <option value="">Select Method</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / Online</option>
                  <option value="Card">Card</option>
                  <option value="Credit">Credit</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">Paid Amount</label>
                <input
                  type="number"
                  value={purchasePaidAmount || ""}
                  onChange={(e) => setPurchasePaidAmount(Number(e.target.value))}
                  placeholder="Enter Paid Amount"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">Balance Amount</label>
                <div
                  className={`px-4 py-3 rounded-xl font-black text-lg border ${
                    balanceDue > 0
                      ? "bg-red-50 text-red-700 border-red-100"
                      : "bg-emerald-50 text-emerald-700 border-emerald-100"
                  }`}
                >
                  ₹{balanceDue.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600">Grand Total</label>
                <div className="px-4 py-3 bg-purple-50 text-purple-700 rounded-xl font-black text-lg border border-purple-100">
                  ₹{currentTotalAmount.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 space-x-4">
              <button
                onClick={handleBulkOrderSubmit}
                className="px-10 py-4 bg-purple-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 flex items-center space-x-3"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Submit Purchase Order</span>
              </button>
              <button
                onClick={handleSubmitPurchase}
                className="px-6 py-3 bg-green-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-100 flex items-center"
              >
                <span>Save to Server</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseEntryView;
