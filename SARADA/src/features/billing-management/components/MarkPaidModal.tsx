import React, { useState } from "react";
import Modal from "../../../shared/components/Modal";
import { IndianRupee } from "../../../shared/utils/icons";

const PAYMENT_MODES = ["Cash", "Card", "UPI", "Net Banking", "Insurance", "Cheque"];

interface Props {
  amount: number;
  onClose: () => void;
  onSubmit: (paymentMode: string) => Promise<void>;
}

const MarkPaidModal: React.FC<Props> = ({ amount, onClose, onSubmit }) => {
  const [mode, setMode] = useState(PAYMENT_MODES[0]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(mode);
    setSaving(false);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Mark Entry as Paid">
      <form onSubmit={handleSubmit} className="space-y-8 animate-scale-in">
        {/* Amount display */}
        <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200">
            <IndianRupee className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">
              Amount to Settle
            </p>
            <p className="text-2xl font-black text-emerald-900 tracking-tight">
              ₹ {amount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Payment Mode */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Payment Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                  mode === m
                    ? "bg-hospital-blue text-white border-hospital-blue shadow-md"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-hospital-blue/40"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-2xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing…</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Confirm Payment</span>
            </>
          )}
        </button>
      </form>
    </Modal>
  );
};

export default MarkPaidModal;
