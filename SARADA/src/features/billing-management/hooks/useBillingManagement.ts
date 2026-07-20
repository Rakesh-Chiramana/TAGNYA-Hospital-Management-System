import React, { useState, useMemo } from "react";
import { Invoice, Patient, Bed } from "../../../shared/types";

import BillingData from "../data/billingMockData.json";

export interface MasterBillItem {
  date: string;
  time: string;
  description: string;
  amount: number;
}

export interface MasterBill {
  patient: Patient;
  bed: Bed | undefined;
  days: number;
  bedCharge: number;
  items: MasterBillItem[];
  chargesBreakdown?: {          // 👈 ADD whole block
  bedCharges: { type: string; days: number; rate: number; amount: number }[];
  pharmacyCharges: { medicine: string; quantity: number; rate: number; amount: number }[];
  nursingCharge: number;
  miscCharge: number;
  discount: number;
  subtotal: number;
  total: number;
  }
}

export const useBillingManagement = (
  invoices: Invoice[],
  onAddInvoice: (i: Invoice) => void,
  onDeleteInvoice: (id: string) => void,
  patients: Patient[],
  beds: Bed[]
) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState(BillingData.filterStatuses[0]);
  const [selectedPatientBill, setSelectedPatientBill] = useState<MasterBill | null>(null);

  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const pName = formData.get("patientName") as string;
    const patient = patients.find(p => p.name === pName);

    const maxId = invoices.reduce((max, inv) => {
      const idNum = parseInt(inv.id.split("-")[1] || String(BillingData.defaultInvoiceStartId));
      return idNum > max ? idNum : max;
    }, BillingData.defaultInvoiceStartId);

    const newBill: Invoice = {
      id: `INV-${maxId + 1}`,
      name: pName,
      patientId: patient?.id || "GUEST",
      services: formData.get("service") as string,
      amount: `₹${Number(formData.get("amount")).toFixed(0)}`,
      status: "Pending",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    onAddInvoice(newBill);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      onDeleteInvoice(id);
    }
  };

  const filteredInvoices = useMemo(() => {
    return filterStatus === "All"
      ? invoices
      : invoices.filter((inv: Invoice) => inv.status === filterStatus);
  }, [invoices, filterStatus]);

  const handlePrint = () => {
    window.print();
  };

  const generateMasterBill = (patient: Patient, invoice?: Invoice) => {
    const patientInvoices = invoices.filter((inv: Invoice) =>
      inv.patientId === patient.id ||
      inv.name?.toLowerCase() === patient.name?.toLowerCase()
    );

    const selectedInvoices = invoice ? [invoice] : patientInvoices;

    const bed = beds.find((b: Bed) => b.patientId === patient.id || b.patientName === patient.name);
    const isInpatient = !!bed && bed.isOccupied;

    const admissionDate = new Date(patient.admissionDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - admissionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const bedChargePerDay = bed ? bed.chargePerDay : 0;
    const totalBedCharge = diffDays * bedChargePerDay;

    // Clean up description: strip duplicate "Department - Department - " prefix
    const cleanDesc = (desc: string) => {
      // "Consultation - Consultation - DR Abdul" → "Consultation - DR Abdul"
      return desc.replace(/^(.+?) - \1 - /, "$1 - ");
    };

    const bedItem: MasterBillItem[] = !invoice && isInpatient
      ? [{
          date: patient.admissionDate,
          time: "09:00 AM",
          description: `Bed Charge — ${bed?.id || "Allocated"} (${diffDays} Days @ ₹${bedChargePerDay}/day)`,
          amount: totalBedCharge,
        }]
      : [];

    const masterBill: MasterBill = {
      patient,
      bed,
      days: diffDays,
      bedCharge: totalBedCharge,
      items: [
        ...bedItem,
        ...selectedInvoices.map((inv: Invoice) => ({
          date: inv.date || patient.admissionDate,
          time: inv.time || "10:00 AM",
          description: cleanDesc(inv.services),
          amount: parseFloat(inv.amount.replace(/[^0-9.-]+/g, "")),
        })),
      ],
       chargesBreakdown: invoice?.charges || undefined,
    };

    setSelectedPatientBill(masterBill);
  };

  const totalSum = selectedPatientBill?.items.reduce(
    (acc: number, item: MasterBillItem) => acc + item.amount,
    0,
  ) || 0;

  const consolidatedYield = invoices.reduce((acc, inv) => acc + parseFloat(inv.amount.replace(/[^0-9.-]+/g, "") || "0"), 0);

  return {
    isModalOpen,
    setIsModalOpen,
    filterStatus,
    setFilterStatus,
    selectedPatientBill,
    setSelectedPatientBill,
    handleBillSubmit,
    handleDelete,
    filteredInvoices,
    handlePrint,
    generateMasterBill,
    totalSum,
    consolidatedYield,
  };
};
