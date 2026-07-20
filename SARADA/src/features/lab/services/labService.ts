import React, { useState, useRef } from "react";
import { Patient, LabTest, UserRole, Invoice } from "../../../shared/types";
import labData from "../data/labMockData.json";

export const useLabLogic = (
  onAddInvoice?: (i: Invoice) => void,
  patients: Patient[] = [],
  labTests: LabTest[] = [],
  setLabTests: React.Dispatch<React.SetStateAction<LabTest[]>> = () => { }
) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<LabTest | null>(null);
  const [manualResults, setManualResults] = useState<Record<string, string>>({});
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [healthSummary, setHealthSummary] = useState("");
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [isRadiologyModalOpen, setIsRadiologyModalOpen] = useState(false);
  const [activeLabTab, setActiveLabTab] = useState<"Pathology" | "Radiology" | "Reports">("Pathology");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleLabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const totalCost = selectedTests.reduce(
      (acc, t) => acc + ((labData.DIAGNOSTIC_PRICES as any)[t] || 0),
      0
    );

    let inRangeCount = 0;
    let totalMetrics = 0;
    Object.entries(manualResults).forEach(([key, val]) => {
      const conf = (labData.DIAGNOSTIC_RANGES as any)[key];
      if (conf) {
        const numVal = parseFloat(val as string);
        if (!isNaN(numVal)) {
          totalMetrics++;
          if (numVal >= conf.min && numVal <= conf.max) {
            inRangeCount++;
          }
        }
      }
    });
    const healthScore = totalMetrics > 0 ? Math.round((inRangeCount / totalMetrics) * 100) : undefined;

    const newTest: LabTest = {
      id: editingTestId || `L-${Math.floor(8000 + Math.random() * 999)}`,
      patient: formData.get("patientName") as string,
      age: formData.get("age") as string,
      sex: formData.get("sex") as string,
      test: selectedTests.join(", "),
      doctor: formData.get("doctor") as string,
      status: "Completed",
      totalCost: totalCost,
      resultData: { ...manualResults },
      healthSummary: healthSummary,
      healthScore: healthScore,
      type: "Pathology",
      pid: formData.get("pid") as string,
      mobile: formData.get("mobile") as string,
      paymentMethod: formData.get("paymentMethod") as string,
      sampleCollectedAt: formData.get("sampleCollectedAt") as string,
      collectedOn: formData.get("collectedOn") as string,
      reportedOn: formData.get("reportedOn") as string,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (editingTestId) {
      setLabTests(labTests.map(t => t.id === editingTestId ? newTest : t));
    } else {
      setLabTests([newTest, ...labTests]);
    }

    setSelectedReport(newTest);

    if (onAddInvoice) {
      const patient = patients.find(p => p.name === newTest.patient);
      onAddInvoice({
        id: `LB-${newTest.id}`,
        name: newTest.patient,
        patientId: patient?.id || "WALKIN",
        services: newTest.test,
        amount: `₹${(totalCost * 83).toFixed(0)}`,
        status: "Paid",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });
    }

    setManualResults({});
    setSelectedTests([]);
    setHealthSummary("");
    setEditingTestId(null);
    setIsModalOpen(false);
  };

  const handleRadiologySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const testName = formData.get("testType") as string;
    const cost = (labData.DIAGNOSTIC_PRICES as any)[testName] || 150;
    const pid = formData.get("pid") as string;

    const newScan: LabTest = {
      id: `R-${Math.floor(5000 + Math.random() * 999)}`,
      patient: formData.get("patientName") as string,
      age: formData.get("age") as string,
      sex: formData.get("sex") as string,
      mobile: formData.get("mobile") as string,
      doctor: formData.get("doctor") as string,
      paymentMethod: formData.get("paymentMethod") as string,
      test: testName,
      status: "Pending",
      totalCost: cost,
      resultData: {
        laterality: formData.get("laterality") as string,
        urgency: formData.get("urgency") as string,
        clinicalHistory: formData.get("history") as string,
        contrastStudy: formData.get("contrast") as string,
      },
      type: "Radiology",
      pid: pid,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLabTests([newScan, ...labTests]);

    if (onAddInvoice) {
      onAddInvoice({
        id: `RAD-${newScan.id}`,
        name: newScan.patient,
        patientId: pid || "WALKIN",
        services: newScan.test,
        amount: `₹${(cost * 83).toFixed(0)}`,
        status: "Paid",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });
    }

    setIsRadiologyModalOpen(false);
  };

  const toggleTest = (testName: string) => {
    if (testName === "Comprehensive Health Profile") {
      if (selectedTests.includes("Comprehensive Health Profile")) {
        setSelectedTests([]);
      } else {
        setSelectedTests(["Comprehensive Health Profile", ...labData.HEALTH_CHECKUP_TESTS]);
      }
      return;
    }
    setSelectedTests((prev) =>
      prev.includes(testName) ? prev.filter((t) => t !== testName) : [...prev, testName]
    );
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const numberToWords = (num: number): string => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const s = num.toString();
    if (s.length > 9) return 'overflow';
    let n = ('000000000' + s).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only ' : '';
    return str;
  };

  return {
    isModalOpen, setIsModalOpen,
    selectedReport, setSelectedReport,
    manualResults, setManualResults,
    selectedTests, setSelectedTests,
    healthSummary, setHealthSummary,
    editingTestId, setEditingTestId,
    isRadiologyModalOpen, setIsRadiologyModalOpen,
    activeLabTab, setActiveLabTab,
    canvasRef,
    handleLabSubmit,
    handleRadiologySubmit,
    toggleTest,
    startDrawing,
    draw,
    stopDrawing,
    clearSignature,
    numberToWords
  };
};
