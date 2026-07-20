import React, { useState } from "react";
import { ArrowLeft, Plus, Search, Truck, Phone, MapPin, CheckCircle, XCircle, ShieldCheck } from "../../../shared/utils/icons";
import { Vendor } from "../services/pharmacyService";

interface VendorsViewProps {
  vendors: Vendor[];
  onAddVendor: (vendor: Partial<Vendor>) => void;
  onToggleVendorStatus: (id: string) => void;
  setPharmacyView: (view: any) => void;
}

const VendorsView: React.FC<VendorsViewProps> = ({
  vendors,
  onAddVendor,
  onToggleVendorStatus,
  setPharmacyView,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    dlNo: "",
    gstNo: "",
  });

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.contactPerson && v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.dlNo && v.dlNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    onAddVendor(form);
    setForm({ name: "", contactPerson: "", phone: "", email: "", address: "", dlNo: "", gstNo: "" });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={() => setPharmacyView("dashboard")}
          className="flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendors by name, DL No, contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-hospital-blue focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-hospital-blue text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vendor</span>
          </button>
        </div>
      </div>

      {/* Vendors Directory Header */}
      <div className="bg-white border-t-[6px] border-hospital-blue shadow-sm rounded-3xl overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-hospital-blue rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.1em]">PHARMACY VENDOR DIRECTORY</h3>
              <p className="text-xs text-slate-400 font-medium">Manage medicine suppliers, DL numbers, and active status</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
            Total Vendors: {vendors.length}
          </span>
        </div>

        {/* Vendors Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 font-medium text-sm">
              No vendors found matching "{searchTerm}"
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className={`p-6 rounded-2xl border transition-all ${
                  vendor.status === "Active"
                    ? "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
                    : "bg-slate-50/70 border-slate-200 opacity-75"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-black text-slate-800 text-base">{vendor.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">Contact: {vendor.contactPerson || "N/A"}</p>
                  </div>
                  <button
                    onClick={() => onToggleVendorStatus(vendor.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all ${
                      vendor.status === "Active"
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                    }`}
                  >
                    {vendor.status === "Active" ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 border-t border-b border-slate-100 py-3.5 my-3">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{vendor.phone || "No phone provided"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{vendor.address || "No address provided"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">DL: {vendor.dlNo || "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>GST: {vendor.gstNo || "N/A"}</span>
                  <span>Registered: {vendor.createdAt}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Vendor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Add New Pharmacy Vendor</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Vendor / Firm Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. MedPlus Logistics Pvt Ltd"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-hospital-blue outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Representative name"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-hospital-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-hospital-blue outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Drug License (DL) No</label>
                  <input
                    type="text"
                    placeholder="e.g. DL-20B/4582"
                    value={form.dlNo}
                    onChange={(e) => setForm({ ...form, dlNo: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-hospital-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 36AAAAA0000A1Z5"
                    value={form.gstNo}
                    onChange={(e) => setForm({ ...form, gstNo: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-hospital-blue outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Address & Location</label>
                <textarea
                  rows={2}
                  placeholder="Street address, City, State"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-hospital-blue outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-hospital-blue text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 shadow-md"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsView;
