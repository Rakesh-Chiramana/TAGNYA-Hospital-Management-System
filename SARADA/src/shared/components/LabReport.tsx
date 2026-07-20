import React from "react";
import "./LabReport.css";
import { LabTest } from "../types";
import HospitalHeader from "./HospitalHeader";

interface LabReportProps {
  test: LabTest;
}

const LabReport: React.FC<LabReportProps> = ({ test }) => {
  const results = test.resultData || {};

  const referenceData = {
    "HAEMATOLOGY (CBC)": [
      {
        id: "hb",
        name: "Hemoglobin (Hb)",
        range: "13.0 – 17.0",
        unit: "g/dL",
        min: 13.0,
        max: 17.0,
      },
      {
        id: "rbc",
        name: "Total RBC Count",
        range: "4.5 – 5.5",
        unit: "mill/cumm",
        min: 4.5,
        max: 5.5,
      },
      {
        id: "wbc",
        name: "Total WBC Count",
        range: "4000 – 11000",
        unit: "/cumm",
        min: 4000,
        max: 11000,
      },
      {
        id: "platelets",
        name: "Platelet Count",
        range: "150000 – 410000",
        unit: "/cumm",
        min: 150000,
        max: 410000,
      },
    ],
    "BLOOD SUGAR PROFILE": [
      {
        id: "fbs",
        name: "Fasting Blood Sugar (FBS)",
        range: "70 – 100",
        unit: "mg/dL",
        min: 70,
        max: 100,
      },
      {
        id: "ppbs",
        name: "Post-Prandial (PPBS)",
        range: "70 – 140",
        unit: "mg/dL",
        min: 70,
        max: 140,
      },
      {
        id: "rbs",
        name: "Random Blood Sugar (RBS)",
        range: "70 – 140",
        unit: "mg/dL",
        min: 70,
        max: 140,
      },
      {
        id: "hba1c",
        name: "Glycated Hb (HbA1c)",
        range: "4.0 – 5.6",
        unit: "%",
        min: 4.0,
        max: 5.6,
      },
    ],
    "THYROID PROFILE": [
      {
        id: "t3",
        name: "T3 (Triiodothyronine)",
        range: "0.8 – 2.0",
        unit: "ng/mL",
        min: 0.8,
        max: 2.0,
      },
      {
        id: "t4",
        name: "T4 (Thyroxine)",
        range: "5.1 – 14.1",
        unit: "µg/dL",
        min: 5.1,
        max: 14.1,
      },
      {
        id: "tsh",
        name: "TSH (Thyrotropin)",
        range: "0.5 – 5.0",
        unit: "µIU/mL",
        min: 0.5,
        max: 5.0,
      },
    ],
    "LIPID PROFILE": [
      {
        id: "chol",
        name: "Total Cholesterol",
        range: "100 – 200",
        unit: "mg/dL",
        min: 100,
        max: 200,
      },
      {
        id: "hdl",
        name: "HDL Cholesterol",
        range: "40 – 60",
        unit: "mg/dL",
        min: 40,
        max: 60,
      },
      {
        id: "ldl",
        name: "LDL Cholesterol",
        range: "0 – 100",
        unit: "mg/dL",
        min: 0,
        max: 100,
      },
      {
        id: "trig",
        name: "Triglycerides",
        range: "0 – 150",
        unit: "mg/dL",
        min: 0,
        max: 150,
      },
    ],
    "LIVER FUNCTION TEST (LFT)": [
      {
        id: "sgot",
        name: "SGOT (AST)",
        range: "0 – 40",
        unit: "U/L",
        min: 0,
        max: 40,
      },
      {
        id: "sgpt",
        name: "SGPT (ALT)",
        range: "0 – 40",
        unit: "U/L",
        min: 0,
        max: 40,
      },
      {
        id: "bili",
        name: "Bilirubin Total",
        range: "0.3 – 1.2",
        unit: "mg/dL",
        min: 0.3,
        max: 1.2,
      },
    ],
    "KIDNEY FUNCTION TEST (KFT)": [
      {
        id: "urea",
        name: "Blood Urea",
        range: "10 – 50",
        unit: "mg/dL",
        min: 10,
        max: 50,
      },
      {
        id: "creat",
        name: "Creatinine",
        range: "0.6 – 1.2",
        unit: "mg/dL",
        min: 0.6,
        max: 1.2,
      },
    ],
  };

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="lab-report-paper">
      <HospitalHeader />

      <div className="report-patient-info">
        <div className="space-y-3">
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              Patient Name
            </p>
            <p className="text-xl font-black text-slate-900 leading-none">
              {test.patient}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {test.pid && (
                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">
                  PID: {test.pid}
                </p>
              )}
              {test.mobile && (
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  Mob: {test.mobile}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <p className="text-xs font-black text-slate-600">
              Age: <span className="text-slate-900 ml-1">{test.age}Y</span>
            </p>
            <p className="text-xs font-black text-slate-600">
              Sex:{" "}
              <span className="text-slate-900 ml-1 uppercase">{test.sex}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center border-x border-slate-100 px-3">
          <div className="w-14 h-14 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300">
            <span className="text-[8px] font-black text-center leading-tight">
              SCAN FOR
              <br />
              VERIFICATION
            </span>
          </div>
          <p className="text-[7px] font-black text-slate-400 mt-1 uppercase tracking-tighter">
            REPORT ID: {test.id}
          </p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs font-black text-slate-600">
            Dr: <span className="text-slate-900">{test.doctor}</span>
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
            Collected: {test.collectedOn || test.time}
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
            Reported: {test.reportedOn || currentDate}
          </p>
          {test.sampleCollectedAt && (
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
              At: {test.sampleCollectedAt}
            </p>
          )}
          {test.paymentMethod && (
            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter mt-1">
              Payment: {test.paymentMethod}
            </p>
          )}
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-black text-slate-900 tracking-tight border-b-2 border-double border-slate-900 inline-block px-6 py-0.5 uppercase">
          Diagnostic Investigation Results
        </h3>
      </div>

      {test.healthScore !== undefined && (
        <div className="health-score-banner">
          <div>
            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest mb-0.5">
              Overall Health Score
            </h4>
            <p className="text-[10px] font-medium text-emerald-600">
              Based on current clinical investigations.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-black text-emerald-600 tracking-tighter leading-none">
              {test.healthScore}%
            </div>
            <div className="w-24 h-1.5 bg-emerald-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-600"
                style={{ width: `${test.healthScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {Object.entries(referenceData).map(([category, items]) => {
        const hasData = items.some((item) => results[item.id]);
        if (!hasData) return null;

        return (
          <div key={category} className="mb-6 animate-in fade-in duration-500">
            <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 pl-2 mb-2">
              {category}
            </h4>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-900 text-[9px] font-black text-slate-400 uppercase">
                  <th className="py-1">INVESTIGATION</th>
                  <th className="py-1">RESULT</th>
                  <th className="py-1">UNIT</th>
                  <th className="py-1">REF. RANGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const valStr = results[item.id];
                  if (!valStr) return null;
                  const numVal = parseFloat(valStr);
                  const isLow = !isNaN(numVal) && numVal < item.min;
                  const isHigh = !isNaN(numVal) && numVal > item.max;
                  const isAbnormal = isLow || isHigh;

                  return (
                    <tr
                      key={item.id}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-2 text-[11px] font-black text-slate-800">
                        {item.name}
                      </td>
                      <td
                        className={`py-2 text-xs font-black ${isAbnormal ? "text-red-600" : "text-blue-700"}`}
                      >
                        {valStr}
                        {isLow ? " (L)" : isHigh ? " (H)" : ""}
                      </td>
                      <td className="py-2 text-[9px] font-bold text-slate-400">
                        {item.unit}
                      </td>
                      <td className="py-2 text-[9px] font-bold text-slate-600">
                        {item.range}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      {test.healthSummary && (
        <div className="mb-6 p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center">
            <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center mr-2 text-[10px]">
              i
            </span>
            Clinical Impression & Health Summary
          </h4>
          <p className="text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
            {test.healthSummary}
          </p>
        </div>
      )}

      <div className="mb-4 px-4 py-2 border-2 border-red-100 bg-red-50/10 rounded-xl flex items-center space-x-3">
        <span className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md">
          !
        </span>
        <p className="text-[8px] font-black text-red-900 leading-tight uppercase tracking-tight">
          Warning: Results highlighted in RED indicate values outside standard
          clinical reference ranges. (H) = High, (L) = Low. Please correlate
          with clinical findings.
        </p>
      </div>

      <div className="space-y-4 mb-20 p-6 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
          Technical Note
        </p>
        <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
          Report generated by Tagnya Hospital.
        </p>
      </div>

      <div className="flex justify-between items-end border-t-2 border-slate-200 pt-4">
        <div className="text-[8px] font-black text-slate-400 uppercase">
          Auth: ACC-DX-REPORT-
          {Math.random().toString(36).slice(2, 8).toUpperCase()}
        </div>
        <div className="text-center">
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
            END OF REPORT
          </p>
        </div>
        <div className="text-right">
          <div className="w-32 h-[1px] bg-slate-300 mb-1 ml-auto"></div>
          <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">
            Consultant Pathologist
          </p>
          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">
            Digital Signature Verified
          </p>
        </div>
      </div>
    </div>
  );
};

export default LabReport;
