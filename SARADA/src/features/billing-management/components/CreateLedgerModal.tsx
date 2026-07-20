import React from "react";
import Modal from "../../../shared/components/Modal";
import { Patient } from "../../../shared/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  submitting?: boolean;
  onSubmit: (payload: any) => Promise<any> | any;
}

const CreateLedgerModal: React.FC<Props> = ({ isOpen, onClose, patients, submitting, onSubmit }) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {};
    try {
      await onSubmit(payload);
    } finally {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Ledger Entry">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-500">This is a lightweight placeholder for Create Ledger modal.</p>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
          <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-hospital-blue text-white">{submitting ? 'Saving...' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateLedgerModal;
