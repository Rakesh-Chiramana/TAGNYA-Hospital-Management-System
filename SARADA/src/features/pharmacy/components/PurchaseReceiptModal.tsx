import React from "react";
import Modal from "../../../shared/components/Modal";
import ReportLetterhead from "../../../shared/components/ReportLetterhead";
import { Download } from "../../../shared/utils/icons";

interface PurchaseReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  latestBulkOrderBill: any;
  hospitalLogo: string;
  onReprint: (bill: any) => void;
}

const PurchaseReceiptModal: React.FC<PurchaseReceiptModalProps> = ({
  isOpen,
  onClose,
  latestBulkOrderBill,
  hospitalLogo,
  onReprint
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Purchase Bill Receipt" size="lg">
      {latestBulkOrderBill && (
        <div className="bg-white p-6 font-sans text-slate-800 space-y-4">
          <ReportLetterhead />
          <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest text-center -mt-2 mb-2">
            Procurement &amp; Purchase Department
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-500">Internal ID: </span>
              <span className="font-black text-slate-900">#{latestBulkOrderBill.id}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500">Date: </span>
              <span className="font-black">{latestBulkOrderBill.date}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500">Time: </span>
              <span className="font-black">
                {latestBulkOrderBill.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-500">Supplier: </span>
              <span className="font-black">{latestBulkOrderBill.vendor || "General Supplier"}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500">Invoice / Bill: </span>
              <span className="font-black">
                Inv: {latestBulkOrderBill.invoiceNo || "-"} / Bill: {latestBulkOrderBill.billNo || "-"}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-500">Payment Mode: </span>
              <span className="font-black text-purple-700">{latestBulkOrderBill.paymentMode || "Credit"}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500">GSTIN: </span>
              <span className="font-black">{latestBulkOrderBill.gstNo || latestBulkOrderBill.vendorGstNo || "-"}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500">Drug Lic. No: </span>
              <span className="font-black">{latestBulkOrderBill.dlNo || latestBulkOrderBill.vendorDlNo || "-"}</span>
            </div>
          </div>
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="px-2 py-2 text-left">#</th>
                <th className="px-2 py-2 text-left">Medicine</th>
                <th className="px-2 py-2 text-center">Qty</th>
                <th className="px-2 py-2 text-center">Free</th>
                <th className="px-2 py-2 text-right">Buy Price</th>
                <th className="px-2 py-2 text-right">MRP</th>
                <th className="px-2 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {latestBulkOrderBill.items.map((item: any, i: number) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-2 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-2 py-2 font-bold">{item.name}</td>
                  <td className="px-2 py-2 text-center">{item.qty}</td>
                  <td className="px-2 py-2 text-center">{item.qtyFree || 0}</td>
                  <td className="px-2 py-2 text-right">₹{Number(item.buyPrice || 0).toFixed(2)}</td>
                  <td className="px-2 py-2 text-right">₹{Number(item.mrp || 0).toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-black text-purple-700">
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
                <span>₹{Number(latestBulkOrderBill.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST / Tax</span>
                <span>₹{Number(latestBulkOrderBill.gstTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid Amount</span>
                <span>₹{Number(latestBulkOrderBill.paidAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-red-600">
                <span className="text-slate-500">Balance Due</span>
                <span>₹{Number(latestBulkOrderBill.balance || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between bg-purple-600 text-white px-3 py-2 rounded-lg font-black">
                <span>GRAND TOTAL</span>
                <span>₹{Number(latestBulkOrderBill.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <button
              onClick={() => onReprint(latestBulkOrderBill)}
              className="px-8 py-3 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 hover:bg-purple-700 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Reprint Purchase Bill</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PurchaseReceiptModal;
