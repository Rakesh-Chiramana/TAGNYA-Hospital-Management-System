import React from "react";
import Modal from "../../../shared/components/Modal";
import { PenTool, Receipt } from "lucide-react";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientFirstName: string;
  setPatientFirstName: (val: string) => void;
  patientLastName: string;
  setPatientLastName: (val: string) => void;
  selectedDoctor: string;
  setSelectedDoctor: (val: string) => void;
  doctors: { id: string; name: string }[];
  DOCTOR_FEES: Record<string, number>;
  followUp: { fee: number; status: string };
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
      title="PATIENT REGISTRATION"
      size="2xl"
    >
      <div className="w-full px-1 py-1">
        <form onSubmit={handleRegister} className="space-y-3">
          {/* 4-Column Grid with compact padding to ensure column 4 & buttons fit on all screens */}
          <div className="grid grid-cols-4 gap-x-3 gap-y-2.5">
            {/* Row 1 */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">FIRST NAME *</label>
              <input
                required
                name="firstName"
                type="text"
                placeholder="First Name"
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200/70 rounded-lg text-[11px] font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
                value={patientFirstName}
                onChange={(e) => setPatientFirstName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">LAST NAME *</label>
              <input
                required
                name="lastName"
                type="text"
                placeholder="Last Name"
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200/70 rounded-lg text-[11px] font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
                value={patientLastName}
                onChange={(e) => setPatientLastName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">AGE *</label>
              <input
                required
                name="age"
                type="number"
                placeholder="Age"
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200/70 rounded-lg text-[11px] font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">GENDER</label>
              <select name="gender" className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200/70 rounded-lg text-[11px] font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Row 2 */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">MOBILE NO *</label>
              <input
                required
                name="contact"
                type="tel"
                placeholder="+91"
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200/70 rounded-lg text-[11px] font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">EMAIL ADDRESS</label>
              <input
                name="email"
                type="email"
                placeholder="email@example.com"
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200/70 rounded-lg text-[11px] font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">DATE OF BIRTH</label>
              <input
                name="dob"
                type="date"
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200/70 rounded-lg text-[11px] font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">BLOOD GROUP</label>
              <select name="bloodGroup" className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200/70 rounded-lg text-[11px] font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all">
                <option value="N/A">Unknown</option>
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
              </select>
            </div>

            {/* Row 3 */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">WEIGHT (KG)</label>
              <input
                name="weight"
                type="number"
                step="0.1"
                placeholder="0.0"
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200/70 rounded-lg text-[11px] font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">ASSIGN DOCTOR *</label>
              <select
                required
                name="doctor"
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200/70 rounded-lg text-[11px] font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
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

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">EMERGENCY NAME</label>
              <input
                name="emergencyName"
                type="text"
                placeholder="Guardian Name"
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200/70 rounded-lg text-[11px] font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">EMERGENCY PHONE</label>
              <input
                name="emergencyContact"
                type="tel"
                placeholder="Phone No"
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200/70 rounded-lg text-[11px] font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
              />
            </div>

            {/* Row 4 */}
            <div className="col-span-2 space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">REASON FOR VISIT / COMPLAINT *</label>
              <input
                required
                name="cause"
                type="text"
                placeholder="Describe symptoms..."
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200/70 rounded-lg text-[11px] font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
              />
            </div>

            <div className="col-span-1 space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">PAYMENT METHOD</label>
              <select name="paymentMethod" className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200/70 rounded-lg text-[11px] font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all">
                <option>Cash</option>
                <option>UPI / QR Scan</option>
                <option>Card</option>
              </select>
            </div>

            <div className="col-span-1 space-y-1">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-wider block">RESIDENTIAL ADDRESS</label>
              <input
                required
                name="address"
                type="text"
                placeholder="House No, Area, City..."
                className="w-full px-2.5 py-1.5 bg-[#F8FAFC] border border-slate-200/70 rounded-lg text-[11px] font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Footer Summary & Actions */}
          <div className="flex items-center justify-between gap-4 pt-3 mt-1 border-t border-slate-100">
            <div className="flex items-center gap-5">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CONSULTATION FEE</span>
                <span className="text-lg font-black text-sky-600 flex items-center gap-1.5 mt-0.5">
                  ₹{followUp.fee.toLocaleString('en-IN')}
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider ml-1">{followUp.status}</span>
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600 border border-sky-100">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
                <p className="text-[9px] font-bold text-slate-400 max-w-[150px] leading-tight">Registration fee is included in the consultation amount.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#0F172A] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <PenTool className="w-3.5 h-3.5" />
                FINALIZE ADMISSION
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RegistrationModal;
