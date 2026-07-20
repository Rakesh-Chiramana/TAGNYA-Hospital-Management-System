import { useState, useEffect, useCallback } from "react";

const BASE = "http://localhost:5000";

export interface LedgerEntry {
  id: number;
  ledger_no: string;
  patient_id: number | null;
  patient_name: string;
  department: string;
  service_name: string;
  amount: number;
  reference_id: string | null;
  payment_status: "Pending" | "Paid";
  created_at: string;
  charges?: any; 
}

export interface CreateLedgerPayload {
  patient_id: number | null;
  patient_name: string;
  department: string;
  service_name: string;
  amount: number;
  reference_id?: string;
  charges?: any;  
}

export const useLedger = () => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE}/list`);
      if (!res.ok) throw new Error("Failed to fetch ledger");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setEntries(data.data);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = async (payload: CreateLedgerPayload): Promise<boolean> => {
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to create ledger entry");
        return false;
      }
      await fetchEntries();
      return true;
    } catch (err: any) {
      alert("Network error: " + err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const markPaid = async (
    id: number,
    paymentMode: string,
    amount: number
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE}/paid/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMode, amount }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to mark as paid");
        return false;
      }
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, payment_status: "Paid" } : e
        )
      );
      return true;
    } catch (err: any) {
      alert("Network error: " + err.message);
      return false;
    }
  };

  const deleteEntry = (id: number) => {
    if (!window.confirm("Delete this ledger entry?")) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const filteredEntries =
    filterStatus === "All"
      ? entries
      : entries.filter((e) => e.payment_status === filterStatus);

  const totalRevenue = entries.reduce((acc, e) => acc + Number(e.amount), 0);
  const pendingCount = entries.filter((e) => e.payment_status === "Pending").length;
  const paidCount = entries.filter((e) => e.payment_status === "Paid").length;

  return {
    entries,
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
  };
};
