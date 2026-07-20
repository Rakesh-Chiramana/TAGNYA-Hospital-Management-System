import React from "react";
import Modal from "../../../shared/components/Modal";
import { UserPlus, Receipt, PenTool } from "../../../shared/utils/icons";
import { Patient } from "../../../shared/types";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientFirstName: string;
  setPatientFirstName: (val: string) => void;
  patientLastName: string;
  setPatientLastName: (val: string) => void;
  selectedDoctor: string;
  setSelectedDoctor: (val: string) => void;
  doctors: any[];
  DOCTOR_FEES: Record<string, number>;
  followUp: { fee: number; status: string; discount: number };
  handleRegister: (e: React.FormEvent) => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  patientFirstName,
  setPatientFirstName,
  patientLastName,
  setPatientLastName,
  selectedDoctor,
  setSelectedDoctor,
  doctors,
  DOCTOR_FEES,
  followUp,
  handleRegister
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setPatientFirstName("");
        setPatientLastName("");
      }}
      title="Patient Registration"
      size="2xl"
    >
      <div className="registration-compact-form w-full max-w-full">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] -mt-4 mb-6 flex items-center gap-2">
          <UserPlus className="w-3 h-3" />
          New Admission Entry Protocol
        </p>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Row 1: Primary Identity */}
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name *</label>
              <input
                required
                name="firstName"
                type="text"
                placeholder="First Name"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                value={patientFirstName}
                onChange={(e) => setPatientFirstName(e.target.value)}
              />
            </div>
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name *</label>
              <input
                required
                name="lastName"
                type="text"
                placeholder="Last Name"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                value={patientLastName}
                onChange={(e) => setPatientLastName(e.target.value)}
              />
            </div>
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Age *</label>
              <input
                required
                name="age"
                type="number"
                placeholder="Age"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Gender</label>
              <select name="gender" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Row 2: Contact & Secondary Info */}
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Mobile No *</label>
              <input
                required
                name="contact"
                type="tel"
                placeholder="+91"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="email@example.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Date of Birth</label>
              <input
                name="dob"
                type="date"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Blood Group</label>
              <select name="bloodGroup" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                <option value="N/A">Unknown</option>
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
              </select>
            </div>

            {/* Row 3: Clinical & Emergency */}
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Weight (KG)</label>
              <input
                name="weight"
                type="number"
                step="0.1"
                placeholder="0.0"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Assign Doctor *</label>
              <select
                required
                name="doctor"
                className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                <option value="">Select Dr.</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.name}>{doc.name}</option>
                ))}
                {doctors.length === 0 && Object.keys(DOCTOR_FEES).map((doc) => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Emergency Name</label>
              <input
                name="emergencyName"
                type="text"
                placeholder="Guardian Name"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Emergency Phone</label>
              <input
                name="emergencyContact"
                type="tel"
                placeholder="Phone No"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            {/* Row 4: Reason & Payment Info */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Reason for Visit / Complaint *</label>
              <input
                required
                name="cause"
                type="text"
                placeholder="Describe symptoms..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Method</label>
              <select name="paymentMethod" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                <option>Cash</option>
                <option>UPI / QR Scan</option>
                <option>Card</option>
              </select>
            </div>
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Residential Address</label>
              <input
                required
                name="address"
                type="text"
                placeholder="House No, Area, City..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Footer Summary & Actions */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Consultation Fee</span>
                <span className="text-xl font-black text-emerald-600 flex items-center gap-1">
                  ₹{followUp.fee.toLocaleString('en-IN')}
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight ml-2">{followUp.status}</span>
                </span>
              </div>
              <div className="h-10 w-px bg-slate-100 hidden md:block"></div>
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                  <Receipt className="w-4 h-4" />
                </div>
                <p className="text-[9px] font-bold text-slate-400 max-w-[140px] leading-tight">Registration fee is included in the consultation amount.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 md:flex-none px-6 py-3 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] md:flex-none px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
              >
                <PenTool className="w-3.5 h-3.5" />
                Finalize Admission
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RegistrationModal;
