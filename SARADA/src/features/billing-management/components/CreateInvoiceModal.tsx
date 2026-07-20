import React from "react";
import { Patient } from "../../../shared/types";
import Modal from "../../../shared/components/Modal";
import { IndianRupee, Receipt } from "../../../shared/utils/icons";
import BillingData from "../data/billingMockData.json";

interface CreateInvoiceModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  handleBillSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  patients: Patient[];
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  handleBillSubmit,
  patients,
}) => {
  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Generate Clinical Invoice"
    >
      <form onSubmit={handleBillSubmit} className="space-y-8 animate-scale-in">
        <div className="p-6 bg-hospital-blue/10 rounded-[2rem] border border-hospital-blue/10 flex items-start space-x-4">
          <div className="w-12 h-12 bg-hospital-blue rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-hospital-blue/20">
            <IndianRupee className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-black text-hospital-blue/90 uppercase tracking-widest">
              Revenue Generation
            </h4>
            <p className="text-xs font-medium text-hospital-blue mt-1">
              Select a patient to raise a department-specific charge. All entries
              are pushed to the master ledger automatically.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Select Patient Identity
          </label>
          <div className="relative group">
            <input
              required
              name="patientName"
              type="text"
              list="patient-list"
              className="w-full px-5 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black focus:ring-4 focus:ring-hospital-blue/10 outline-none transition-all"
              placeholder="Patient Name..."
            />
            <datalist id="patient-list">
              {patients.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="service" className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Service Department
            </label>
            <select
              id="service"
              name="service"
              className="w-full px-5 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-hospital-blue/10 transition-all appearance-none"
            >
              {BillingData.serviceDepartments.map((dept) => (
                <option key={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Amount (₹)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <IndianRupee className="w-4 h-4 text-slate-400" />
              </div>
              <input
                required
                name="amount"
                type="number"
                step="0.01"
                className="w-full pl-12 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-6 bg-hospital-blue text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-hospital-blue/70 shadow-2xl shadow-hospital-blue/10 transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          <Receipt className="w-5 h-5" />
          <span>Generate Ledger Entry</span>
        </button>
      </form>
    </Modal>
  );
};

export default CreateInvoiceModal;
