import React from "react";
import Modal from "../../../shared/components/Modal";
import LabReport from "../../../shared/components/LabReport";

interface Props {
  report: any | null;
  onClose: () => void;
}

const LabReportModal: React.FC<Props> = ({ report, onClose }) => {
  return (
    <Modal isOpen={!!report} onClose={onClose} title="Lab Investigation Report">
      {report && (
        <div>
          <div id="printable-report">
            <LabReport test={report} />
          </div>
          <div className="mt-8 flex justify-center space-x-4 print:hidden">
            <button onClick={() => window.print()} className="flex items-center space-x-3 px-10 py-4 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-hospital-blue transition-all shadow-2xl">
              <span>Print PDF</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default LabReportModal;
