import React from "react";
import Modal from "../../../shared/components/Modal";
import { Activity, CheckCircle2, Microscope, Search, User } from "../../../shared/utils/icons";

interface LabTestMaster {
  id?: number;
  test_name: string;
  price?: number | string;
}

interface LabParameter {
  id?: number;
  parameter_name: string;
  result_value?: string;
  unit?: string;
  reference_range?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ipNo: string;
  setIpNo: (value: string) => void;
  handleIpSearch: () => void;
  searchingPatient: boolean;
  patientName: string;
  age: string;
  gender: string;
  doctor: string;
  tests: LabTestMaster[];
  testsLoading: boolean;
  selectedTest: string;
  selectTest: (testName: string) => void;
  parameters: LabParameter[];
  updateResult: (index: number, value: string) => void;
  saveReport: () => void;
  savingReport: boolean;
  errorMessage: string;
}

const LabInvestigationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  ipNo,
  setIpNo,
  handleIpSearch,
  searchingPatient,
  patientName,
  age,
  gender,
  doctor,
  tests,
  testsLoading,
  selectedTest,
  selectTest,
  parameters,
  updateResult,
  saveReport,
  savingReport,
  errorMessage,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lab Investigation & Transcription" size="xl">
      <div className="lab-compact-form">
        <div className="space-y-8">
          <div className="p-8 bg-slate-50 border border-slate-100 rounded-[3rem] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-4 items-end">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">IP Number</label>
                <div className="relative">
                  <input
                    value={ipNo}
                    onChange={(e) => setIpNo(e.target.value)}
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none"
                    placeholder="Enter IP No"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <button
                type="button"
                onClick={handleIpSearch}
                disabled={!ipNo.trim() || searchingPatient}
                className={
                  !ipNo.trim() || searchingPatient
                    ? "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-300 cursor-not-allowed"
                    : "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-hospital-blue text-white shadow-xl"
                }
              >
                {searchingPatient ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Patient Name</label>
                <input value={patientName} readOnly className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none" placeholder="Patient name" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Age</label>
                <input value={age} readOnly className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none" placeholder="Age" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                <input value={gender} readOnly className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none" placeholder="Gender" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Doctor</label>
              <input value={doctor} readOnly className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none" placeholder="Primary doctor" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-hospital-blue/10 rounded-xl flex items-center justify-center text-hospital-blue">
                <Microscope className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Select Test</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Click a lab test to load parameters from database</p>
              </div>
            </div>

            {testsLoading ? (
              <div className="bg-white border border-slate-100 rounded-[2rem] p-6 text-xs font-bold text-slate-500">Loading lab tests...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {tests.map((test) => {
                  const isActive = selectedTest === test.test_name;
                  return (
                    <button
                      key={test.id ?? test.test_name}
                      type="button"
                      onClick={() => selectTest(test.test_name)}
                      className={
                        isActive
                          ? "p-4 rounded-2xl text-left border bg-slate-900 border-slate-900 text-white shadow-xl"
                          : "p-4 rounded-2xl text-left border bg-white border-slate-100 text-slate-700 hover:border-hospital-blue/40"
                      }
                    >
                      <div className="text-[10px] font-black uppercase leading-tight">{test.test_name}</div>
                      {test.price !== undefined && test.price !== null ? (
                        <div className={isActive ? "mt-2 text-[10px] font-black text-white/70" : "mt-2 text-[10px] font-black text-hospital-blue"}>
                          Rs. {Number(test.price).toFixed(0)}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-hospital-blue px-6 py-4 rounded-2xl shadow-lg flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-widest">Test Parameters</h4>
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-3xl border border-slate-100 shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Investigation</th>
                    <th className="px-6 py-4">Result Value</th>
                    <th className="px-6 py-4">Unit</th>
                    <th className="px-6 py-4">Reference Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {parameters.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-xs font-bold text-slate-400">
                        Select a test to load rows from the database.
                      </td>
                    </tr>
                  ) : (
                    parameters.map((item, index) => (
                      <tr key={item.id ?? item.parameter_name + "-" + index} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 text-[11px] font-black text-slate-800">{item.parameter_name}</td>
                        <td className="px-6 py-4">
                          <input
                            value={item.result_value || ""}
                            onChange={(e) => updateResult(index, e.target.value)}
                            className="w-full bg-slate-50 border-2 px-4 py-2.5 rounded-xl text-xs font-black outline-none focus:border-hospital-blue"
                            placeholder="Enter result"
                          />
                        </td>
                        <td className="px-6 py-4 text-[10px] font-bold text-slate-500">{item.unit || "-"}</td>
                        <td className="px-6 py-4 text-[10px] font-black text-hospital-blue">{item.reference_range || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {errorMessage ? (
            <div className="px-5 py-4 rounded-2xl bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-600">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Diagnostic Order Finalization</h4>
                <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Save results to the lab report table</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button type="button" onClick={onClose} className="px-8 py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Discard</button>
              <button
                type="button"
                onClick={saveReport}
                disabled={!selectedTest || parameters.length === 0 || savingReport}
                className={
                  !selectedTest || parameters.length === 0 || savingReport
                    ? "flex-1 md:flex-none px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] bg-slate-100 text-slate-300 cursor-not-allowed"
                    : "flex-1 md:flex-none px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] bg-hospital-blue text-white shadow-2xl"
                }
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {savingReport ? "Saving..." : "Save Result & Finalize Report"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LabInvestigationModal;
