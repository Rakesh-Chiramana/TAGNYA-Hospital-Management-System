import React, { useState, useMemo } from "react";
import { Invoice, Patient, Bed, ChargeDetails } from "../../../shared/types";

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
  chargesBreakdown?: ChargeDetails;        // 👈 ADD whole block
  bedCharges: { type: string; days: number; rate: number; amount: number }[];
  pharmacyCharges: { medicine: string; quantity: number; rate: number; amount: number }[];
  nursingCharge: number;
  miscCharge: number;
  discount: number;
  subtotal: number;
  total: number;
  }


export const useBillingManagement = (
  invoices: Invoice[],
  patients: Patient[],
  beds: Bed[]
) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState(BillingData.filterStatuses[0]);
  const [selectedPatientBill, setSelectedPatientBill] = useState<MasterBill | null>(null);

  

 

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

  bedCharges: invoice?.charges?.bedCharges || [],
  
  pharmacyCharges: invoice?.charges?.pharmacyCharges || [],

  nursingCharge: invoice?.charges?.nursingCharge || 0,

  miscCharge: invoice?.charges?.miscCharge || 0,

  discount: invoice?.charges?.discount || 0,

  subtotal: invoice?.charges?.subtotal || 
    selectedInvoices.reduce(
      (sum, inv) =>
        sum + parseFloat(inv.amount.replace(/[^0-9.-]+/g, "")),
      0
    ),

  total: invoice?.charges?.total ||
    selectedInvoices.reduce(
      (sum, inv) =>
        sum + parseFloat(inv.amount.replace(/[^0-9.-]+/g, "")),
      0
    ),
};

    setSelectedPatientBill(masterBill);
  };

  const totalSum = useMemo(() => {

  if (!selectedPatientBill) return 0;

  if (selectedPatientBill.chargesBreakdown) {
    return selectedPatientBill.chargesBreakdown.total;
  }

  return selectedPatientBill.items.reduce(
    (acc, item) => acc + item.amount,
    0
  );

}, [selectedPatientBill]);

  const consolidatedYield = invoices.reduce((acc, inv) => acc + parseFloat(inv.amount.replace(/[^0-9.-]+/g, "") || "0"), 0);

  return {
    isModalOpen,
    setIsModalOpen,
    filterStatus,
    setFilterStatus,
    selectedPatientBill,
    setSelectedPatientBill,
    filteredInvoices,
    handlePrint,
    generateMasterBill,
    totalSum,
    consolidatedYield,
  };
};
