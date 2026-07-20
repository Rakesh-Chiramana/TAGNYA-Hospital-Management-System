import React from "react";
import Modal from "../../../shared/components/Modal";
import { Zap, Package, Download } from "../../../shared/utils/icons";
import { Medicine } from "../services/pharmacyService";
import { generateMedicinePDF } from "../services/pharmacyPDFService";

interface Props {
  isViewOpen: boolean;
  onViewClose: () => void;
  isEditOpen: boolean;
  onEditClose: () => void;
  medicine: Medicine | null;
  onEditSubmit: (e: React.FormEvent) => void;
}

const MedicineDetailsModal: React.FC<Props> = ({ isViewOpen, onViewClose, isEditOpen, onEditClose, medicine, onEditSubmit }) => {
  if (!medicine) return null;

  return (
    <>
      <Modal isOpen={isViewOpen} onClose={onViewClose} title="Medicine Information">
        <div className="p-8 bg-white rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-12"><Zap className="w-96 h-96 text-hospital-blue/90 fill-current" /></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-hospital-blue/10 rounded-2xl flex items-center justify-center text-hospital-blue shadow-sm"><Package className="w-8 h-8" /></div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{medicine.name}</h3>
                <span className="text-[10px] font-mono text-hospital-blue font-black px-2 py-1 bg-hospital-blue/10 rounded-lg mt-1 inline-block">{medicine.id}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p><p className="text-sm font-black text-slate-900">{medicine.category || 'General'}</p></div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dosage</p><p className="text-sm font-black text-slate-900">{medicine.dosage || 'N/A'}</p></div>
            </div>
            <button onClick={() => generateMedicinePDF(medicine)} className="mt-8 w-full flex items-center justify-center space-x-2 px-8 py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl">
              <Download className="w-4 h-4" />
              <span>Download / Print Details PDF</span>
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={onEditClose} title="Edit Medicine Details">
        <form onSubmit={onEditSubmit} className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6"><h4 className="text-sm font-black text-slate-900">{medicine.name}</h4><p className="text-[10px] font-mono text-blue-500 font-black">{medicine.id}</p></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Price (₹)</label><input required name="price" type="number" step="0.01" defaultValue={medicine.price} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Stock Units</label><input required name="stock" type="number" defaultValue={medicine.stock} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none" /></div>
          </div>
          <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all">Update Medicine Info</button>
        </form>
      </Modal>
    </>
  );
};

export default MedicineDetailsModal;
