import React, { useState } from "react";
import { ArrowLeft, Receipt, Calendar, PlusCircle, History, Package, Printer } from "../../../shared/utils/icons";

interface VendorBillItem {
  name:string;
  qty:number;
  buyPrice:number;
  batchNo?:string;
  expiry?:string;
}

interface VendorPayment {
  amountPaid:number;
  itemsPaidCount:number;
  date:string;
  notes?:string;
}

interface VendorBill {
  id:string;
  vendorName:string;
  vendor?: string;  
  invoiceNo:string;
  date:string;
  dlNo?: string;
  total:number;
  paidAmount:number;
  balance:number;
  totalDeliveredQty?: number;
  totalPaidQty?: number; 
  items:VendorBillItem[];
  paymentHistory?:VendorPayment[];
}
interface VendorBillsViewProps {
  stockBills: VendorBill[];
  onAddVendorPaymentTerm: (billId: string, amountPaid: number, itemsPaidCount: number, notes: string) => void;
  onPrintBill?: (bill: VendorBill) => void;
  setPharmacyView: (view: "dashboard" | "createMedicine" | "purchaseEntry" | "salesEntry" | "salesBills") => void;
}

const VendorBillsView: React.FC<VendorBillsViewProps> = ({
  stockBills,
  onAddVendorPaymentTerm,
  onPrintBill,
  setPharmacyView,
}) => {
  const [selectedBill, setSelectedBill] = useState<VendorBill | null>(null);
  const [isTermPaymentModalOpen, setIsTermPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | string>("");
  const [itemsPaidCount, setItemsPaidCount] = useState<number | string>("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const handleOpenPaymentModal = (bill: VendorBill) => {
    setSelectedBill(bill);
    setPaymentAmount("");
    setItemsPaidCount("");
    setPaymentNotes("");
    setIsTermPaymentModalOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;
    const amount = Number(paymentAmount);
    const itemsCount = Number(itemsPaidCount) || 0;
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    onAddVendorPaymentTerm(selectedBill.id, amount, itemsCount, paymentNotes);
    setIsTermPaymentModalOpen(false);
    setSelectedBill(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPharmacyView("dashboard")}
          className="flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="text-xs font-bold text-slate-500">
          Total Recorded Bills: {stockBills.length}
        </span>
      </div>

      {/* Main Vendor Bills Table Card */}
      <div className="bg-white border-t-[6px] border-hospital-blue shadow-sm rounded-3xl overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.1em]">VENDOR PURCHASE BILLS & TERM PAYMENTS</h3>
              <p className="text-xs text-slate-400 font-medium">Track delivered medicines, partial payments, and balance terms by date</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {stockBills.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-medium text-sm">
              No vendor purchase bills recorded yet. Create a purchase entry to view bills here.
            </div>
          ) : (
            stockBills.map((bill) => {
              const items = bill.items || [];
              const totalDelivered = bill.totalDeliveredQty || items.reduce((acc: number, i: VendorBillItem) => acc + (Number(i.qty) || 0), 0);
              const totalPaidQty = bill.totalPaidQty || (bill.balance <= 0 ? totalDelivered : Math.round(totalDelivered * (bill.paidAmount / (bill.total || 1))));
              const remainingQty = Math.max(0, totalDelivered - totalPaidQty);
              const isFullyPaid = Number(bill.balance || 0) <= 0;

              return (
                <div key={bill.id} className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm hover:border-slate-300 transition-all space-y-6">
                  {/* Bill Header info */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-black bg-blue-50 text-hospital-blue px-2.5 py-1 rounded-lg">{bill.id}</span>
                        <h4 className="font-black text-slate-800 text-base">{bill.vendorName || bill.vendor || "Unknown Vendor"}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium mt-1">
                        <span>Invoice No: <strong>{bill.invoiceNo || "N/A"}</strong></span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Date: {bill.date}</span>
                        </span>
                        {bill.dlNo && (
                          <>
                            <span>•</span>
                            <span>DL: {bill.dlNo}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400">Bill Status</p>
                        <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider mt-0.5 ${
                          isFullyPaid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {isFullyPaid ? "Fully Paid (Completed)" : "Active (Partial Term)"}
                        </span>
                      </div>

                      {onPrintBill && (
                        <button
                          onClick={() => onPrintBill(bill)}
                          className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all border border-slate-200"
                          title="Print / Download Bill"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print</span>
                        </button>
                      )}

                      {!isFullyPaid && (
                        <button
                          onClick={() => handleOpenPaymentModal(bill)}
                          className="flex items-center space-x-1.5 px-4 py-2.5 bg-hospital-blue text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 shadow-md transition-all"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Pay Term</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delivered Medicines & Terms Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Medicines List */}
                    <div className="lg:col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-200">
                        <span className="flex items-center space-x-1.5">
                          <Package className="w-4 h-4 text-hospital-blue" />
                          <span>Delivered Medicines in Bill</span>
                        </span>
                        <span>Batch & Expiry</span>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {items.map((item:  VendorBillItem, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                            <div>
                              <span className="font-bold text-slate-800">{item.name}</span>
                              <div className="text-[11px] text-slate-500 font-medium">Qty: {item.qty} units | Buy Price: ₹{item.buyPrice}</div>
                            </div>
                            <div className="text-right text-[11px] text-slate-600">
                              <div className="font-mono bg-slate-100 px-2 py-0.5 rounded">Batch: {item.batchNo || "N/A"}</div>
                              <div className="text-slate-400 mt-0.5">Exp: {item.expiry || "N/A"}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Terms & Quantities summary */}
                    <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-inner">
                      <div className="space-y-3">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-400 pb-1 border-b border-slate-800">Payment & Terms Summary</h5>

                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Total Bill Amount:</span>
                          <span className="font-black text-white">₹{Number(bill.total || 0).toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Amount Paid so far:</span>
                          <span className="font-bold text-emerald-400">₹{Number(bill.paidAmount || 0).toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-xs pt-1 border-t border-slate-800">
                          <span className="text-slate-400 font-bold">Remaining Balance:</span>
                          <span className={`font-black ${Number(bill.balance || 0) > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                            ₹{Number(bill.balance || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Itemized Terms status example: 10 delivered, 5 paid */}
                      <div className="bg-slate-800/80 p-3 rounded-lg text-xs space-y-1.5 border border-slate-700">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Total Items Delivered:</span>
                          <span className="font-bold text-white">{totalDelivered} medicines</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Terms Paid For:</span>
                          <span className="font-bold text-emerald-400">{totalPaidQty} medicines</span>
                        </div>
                        <div className="flex justify-between text-[11px] pt-1 border-t border-slate-700/50">
                          <span className="text-slate-400">Remaining Unpaid Terms:</span>
                          <span className="font-bold text-amber-400">{remainingQty} medicines</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment History Audit Terms */}
                  {bill.paymentHistory && bill.paymentHistory.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 mb-2">
                        <History className="w-3.5 h-3.5 text-hospital-blue" />
                        <span>Term Payment Installment Log</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {bill.paymentHistory.map((term: VendorPayment, tIdx: number) => (
                          <div key={tIdx} className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl text-xs space-y-1">
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>Paid: ₹{term.amountPaid}</span>
                              <span className="text-[10px] text-slate-400">{term.date}</span>
                            </div>
                            <div className="text-[11px] text-slate-600">
                              Items paid for: <strong className="text-hospital-blue">{term.itemsPaidCount} medicines</strong>
                            </div>
                            {term.notes && <p className="text-[10px] text-slate-500 italic truncate">{term.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Record Term Payment Modal */}
      {isTermPaymentModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Record Term Payment</h3>
                <p className="text-xs text-slate-400 font-medium">Bill: {selectedBill.id} ({selectedBill.vendorName})</p>
              </div>
              <button onClick={() => setIsTermPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
                <div className="flex justify-between">
                  <span>Current Balance Due:</span>
                  <span className="font-black">₹{Number(selectedBill.balance || 0).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Payment Amount (₹) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  max={selectedBill.balance}
                  placeholder="Enter amount paid"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-hospital-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Medicines / Items Paid For (Count)</label>
                <input
                  type="number"
                  placeholder="e.g. 5 medicines"
                  value={itemsPaidCount}
                  onChange={(e) => setItemsPaidCount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-hospital-blue outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Example: If 10 delivered and paying for 5 today, enter 5</p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Notes / Transaction Ref</label>
                <input
                  type="text"
                  placeholder="e.g. Paid via UPI / Cheque #1042"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-hospital-blue outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTermPaymentModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-hospital-blue text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 shadow-md"
                >
                  Submit Payment Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorBillsView;
