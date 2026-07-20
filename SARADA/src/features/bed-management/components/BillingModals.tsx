import React from "react";
import { Bed as BedInterface, Invoice } from "../../../shared/types";
import Modal from "../../../shared/components/Modal";
import {
  Zap,
  Download,
  Activity,
  ShieldCheck,
  AlertTriangle,
} from "../../../shared/utils/icons";

interface BillingModalsProps {
  showInvoiceFormModal: boolean;
  setShowInvoiceFormModal: (val: boolean) => void;
  invoiceFormData: any;
  setInvoiceFormData: React.Dispatch<React.SetStateAction<any>>;
  selectedBedForDetails: BedInterface | null;
  onAddInvoice?: (invoice: Invoice) => void;
  generateInvoicePDF: (bed: BedInterface, data: any) => void;
   generateReleaseBillPDF: (bed: BedInterface, patient: any, formData?: any, pharmacyItems?: any[]) => void;
  showBillsArchiveModal: boolean;
  setShowBillsArchiveModal: (val: boolean) => void;
  invoices: Invoice[];
  beds: BedInterface[];
  onDeleteInvoice: (id: string) => void;
}

const BillingModals: React.FC<BillingModalsProps> = ({
  showInvoiceFormModal,
  setShowInvoiceFormModal,
  invoiceFormData,
  setInvoiceFormData,
  selectedBedForDetails,
  onAddInvoice,
  generateInvoicePDF,
  generateReleaseBillPDF,
  showBillsArchiveModal,
  setShowBillsArchiveModal,
  invoices,
  beds,
  onDeleteInvoice,
}) => {
  return (
    <>
      {/* Invoice Details Form Modal */}
      <Modal
        isOpen={showInvoiceFormModal}
        onClose={() => setShowInvoiceFormModal(false)}
        title="Generate Patient Invoice"
        size="lg"
      >
        <div className="space-y-8">
          <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center space-x-6">
            <div className="w-12 h-12 bg-hospital-blue rounded-xl flex items-center justify-center shadow-lg shadow-hospital-blue/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest">
                Invoice Verification
              </h4>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                Review and edit details for {selectedBedForDetails?.id}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Patient Name
              </label>
              <input
                type="text"
                value={invoiceFormData.patientName}
                onChange={(e) =>
                  setInvoiceFormData({
                    ...invoiceFormData,
                    patientName: e.target.value,
                  })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-hospital-blue/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Patient ID
              </label>
              <input
                type="text"
                value={invoiceFormData.patientId}
                onChange={(e) =>
                  setInvoiceFormData({
                    ...invoiceFormData,
                    patientId: e.target.value,
                  })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-hospital-blue/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Age
              </label>
              <input
                type="number"
                value={invoiceFormData.age}
                onChange={(e) =>
                  setInvoiceFormData({ ...invoiceFormData, age: e.target.value })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-hospital-blue/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Mobile No
              </label>
              <input
                type="tel"
                value={invoiceFormData.mobileNo}
                onChange={(e) =>
                  setInvoiceFormData({
                    ...invoiceFormData,
                    mobileNo: e.target.value,
                  })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-hospital-blue/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Stay Duration (Days)
              </label>
              <input
                type="number"
                value={invoiceFormData.daysStayed}
                onChange={(e) =>
                  setInvoiceFormData({
                    ...invoiceFormData,
                    daysStayed: Number(e.target.value),
                  })
                }
                className="w-full px-6 py-4 bg-hospital-blue/10 border border-hospital-blue/10 rounded-2xl text-xs font-black text-hospital-blue/70 outline-none focus:ring-4 focus:ring-hospital-blue/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Charge Per Day (₹)
              </label>
              <input
                type="number"
                value={invoiceFormData.chargePerDay}
                onChange={(e) =>
                  setInvoiceFormData({
                    ...invoiceFormData,
                    chargePerDay: Number(e.target.value),
                  })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-hospital-blue/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Pharmacy Charge (₹)
              </label>
              <input
                type="number"
                value={invoiceFormData.pharmacyCharge}
                onChange={(e) =>
                  setInvoiceFormData({
                    ...invoiceFormData,
                    pharmacyCharge: Number(e.target.value),
                  })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-hospital-blue/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Nursing Charge (₹)
              </label>
              <input
                type="number"
                value={invoiceFormData.nursingCharge}
                onChange={(e) =>
                  setInvoiceFormData({
                    ...invoiceFormData,
                    nursingCharge: Number(e.target.value),
                  })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-hospital-blue/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Miscellaneous Charge (₹)
              </label>
              <input
                type="number"
                value={invoiceFormData.miscCharge}
                onChange={(e) =>
                  setInvoiceFormData({
                    ...invoiceFormData,
                    miscCharge: Number(e.target.value),
                  })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-hospital-blue/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Discount Amount (₹)
              </label>
              <input
                type="number"
                value={invoiceFormData.discountAmount}
                onChange={(e) =>
                  setInvoiceFormData({
                    ...invoiceFormData,
                    discountAmount: Number(e.target.value),
                  })
                }
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-hospital-blue/10"
              />
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Estimated Total Bill
              </p>
              <p className="text-2xl font-black text-slate-900">
                ₹
                {(
                  invoiceFormData.daysStayed * invoiceFormData.chargePerDay +
                  invoiceFormData.pharmacyCharge +
                  invoiceFormData.nursingCharge +
                  invoiceFormData.miscCharge -
                  invoiceFormData.discountAmount
                ).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => {
                if (selectedBedForDetails) {
                  const bedAmount = invoiceFormData.daysStayed * invoiceFormData.chargePerDay;
                  const subtotal = bedAmount + invoiceFormData.pharmacyCharge + invoiceFormData.nursingCharge + invoiceFormData.miscCharge;
                  const totalAmount = Math.max(0, subtotal - invoiceFormData.discountAmount);
                  
                  const newInvoice: Invoice = {
                    id: `BD-${Math.floor(1000 + Math.random() * 9000)}`,
                    name: invoiceFormData.patientName,
                    patientId: invoiceFormData.patientId,
                    age: invoiceFormData.age,
                    mobileNo: invoiceFormData.mobileNo,
                    services: `Bed: ${selectedBedForDetails.id} | Room: ${selectedBedForDetails.wardNo} | Stay: ${invoiceFormData.daysStayed} Days | Status: In`,
                    amount: `₹${totalAmount.toLocaleString()}`,
                    status: "Paid",
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                    paymentMethod: invoiceFormData.paymentMethod,
                    charges: {
                      bedCharges: [{
                        type: selectedBedForDetails.wardType,
                        days: invoiceFormData.daysStayed,
                        rate: invoiceFormData.chargePerDay,
                        amount: bedAmount,
                      }],
                      pharmacyCharges: invoiceFormData.pharmacyCharge > 0 ? [{
                        medicine: 'Pharmacy charges',
                        quantity: 1,
                        rate: invoiceFormData.pharmacyCharge,
                        amount: invoiceFormData.pharmacyCharge,
                      }] : [],
                      nursingCharge: invoiceFormData.nursingCharge,
                      miscCharge: invoiceFormData.miscCharge,
                      discount: invoiceFormData.discountAmount,
                      subtotal,
                      tax: 0,
                      total: totalAmount,
                    },
                  };
                  onAddInvoice?.(newInvoice);
                  generateInvoicePDF(selectedBedForDetails, invoiceFormData);
                  setShowInvoiceFormModal(false);
                }
              }}
              className="px-10 py-5 bg-hospital-blue text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-hospital-blue/70 transition-all shadow-xl shadow-hospital-blue/20 flex items-center space-x-3"
            >
              <Download className="w-4 h-4" />
              <span>Finalize & Print PDF</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Bills Archive Modal */}
      <Modal
        isOpen={showBillsArchiveModal}
        onClose={() => setShowBillsArchiveModal(false)}
        title="Bed Management Billing Ledger"
        size="xl"
      >
        <div className="space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar pr-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Invoice History
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Financial audit trail for facility allocations
              </p>
            </div>
            <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-3">
              <Activity className="w-4 h-4 text-hospital-blue" />
              <span className="text-[10px] font-black text-slate-900 uppercase">
                {invoices.filter((inv) => inv.id.startsWith("BD")).length} Bed
                Invoices Sync'd
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-6">Timestamp</th>
                  <th className="px-8 py-6">Patient Entity</th>
                  <th className="px-8 py-6">Bed No</th>
                  <th className="px-8 py-6">Room Name</th>
                  <th className="px-8 py-6">Days Stay</th>
                  <th className="px-8 py-6">In/Out</th>
                  <th className="px-8 py-6">Settlement</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices
                  .filter((inv) => inv.id.startsWith("BD"))
                  .map((inv) => (
                    <tr
                      key={inv.id}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">
                            {inv.date}
                          </span>
                          <span className="text-[9px] font-black text-slate-400 uppercase">
                            {inv.time}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900 uppercase">
                            {inv.name}
                          </span>
                          <span className="text-[9px] font-bold text-hospital-blue">
                            ID: {inv.patientId}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg uppercase">
                          {inv.services.includes("Bed: ")
                            ? inv.services.split("Bed: ")[1].split(" | ")[0]
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black text-slate-600 uppercase">
                          {inv.services.includes("Room: ")
                            ? inv.services.split("Room: ")[1].split(" | ")[0]
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black text-slate-600 uppercase">
                          {inv.services.includes("Stay: ")
                            ? inv.services.split("Stay: ")[1].split(" | ")[0]
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${
                            inv.services.includes("Status: In")
                              ? "bg-hospital-blue/10 text-hospital-blue"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {inv.services.includes("Status: In") ? "In" : "Out"}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-900">
                          {inv.amount}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                          onClick={() => {
  if (!inv.charges) {
    alert("This invoice was created before detailed billing was saved — can't reprint the full breakdown.");
    return;
  }
  const c = inv.charges;

  const roomName = inv.services.includes("Room: ")
    ? inv.services.split("Room: ")[1].split(" | ")[0]
    : "N/A";
  const bedId = inv.services.includes("Bed: ")
    ? inv.services.split("Bed: ")[1].split(" | ")[0]
    : "N/A";

  const mockBed = beds.find((b) => b.id === bedId) || {
    id: bedId,
    wardType: c.bedCharges[0]?.type || "General",
    wardNo: roomName,
    chargePerDay: c.bedCharges[0]?.rate || 0,
  };

  const segments = c.bedCharges.map((bc: any) => ({
    wardType: bc.type,
    days: bc.days,
    chargePerDay: bc.rate,
    amount: bc.amount,
  }));

  const pharmacyItems = (c.pharmacyCharges || []).map((p: any) => ({
    medicine_name: p.medicine,
    qty: p.quantity,
    mrp: p.rate,
    total: p.amount,
  }));

  const pharmacyChargeTotal = pharmacyItems.reduce(
    (sum: number, p: any) => sum + p.total, 0
  );

  generateReleaseBillPDF(mockBed as any, null, {
    patientName: inv.name,
    patientId: inv.patientId,
    age: inv.age,
    mobileNo: inv.mobileNo,
    daysStayed: c.bedCharges[0]?.days || 1,
    chargePerDay: c.bedCharges[0]?.rate || 0,
    totalBedCharge: c.bedCharges.reduce((s: number, bc: any) => s + bc.amount, 0),
    pharmacyCharge: pharmacyChargeTotal,
    nursingCharge: c.nursingCharge || 0,
    miscCharge: c.miscCharge || 0,
    discountAmount: c.discount || 0,
    segments,
  }, pharmacyItems);
}}
                            className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteInvoice(inv.id)}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BillingModals;
