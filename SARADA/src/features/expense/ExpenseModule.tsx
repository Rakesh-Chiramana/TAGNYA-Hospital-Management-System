import React, { useState, useEffect } from "react";
import { Save, PlusCircle, Printer, RotateCcw, FolderOpen, Trash2, Eye, Pencil, X } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  HOSPITAL_NAME_LINE1,
  HOSPITAL_ADDRESS,
  HOSPITAL_PHONE,
  HOSPITAL_EMAIL,
} from "../../shared/constants/hospitalBranding";
import hospitalLogo from "../../assets/sarada_logo.png";
import "./styles/expense.css";

interface ExpenseRow {
  id: string;
  date: string;
  doctorFee: number;
  snacks: number;
  food: number;
  accommodation: number;
  medicine: number;
  other: number;
}

interface SavedExpenseSheet {
  id: string;
  doctorName: string;
  fromDate: string;
  toDate: string;
  rows: ExpenseRow[];
  savedAt: string;
}

interface ExpenseDBRow {
  id: number;
  doctor_name: string;
  from_date: string | null;
  to_date: string | null;
  bill_date: string | null;
  created_at: string;
  doctor_fee: number | string;
  snacks: number | string;
  food: number | string;
  accommodation: number | string;
  medicine: number | string;
  other_expense: number | string;
}

const groupDbRowsIntoSheets = (dbRows: ExpenseDBRow[]): SavedExpenseSheet[] => {
  const groups: { [key: string]: SavedExpenseSheet } = {};

  dbRows.forEach((row) => {
    const formatDate = (dVal: string | null) => {
      if (!dVal) return "";
      try {
        const dateObj = new Date(dVal);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const dd = String(dateObj.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      } catch {
        return "";
      }
    };

    const fromDateStr = formatDate(row.from_date);
    const toDateStr = formatDate(row.to_date);
    const billDateStr = formatDate(row.bill_date);

    const savedDateStr = new Date(row.created_at).toLocaleString("en-IN");
    const key = `${row.doctor_name || ""}_${fromDateStr}_${toDateStr}`;

    if (!groups[key]) {
      groups[key] = {
        id: key,
        doctorName: row.doctor_name || "",
        fromDate: fromDateStr,
        toDate: toDateStr,
        savedAt: savedDateStr,
        rows: [],
      };
    }

    groups[key].rows.push({
      id: String(row.id),
      date: billDateStr,
      doctorFee: Number(row.doctor_fee) || 0,
      snacks: Number(row.snacks) || 0,
      food: Number(row.food) || 0,
      accommodation: Number(row.accommodation) || 0,
      medicine: Number(row.medicine) || 0,
      other: Number(row.other_expense) || 0,
    });
  });

  const list = Object.values(groups);
  list.forEach(sheet => {
    sheet.rows.sort((a, b) => a.date.localeCompare(b.date));
  });

  return list;
};

const ExpenseModule: React.FC = () => {
  const [doctorName, setDoctorName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const createNewRow = (): ExpenseRow => ({
    id: Math.random().toString(36).substr(2, 9),
    date: "",
    doctorFee: 0,
    snacks: 0,
    food: 0,
    accommodation: 0,
    medicine: 0,
    other: 0,
  });

  const [rows, setRows] = useState<ExpenseRow[]>([createNewRow()]);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [savedSheets, setSavedSheets] = useState<SavedExpenseSheet[]>([]);

  // NEW: tracks the sheet currently being edited (null = normal "new entry" mode)
  const [editingSheet, setEditingSheet] = useState<SavedExpenseSheet | null>(null);
  // NEW: tracks the sheet currently open in the read-only View modal
  const [viewSheet, setViewSheet] = useState<SavedExpenseSheet | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchSavedSheets = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/expense/all");
      const json = await res.json();
      if (json.success && json.data) {
        const grouped = groupDbRowsIntoSheets(json.data);
        setSavedSheets(grouped);
      }
    } catch (error) {
      console.error("Failed to fetch saved expense sheets:", error);
    }
  };

  useEffect(() => {
    fetchSavedSheets();
  }, []);

  const handleRowChange = (
  index: number,
  field: keyof ExpenseRow,
  value: string
) => {
  const updatedRows = [...rows];

  if (field === "date") {
    updatedRows[index].date = value;
  } else if (field !== "id") {
    updatedRows[index][field] = Number(value) || 0;
  }

  setRows(updatedRows);
};

  const updateRowsForRange = (startStr: string, endStr: string) => {
    const partsStart = startStr.split("-").map(Number);
    const partsEnd = endStr.split("-").map(Number);
    if (partsStart.length !== 3 || partsEnd.length !== 3) return;

    const start = new Date(Date.UTC(partsStart[0], partsStart[1] - 1, partsStart[2]));
    const end = new Date(Date.UTC(partsEnd[0], partsEnd[1] - 1, partsEnd[2]));

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return;

    const newRows: ExpenseRow[] = [];
    const temp = new Date(start);

    setRows(prevRows => {
      while (temp <= end) {
        const yyyy = temp.getUTCFullYear();
        const mm = String(temp.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(temp.getUTCDate()).padStart(2, "0");
        const dateString = `${yyyy}-${mm}-${dd}`;

        const existingRow = prevRows.find(r => r.date === dateString);
        if (existingRow) {
          newRows.push(existingRow);
        } else {
          newRows.push({
            id: Math.random().toString(36).substr(2, 9),
            date: dateString,
            doctorFee: 0,
            snacks: 0,
            food: 0,
            accommodation: 0,
            medicine: 0,
            other: 0,
          });
        }
        temp.setUTCDate(temp.getUTCDate() + 1);
      }
      return newRows.length > 0 ? newRows : prevRows;
    });
  };

  const handleFromDateChange = (val: string) => {
    setFromDate(val);
    if (val && toDate) {
      updateRowsForRange(val, toDate);
    }
  };

  const handleToDateChange = (val: string) => {
    setToDate(val);
    if (fromDate && val) {
      updateRowsForRange(fromDate, val);
    }
  };

  const calculateRowTotal = (row: ExpenseRow) => {
    return (
      row.doctorFee +
      row.snacks +
      row.food +
      row.accommodation +
      row.medicine +
      row.other
    );
  };

  const calculateGrandTotal = (rowsToSum: ExpenseRow[] = rows) => {
    return rowsToSum.reduce((sum, row) => sum + calculateRowTotal(row), 0);
  };

  const handleAddDay = () => {
    setRows([...rows, createNewRow()]);
  };

  const handleClear = () => {
    setDoctorName("");
    setFromDate("");
    setToDate("");
    setRows([createNewRow()]);
    setEditingSheet(null);
  };

  // Deletes all DB rows belonging to a given saved sheet (by doctor + date range).
  // Reused by both the standalone Delete button and the Edit-save flow.
  const deleteSheetFromDb = async (sheet: SavedExpenseSheet) => {
    const ids = sheet.rows.map((r) => r.id).join(",");
    if (!ids) return;

    const url = `http://localhost:5000/api/expense/delete-by-ids?ids=${ids}`;
    const res = await fetch(url, { method: "DELETE" });
    const json = await res.json();
    if (!json.success) {
      throw new Error("Failed to delete existing sheet before update.");
    }
  };

  const handleSaveExpense = async () => {
    if (!doctorName) {
      alert("Please enter a doctor/guest name.");
      return;
    }

    setIsSaving(true);
    try {
      // EDIT MODE: remove the old DB rows for this sheet first, so the
      // update doesn't just add duplicate rows alongside the originals.
      if (editingSheet) {
        await deleteSheetFromDb(editingSheet);
      }

      const savePromises = rows.map((row) => {
        const payload = {
          doctor_name: doctorName,
          from_date: fromDate || null,
          to_date: toDate || null,
          bill_date: row.date || null,
          doctor_fee: row.doctorFee,
          snacks: row.snacks,
          food: row.food,
          accommodation: row.accommodation,
          medicine: row.medicine,
          other_expense: row.other,
          total: calculateRowTotal(row),
        };

        return fetch("http://localhost:5000/api/expense/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }).then(async (res) => {
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText || "Failed to save row");
          }
          return res.json();
        });
      });

      await Promise.all(savePromises);
      alert(editingSheet ? "Expense sheet updated successfully!" : "Expense sheet saved successfully!");
      setEditingSheet(null);
      fetchSavedSheets();
    } catch (error) {
      console.error(error);
      alert(
        (editingSheet ? "Failed to update expense sheet: " : "Failed to save expense sheet: ") +
        (error as Error).message
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Loads a sheet into the form for editing and remembers its original
  // identity so handleSaveExpense knows what to delete-and-replace.
  const handleEditSheet = (sheet: SavedExpenseSheet, e: React.MouseEvent) => {
    e.stopPropagation();
    setDoctorName(sheet.doctorName);
    setFromDate(sheet.fromDate);
    setToDate(sheet.toDate);
    setRows(sheet.rows.map(r => ({ ...r })));
    setEditingSheet(sheet);
    setShowSavedModal(false);
  };

  const handleViewSheet = (sheet: SavedExpenseSheet, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewSheet(sheet);
  };

  const handleCancelEdit = () => {
    handleClear();
  };

  const deleteSavedSheet = async (sheet: SavedExpenseSheet, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete the expense sheet for ${sheet.doctorName}?`)) {
      return;
    }

    setIsDeleting(sheet.id);
    try {
      await deleteSheetFromDb(sheet);
      alert("Expense sheet deleted successfully!");
      // If the sheet being deleted is the one currently loaded for editing, reset the form.
      if (editingSheet && editingSheet.id === sheet.id) {
        handleClear();
      }
      fetchSavedSheets();
    } catch (error) {
      console.error(error);
      alert("Failed to delete expense sheet from database.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handlePrintPDF = (override?: {
    doctorName: string;
    fromDate: string;
    toDate: string;
    rows: ExpenseRow[];
  }) => {
    const data = override || { doctorName, fromDate, toDate, rows };
    const doc = new jsPDF();

    // --- BRANDED HEADER SECTION (Tagnya Hospital Letterhead) ---
    const imgElement = document.getElementById('hospital-logo-img-expense') as HTMLImageElement;
    if (imgElement) {
      doc.addImage(imgElement, "PNG", 14, 13, 16, 16);
    }

    doc.setTextColor(6, 57, 112); // Deep Navy Blue
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(HOSPITAL_NAME_LINE1, 32, 24);

    // "24/7 SERVICES" (Middle block)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("24/7", 112, 21, { align: "right" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("SERVICES", 112, 26, { align: "right" });

    // Gold/Orange vertical separator line
    doc.setDrawColor(218, 145, 0); // Gold/Orange
    doc.setLineWidth(0.8);
    doc.line(116, 14, 116, 29);

    // Phone & Email contact details (Right side)
    doc.setTextColor(6, 57, 112);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(HOSPITAL_PHONE, 120, 20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(HOSPITAL_EMAIL, 120, 26);

    // Full width divider above address
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(15, 32, 195, 32);

    // Centered address bar
    doc.setTextColor(10, 80, 130);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(HOSPITAL_ADDRESS, 105, 36, { align: "center" });

    // Full width divider below address
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(15, 39, 195, 39);
    // --- END OF BRANDED HEADER SECTION ---

    // Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Expense Bills", 105, 48, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Multi-Day Billing Statement", 105, 53, { align: "center" });

    // Metadata
    doc.setFontSize(10);
    doc.text(`Doctor/Guest/Others: ${data.doctorName || "—"}`, 15, 62);
    doc.text(`From Date: ${data.fromDate || "—"}`, 15, 68);
    doc.text(`To Date: ${data.toDate || "—"}`, 120, 68);

    // Table
    const headers = [
      ["DATE", "DR. FEE", "SNACKS", "FOOD", "ACCOM.", "MEDICINE", "OTHER", "TOTAL"],
    ];
    const tableData = data.rows.map((r) => [
      r.date || "—",
      `Rs. ${r.doctorFee}`,
      `Rs. ${r.snacks}`,
      `Rs. ${r.food}`,
      `Rs. ${r.accommodation}`,
      `Rs. ${r.medicine}`,
      `Rs. ${r.other}`,
      `Rs. ${calculateRowTotal(r)}`,
    ]);

    autoTable(doc, {
      startY: 75,
      head: headers,
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85],
        cellPadding: 4,
      },
      columnStyles: {
        0: { halign: "center" },
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { fontStyle: "bold", halign: "right" },
      },
    });

    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } })
  .lastAutoTable.finalY + 15;

    // Grand Total
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: Rs. ${calculateGrandTotal(data.rows).toLocaleString("en-IN")}`, 195, finalY, { align: "right" });

    // Signature
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Authorized Signature: _______________________", 195, finalY + 25, { align: "right" });

    doc.autoPrint();
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="expense-container">
      {/* Branded Letterhead Header */}
      <div className="branded-header">
        <div className="header-top-row">
          <div className="header-left">
            <img id="hospital-logo-img-expense" src={hospitalLogo} alt="Logo" className="hospital-logo" />
            <span className="hospital-name">{HOSPITAL_NAME_LINE1}</span>
          </div>
          <div className="header-right">
            <div className="services-block">
              <span className="services-247">24/7</span>
              <span className="services-label">SERVICES</span>
            </div>
            <div className="vertical-divider"></div>
            <div className="contact-info">
              <span className="contact-phone">{HOSPITAL_PHONE}</span>
              <span className="contact-email">{HOSPITAL_EMAIL}</span>
            </div>
          </div>
        </div>
        <div className="header-divider-line"></div>
        <div className="header-address">{HOSPITAL_ADDRESS}</div>
        <div className="header-divider-line"></div>
      </div>

      {/* Title Header */}
      <div className="expense-header text-center my-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Expense Bills</h1>
        <p className="text-slate-500 text-sm mt-1">Multi-Day Billing Statement</p>
        {editingSheet && (
          <div className="mt-3 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold px-4 py-1.5 rounded-full">
            <Pencil className="w-3.5 h-3.5" />
            Editing: {editingSheet.doctorName} ({editingSheet.fromDate || "—"} to {editingSheet.toDate || "—"})
          </div>
        )}
      </div>

      {/* Top Form */}
      <div className="expense-form-grid mb-6">
        <div className="form-group">
          <label>Doctor/Guest/Others</label>
          <input
            type="text"
            placeholder="Enter doctor name"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => handleToDateChange(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="table-responsive mb-8">
        <table className="expense-table">
          <thead>
            <tr>
              <th>DATE</th>
              <th>DOCTOR FEE</th>
              <th>SNACKS</th>
              <th>FOOD</th>
              <th>ACCOMMODATION</th>
              <th>MEDICINE</th>
              <th>OTHER</th>
              <th>TOTAL</th>
              <th className="action-col"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td>
                  <input
                    type="date"
                    value={row.date}
                    onChange={(e) => handleRowChange(index, "date", e.target.value)}
                    className="table-input date-input"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.doctorFee === 0 ? "" : row.doctorFee}
                    onChange={(e) => handleRowChange(index, "doctorFee", e.target.value.replace(/[^0-9]/g, ""))}
                    className="table-input number-input"
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.snacks === 0 ? "" : row.snacks}
                    onChange={(e) => handleRowChange(index, "snacks", e.target.value.replace(/[^0-9]/g, ""))}
                    className="table-input number-input"
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.food === 0 ? "" : row.food}
                    onChange={(e) => handleRowChange(index, "food", e.target.value.replace(/[^0-9]/g, ""))}
                    className="table-input number-input"
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.accommodation === 0 ? "" : row.accommodation}
                    onChange={(e) => handleRowChange(index, "accommodation", e.target.value.replace(/[^0-9]/g, ""))}
                    className="table-input number-input"
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.medicine === 0 ? "" : row.medicine}
                    onChange={(e) => handleRowChange(index, "medicine", e.target.value.replace(/[^0-9]/g, ""))}
                    className="table-input number-input"
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={row.other === 0 ? "" : row.other}
                    onChange={(e) => handleRowChange(index, "other", e.target.value.replace(/[^0-9]/g, ""))}
                    className="table-input number-input"
                    placeholder="0"
                  />
                </td>
                <td className="total-cell font-bold">
                  ₹{calculateRowTotal(row).toLocaleString("en-IN")}
                </td>
                <td className="action-col">
                  {rows.length > 1 && (
                    <button
                      onClick={() => setRows(rows.filter((_, rIdx) => rIdx !== index))}
                      className="delete-row-btn"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button onClick={handleSaveExpense} className="btn btn-save" disabled={isSaving}>
          <Save className="w-4 h-4" />
          <span>{isSaving ? "Saving..." : editingSheet ? "Update Expense" : "Save Expense"}</span>
        </button>
        <button onClick={handleAddDay} className="btn btn-add">
          <PlusCircle className="w-4 h-4" />
          <span>Add Day</span>
        </button>
        <button onClick={() => handlePrintPDF()} className="btn btn-print">
          <Printer className="w-4 h-4" />
          <span>Print / PDF</span>
        </button>
        <button onClick={handleClear} className="btn btn-clear">
          <RotateCcw className="w-4 h-4" />
          <span>{editingSheet ? "Cancel Edit" : "Clear"}</span>
        </button>
        <button onClick={() => setShowSavedModal(true)} className="btn btn-saved">
          <FolderOpen className="w-4 h-4" />
          <span>Saved Expenses</span>
        </button>
      </div>

      {/* Footer Area */}
      <div className="expense-footer flex justify-between items-start mt-8 pt-6 border-t border-slate-200">
        <div></div>
        <div className="text-right space-y-6">
          <div className="text-2xl font-black text-slate-800">
            Grand Total: <span className="text-indigo-600">₹{calculateGrandTotal().toLocaleString("en-IN")}</span>
          </div>
          <div className="pt-8">
            <div className="border-t border-slate-400 w-64 ml-auto"></div>
            <div className="text-sm font-semibold text-slate-500 mt-2">Authorized Signature</div>
          </div>
        </div>
      </div>

      {/* Saved Sheets Modal */}
      {showSavedModal && (
        <div className="modal-overlay" onClick={() => setShowSavedModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">Saved Expense Sheets</h2>
              <button className="close-btn" onClick={() => setShowSavedModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {savedSheets.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No saved expense sheets found.</p>
              ) : (
                <div className="space-y-3">
                  {savedSheets.map((sheet) => (
                    <div
                      key={sheet.id}
                      className="saved-sheet-item flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-300 transition-all"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800">{sheet.doctorName}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Period: {sheet.fromDate || "—"} to {sheet.toDate || "—"} | Saved: {sheet.savedAt}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-600 mr-2">
                          ₹{sheet.rows.reduce((sum, r) => sum + calculateRowTotal(r), 0).toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={(e) => handleViewSheet(sheet, e)}
                          className="p-1.5 hover:bg-slate-200 rounded"
                          title="View Sheet"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                          onClick={(e) => handleEditSheet(sheet, e)}
                          className="p-1.5 hover:bg-blue-50 rounded"
                          title="Edit Sheet"
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={(e) => deleteSavedSheet(sheet, e)}
                          className="p-1.5 hover:bg-red-50 rounded disabled:opacity-50"
                          title="Delete Sheet"
                          disabled={isDeleting === sheet.id}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Sheet Modal (read-only) */}
      {viewSheet && (
        <div className="modal-overlay" onClick={() => setViewSheet(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "900px" }}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">
                {viewSheet.doctorName} — {viewSheet.fromDate || "—"} to {viewSheet.toDate || "—"}
              </h2>
              <button className="close-btn" onClick={() => setViewSheet(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <div className="table-responsive mb-4">
                <table className="expense-table">
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>DOCTOR FEE</th>
                      <th>SNACKS</th>
                      <th>FOOD</th>
                      <th>ACCOMMODATION</th>
                      <th>MEDICINE</th>
                      <th>OTHER</th>
                      <th>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewSheet.rows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.date || "—"}</td>
                        <td>₹{row.doctorFee.toLocaleString("en-IN")}</td>
                        <td>₹{row.snacks.toLocaleString("en-IN")}</td>
                        <td>₹{row.food.toLocaleString("en-IN")}</td>
                        <td>₹{row.accommodation.toLocaleString("en-IN")}</td>
                        <td>₹{row.medicine.toLocaleString("en-IN")}</td>
                        <td>₹{row.other.toLocaleString("en-IN")}</td>
                        <td className="font-bold">₹{calculateRowTotal(row).toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-lg font-black text-slate-800">
                  Grand Total:{" "}
                  <span className="text-indigo-600">
                    ₹{calculateGrandTotal(viewSheet.rows).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    className="btn btn-print"
                    onClick={() =>
                      handlePrintPDF({
                        doctorName: viewSheet.doctorName,
                        fromDate: viewSheet.fromDate,
                        toDate: viewSheet.toDate,
                        rows: viewSheet.rows,
                      })
                    }
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print / PDF</span>
                  </button>
                  <button
                    className="btn btn-clear"
                    onClick={() => setViewSheet(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseModule;
