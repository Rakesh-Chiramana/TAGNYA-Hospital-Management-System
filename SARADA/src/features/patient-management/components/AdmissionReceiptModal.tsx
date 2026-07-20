import React from "react";
import Modal from "../../../shared/components/Modal";
import HospitalHeader from "../../../shared/components/HospitalHeader";
import { Heart, IndianRupee, Download, FileText } from "../../../shared/utils/icons";
import { Patient } from "../../../shared/types";

interface AdmissionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  latestPatient: Patient | null;
  generateAdmissionPDF: (patient: Patient) => void;
}

const AdmissionReceiptModal: React.FC<AdmissionReceiptModalProps> = ({
  isOpen,
  onClose,
  latestPatient,
  generateAdmissionPDF,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admission & Registration Complete">
      {latestPatient && (
        <div className="relative p-8 bg-white rounded-3xl overflow-hidden printable-prescription" id="printable-bill">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-12">
            <Heart className="w-96 h-96 text-hospital-blue/10 fill-current" />
          </div>

          <div className="relative z-10">
            <HospitalHeader variant="large" />

            <div className="grid grid-cols-2 gap-y-6 mb-8">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Name</p>
                <p className="text-sm font-black text-slate-900">{latestPatient.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinical Serial</p>
                <p className="text-sm font-black text-hospital-blue font-mono">{latestPatient.serial}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Specialist</p>
                <p className="text-xs font-bold text-slate-700">{latestPatient.doctor}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient ID</p>
                <p className="text-xs font-bold text-slate-700">{latestPatient.id}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                <p className="text-xs font-bold text-slate-700">{latestPatient.gender}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Age</p>
                <p className="text-xs font-bold text-slate-700">{latestPatient.age} Years</p>
              </div>
              <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reason for Visit</p>
                <p className="text-xs font-bold text-slate-700">{latestPatient.cause}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500">Consultation Fee</span>
                <div className="flex items-center space-x-1 text-sm font-black text-slate-900">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>{latestPatient.fee.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Amount</span>
                <div className="flex items-center space-x-2 text-xl font-black text-hospital-blue">
                  <IndianRupee className="w-5 h-5" />
                  <span>{latestPatient.fee.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <p className="text-[8px] font-bold text-slate-400 mt-4 uppercase tracking-widest text-center">
                Payment Method: {latestPatient.paymentMethod}
              </p>
            </div>

            <div className="flex justify-between items-end">
              <div className="text-center">
                <div className="w-32 h-1 bg-slate-200 mb-2"></div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Patient Signature</p>
              </div>
              <div className="text-center">
                {latestPatient.signature && (
                  <img src={latestPatient.signature} alt="Signature" className="h-10 mx-auto mb-1 opacity-80" />
                )}
                <div className="w-32 h-1 bg-slate-200 mb-2"></div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 text-center">
              <p className="text-[9px] font-bold text-slate-400">
                This is a computer generated document. No physical signature required.
              </p>
              <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-4 print:hidden">
                <button
                  onClick={() => generateAdmissionPDF(latestPatient)}
                  className="flex items-center space-x-3 px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-100"
                >
                  <FileText className="w-4 h-4" />
                  <span>Print Official Bill</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AdmissionReceiptModal;
