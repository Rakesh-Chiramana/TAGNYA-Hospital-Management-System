import React, { useState } from "react";
import Modal from "../../../shared/components/Modal";
import { Patient } from "../../../shared/types";
import { CreateLedgerPayload } from "../hooks/useLedger";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  submitting?: boolean;
  onSubmit: (payload: CreateLedgerPayload) => void;
}

const CreateLedgerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patients,
  submitting,
  onSubmit,
}) => {

  const [patientId, setPatientId] = useState("");
  const [department, setDepartment] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPatient = patients.find(
      (p) => String(p.id) === patientId
    );

    const payload: CreateLedgerPayload = {
      patient_id: selectedPatient
        ? Number(selectedPatient.id)
        : null,

      patient_name: selectedPatient?.name || "Guest",

      department,

      service_name: serviceName,

      amount: Number(amount),

      charges: {
        bedCharges: [],
        pharmacyCharges: [],
        nursingCharge: 0,
        miscCharge: 0,
        discount: 0,
        subtotal: Number(amount),
        total: Number(amount),
      },
    };


    await onSubmit(payload);

    onClose();
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Ledger Entry"
    >

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        {/* Patient */}
        <select
          value={patientId}
          onChange={(e)=>setPatientId(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">
            Select Patient
          </option>

          {patients.map((p)=>(
            <option
              key={p.id}
              value={p.id}
            >
              {p.name}
            </option>
          ))}

        </select>


        {/* Department */}
        <input
          value={department}
          onChange={(e)=>setDepartment(e.target.value)}
          placeholder="Department"
          className="w-full border p-2 rounded"
          required
        />


        {/* Service */}
        <input
          value={serviceName}
          onChange={(e)=>setServiceName(e.target.value)}
          placeholder="Service Name"
          className="w-full border p-2 rounded"
          required
        />


        {/* Amount */}
        <input
          type="number"
          value={amount}
          onChange={(e)=>setAmount(e.target.value)}
          placeholder="Amount"
          className="w-full border p-2 rounded"
          required
        />


        <div className="flex justify-end gap-2">

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200"
          >
            Cancel
          </button>


          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded bg-hospital-blue text-white"
          >
            {submitting ? "Saving..." : "Create"}
          </button>

        </div>

      </form>

    </Modal>
  );
};


export default CreateLedgerModal;