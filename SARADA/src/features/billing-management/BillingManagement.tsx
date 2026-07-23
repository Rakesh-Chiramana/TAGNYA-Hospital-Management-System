import React, { useMemo, useState } from "react";
import "./styles/billing-management.css";
import { Patient, Bed, Invoice } from "../../shared/types";
import {useLedger,CreateLedgerPayload,} from "./hooks/useLedger";
import { useBillingManagement } from "./hooks/useBillingManagement";

// Subcomponents
import RevenueStats from "./components/RevenueStats";
import LedgerTable from "./components/LedgerTable";
import MasterBillOverlay from "./components/MasterBillOverlay";
import CreateLedgerModal from "./components/CreateLedgerModal";
import MarkPaidModal from "./components/MarkPaidModal";




interface Props {
  invoices: Invoice[];
  onAddInvoice: (i:any)=>void;
  onDeleteInvoice:(id:string)=>void;
  patients: Patient[];
  beds: Bed[];
}

const BillingManagement: React.FC<Props> = ({ patients, beds }) => {
  const {
    filteredEntries,
    loading,
    error,
    submitting,
    filterStatus,
    setFilterStatus,
    createEntry,
    markPaid,
    deleteEntry,
    fetchEntries,
    totalRevenue,
    pendingCount,
    paidCount,
  } = useLedger();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [payingEntry, setPayingEntry] = useState<{ id: number; amount: number } | null>(null);

  // Map Ledger Entries to Invoices so they show up in the Master Settlement report
 // Map Ledger Entries to Invoices so they show up in the Master Settlement report
const mappedInvoices: Invoice[] = useMemo(() => {
  return filteredEntries.map((e): Invoice => ({
    id: e.ledger_no,
    name: e.patient_name,
    patientId: e.patient_id ? `P-${e.patient_id}` : "GUEST",
    services: `${e.department} - ${e.service_name}`,
    amount: `₹${Number(e.amount).toFixed(0)}`,
    status: e.payment_status,
    paymentMethod: e.payment_mode || "N/A",
    date: e.created_at
      ? new Date(e.created_at).toLocaleDateString()
      : new Date().toLocaleDateString(),
    time: e.created_at
      ? new Date(e.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
    charges: e.charges,
  }));
}, [filteredEntries]);

  // MasterBill overlay (print) — reuse existing logic for patient billing report
  const { selectedPatientBill, setSelectedPatientBill, generateMasterBill, totalSum } =
    useBillingManagement(
  mappedInvoices,
  patients,
  beds
);

    const closeCreateModal = () => {
  setIsCreateOpen(false);
};

const handleCreateLedger = async (payload: CreateLedgerPayload) => {
  const ok = await createEntry(payload);

  if (ok) {
    setIsCreateOpen(false);
  }
};

const closePaymentModal = () => {
  setPayingEntry(null);
};

const handleMarkPaid = async (paymentMode: string) => {
  if (!payingEntry) return;

  await markPaid(
    payingEntry.id,
    paymentMode,
    payingEntry.amount
  );

  setPayingEntry(null);
};
  return (
    <div className="billing-container">
      {/* Revenue Stats */}
      <RevenueStats
        totalRevenue={totalRevenue}
        pendingCount={pendingCount}
        paidCount={paidCount}
        totalCount={filteredEntries.length}
      />

      {/* Error banner */}
      {error && (
        <div className="px-6 py-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600 flex items-center justify-between">
          <span>⚠ {error}</span>
          <button
            onClick={fetchEntries}
            className="ml-4 px-3 py-1 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Ledger Table */}
      <LedgerTable
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        setIsModalOpen={setIsCreateOpen}
        filteredEntries={filteredEntries}
        loading={loading}
        patients={patients}
        generateMasterBill={generateMasterBill}
        onMarkPaid={(id, amount) => setPayingEntry({ id, amount })}
        onDelete={deleteEntry}
      />

      {/* Master Bill Print Overlay */}
      {selectedPatientBill && (
        <MasterBillOverlay
          selectedPatientBill={selectedPatientBill}
          setSelectedPatientBill={setSelectedPatientBill}
          totalSum={totalSum}
        />
      )}

      {/* Create Ledger Entry Modal */}
      <CreateLedgerModal
        isOpen={isCreateOpen}
        onClose={closeCreateModal}
        patients={patients}
        submitting={submitting}
        onSubmit={handleCreateLedger}
      />

      {/* Mark Paid Modal */}
      {payingEntry && (
       <MarkPaidModal
        amount={payingEntry.amount}
         onSubmit={handleMarkPaid}
         onClose={closePaymentModal}
       />
      )}
    </div>
  );
};

export default BillingManagement;
