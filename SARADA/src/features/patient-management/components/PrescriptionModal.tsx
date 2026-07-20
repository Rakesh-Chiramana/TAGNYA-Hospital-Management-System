import React from "react";
import Modal from "../../../shared/components/Modal";
import { Patient } from "../../../shared/types";
import HospitalHeader from "../../../shared/components/HospitalHeader";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedPrescriptionPatient: Patient | null;
}

const PrescriptionModal: React.FC<Props> = ({ isOpen, onClose, selectedPrescriptionPatient }) => {
  if (!selectedPrescriptionPatient) return null;

  const p = selectedPrescriptionPatient;

  const today = new Date();
  const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div>
        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * { visibility: hidden !important; }
            #rx-prescription-pad, #rx-prescription-pad * { visibility: visible !important; }
            #rx-prescription-pad {
              position: absolute !important;
              left: 0 !important; top: 0 !important;
              width: 210mm !important;
              margin: 0 !important; padding: 8mm !important;
              box-shadow: none !important; border-radius: 0 !important;
              border: none !important;
            }
            .rx-no-print { display: none !important; }
          }
        `}} />

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mb-4 rx-no-print">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.615 0-1.11-.497-1.12-1.127L6.34 18m11.32 0h-11.32" /></svg>
            <span>Print</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Close
          </button>
        </div>

        {/* ============ PRESCRIPTION PAD ============ */}
        <div
          id="rx-prescription-pad"
          style={{
            background: "#fff",
            border: "1px solid #cbd5e1",
            borderRadius: "0.5rem",
            fontFamily: "'Inter', Arial, sans-serif",
            maxWidth: "800px",
            margin: "0 auto",
            position: "relative",
            height: "1100px",
          }}
        >
          {/* Hospital Header — reuses existing project component */}
          <HospitalHeader variant="large" />

          {/* Patient Info + Vitals Row */}
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #dce6f2" }}>
            {/* Left: Patient Details */}
            <div style={{ flex: "1 1 55%", padding: "14px 20px", display: "flex", gap: "24px" }}>
              {/* Col-1 */}
              <div style={{ flex: 1, lineHeight: 2 }}>
                <InfoRow label="MR No." value={p.id} />
                <InfoRow label="Patient Name" value={p.name} />
                <InfoRow label="Type" value={p.type === "IP" ? "IP ADMISSION" : "OP CONSULTATION"} />
                <InfoRow label="Doctor Name" value={`DR. ${(p.doctor || "N/A").toUpperCase()}`} />
              </div>
              {/* Col-2 */}
              <div style={{ flex: 1, lineHeight: 2 }}>
                <InfoRow label="Date & Time" value={formattedDate} />
                <InfoRow label="Age / Sex" value={`${p.age} / ${(p.gender || "").toUpperCase()}`} />
                <InfoRow label="Address" value={p.address || "NLR"} />
                <InfoRow label="Mobile No" value={p.contact || "N/A"} />
              </div>
            </div>

            {/* Right: Vitals box */}
            <div style={{ flex: "0 0 200px", borderLeft: "1px solid #dce6f2" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                <tbody>
                  {["BP", "TEMP", "WEIGHT", "PR", "SPO2"].map((v) => (
                    <tr key={v} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "5px 10px", fontWeight: 700, color: "#475569", textTransform: "uppercase", fontSize: "10px", width: "60px" }}>{v}</td>
                      <td style={{ padding: "5px 2px", fontWeight: 700, color: "#475569", width: "10px" }}>:</td>
                      {[1,2,3,4,5].map((i) => (
                        <td key={i} style={{ borderLeft: "1px solid #e2e8f0", width: "24px", height: "24px", textAlign: "center", padding: 0 }}>
                          <input
                            type="text"
                            maxLength={1}
                            style={{
                              width: "100%", height: "100%", border: "none", outline: "none",
                              textAlign: "center", fontSize: "11px", fontWeight: 800,
                              background: "transparent",
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signature Block — pinned to absolute bottom-right of the full page */}
          <div style={{ position: "absolute", bottom: "30px", right: "36px" }}>
            <div style={{ textAlign: "center", width: "220px" }}>
              <p style={{ fontSize: "13px", fontWeight: 900, color: "#0f172a", textTransform: "uppercase", letterSpacing: "2px", margin: 0 }}>
                Authorized Specialist
              </p>
              <p style={{ fontSize: "10px", fontWeight: 600, color: "#64748b", margin: "3px 0 0" }}>
                Medical Council Reg. No. QN-465
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

/* Small helper for patient info rows */
const InfoRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div style={{ display: "flex", gap: "6px", fontSize: "11px" }}>
    <span style={{ minWidth: "85px", fontWeight: 600, color: "#64748b" }}>{label}</span>
    <span style={{ fontWeight: 600, color: "#64748b" }}>:</span>
    <span style={{ fontWeight: 800, color: "#0f172a" }}>{String(value).toUpperCase()}</span>
  </div>
);

export default PrescriptionModal;
