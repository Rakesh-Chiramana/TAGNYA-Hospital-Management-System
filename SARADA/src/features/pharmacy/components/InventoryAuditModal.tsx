import React from "react";
import Modal from "../../../shared/components/Modal";
import { Search, Calendar } from "../../../shared/utils/icons";
import { Medicine } from "../services/pharmacyService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  filteredMedicines: Medicine[];
  onEdit: (m: Medicine) => void;
  onView: (m: Medicine) => void;
}

const InventoryAuditModal: React.FC<Props> = ({ isOpen, onClose, searchTerm, setSearchTerm, filteredMedicines, onEdit, onView }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Medicine Inventory Management" size="full">
      <div className="space-y-6 min-h-[600px]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search className="w-4 h-4" /></div>
            <input type="text" value={searchTerm} placeholder="Search medicine..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center space-x-3"><Calendar className="w-4 h-4 text-hospital-blue" /><span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{new Date().toLocaleDateString('en-GB')}</span></div>
        </div>
        <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr><th className="px-6 py-5">Code</th><th className="px-6 py-5">Medicine Name</th><th className="px-6 py-5">Vendor Name</th><th className="px-6 py-5">Category</th><th className="px-6 py-5">In Stock</th><th className="px-6 py-5">Unit</th><th className="px-6 py-5">Price (₹)</th><th className="px-6 py-5">Expiry</th><th className="px-6 py-5 text-center">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 text-[10px] font-black text-slate-400 font-mono">{m.id}</td>
                  <td className="px-6 py-5"><span className="text-xs font-black text-slate-900">{m.name}</span></td>
                  <td className="px-6 py-5"><span className="text-xs font-semibold text-slate-600">{m.vendorName || 'N/A'}</span></td>
                  <td className="px-6 py-5"><span className="text-xs font-medium text-slate-500">{m.category || 'General'}</span></td>
                  <td className="px-6 py-5"><span className={`text-xs font-black ${m.stock < 100 ? 'text-red-500' : 'text-slate-900'}`}>{m.stock}</span></td>
                  <td className="px-6 py-5"><span className="text-[10px] font-black text-slate-400 uppercase">{m.unit || 'Tablets'}</span></td>
                  <td className="px-6 py-5"><span className="text-xs font-black text-slate-900">₹{(m.price).toFixed(0)}</span></td>
                  <td className="px-6 py-5"><span className="text-[10px] font-black text-slate-400 font-mono">{m.expiry}</span></td>
                  <td className="px-6 py-5 text-center">
                    <button onClick={() => onEdit(m)} className="px-3 py-1.5 bg-hospital-blue/10 text-hospital-blue rounded-lg text-[9px] font-black uppercase">Edit</button>
                    <button onClick={() => onView(m)} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase ml-2">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};

export default InventoryAuditModal;
