import React from "react";
import { Bed as BedInterface, Patient, UserRole, WardType } from "../../../shared/types";
import Modal from "../../../shared/components/Modal";
import { Zap } from "../../../shared/utils/icons";

interface AdmissionModalsProps {
  showCreateAdmissionModal: boolean;
  setShowCreateAdmissionModal: (val: boolean) => void;
  admissionData: any;
  setAdmissionData: React.Dispatch<React.SetStateAction<any>>;
  patients: Patient[];
  doctors: any[];
  beds: BedInterface[];
  onBookBed: (bedId: string, bookingData: any) => void;
  showAddBedModal: boolean;
  setShowAddBedModal: (val: boolean) => void;
  newBedData: any;
  setNewBedData: React.Dispatch<React.SetStateAction<any>>;
  handleAddBedSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  userRole: UserRole;
}

const AdmissionModals: React.FC<AdmissionModalsProps> = ({
  showCreateAdmissionModal,
  setShowCreateAdmissionModal,
  admissionData,
  setAdmissionData,
  patients,
  doctors,
  beds,
  onBookBed,
  showAddBedModal,
  setShowAddBedModal,
  newBedData,
  setNewBedData,
  handleAddBedSubmit,
  userRole,
}) => {
  return (
    <>
      <Modal
        isOpen={showCreateAdmissionModal}
        onClose={() => setShowCreateAdmissionModal(false)}
        title="CREATE ADMISSION"
        size="xl"
      >
        <div className="space-y-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const ipNum = parseInt(admissionData.ipNo.replace("IP", ""));
              localStorage.setItem("accendia_last_ip_num", String(ipNum));

              const admissionRecord = {
                ipNo: admissionData.ipNo,
                uhid: admissionData.uhid,
                patientName: admissionData.patientName,
                age: admissionData.age,
                mobileNo: admissionData.mobileNo,
                doctor: admissionData.primaryDoctor,
                department: admissionData.department,
                admissionDateTime: admissionData.admissionDateTime,
              };
              localStorage.setItem(
                `accendia_ip_${admissionData.ipNo}`,
                JSON.stringify(admissionRecord)
              );

              const ipIndex: string[] = JSON.parse(
                localStorage.getItem("accendia_ip_index") || "[]"
              );
              if (!ipIndex.includes(admissionData.ipNo)) {
                ipIndex.unshift(admissionData.ipNo);
                localStorage.setItem("accendia_ip_index", JSON.stringify(ipIndex));
              }

              onBookBed(admissionData.admittingWard, {
                patientName: admissionData.patientName,
                age: admissionData.age,
                gender: "Select",
                doctor: admissionData.primaryDoctor,
                ipNumber: admissionData.ipNo,
                attendantRelation: admissionData.attendantRelation,
                attendantContactNo: admissionData.attendantContactNo,
                department: admissionData.department,
              });

              setShowCreateAdmissionModal(false);
              setAdmissionData({
                admissionDateTime: new Date()
                  .toISOString()
                  .slice(0, 16)
                  .replace("T", " "),
                uhid: "",
                patientName: "",
                age: "",
                mobileNo: "",
                attendantRelation: "",
                attendantContactNo: "",
                admittingWard: "",
                admittingDoctor: "",
                primaryDoctor: "",
                ipNo: `IP${
                  parseInt(localStorage.getItem("accendia_last_ip_num") || "1000") +
                  1
                }`,
                department: "",
              });
            }}
            className="p-6 bg-white"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 items-center">
                  <label className="text-[11px] text-slate-700 font-medium">
                    Admission Date and Time
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none bg-white"
                    value={admissionData.admissionDateTime}
                    onChange={(e) =>
                      setAdmissionData({
                        ...admissionData,
                        admissionDateTime: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 items-center">
                  <label className="text-[11px] text-slate-700 font-medium">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Patient Name"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none bg-slate-100"
                    value={admissionData.patientName}
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-2 items-center">
                  <label className="text-[11px] text-slate-700 font-medium">
                    Mobile No
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Mobile No"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none bg-slate-100"
                    value={admissionData.mobileNo}
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-2 items-center">
                  <label className="text-[11px] text-slate-700 font-medium">
                    Attendant Contact No
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Attendant Contact No"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none"
                    value={admissionData.attendantContactNo}
                    onChange={(e) =>
                      setAdmissionData({
                        ...admissionData,
                        attendantContactNo: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 items-center">
                  <label className="text-[11px] text-slate-700 font-medium">
                    Admitting Doctor
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none appearance-none"
                    value={admissionData.admittingDoctor}
                    onChange={(e) =>
                      setAdmissionData({
                        ...admissionData,
                        admittingDoctor: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.name}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 items-center">
                  <label className="text-[11px] text-slate-700 font-medium">
                    IP No
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none bg-slate-100"
                    value={admissionData.ipNo}
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 items-center">
                  <label className="text-[11px] text-slate-700 font-medium">
                    UHID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter UHID"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none"
                    list="patient-uhids"
                    value={admissionData.uhid}
                    onChange={(e) => {
                      const val = e.target.value;
                      const p = patients.find((patient) => patient.id === val);
                      if (p) {
                        setAdmissionData({
                          ...admissionData,
                          uhid: val,
                          patientName: p.name,
                          age: String(p.age),
                          mobileNo: p.contact || "N/A",
                        });
                      } else {
                        setAdmissionData({ ...admissionData, uhid: val });
                      }
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 items-center">
                  <label className="text-[11px] text-slate-700 font-medium">
                    Age
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Age"
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none bg-slate-100"
                    value={admissionData.age}
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-2 items-center">
                  <label className="text-[11px] text-slate-700 font-medium">
                    Attendant Relation
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Attendant Relation"
                    className="w-full px-3 py-2 border border-indigo-600 rounded text-sm outline-none"
                    value={admissionData.attendantRelation}
                    onChange={(e) =>
                      setAdmissionData({
                        ...admissionData,
                        attendantRelation: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 items-center">
                  <label className="text-[11px] text-slate-700 font-medium">
                    Admitting Ward
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none appearance-none"
                    value={admissionData.admittingWard}
                    onChange={(e) =>
                      setAdmissionData({
                        ...admissionData,
                        admittingWard: e.target.value,
                      })
                    }
                  >
                    <option value="">Enter Admitting Ward</option>
                    {beds
                      .filter((bed) => !bed.isOccupied)
                      .map((bed) => (
                        <option key={bed.id} value={bed.id}>
                          {bed.id} ({bed.wardType})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 items-center">
                  <label className="text-[11px] text-slate-700 font-medium">
                    Primary Doctor
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none appearance-none"
                    value={admissionData.primaryDoctor}
                    onChange={(e) =>
                      setAdmissionData({
                        ...admissionData,
                        primaryDoctor: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.name}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 items-center">
                  <label className="text-[11px] text-slate-700 font-medium">
                    Department
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none appearance-none"
                    value={admissionData.department}
                    onChange={(e) =>
                      setAdmissionData({
                        ...admissionData,
                        department: e.target.value,
                      })
                    }
                  >
                    <option>Select</option>
                    <option>Cardiology</option>
                    <option>Neurology</option>
                    <option>Orthopedics</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="px-8 py-2 bg-[#0070ad] text-white text-xs font-bold rounded shadow-md hover:bg-[#005a8d] transition-all"
              >
                Submit
              </button>
            </div>
          </form>
          <datalist id="patient-uhids">
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </datalist>
        </div>
      </Modal>

      <Modal
        isOpen={showAddBedModal}
        onClose={() => setShowAddBedModal(false)}
        title="Initialize New Facility Node"
      >
        <div className="space-y-8">
          <div className="p-8 bg-hospital-blue/10 rounded-[3rem] border border-hospital-blue/10 flex items-start space-x-6">
            <div className="w-16 h-16 bg-hospital-blue rounded-2xl flex items-center justify-center shrink-0 shadow-2xl shadow-hospital-blue/10">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-black text-hospital-blue/90 uppercase tracking-tight">
                Expansion protocol
              </h4>
              <p className="text-sm font-medium text-hospital-blue mt-1">
                Adding new capacity to the medical wing. Ensure all logistics are
                verified.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddBedSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  Node ID (Bed ID)
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold outline-none"
                  placeholder="e.g., ICU-501"
                  value={newBedData.id}
                  onChange={(e) =>
                    setNewBedData({ ...newBedData, id: e.target.value })
                  }
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  Ward No
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold outline-none"
                  placeholder="e.g., Ward 4"
                  value={newBedData.wardNo}
                  onChange={(e) =>
                    setNewBedData({ ...newBedData, wardNo: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  Ward Type
                </label>
                <select
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold outline-none appearance-none"
                  value={newBedData.wardType}
                  onChange={(e) =>
                    setNewBedData({
                      ...newBedData,
                      wardType: e.target.value as WardType,
                    })
                  }
                >
                  {Object.values(WardType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  Charge Per Day
                </label>
                <input
                  required
                  type="number"
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-bold outline-none"
                  value={newBedData.chargePerDay}
                  onChange={(e) =>
                    setNewBedData({
                      ...newBedData,
                      chargePerDay: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-6 mt-4 bg-hospital-blue hover:bg-hospital-blue/70 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all"
            >
              Deploy New Facility Node
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default AdmissionModals;
