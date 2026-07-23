import React, { useEffect, useState } from "react";
import "./styles/lab.css";
import {
  Clock,
  Download,
  IndianRupee,
  Microscope,
  PenTool,
  User,
  Zap,
} from "../../shared/utils/icons";
import { Patient, UserRole, LabTest,Invoice} from "../../shared/types";
import { useLabLogic } from "./services/labService";
import { generateLabReportPDF } from "./services/labPDFService";
import LabReportModal from "./components/LabReportModal";
import LabInvestigationModal from "./components/LabInvestigationModal";


interface Props {
  onAddInvoice?: (i: Invoice) => void;
  userRole?: UserRole;
  patients?: Patient[];
  doctors?: unknown[];
  labTests?: LabTest[];
  setLabTests?: React.Dispatch<React.SetStateAction<LabTest[]>>;
}

interface ApiLabTest {
  id?: number;
  test_name: string;
  price?: number | string;
}

interface ApiLabParameter {
  id?: number;
  parameter_name: string;
  result_value?: string;
  unit?: string;
  reference_range?: string;
}

const LAB_API_BASE = "http://localhost:5000";
const LabModule: React.FC<Props> = ({
  onAddInvoice,
  userRole,
  patients = [],
  doctors = [],
  labTests = [],
  setLabTests = () => {},
}) => {
  const {
    isModalOpen,
    setIsModalOpen,
    selectedReport,
    setSelectedReport,
    isRadiologyModalOpen,
    setIsRadiologyModalOpen,
    activeLabTab,
    setActiveLabTab,
    numberToWords,
  } = useLabLogic(onAddInvoice, patients, labTests, setLabTests as React.Dispatch<React.SetStateAction<LabTest[]>>);

  const [reportDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [ipNo, setIpNo] = useState("");
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [doctor, setDoctor] = useState("");
  const [tests, setTests] = useState<ApiLabTest[]>([]);
  const [selectedTest, setSelectedTest] = useState("");
  const [parameters, setParameters] = useState<ApiLabParameter[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setTestsLoading(true);
      setErrorMessage("");
      const res = await fetch(`${LAB_API_BASE}/tests`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch tests");
      }

      setTests(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to fetch tests");
    } finally {
      setTestsLoading(false);
    }
  };

  const handleIpSearch = async () => {
    if (!ipNo.trim()) {
      setErrorMessage("Enter an IP number first.");
      return;
    }

    try {
      setSearchingPatient(true);
      setErrorMessage("");
      const res = await fetch(`${LAB_API_BASE}/patient/${encodeURIComponent(ipNo.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Patient not found");
      }

      setPatientName(data.patient_name || "");
      setAge(data.age ? String(data.age) : "");
      setGender(data.gender || "");
      setDoctor(data.primary_doctor || "");
    } catch (error) {
      setPatientName("");
      setAge("");
      setGender("");
      setDoctor("");
      setErrorMessage(error instanceof Error ? error.message : "Failed to fetch patient details");
    } finally {
      setSearchingPatient(false);
    }
  };

  const selectTest = async (testName: string) => {
    try {
      setSelectedTest(testName);
      setErrorMessage("");
      const res = await fetch(`${LAB_API_BASE}/test/${encodeURIComponent(testName)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load test parameters");
      }

      setParameters(Array.isArray(data) ? data : []);
    } catch (error) {
      setParameters([]);
      setErrorMessage(error instanceof Error ? error.message : "Failed to load test parameters");
    }
  };

  const updateResult = (index: number, value: string) => {
    setParameters((current) => {
      const updated = [...current];
      updated[index] = {
        ...updated[index],
        result_value: value,
      };
      return updated;
    });
  };

  const resetPathologyForm = () => {
    setIpNo("");
    setPatientName("");
    setAge("");
    setGender("");
    setDoctor("");
    setSelectedTest("");
    setParameters([]);
    setErrorMessage("");
  };

  const saveReport = async () => {
    if (!selectedTest || parameters.length === 0) {
      setErrorMessage("Select a test and enter results before saving.");
      return;
    }

    const payload = {
      orderId: Date.now(),
      testName: selectedTest,
      results: parameters,
    };

    try {
      setSavingReport(true);
      setErrorMessage("");
      const res = await fetch(`${LAB_API_BASE}/save-result`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save report");
      }

      const selectedTestMeta = tests.find((test) => test.test_name === selectedTest);
      const totalCost = Number(selectedTestMeta?.price || 0);
      const resultData = parameters.reduce<Record<string, string>>((acc, item) => {
        acc[item.parameter_name] = item.result_value || "";
        return acc;
      }, {});

      const newTest: LabTest = {
        id: `L-${payload.orderId}`,
        patient: patientName || "Unknown Patient",
        age: age || "",
        sex: gender || "",
        test: selectedTest,
        doctor: doctor || "",
        status: "Completed",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "Pathology",
        totalCost,
        resultData,
        pid: ipNo,
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
      };

      (setLabTests as React.Dispatch<React.SetStateAction<LabTest[]>>)((current) => [newTest, ...current]);
      setSelectedReport(newTest);

      if (onAddInvoice) {
        onAddInvoice({
          id: `LB-${payload.orderId}`,
          name: newTest.patient,
          patientId: ipNo || "WALKIN",
          services: selectedTest,
          amount: `Rs. ${totalCost.toFixed(0)}`,
          status: "Paid",
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
        });
      }

      window.alert("Report Saved");
      setIsModalOpen(false);
      resetPathologyForm();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save report");
    } finally {
      setSavingReport(false);
    }
  };

  const closePathologyModal = () => {
    setIsModalOpen(false);
    resetPathologyForm();
  };

  return (
    <div className="clinical-modules-container">
      <div className="clinical-header">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
            {activeLabTab === "Pathology"
              ? "Laboratory Diagnostics"
              : activeLabTab === "Radiology"
                ? "Radiology Diagnostics"
                : "Reports Archive"}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            {["Pathology", "Radiology", "Reports"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveLabTab(tab as "Pathology" | "Radiology" | "Reports")}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeLabTab === tab ? "bg-white text-hospital-blue shadow-xl" : "text-slate-500 hover:text-slate-700"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          {userRole !== UserRole.DOCTOR ? (
            <button
              onClick={() => activeLabTab === "Pathology" ? setIsModalOpen(true) : setIsRadiologyModalOpen(true)}
              className="px-6 py-4 bg-hospital-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-hospital-blue/70 transition-all shadow-xl flex items-center space-x-3"
            >
              <Zap className="w-4 h-4" />
              <span>{activeLabTab === "Pathology" ? "New Report" : "New Scan"}</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden max-w-5xl">
          <div className="revenue-card-dark group">
            <div className="relative z-10">
              <p className="text-[9px] font-black text-hospital-blue uppercase tracking-[0.3em] mb-2">Vertical Revenue</p>
              <div className="flex items-center space-x-3 mb-2">
                <IndianRupee className="w-6 h-6 text-hospital-blue" />
                <h4 className="text-3xl font-black tracking-tighter">{labTests.reduce((acc, t) => acc + (t.totalCost || 0), 0).toLocaleString("en-IN")}</h4>
              </div>
            </div>
          </div>
          <div className="stats-card-clinical card-teal-cyan group">
            <div className="relative z-10">
              <Microscope className="w-5 h-5 text-white mb-4" />
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">Total Lab Orders</p>
              <h4 className="text-3xl font-black tracking-tighter">{labTests.length}</h4>
            </div>
          </div>
          <div className="stats-card-clinical card-amber-rose group">
            <div className="relative z-10">
              <Clock className="w-5 h-5 text-white mb-4" />
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">Pending Reports</p>
              <h4 className="text-3xl font-black tracking-tighter">{labTests.filter((t) => t.status === "Pending").length}</h4>
            </div>
          </div>
        </div>

        {activeLabTab === "Pathology" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 print:hidden">
            {labTests.filter((t) => t.type === "Pathology").map((test) => (
              <div key={test.id} onClick={() => setSelectedReport(test)} className="lab-test-card group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-hospital-blue shadow-sm">
                    <Microscope className="w-7 h-7" />
                  </div>
                  <div className="text-right">
                    <span className={test.status === "Pending" ? "text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest bg-amber-100 text-amber-700" : "text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest bg-hospital-blue/10 text-hospital-blue/70"}>
                      {test.status}
                    </span>
                    <div className="flex items-center space-x-1 text-[10px] font-black text-hospital-blue mt-2 uppercase">
                      <IndianRupee className="w-3 h-3" />
                      <span>{(test.totalCost || 0).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
                <h4 className="font-black text-slate-900 text-lg tracking-tight leading-tight mb-1 truncate">{test.test}</h4>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs text-slate-500 font-bold uppercase flex items-center">
                    <User className="w-3.5 h-3.5 mr-2 text-hospital-blue" />
                    {test.patient}
                  </p>
                  <span className="text-[10px] font-black text-slate-400 uppercase">{test.age}Y � {test.sex}</span>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">{test.time}</span>
                  <div className="px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg flex items-center space-x-2">
                    <PenTool className="w-3.5 h-3.5" />
                    <span>View Report</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activeLabTab === "Reports" ? (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-10 py-6">Reference ID</th>
                  <th className="px-10 py-6">Patient Details</th>
                  <th className="px-10 py-6">Investigations</th>
                  <th className="px-10 py-6">Provider</th>
                  <th className="px-10 py-6">Financials</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {labTests
                  .filter((t) => !reportDateFilter || t.date === reportDateFilter.split("-").reverse().join("/"))
                  .map((test) => (
                    <tr key={test.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6"><span className="text-xs font-black text-slate-400 font-mono tracking-tighter">{test.id}</span></td>
                      <td className="px-10 py-6"><div className="flex flex-col"><span className="text-xs font-black text-slate-900">{test.patient}</span><span className="text-[10px] font-black text-slate-400 uppercase mt-0.5">{test.age}Y � {test.sex}</span></div></td>
                      <td className="px-10 py-6"><span className="text-xs font-black text-slate-600 line-clamp-1">{test.test}</span></td>
                      <td className="px-10 py-6"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{test.doctor}</span></td>
                      <td className="px-10 py-6"><span className="text-xs font-black text-hospital-blue">Rs. {(test.totalCost || 0).toLocaleString()}</span></td>
                      <td className="px-10 py-6"><div className="flex justify-end space-x-2"><button onClick={() => generateLabReportPDF(test, numberToWords)} className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><Download className="w-4 h-4" /></button></div></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <LabInvestigationModal
        isOpen={isModalOpen}
        onClose={closePathologyModal}
        ipNo={ipNo}
        setIpNo={setIpNo}
        handleIpSearch={handleIpSearch}
        searchingPatient={searchingPatient}
        patientName={patientName}
        age={age}
        gender={gender}
        doctor={doctor}
        tests={tests}
        testsLoading={testsLoading}
        selectedTest={selectedTest}
        selectTest={selectTest}
        parameters={parameters}
        updateResult={updateResult}
        saveReport={saveReport}
        savingReport={savingReport}
        errorMessage={errorMessage}
      />
      <LabReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
    </div>
  );
};

export default LabModule;
