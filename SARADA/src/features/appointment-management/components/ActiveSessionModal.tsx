import React from "react";
import Modal from "../../../shared/components/Modal";
import {
  AlertCircle,
  User,
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Pill,
  CheckCircle,
} from "../../../shared/utils/icons";

interface VitalSigns {
  bp: string;
  heartRate: string;
  temp: string;
  spo2: string;
}
interface Prescription {
  name: string;
  dosage: string;
  frequency: string;
}
interface ActiveAppointment {
  name: string;
  dr: string;

  patientInfo?: {
    id: string;
    age: number;
    gender: string;
  };
}

interface ActiveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  validationError: string | null;
  activeApt: ActiveAppointment | null;
  handleFinishVisit: (e: React.FormEvent<HTMLFormElement>) => void;
  vitals: VitalSigns;
  setVitals: React.Dispatch<
    React.SetStateAction<VitalSigns>
  >;
  prescriptions: Prescription[];
  setPrescriptions: React.Dispatch<
    React.SetStateAction<Prescription[]>
  >;
  medName: string;
  setMedName: (val: string) => void;
  dosage: string;
  setDosage: (val: string) => void;
}

const ActiveSessionModal: React.FC<ActiveSessionModalProps> = ({
  isOpen,
  onClose,
  validationError,
  activeApt,
  handleFinishVisit,
  vitals,
  setVitals,
  prescriptions,
  setPrescriptions,
  medName,
  setMedName,
  dosage,
  setDosage,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Active Medical Session">
      <div className="space-y-8">
        {validationError && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-black uppercase tracking-tight">
              {validationError}
            </p>
          </div>
        )}
        <div className="flex justify-between items-start border-b border-slate-100 pb-8">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-emerald-200 transform hover:rotate-6 transition-transform">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {activeApt?.name}
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                {activeApt?.patientInfo?.id} • {activeApt?.patientInfo?.age}{" "}
                Years • {activeApt?.patientInfo?.gender}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Assigned Physician
            </p>
            <p className="text-base font-black text-emerald-600 leading-none">
              {activeApt?.dr}
            </p>
          </div>
        </div>

        <form onSubmit={handleFinishVisit} className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
              <Activity className="w-4 h-4 mr-2 text-emerald-500" />
              Patient Telemetry
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center space-x-1.5 mb-2">
                  <Heart className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                    BP (mmHg)
                  </span>
                </div>
                <input
                  required
                  type="text"
                  value={vitals.bp}
                  onChange={(e) =>
                    setVitals((prev) => ({ ...prev, bp: e.target.value }))
                  }
                  placeholder="120/80"
                  aria-label="Blood Pressure (mmHg)"
                  className="w-full bg-transparent text-lg font-black text-slate-900 outline-none"
                />
              </div>
              <div className="space-y-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center space-x-1.5 mb-2">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                    Pulse (BPM)
                  </span>
                </div>
                <input
                  required
                  type="number"
                  value={vitals.heartRate}
                  onChange={(e) =>
                    setVitals((prev) => ({
                      ...prev,
                      heartRate: e.target.value,
                    }))
                  }
                  placeholder="72"
                  aria-label="Heart Rate (BPM)"
                  className="w-full bg-transparent text-lg font-black text-slate-900 outline-none"
                />
              </div>
              <div className="space-y-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center space-x-1.5 mb-2">
                  <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                    Temp (°F)
                  </span>
                </div>
                <input
                  required
                  type="number"
                  value={vitals.temp}
                  onChange={(e) =>
                    setVitals((prev) => ({ ...prev, temp: e.target.value }))
                  }
                  placeholder="98.6"
                  aria-label="Body Temperature (°F)"
                  className="w-full bg-transparent text-lg font-black text-slate-900 outline-none"
                />
              </div>
              <div className="space-y-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center space-x-1.5 mb-2">
                  <Droplets className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                    SpO2 (%)
                  </span>
                </div>
                <input
                  required
                  type="number"
                  value={vitals.spo2}
                  onChange={(e) =>
                    setVitals((prev) => ({ ...prev, spo2: e.target.value }))
                  }
                  placeholder="98"
                  aria-label="Oxygen Saturation (%)"
                  className="w-full bg-transparent text-lg font-black text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Clinical Diagnosis
              </label>
              <textarea
                required
                name="diagnosis"
                rows={3}
                aria-label="Clinical Diagnosis"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                placeholder="Enter diagnostic conclusions..."
              ></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Treatment Observation
              </label>
              <textarea
                required
                name="clinicalNotes"
                rows={3}
                aria-label="Treatment Observations and Notes"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                placeholder="Enter clinical observations..."
              ></textarea>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center">
              <Pill className="w-4 h-4 mr-2 text-emerald-500" />
              Clinical Rx Transcription
            </h4>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4 shadow-inner">
              <div className="flex gap-3">
                <input
                  id="medName"
                  name="medName"
                  type="text"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="Rx Molecule..."
                  aria-label="Medication Name"
                  className="flex-[2] px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm"
                />
                <input
                  id="dosage"
                  name="dosage"
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="Dosage..."
                  aria-label="Medication Dosage"
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm"
                />
                <button
                  type="button"
                  aria-label="Add prescription to the list"
                  onClick={() => {
                    if (medName && dosage) {
                      setPrescriptions((prev) => [
                        ...prev,
                        { name: medName, dosage, frequency: "Daily" },
                      ]);
                      setMedName("");
                      setDosage("");
                    }
                  }}
                  className="bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  Add Rx
                </button>
              </div>
              <div className="space-y-3">
                {prescriptions.map((med, idx) => (
                  <div
                    key={`${med.name}-${idx}`}
                    className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-xs font-black text-emerald-600">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                          {med.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          {med.dosage} • Routine Dispense
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${med.name} from prescription list`}
                      onClick={() =>
                        setPrescriptions((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex gap-4">
            <button
              type="button"
              aria-label="Discard this clinical session without saving"
              onClick={onClose}
              className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all active:scale-95"
            >
              Discard Session
            </button>
            <button
              type="submit"
              aria-label="Submit and finalize the electronic medical record"
              className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 hover:bg-emerald-700 shadow-2xl shadow-emerald-100 transition-all active:scale-[0.98]"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Submit & Finalize EMR</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ActiveSessionModal;
