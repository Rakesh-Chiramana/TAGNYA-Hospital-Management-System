import React, { useState, useRef, useEffect } from "react";
import { Invoice, Patient, LabTest, UserRole } from "../../../shared/types";

// Load mock data if present. Keep this dynamic so the file can be removed when using DB-only mode.
let clinicalData: any = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  clinicalData = require("../data/pharmacyMockData.json");
} catch (err) {
  clinicalData = {};
}

export interface Vendor {
  id: string;
  dbId?: number | string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  dlNo?: string;
  gstNo?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface VendorPaymentTerm {
  date: string;
  amountPaid: number;
  itemsPaidCount: number;
  notes: string;
}

export interface VendorBill {
  id: string;
  vendorName: string;
  invoiceNo: string;
  invoiceDate: string;
  dlNo?: string;
  status: "Active" | "Inactive" | "Completed" | "Partial";
  items: any[];
  totalDeliveredQty: number;
  totalPaidQty: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentHistory: VendorPaymentTerm[];
  date: string;
}

export interface Medicine {
  id: string;
  name: string;
  stock: number;
  price: number; // Sell price
  buyPrice?: number;
  mrp?: number;
  batchNo?: string;
  expiry: string;
  category?: string;
  unit?: string;
  dosage?: string;
  hsnCode?: string;
  taxPercentage?: string;
  pack?: string;
  companyName?: string;
  vendorName?: string;
  vendorPhone?: string;
  vendorEmail?: string;
  vendorAddress?: string;
  vendorContactPerson?: string;
  vendorDlNo?: string;
  vendorGstNo?: string;
  vendorStatus?: string;
  discount?: number;
}

export interface BulkOrderItem {
  name: string;
  dosage?: string;
  hsnCode?: string;
  company?: string;
  pack?: string;
  batchNo?: string;
  qty: number;
  qtyFree: number;
  buyPrice: number;
  sellPrice: number;
  mrp: number;
  expiry: string;
  discount?: number;
  discountAmount?: number;
  tax?: number;
  taxAmount?: number;
  totalAmount: number;
}

export interface PharmacyBill {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  ageGender: string;
  date: string;
  time: string;
  items: SalesEntryItem[];
  subtotal: number;
  gstTotal: number;
  total: number;
  paidAmount: number;
  balance: number;
  amountInWords: string;
  paymentMode: string;
  dlNo: string;
}

const BILL_PREFIX = "Tgy-";
const formatBillNo = (count: number) => `${BILL_PREFIX}${String(count).padStart(3, "0")}`;
const normalizeBillNo = (value: any) => {
  const bill = value ? String(value).trim() : "";
  if (!bill) return bill;
  if (bill.startsWith(BILL_PREFIX)) return bill;
  if (/^\d+$/.test(bill)) return formatBillNo(Number(bill));
  return bill;
};

const parseBillCount = (billNo: string): number => {
  if (!billNo) return NaN;
  const normalized = normalizeBillNo(billNo);
  const numericPart = normalized.startsWith(BILL_PREFIX) ? normalized.slice(BILL_PREFIX.length) : normalized;
  const count = parseInt(numericPart, 10);
  return Number.isInteger(count) ? count : NaN;
};

export interface SalesEntryItem {
  name: string;
  hsnCode?: string;
  batchNo?: string;
  qty: number;
  purchasePrice: number;
  mrp: number;
  expiry: string;
  discount?: number;
  discountAmount?: number;
  tax?: number;
  taxAmount?: number;
  totalAmount: number;
  stockStrips?: string;
}

export const useClinicalModules = (
  type: "lab" | "pharmacy",
  onAddInvoice?: (i: Invoice) => void,
  patients: Patient[] = [],
  doctors: any[] = [],
  labTests: any[] = [],
  setLabTests: React.Dispatch<React.SetStateAction<any[]>> = () => { },
  userRole?: UserRole
) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReplenishModalOpen, setIsReplenishModalOpen] = useState(false);
  const [isStockCheckModalOpen, setIsStockCheckModalOpen] = useState(false);
  const [isBulkOrderModalOpen, setIsBulkOrderModalOpen] = useState(false);
  const [isEditMedModalOpen, setIsEditMedModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isViewMedModalOpen, setIsViewMedModalOpen] = useState(false);
  const [isCreateMedModalOpen, setIsCreateMedModalOpen] = useState(false);
  const [pharmacyView, setPharmacyView] = useState<"dashboard" | "createMedicine" | "purchaseEntry" | "salesEntry" | "salesBills" | "purchaseBills" | "vendors" | "vendorBills">("dashboard");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stockBills, setStockBills] = useState<any[]>([]);

  useEffect(() => {
    if (type !== "pharmacy") return;

    const loadVendorsAndBills = async () => {
      try {
        const vResp = await fetch("http://localhost:5000/api/vendors");
        if (vResp.ok) {
          const vData = await vResp.json();
          if (vData.success) {
            setVendors(vData.vendors || []);
          }
        }
      } catch (err) {
        console.warn("Failed to load vendors from DB", err);
      }

      try {
        const bResp = await fetch("http://localhost:5000/api/purchase-orders");
        if (bResp.ok) {
          const bData = await bResp.json();
          if (bData.success) {
            setStockBills(bData.purchaseOrders || []);
          }
        }
      } catch (err) {
        console.warn("Failed to load purchase bills from DB", err);
      }

      try {
        const sResp = await fetch("http://localhost:5000/api/sales");
        if (sResp.ok) {
          const sData = await sResp.json();
          if (sData.success && Array.isArray(sData.sales)) {
            const mappedSales = sData.sales.map((row: any) => {
              const billNo = normalizeBillNo(row.bill_no || row.id);
              return {
                id: billNo,
                patientId: row.patient_id || "WALKIN",
                patientName: row.patient_name || "Walk-in",
                phone: "",
                ageGender: "N/A",
                date: row.created_at
                  ? new Date(row.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                  : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                time: row.created_at
                  ? new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                  : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                items: Array.from({ length: Number(row.itemCount || 0) }, () => ({ name: "Item", qty: 1, price: 0 })),
                subtotal: Number(row.total_amount || 0),
                gstTotal: 0,
                total: Number(row.total_amount || 0),
                paidAmount: Number(row.total_amount || 0),
                balance: 0,
                amountInWords: "",
                paymentMode: row.payment_mode || "Cash",
                dlNo: "",
              };
            });
            setRecentBills((prev) => {
              const existingIds = new Set(prev.map((bill) => normalizeBillNo(bill.id)));
              const merged = [
                ...mappedSales.filter((bill) => !existingIds.has(normalizeBillNo(bill.id))),
                ...prev,
              ];
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn("Failed to load pharmacy sales from DB", err);
      }
    };

    loadVendorsAndBills();
  }, [type]);

  const [recentlyCreatedMedicines, setRecentlyCreatedMedicines] = useState<any[]>([]);
  const [newlyCreatedMedicine, setNewlyCreatedMedicine] = useState<any>(null);
  const [isCreateMedSuccessModalOpen, setIsCreateMedSuccessModalOpen] = useState(false);
  const [viewingMedicine, setViewingMedicine] = useState<Medicine | null>(null);
  const [showPharmacyReceipt, setShowPharmacyReceipt] = useState(false);
  const [latestPharmacyBill, setLatestPharmacyBill] = useState<PharmacyBill | null>(null);
  const [showBulkOrderReceipt, setShowBulkOrderReceipt] = useState(false);
  const [latestBulkOrderBill, setLatestBulkOrderBill] = useState<any>(null);
  const [pharmacySearchTerm, setPharmacySearchTerm] = useState("");
  const [billingSearchTerm, setBillingSearchTerm] = useState("");
  const [billingQty, setBillingQty] = useState<number | string>("");

  const [recentBills, setRecentBills] = useState<PharmacyBill[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("accendia_v3_recent_bills");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const totalPharmacyRevenue = (recentBills || []).reduce((acc, b) => acc + (b.total || 0), 0);

  const [selectedReport, setSelectedReport] = useState<LabTest | null>(null);
  const [manualResults, setManualResults] = useState<Record<string, string>>({});
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [healthSummary, setHealthSummary] = useState("");
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [isRadiologyModalOpen, setIsRadiologyModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("accendia_v3_medicines");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  // Load medicines from backend DB on mount; fall back to local storage or mock data
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const resp = await fetch("http://localhost:5000/api/medicines");
        if (!resp.ok) throw new Error(`Status ${resp.status}`);
        const data = await resp.json();
        if (mounted && data && data.success && Array.isArray(data.medicines)) {
          // Map DB rows to frontend model
          const mapped = data.medicines.map((r: any) => ({
            id: r.medicine_id || `M${r.id}`,
            name: r.medicine_name || r.name || "",
            hsnCode: r.hsn_code || "",
            taxPercentage: r.tax_percentage ? String(r.tax_percentage) : "",
            dosage: r.dosage || "",
            pack: r.pack || "",
            companyName: r.company_name || "",
            vendorName: r.vendor_name || "",
            vendorPhone: r.vendor_mobile || "",
            vendorEmail: r.vendor_email || "",
            vendorAddress: r.vendor_address || "",
            vendorContactPerson: r.vendor_contact_person || "",
            vendorDlNo: r.vendor_dl_no || "",
            vendorGstNo: r.vendor_gst_no || "",
            vendorStatus: r.vendor_status || "",
            stock: r.stock || 0,
            buyPrice: r.latest_buy_price ? Number(r.latest_buy_price) : 0,
            price: r.latest_sell_price ? Number(r.latest_sell_price) : (r.latest_mrp ? Number(r.latest_mrp) : 0),
            mrp: r.latest_mrp ? Number(r.latest_mrp) : 0,
            batchNo: r.latest_batch_no || "",
            expiry: r.latest_expiry || "2027-12",
            discount: r.latest_discount ? Number(r.latest_discount) : 0,
            category: r.category || "General",
          }));
          setMedicines(mapped);
          return;
        }
      } catch (err) {
        console.warn("Failed to load medicines from server:", err);
      }

      // fallback: try localStorage then mock
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("accendia_v3_medicines");
        if (saved) {
          setMedicines(JSON.parse(saved));
          return;
        }
      }

      // final fallback to mock data if present
      try {
        const mock = (clinicalData as any).MEDICINES || [];
        setMedicines(mock);
      } catch (err) {
        setMedicines([]);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem("accendia_v3_medicines", JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem("accendia_v3_recent_bills", JSON.stringify(recentBills));
  }, [recentBills]);

  useEffect(() => {
    localStorage.setItem("accendia_v3_stock_bills", JSON.stringify(stockBills));
  }, [stockBills]);

  useEffect(() => {
    const maxSalesCount = recentBills.reduce((max, bill) => {
      const count = parseBillCount(bill.id);
      return Number.isFinite(count) ? Math.max(max, count) : max;
    }, 0);
    const nextSalesCount = maxSalesCount > 0 ? maxSalesCount + 1 : salesBillNoCounter[0];
    if (nextSalesCount > salesBillNoCounter[0]) {
      salesBillNoCounter[1](nextSalesCount);
      setSalesBillNo(formatBillNo(nextSalesCount));
      localStorage.setItem("accendia_v3_sales_bill_counter", String(nextSalesCount));
    }
  }, [recentBills]);

  useEffect(() => {
    const maxPurchaseCount = stockBills.reduce((max, bill) => {
      const count = parseBillCount(bill.billNo || bill.id || "");
      return Number.isFinite(count) ? Math.max(max, count) : max;
    }, 0);
    const nextPurchaseCount = maxPurchaseCount > 0 ? maxPurchaseCount + 1 : purchaseBillCounter;
    if (nextPurchaseCount > purchaseBillCounter) {
      setPurchaseBillCounter(nextPurchaseCount);
      setPurchaseBillNo(formatBillNo(nextPurchaseCount));
      localStorage.setItem("accendia_v3_purchase_bill_counter", String(nextPurchaseCount));
    }
  }, [stockBills]);

  const [billItems, setBillItems] = useState<{ name: string; qty: number; price: number }[]>([]);

  const [bulkOrderItems, setBulkOrderItems] = useState<BulkOrderItem[]>([]);
  const [bulkOrderVendor, setBulkOrderVendor] = useState("");

  const [purchaseInvoiceDate, setPurchaseInvoiceDate] = useState("");
  const [purchaseLRDate, setPurchaseLRDate] = useState("");
  const [purchaseBillCounter, setPurchaseBillCounter] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("accendia_v3_purchase_bill_counter");
      return saved ? parseInt(saved, 10) : 1;
    }
    return 1;
  });
  const [purchaseBillNo, setPurchaseBillNo] = useState(() => formatBillNo(purchaseBillCounter));
  const [purchaseDLNo, setPurchaseDLNo] = useState("");
  const [purchaseGstNo, setPurchaseGstNo] = useState("");
  const [purchaseInvoiceNo, setPurchaseInvoiceNo] = useState("");
  const [purchasePaidAmount, setPurchasePaidAmount] = useState(0);
  const [purchasePaymentMode, setPurchasePaymentMode] = useState("");
  const [purchaseSupplierName, setPurchaseSupplierName] = useState("");

  const [purchaseCurrentItem, setPurchaseCurrentItem] = useState<any>({
    name: "", dosage: "", hsnCode: "", company: "", pack: "", batchNo: "", qty: "", qtyFree: "", buyPrice: "", sellPrice: "", mrp: "", expiry: "", discount: "", discountAmount: 0, tax: "", taxAmount: 0, totalAmount: 0
  });

  // Sales Entry State
  const [salesItems, setSalesItems] = useState<SalesEntryItem[]>([]);
  const salesBillNoCounter = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("accendia_v3_sales_bill_counter");
      return saved ? parseInt(saved, 10) : 1;
    }
    return 1;
  });
  const [salesBillNo, setSalesBillNo] = useState(() => formatBillNo(salesBillNoCounter[0]));
  const [salesPatientIP, setSalesPatientIP] = useState("");
  const [salesPatientId, setSalesPatientId] = useState("");
  const [salesPatientName, setSalesPatientName] = useState("");
  const [salesPatientMobile, setSalesPatientMobile] = useState("");
  const [salesPatientAge, setSalesPatientAge] = useState("");
  const [ipLookupStatus, setIpLookupStatus] = useState<"idle" | "found" | "notfound">("idle");
  const [salesBillDateTime, setSalesBillDateTime] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [salesIsOutside, setSalesIsOutside] = useState(false);
  const [salesPaymentMode, setSalesPaymentMode] = useState("");
  const [salesPaidAmount, setSalesPaidAmount] = useState(0);

  const [salesCurrentItem, setSalesCurrentItem] = useState<any>({
    name: "", hsnCode: "", batchNo: "", qty: "", purchasePrice: "", mrp: "", expiry: "", discount: "", discountAmount: 0, tax: "", taxAmount: 0, totalAmount: 0, stockStrips: ""
  });

  // IP Number auto-lookup: reads admission record from localStorage and fills patient details
  const handleSalesPatientIPChange = (ip: string) => {
    setSalesPatientIP(ip);
    if (!ip.trim()) {
      setIpLookupStatus("idle");
      setSalesPatientName("");
      setSalesPatientId("");
      setSalesPatientMobile("");
      setSalesPatientAge("");
      return;
    }
    const key = `accendia_ip_${ip.trim().toUpperCase()}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const record = JSON.parse(stored);
        setSalesPatientName(record.patientName || "");
        setSalesPatientId(record.uhid || record.ipNo || "");
        setSalesPatientMobile(record.mobileNo || "");
        setSalesPatientAge(record.age || "");
        setIpLookupStatus("found");
      } catch {
        setIpLookupStatus("notfound");
      }
    } else {
      setIpLookupStatus("notfound");
      setSalesPatientName("");
      setSalesPatientId("");
      setSalesPatientMobile("");
      setSalesPatientAge("");
    }
  };

  // Utility: lookup any IP from localStorage
  const lookupIPRecord = (ip: string): any | null => {
    if (!ip.trim()) return null;
    const stored = localStorage.getItem(`accendia_ip_${ip.trim().toUpperCase()}`);
    try { return stored ? JSON.parse(stored) : null; } catch { return null; }
  };

  // All known IP admissions index for datalist dropdown
  const allIPRecords: string[] = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("accendia_ip_index") || "[]")
    : [];

  const updateSalesCurrentItem = (field: keyof SalesEntryItem, value: any) => {
    setSalesCurrentItem(prev => {
      // For numeric fields, always convert to number immediately
      // This prevents empty string "" from breaking calculations
      let parsedValue = value;
      if (["qty", "purchasePrice", "mrp", "discount", "tax"].includes(field as string)) {
        const num = parseFloat(value);
        parsedValue = isNaN(num) ? 0 : num;
      }
      const updated = { ...prev, [field]: parsedValue };

      // Auto-populate from existing medicines or purchase history
      if (field === "name" || field === "batchNo") {
        const trimmedName = (field === "name" ? value : updated.name).trim().toLowerCase();

        // Get all historical purchase items for this medicine
        const allPurchaseItems = stockBills.flatMap(bill => {
          // Parse date carefully: "DD/MM/YYYY" or "YYYY-MM-DD"
          let timestamp = 0;
          if (bill.date) {
            const parts = bill.date.split(/[-/]/);
            if (parts.length === 3) {
              if (parts[0].length === 4) timestamp = new Date(bill.date).getTime(); // YYYY-MM-DD
              else timestamp = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime(); // DD/MM/YYYY
            }
          }
          return (bill.items || []).map((item: any) => ({ ...item, billTimestamp: timestamp }));
        });

        const relevantPurchases = allPurchaseItems.filter((item: any) =>
          item.name && item.name.trim().toLowerCase() === trimmedName
        );

        let targetPurchase = null;

        if (field === "batchNo" && value) {
          targetPurchase = relevantPurchases
            .filter((item: any) => item.batchNo === value)
            .sort((a: any, b: any) => b.billTimestamp - a.billTimestamp)[0];
        } else {
          targetPurchase = relevantPurchases
            .sort((a: any, b: any) => b.billTimestamp - a.billTimestamp)[0];
        }

        if (targetPurchase) {
          updated.hsnCode = targetPurchase.hsnCode || updated.hsnCode;
          updated.tax = targetPurchase.tax || updated.tax;
          updated.mrp = targetPurchase.mrp || targetPurchase.sellPrice || updated.mrp;
          updated.purchasePrice = targetPurchase.buyPrice || updated.purchasePrice;
          updated.expiry = targetPurchase.expiry || updated.expiry;
          updated.batchNo = targetPurchase.batchNo || updated.batchNo;
          updated.discount = targetPurchase.discount || updated.discount;
          // Also pull stock from medicines array
          const med = medicines.find(m => m.name.trim().toLowerCase() === trimmedName);
          if (med) updated.stockStrips = String(med.stock || 0);
        } else {
          const existingMed = medicines.find(m => m.name.trim().toLowerCase() === trimmedName);
          if (existingMed) {
            updated.hsnCode = existingMed.hsnCode || updated.hsnCode;
            updated.tax = parseFloat(existingMed.taxPercentage || "0");
            updated.mrp = existingMed.mrp || existingMed.price || updated.mrp;
            updated.purchasePrice = existingMed.buyPrice || updated.purchasePrice;
            updated.stockStrips = String(existingMed.stock || 0);
            updated.expiry = existingMed.expiry || updated.expiry;
            updated.batchNo = existingMed.batchNo || updated.batchNo;
            updated.discount = existingMed.discount || updated.discount;
          }
        }
      }

      // Auto-calculate amounts
      if (["qty", "mrp", "discount", "tax", "name", "purchasePrice", "batchNo"].includes(field as string)) {
        const qty = parseFloat(String(updated.qty || 0));
        const mrp = parseFloat(String(updated.mrp || 0));
        const discountPercent = parseFloat(String(updated.discount || 0));
        const taxPercent = parseFloat(String(updated.tax || 0));

        const subtotal = qty * mrp;
        const discountAmount = (subtotal * discountPercent) / 100;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = (afterDiscount * taxPercent) / 100;
        const totalAmount = afterDiscount + taxAmount;

        updated.discountAmount = discountAmount;
        updated.taxAmount = taxAmount;
        updated.totalAmount = totalAmount;
      }

      return updated;
    });
  };

  const addSalesCurrentItem = () => {
    if (!salesCurrentItem.name) return;

    // Block if qty exceeds available stock
    const availableStock = Number(salesCurrentItem.stockStrips || 0);
    const requestedQty = Number(salesCurrentItem.qty || 0);
    if (availableStock > 0 && requestedQty > availableStock) {
      alert(`⚠ Insufficient stock! Only ${availableStock} units available for "${salesCurrentItem.name}".`);
      return;
    }

    const parsedItem: SalesEntryItem = {
      ...salesCurrentItem,
      qty: Number(salesCurrentItem.qty || 0),
      purchasePrice: Number(salesCurrentItem.purchasePrice || 0),
      mrp: Number(salesCurrentItem.mrp || 0),
      discount: Number(salesCurrentItem.discount || 0),
      tax: Number(salesCurrentItem.tax || 0),
      discountAmount: Number(salesCurrentItem.discountAmount || 0),
      taxAmount: Number(salesCurrentItem.taxAmount || 0),
      totalAmount: Number(salesCurrentItem.totalAmount || 0)
    };
    setSalesItems(prev => [...prev, parsedItem]);

    // Deduct stock from medicines state immediately
    const soldName = salesCurrentItem.name.trim().toLowerCase();
    const soldQty = Number(salesCurrentItem.qty || 0);
    setMedicines(prev => prev.map(m =>
      m.name.trim().toLowerCase() === soldName
        ? { ...m, stock: Math.max(0, (m.stock || 0) - soldQty) }
        : m
    ));

    setSalesCurrentItem({
      name: "", hsnCode: "", batchNo: "", qty: 0, purchasePrice: 0, mrp: 0, expiry: "", discount: 0, discountAmount: 0, tax: 0, taxAmount: 0, totalAmount: 0, stockStrips: ""
    });
  };

  const removeSalesItem = (index: number) => {
    setSalesItems(salesItems.filter((_, i) => i !== index));
  };

  const updatePurchaseCurrentItem = (field: keyof BulkOrderItem, value: any) => {
    setPurchaseCurrentItem(prev => {
      // For numeric fields, always convert to number immediately
      // This ensures calculations always use real numbers, not strings
      let parsedValue = value;
      if (["qty", "qtyFree", "buyPrice", "sellPrice", "mrp", "discount", "tax"].includes(field as string)) {
        const num = parseFloat(value);
        parsedValue = isNaN(num) ? 0 : num;
      }
      const updated = { ...prev, [field]: parsedValue };

      // Auto-populate from existing medicines if name is changed
      if (field === "name") {
        const existingMed = medicines.find((m: any) =>
          (m.medicine_name || m.name || "").toLowerCase() === String(value).toLowerCase()
        );
        if (existingMed) {
          updated.hsnCode = existingMed.hsnCode || updated.hsnCode;
          updated.tax = parseFloat(existingMed.taxPercentage || "0");
          updated.pack = existingMed.pack || updated.pack;
          updated.dosage = existingMed.dosage || updated.dosage;
        }
      }

      // Auto-calculate amounts whenever any relevant field changes
      if (["qty", "buyPrice", "discount", "tax", "name", "sellPrice", "mrp"].includes(field as string)) {
        const qty = Number(updated.qty) || 0;
        const buyPrice = Number(updated.buyPrice) || 0;
        const discountPercent = Number(updated.discount) || 0;
        const taxPercent = Number(updated.tax) || 0;

        const subtotal = qty * buyPrice;
        const discountAmount = (subtotal * discountPercent) / 100;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = (afterDiscount * taxPercent) / 100;
        const totalAmount = afterDiscount + taxAmount;

        updated.discountAmount = discountAmount;
        updated.taxAmount = taxAmount;
        updated.totalAmount = totalAmount;
      }

      return updated;
    });
  };


  const addCurrentItemToOrder = () => {
    if (!purchaseCurrentItem.name) return;
    const parsedItem: BulkOrderItem = {
      ...purchaseCurrentItem,
      qty: Number(purchaseCurrentItem.qty || 0),
      qtyFree: Number(purchaseCurrentItem.qtyFree || 0),
      buyPrice: Number(purchaseCurrentItem.buyPrice || 0),
      sellPrice: Number(purchaseCurrentItem.sellPrice || 0),
      mrp: Number(purchaseCurrentItem.mrp || 0),
      discount: Number(purchaseCurrentItem.discount || 0),
      tax: Number(purchaseCurrentItem.tax || 0),
      discountAmount: Number(purchaseCurrentItem.discountAmount || 0),
      taxAmount: Number(purchaseCurrentItem.taxAmount || 0),
      totalAmount: Number(purchaseCurrentItem.totalAmount || 0)
    };
    setBulkOrderItems(prev => [...prev, parsedItem]);
    setPurchaseCurrentItem({
      name: "", dosage: "", hsnCode: "", company: "", pack: "", batchNo: "", qty: 0, qtyFree: 0, buyPrice: 0, sellPrice: 0, mrp: 0, expiry: "", discount: 0, discountAmount: 0, tax: 0, taxAmount: 0, totalAmount: 0
    });
  };

  const handleLabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const totalCost = selectedTests.reduce(
      (acc, t) => acc + ((clinicalData.DIAGNOSTIC_PRICES as any)[t] || 0),
      0
    );

    let inRangeCount = 0;
    let totalMetrics = 0;
    Object.entries(manualResults).forEach(([key, val]) => {
      const conf = (clinicalData.DIAGNOSTIC_RANGES as any)[key];
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
        amount: `Γé╣${(totalCost * 83).toFixed(0)}`,
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
    const cost = (clinicalData.DIAGNOSTIC_PRICES as any)[testName] || 150;
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
        amount: `Γé╣${(cost * 83).toFixed(0)}`,
        status: "Paid",
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });
    }

    setIsRadiologyModalOpen(false);
  };

  const handleAddBillItem = () => {
    if (!billingSearchTerm) {
      window.alert("Please select a medicine first.");
      return;
    }

    const qty = parseInt(billingQty.toString());
    if (isNaN(qty) || qty <= 0) {
      window.alert("Please enter a valid quantity.");
      return;
    }

    const med = medicines.find((m) =>
      m.name.toLowerCase() === billingSearchTerm.toLowerCase() ||
      m.id.toLowerCase() === billingSearchTerm.toLowerCase()
    );

    if (med) {
      if (med.stock < qty) {
        window.alert(`Insufficient stock! Only ${med.stock} units available.`);
        return;
      }
      setBillItems([...billItems, { name: med.name, qty, price: med.price }]);
      setBillingSearchTerm("");
      setBillingQty("");
    } else {
      window.alert("Medicine not found in inventory.");
    }
  };

  const toggleTest = (testName: string) => {
    if (testName === "Comprehensive Health Profile") {
      if (selectedTests.includes("Comprehensive Health Profile")) {
        setSelectedTests([]);
      } else {
        setSelectedTests(["Comprehensive Health Profile", ...clinicalData.HEALTH_CHECKUP_TESTS]);
      }
      return;
    }
    setSelectedTests((prev) =>
      prev.includes(testName) ? prev.filter((t) => t !== testName) : [...prev, testName]
    );
  };

  const handlePharmacySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const total = salesItems.reduce((acc, i) => acc + Number(i.totalAmount || 0), 0);
    const gstTotal = salesItems.reduce((acc, i) => acc + Number(i.taxAmount || 0), 0);
    const subtotal = total - gstTotal;
    const pName = salesPatientName;
    const balance = total - salesPaidAmount;

    const newBill: PharmacyBill = {
      id: salesBillNo,
      patientId: salesPatientIP || salesPatientId || "WALKIN",
      patientName: pName,
      phone: salesPatientMobile || salesPatientIP || "",
      ageGender: salesPatientAge ? `${salesPatientAge}/N/A` : "N/A",
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      items: [...salesItems],
      subtotal,
      gstTotal,
      total,
      paidAmount: salesPaidAmount,
      balance,
      amountInWords: numberToWords(Math.round(total)),
      paymentMode: salesPaymentMode || "Cash",
      dlNo: "20B/KA-B51-253741"
    };

    // ── Save to DB ──────────────────────────────────────────────────────────
    try {
      const payload = {
        billNo: salesBillNo,
        patientId: salesPatientIP || salesPatientId || "WALKIN",
        patientName: pName,
        paymentMode: salesPaymentMode || "Cash",
        totalAmount: total,
        items: salesItems.map((item) => ({
          medicineId: null,           // no medicine_id lookup yet
          medicine: item.name,        // backend expects "medicine"
          batch: item.batchNo,        // backend expects "batch"
          qty: Number(item.qty || 0),
          mrp: Number(item.mrp || 0),
          discount: Number(item.discount || 0),
          tax: Number(item.tax || 0),
          total: Number(item.totalAmount || 0), // backend expects "total"
        })),
      };

      const response = await fetch("http://localhost:5000/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!data.success) {
        console.error("Failed to save sale to DB:", data);
        window.alert("Warning: Sale processed locally but DB save failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error saving sale to DB:", err);
      window.alert("Warning: Could not connect to server. Sale saved locally only.");
    }
    // ────────────────────────────────────────────────────────────────────────

    // Update medicine stock
    setMedicines((prev) =>
      prev.map((m) => {
        const soldItem = salesItems.find((si) => si.name.toLowerCase() === m.name.toLowerCase());
        if (soldItem) return { ...m, stock: Math.max(0, m.stock - Number(soldItem.qty || 0)) };
        return m;
      })
    );

    if (onAddInvoice) {
      const patient = patients.find(p => p.name === pName);
      onAddInvoice({
        id: `PH-${newBill.id}`,
        name: pName,
        patientId: patient?.id || "WALKIN",
        services: salesItems.map((i) => `${i.name} x${i.qty}`).join(", "),
        amount: `₹${total.toFixed(0)}`,
        status: "Paid",
        date: newBill.date,
        time: newBill.time,
      });
    }

    setLatestPharmacyBill(newBill);
    setRecentBills((prev) => [newBill, ...prev]);
    setShowPharmacyReceipt(true);

    // Reset sales entry
    setSalesItems([]);
    setSalesPatientName("");
    setSalesPatientIP("");
    setSalesPatientId("");
    setSalesPatientMobile("");
    setSalesPatientAge("");
    setIpLookupStatus("idle");
    setSalesPaidAmount(0);
    setSalesPaymentMode("");
    setSalesIsOutside(false);

    // Increment bill number
    const nextBillNo = salesBillNoCounter[0] + 1;
    salesBillNoCounter[1](nextBillNo);
    setSalesBillNo(formatBillNo(nextBillNo));
    localStorage.setItem("accendia_v3_sales_bill_counter", String(nextBillNo));

    setPharmacyView("dashboard");
  };


  const handleEditMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newPrice = parseFloat(formData.get("price") as string);
    const newStock = parseInt(formData.get("stock") as string);

    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === editingMedicine?.id) {
          return { ...m, price: newPrice, stock: newStock };
        }
        return m;
      })
    );
    setIsEditMedModalOpen(false);
    setEditingMedicine(null);
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const payload = {
      medicine_name: String(formData.get("medicineName") || "").trim(),
      dosage: String(formData.get("dosage") || "").trim(),
      hsn_code: String(formData.get("hsnCode") || "").trim(),
      // frontend field renamed to 'quantity' — map it to backend 'pack' column
      pack: String(formData.get("quantity") || "").trim(),
      tax_percentage: String(formData.get("taxPercentage") || "").trim(),
      company_name: String(formData.get("companyName") || "").trim(),
      vendor_name: String(formData.get("vendorName") || "").trim(),
    };

    // Optimistic local object while awaiting server response
    const tempMed: any = {
      id: `M${Math.floor(1000 + Math.random() * 9000)}`,
      name: payload.medicine_name,
      dosage: payload.dosage,
      hsnCode: payload.hsn_code,
      pack: payload.pack,
      taxPercentage: payload.tax_percentage,
      companyName: payload.company_name,
      vendorName: payload.vendor_name,
      stock: 0,
      price: 0,
      expiry: "2027-12",
      category: "General",
    };

    try {
      const resp = await fetch("http://localhost:5000/api/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Show server response body when it fails to help debug
      let data: any = null;
      try {
        data = await resp.json();
      } catch (err) {
        const txt = await resp.text();
        console.error('Non-JSON response from server:', txt);
        if (!resp.ok) {
          window.alert('Server error: ' + txt);
        }
      }

      if (resp.ok && data && data.success) {
        // Use server-assigned id if available
        const serverId = data.data && (data.data.medicine_id || data.data.insertId);
        const createdMed = { ...tempMed, id: serverId || tempMed.id };

        setMedicines((prev) => [createdMed, ...prev]);
        setRecentlyCreatedMedicines((prev) => [createdMed, ...prev]);
        setNewlyCreatedMedicine(createdMed);
        setIsCreateMedModalOpen(false);
        form.reset();
      } else {
        // Fallback: still add locally but alert user
        setMedicines((prev) => [tempMed, ...prev]);
        setRecentlyCreatedMedicines((prev) => [tempMed, ...prev]);
        setNewlyCreatedMedicine(tempMed);
        setIsCreateMedModalOpen(false);
        form.reset();
        const msg = (data && data.message) ? data.message : 'Medicine added locally, but server returned an error.';
        window.alert(msg);
      }
    } catch (err) {
      console.error("Create medicine error:", err);
      // Add locally so user can continue working offline
      setMedicines((prev) => [tempMed, ...prev]);
      setRecentlyCreatedMedicines((prev) => [tempMed, ...prev]);
      setNewlyCreatedMedicine(tempMed);
      setIsCreateMedModalOpen(false);
      form.reset();
      window.alert("Failed to add medicine to server. Saved locally.");
    }
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

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(pharmacySearchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(pharmacySearchTerm.toLowerCase())
  );

  const chartData = medicines.slice(0, 6).map((m) => ({
    name: m.name.split(" ")[0],
    stock: m.stock,
    value: m.stock * m.price,
  }));

  const categoryData = [
    {
      name: "Tablets",
      value: medicines.filter((m) => m.name.includes("mg")).length,
      color: "#3b82f6",
    },
    {
      name: "Injections",
      value: medicines.filter((m) => m.name.includes("Insulin")).length,
      color: "#10b981",
    },
    {
      name: "Others",
      value:
        medicines.length -
        medicines.filter((m) => m.name.includes("mg") || m.name.includes("Insulin")).length,
      color: "#f59e0b",
    },
  ];

  const handleReplenishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const medId = formData.get("replenishId") as string;
    const qtyToAdd = parseInt(formData.get("replenishQty") as string);
    const newExpiry = formData.get("replenishExpiry") as string;

    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === medId) {
          return {
            ...m,
            stock: m.stock + qtyToAdd,
            expiry: newExpiry || m.expiry,
          };
        }
        return m;
      })
    );

    setIsReplenishModalOpen(false);
    window.alert("Bill Recorded & Stock Updated Successfully");
  };

  const numberToWords = (num: number): string => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const numStr = num.toString();
    if (numStr.length > 9) return 'overflow';
    let n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    let str = '';
    str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
    return str.toUpperCase();
  };

  const handleBulkOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMedicines((prev) => {
      let updatedMedicines = [...prev];
      bulkOrderItems.forEach((item) => {
        if (!item.name) return;
        const existingIdx = updatedMedicines.findIndex((m) => m.name.toLowerCase() === item.name.toLowerCase());

        if (existingIdx > -1) {
          updatedMedicines[existingIdx] = {
            ...updatedMedicines[existingIdx],
            stock: Number(updatedMedicines[existingIdx].stock) + Number(item.qty),
            buyPrice: item.buyPrice,
            price: item.sellPrice,
            mrp: item.mrp,
            batchNo: item.batchNo,
            expiry: item.expiry || updatedMedicines[existingIdx].expiry,
            dosage: item.dosage || updatedMedicines[existingIdx].dosage,
            hsnCode: item.hsnCode || updatedMedicines[existingIdx].hsnCode,
            pack: item.pack || updatedMedicines[existingIdx].pack
          };
        } else {
          updatedMedicines.push({
            id: `M${Math.floor(2000 + Math.random() * 8000)}`,
            name: item.name,
            stock: Number(item.qty),
            buyPrice: item.buyPrice,
            price: item.sellPrice,
            mrp: item.mrp,
            batchNo: item.batchNo,
            expiry: item.expiry || "2027-12",
            category: "General",
            dosage: item.dosage || "",
            hsnCode: item.hsnCode || "",
            pack: item.pack || ""
          });
        }
      });
      return updatedMedicines;
    });

    const total = bulkOrderItems.reduce((acc, i) => acc + i.totalAmount, 0);
    const gstTotal = bulkOrderItems.reduce((acc, i) => acc + (i.taxAmount || 0), 0);
    const subtotal = total - gstTotal;
    const balance = total - purchasePaidAmount;

    const totalDeliveredQty = bulkOrderItems.reduce((acc, i) => acc + (Number(i.qty) || 0), 0);
    // Estimated paid qty ratio based on paid amount vs total amount
    const paidRatio = total > 0 ? Math.min(1, purchasePaidAmount / total) : 1;
    const totalPaidQty = Math.round(totalDeliveredQty * paidRatio);

    const initialTerm: VendorPaymentTerm = {
      date: purchaseInvoiceDate || new Date().toISOString().split("T")[0],
      amountPaid: purchasePaidAmount,
      itemsPaidCount: totalPaidQty,
      notes: "Initial purchase entry payment"
    };

    const newStockBill: any = {
      id: `STK-${Math.floor(1000 + Math.random() * 9000)}`,
      vendor: purchaseSupplierName || bulkOrderVendor,
      vendorName: purchaseSupplierName || bulkOrderVendor,
      date: purchaseInvoiceDate || new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: bulkOrderItems.filter(i => i.name),
      subtotal: subtotal,
      gstTotal: gstTotal,
      total: total,
      paidAmount: purchasePaidAmount,
      balance: balance,
      invoiceNo: purchaseInvoiceNo,
      billNo: purchaseBillNo,
      paymentMode: purchasePaymentMode,
      invoiceDate: purchaseInvoiceDate || new Date().toISOString().split("T")[0],
      dlNo: purchaseDLNo,
      gstNo: purchaseGstNo,
      totalPaidQty: totalPaidQty,
      paymentHistory: purchasePaidAmount > 0 ? [initialTerm] : []
    };

    // Save to DB
    try {
      const resp = await fetch("http://localhost:5000/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStockBill)
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          newStockBill.dbId = data.id;
          newStockBill.id = `STK-${data.id}`;
        }
      }
    } catch (err) {
      console.error("Error saving purchase order to DB", err);
    }

    setStockBills(prev => [newStockBill, ...prev]);

    setPharmacyView("dashboard"); // Go back to dashboard after submit
    setBulkOrderItems([]);
    setBulkOrderVendor("");
    setPurchaseInvoiceDate("");
    setPurchaseLRDate("");
    const nextPurchaseBillCount = purchaseBillCounter + 1;
    setPurchaseBillCounter(nextPurchaseBillCount);
    setPurchaseBillNo(formatBillNo(nextPurchaseBillCount));
    localStorage.setItem("accendia_v3_purchase_bill_counter", String(nextPurchaseBillCount));
    setPurchaseInvoiceNo("");
    setPurchaseDLNo("");
    setPurchaseGstNo("");
    setPurchasePaymentMode("");
    setPurchasePaidAmount(0);
    setPurchaseSupplierName("");

    setLatestBulkOrderBill(newStockBill);
    setShowBulkOrderReceipt(true);
    return newStockBill;
  };

  const handleAddVendor = async (vendorData: Partial<Vendor>) => {
    const tempVendor: Vendor = {
      id: `V${Math.floor(100 + Math.random() * 900)}`,
      name: vendorData.name || "",
      contactPerson: vendorData.contactPerson || "",
      phone: vendorData.phone || "",
      email: vendorData.email || "",
      address: vendorData.address || "",
      dlNo: vendorData.dlNo || "",
      gstNo: vendorData.gstNo || "",
      status: "Active",
      createdAt: new Date().toISOString().split("T")[0],
    };

    // Save to DB
    try {
      const resp = await fetch("http://localhost:5000/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendorData)
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          tempVendor.dbId = data.id;
        }
      }
    } catch (err) {
      console.error("Error saving vendor to DB", err);
    }

    setVendors((prev) => [tempVendor, ...prev]);
  };

  const handleToggleVendorStatus = async (id: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id || String(v.dbId) === id ? { ...v, status: v.status === "Active" ? "Inactive" : "Active" } : v))
    );

    // Save to DB
    try {
      await fetch(`http://localhost:5000/api/vendors/${id}/status`, {
        method: "PUT"
      });
    } catch (err) {
      console.error("Error updating vendor status in DB", err);
    }
  };

  const handleAddVendorPaymentTerm = async (billId: string, amountPaid: number, itemsPaidCount: number, notes: string) => {
    let dbId = billId;
    if (billId.startsWith("STK-")) {
      dbId = billId.replace("STK-", "");
    }

    // Save to DB
    try {
      await fetch(`http://localhost:5000/api/purchase-orders/${dbId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPaid, itemsPaidCount, notes })
      });
    } catch (err) {
      console.error("Error recording payment in DB", err);
    }

    setStockBills((prev) =>
      prev.map((bill) => {
        if (bill.id === billId || String(bill.dbId) === billId) {
          const newPaid = Number(bill.paidAmount || 0) + Number(amountPaid);
          const newBal = Math.max(0, Number(bill.total || 0) - newPaid);
          const history = bill.paymentHistory || [];
          const newTerm: VendorPaymentTerm = {
            date: new Date().toISOString().split("T")[0],
            amountPaid,
            itemsPaidCount,
            notes: notes || "Term installment payment",
          };
          const updatedPaidQty = Math.min(Number(bill.totalDeliveredQty || 0), Number(bill.totalPaidQty || 0) + Number(itemsPaidCount));
          return {
            ...bill,
            paidAmount: newPaid,
            balance: newBal,
            totalPaidQty: updatedPaidQty,
            status: newBal <= 0 ? "Completed" : "Active",
            paymentHistory: [newTerm, ...history],
          };
        }
        return bill;
      })
    );
  };

  const addBulkOrderItem = () => {
    setBulkOrderItems([...bulkOrderItems, {
      name: "",
      dosage: "",
      hsnCode: "",
      pack: "",
      batchNo: "",
      qty: 0,
      qtyFree: 0,
      buyPrice: 0,
      sellPrice: 0,
      mrp: 0,
      expiry: "",
      discount: 0,
      discountAmount: 0,
      tax: 0,
      taxAmount: 0,
      totalAmount: 0
    }]);
  };

  const removeBulkOrderItem = (index: number) => {
    setBulkOrderItems(bulkOrderItems.filter((_, i) => i !== index));
  };

  const updateBulkOrderItem = (index: number, field: string, value: any) => {
    const updated = [...bulkOrderItems];
    updated[index] = { ...updated[index], [field]: value };
    setBulkOrderItems(updated);
  };

  const TEST_CATEGORY_MAP: Record<string, string> = {
    "Complete Blood Count (CBC)": "HAEMATOLOGY",
    "Blood Sugar / Glucose Profile": "DIABETIC",
    "HbA1c (Glycated Hemoglobin)": "DIABETIC",
    "Thyroid Profile (T3, T4, TSH)": "THYROID",
    "Lipid Profile (Cholesterol)": "LIPID",
    "Liver Function Test (LFT)": "LIVER",
    "Kidney Function Test (KFT)": "KIDNEY",
    "Comprehensive Health Profile": "ALL",
  };

  const TEST_KEYS_MAP: Record<string, string[]> = {
    "Complete Blood Count (CBC)": ["hb", "rbc", "wbc", "platelets"],
    "Blood Sugar / Glucose Profile": ["fbs", "ppbs", "rbs"],
    "HbA1c (Glycated Hemoglobin)": ["hba1c"],
    "Thyroid Profile (T3, T4, TSH)": ["t3", "t4", "tsh"],
    "Lipid Profile (Cholesterol)": ["chol", "hdl", "ldl", "trig"],
    "Liver Function Test (LFT)": ["sgot", "sgpt", "bili"],
    "Kidney Function Test (KFT)": ["urea", "creat"],
    "Comprehensive Health Profile": ["hb", "rbc", "wbc", "platelets", "fbs", "ppbs", "rbs", "hba1c", "t3", "t4", "tsh", "chol", "hdl", "ldl", "trig", "sgot", "sgpt", "bili", "urea", "creat"],
    "Urine Analysis (Routine)": []
  };

  const activeKeys = React.useMemo(() => {
    return selectedTests.flatMap(test => TEST_KEYS_MAP[test] || []);
  }, [selectedTests]);

  const finalCategories = React.useMemo(() => {
    if (activeKeys.length === 0) return [];

    const categories = activeKeys.map(key => (clinicalData.DIAGNOSTIC_RANGES as any)[key]?.category).filter(Boolean);
    return Array.from(new Set(categories));
  }, [activeKeys]);

  const [activeLabTab, setActiveLabTab] = useState<"Pathology" | "Radiology" | "Reports">(
    userRole === UserRole.DOCTOR ? "Reports" : "Pathology"
  );

  const [reportDateFilter, setReportDateFilter] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  const deleteReport = (reportId: string) => {
    if (window.confirm("Are you sure you want to delete this diagnostic report? This action is permanent.")) {
      setLabTests(prev => prev.filter(t => t.id !== reportId));
    }
  };

  return {
    isModalOpen, setIsModalOpen,
    isReplenishModalOpen, setIsReplenishModalOpen,
    isStockCheckModalOpen, setIsStockCheckModalOpen,
    isBulkOrderModalOpen, setIsBulkOrderModalOpen,
    isEditMedModalOpen, setIsEditMedModalOpen,
    editingMedicine, setEditingMedicine,
    isViewMedModalOpen, setIsViewMedModalOpen,
    viewingMedicine, setViewingMedicine,
    showPharmacyReceipt, setShowPharmacyReceipt,
    latestPharmacyBill, setLatestPharmacyBill,
    showBulkOrderReceipt, setShowBulkOrderReceipt,
    latestBulkOrderBill, setLatestBulkOrderBill,
    pharmacySearchTerm, setPharmacySearchTerm,
    recentBills, setRecentBills,
    stockBills, setStockBills,
    totalPharmacyRevenue,
    billingSearchTerm, setBillingSearchTerm,
    billingQty, setBillingQty,
    selectedReport, setSelectedReport,
    manualResults, setManualResults,
    selectedTests, setSelectedTests,
    healthSummary, setHealthSummary,
    canvasRef,
    isDrawing,
    medicines, setMedicines,
    vendors, setVendors,
    handleAddVendor,
    handleToggleVendorStatus,
    handleAddVendorPaymentTerm,
    billItems, setBillItems,
    bulkOrderItems, setBulkOrderItems,
    bulkOrderVendor, setBulkOrderVendor,
    handleLabSubmit,
    toggleTest,
    handleAddBillItem,
    handlePharmacySubmit,
    handleEditMedicine,
    startDrawing,
    draw,
    stopDrawing,
    clearSignature,
    filteredMedicines,
    chartData,
    categoryData,
    handleReplenishSubmit,
    handleBulkOrderSubmit,
    addBulkOrderItem,
    removeBulkOrderItem,
    updateBulkOrderItem,
    finalCategories,
    activeKeys,
    activeLabTab, setActiveLabTab,
    editingTestId, setEditingTestId,
    isRadiologyModalOpen, setIsRadiologyModalOpen,
    handleRadiologySubmit,
    isCreateMedModalOpen, setIsCreateMedModalOpen,
    pharmacyView, setPharmacyView,
    recentlyCreatedMedicines, setRecentlyCreatedMedicines,
    newlyCreatedMedicine, setNewlyCreatedMedicine,
    isCreateMedSuccessModalOpen, setIsCreateMedSuccessModalOpen,
    handleCreateMedicine,
    purchaseInvoiceDate, setPurchaseInvoiceDate,
    purchaseLRDate, setPurchaseLRDate,
    purchaseBillNo, setPurchaseBillNo,
    purchaseDLNo, setPurchaseDLNo,
    purchaseGstNo, setPurchaseGstNo,
    purchaseInvoiceNo, setPurchaseInvoiceNo,
    purchasePaidAmount, setPurchasePaidAmount,
    purchasePaymentMode, setPurchasePaymentMode,
    purchaseSupplierName, setPurchaseSupplierName,
    purchaseCurrentItem, setPurchaseCurrentItem,
    updatePurchaseCurrentItem,
    addCurrentItemToOrder,
    // Sales Entry
    salesItems, setSalesItems,
    salesCurrentItem, setSalesCurrentItem,
    updateSalesCurrentItem,
    addSalesCurrentItem,
    removeSalesItem,
    salesBillNo, setSalesBillNo,
    salesPatientIP, setSalesPatientIP,
    salesPatientId, setSalesPatientId,
    salesPatientName, setSalesPatientName,
    salesPatientMobile, setSalesPatientMobile,
    salesPatientAge, setSalesPatientAge,
    ipLookupStatus,
    handleSalesPatientIPChange,
    lookupIPRecord,
    allIPRecords,
    salesBillDateTime, setSalesBillDateTime,
    reportDateFilter, setReportDateFilter,
    deleteReport,
    salesIsOutside, setSalesIsOutside,
    salesPaymentMode, setSalesPaymentMode,
    salesPaidAmount, setSalesPaidAmount
  };
};

export const usePharmacyLogic = (
  onAddInvoice?: (i: Invoice) => void,
  patients: Patient[] = [],
  userRole?: UserRole
) => {
  return useClinicalModules("pharmacy", onAddInvoice, patients, [], [], () => { }, userRole);
};
