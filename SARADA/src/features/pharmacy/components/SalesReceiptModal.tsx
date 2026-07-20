import React from "react";
import Modal from "../../../shared/components/Modal";
import ReportLetterhead from "../../../shared/components/ReportLetterhead";
import { Download } from "../../../shared/utils/icons";
import { PharmacyBill } from "../services/pharmacyService";

interface SalesReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  latestPharmacyBill: PharmacyBill | null;
  hospitalLogo: string;
  onReprint: (bill: PharmacyBill) => void;
}

const SalesReceiptModal: React.FC<SalesReceiptModalProps> = ({
  isOpen,
  onClose,
  latestPharmacyBill,
  hospitalLogo,
  onReprint
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pharmacy Sales Receipt" size="lg">
      {latestPharmacyBill && (
        <div className="bg-white p-6 font-sans text-slate-800 space-y-4">
          <ReportLetterhead />
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-500">Bill No: </span>
              <span className="font-black text-slate-900">#{latestPharmacyBill.id}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500">Date: </span>
              <span className="font-black">
                {latestPharmacyBill.date} {latestPharmacyBill.time}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-500">Patient: </span>
              <span className="font-black">{latestPharmacyBill.patientName || "Walk-in"}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500">Payment: </span>
              <span className="font-black text-emerald-600">{latestPharmacyBill.paymentMode}</span>
            </div>
          </div>
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="bg-hospital-blue text-white">
                <th className="px-2 py-2 text-left">#</th>
                <th className="px-2 py-2 text-left">Medicine</th>
                <th className="px-2 py-2 text-center">Qty</th>
                <th className="px-2 py-2 text-right">MRP</th>
                <th className="px-2 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {latestPharmacyBill.items.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-2 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-2 py-2 font-bold">{item.name}</td>
                  <td className="px-2 py-2 text-center">{item.qty}</td>
                  <td className="px-2 py-2 text-right">₹{Number(item.mrp || 0).toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-black text-emerald-600">
                    ₹{Number(item.totalAmount || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end">
            <div className="w-56 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>₹{Number(latestPharmacyBill.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST / Tax</span>
                <span>₹{Number(latestPharmacyBill.gstTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid Amount</span>
                <span>₹{Number(latestPharmacyBill.paidAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-red-600">
                <span className="text-slate-500">Balance Due</span>
                <span>₹{Number(latestPharmacyBill.balance || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between bg-hospital-blue text-white px-3 py-2 rounded-lg font-black">
                <span>GRAND TOTAL</span>
                <span>₹{Number(latestPharmacyBill.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <button
              onClick={() => onReprint(latestPharmacyBill)}
              className="px-8 py-3 bg-hospital-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 hover:bg-blue-700 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Reprint Receipt</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SalesReceiptModal;
