import React, { useEffect } from "react";
import "./styles/pharmacy.css";
import { History, Zap } from "../../shared/utils/icons";
import Modal from "../../shared/components/Modal";
import { Patient, UserRole, Invoice } from "../../shared/types";
import { usePharmacyLogic } from "./services/pharmacyService";
import hospitalLogo from "../../assets/sarada_logo.png";

// Sub-components (Existing)
import BillingArchiveModal from "./components/BillingArchiveModal";
import InventoryAuditModal from "./components/InventoryAuditModal";
import MedicineDetailsModal from "./components/MedicineDetailsModal";

// Sub-components (New Modular Views)
import PharmacyDashboard from "./components/PharmacyDashboard";
import CreateMedicineView from "./components/CreateMedicineView";
import PurchaseEntryView from "./components/PurchaseEntryView";
import SalesEntryView from "./components/SalesEntryView";
import SalesBillsView from "./components/SalesBillsView";
import VendorsView from "./components/VendorsView";
import VendorBillsView from "./components/VendorBillsView";

// Sub-components (New Modular Modals)
import SalesReceiptModal from "./components/SalesReceiptModal";
import PurchaseReceiptModal from "./components/PurchaseReceiptModal";

// Print Utilities
import { printSalesReceipt, printBulkOrderReceipt } from "./utils/printHelpers";

class ErrorBoundary extends React.Component<any, { hasError: boolean; error?: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error("PharmacyModule rendering error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-700 rounded-xl">
          <h3 className="font-black">Something went wrong in Pharmacy module.</h3>
          <p>Open the browser console for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface Props {
  onAddInvoice?: (i: Invoice) => void;
  userRole?: UserRole;
  patients?: Patient[];
  doctors?: any[];
  labTests?: any[];
  setLabTests?: React.Dispatch<React.SetStateAction<any[]>>;
}

const PharmacyModule: React.FC<Props> = ({
  onAddInvoice,
  userRole,
  patients = [],
}) => {
  const {
    isReplenishModalOpen, setIsReplenishModalOpen,
    isStockCheckModalOpen, setIsStockCheckModalOpen,
    isBulkOrderModalOpen, setIsBulkOrderModalOpen,
    isEditMedModalOpen, setIsEditMedModalOpen,
    editingMedicine, setEditingMedicine,
    isViewMedModalOpen, setIsViewMedModalOpen,
    isCreateMedModalOpen, setIsCreateMedModalOpen,
    pharmacyView, setPharmacyView,
    viewingMedicine, setViewingMedicine,
    showPharmacyReceipt, setShowPharmacyReceipt,
    latestPharmacyBill,
    pharmacySearchTerm, setPharmacySearchTerm,
    recentBills, setRecentBills,
    stockBills, setStockBills,
    medicines, setMedicines,
    vendors,
    handleAddVendor,
    handleToggleVendorStatus,
    handleAddVendorPaymentTerm,
    bulkOrderVendor, setBulkOrderVendor,
    totalPharmacyRevenue,
    handlePharmacySubmit,
    handleEditMedicine,
    handleBulkOrderSubmit,
    handleCreateMedicine,
    filteredMedicines,
    chartData,
    categoryData,
    handleReplenishSubmit,
    addBulkOrderItem,
    removeBulkOrderItem,
    updateBulkOrderItem,
    recentlyCreatedMedicines,
    newlyCreatedMedicine,
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
    bulkOrderItems,
    showBulkOrderReceipt, setShowBulkOrderReceipt,
    latestBulkOrderBill,
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
    salesIsOutside, setSalesIsOutside,
    salesPaymentMode, setSalesPaymentMode,
    salesPaidAmount, setSalesPaidAmount
  } = usePharmacyLogic(onAddInvoice, patients, userRole);

  const [isBillsModalOpen, setIsBillsModalOpen] = React.useState(false);

  // Auto-print whenever a new pharmacy bill is generated
  useEffect(() => {
    if (latestPharmacyBill) {
      printSalesReceipt(latestPharmacyBill, hospitalLogo);
    }
  }, [latestPharmacyBill]);

  React.useEffect(() => {
    console.log("PharmacyModule mounted - current view:", pharmacyView);
  }, [pharmacyView]);


  // Auto-print whenever a new bulk purchase order is generated
  useEffect(() => {
    if (latestBulkOrderBill) {
      printBulkOrderReceipt(latestBulkOrderBill, hospitalLogo);
    }
  }, [latestBulkOrderBill]);

  return (
    <ErrorBoundary>
      <div className="clinical-modules-container">
      <div className="clinical-header">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Pharmacy Management</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            {["dashboard", "salesEntry", "purchaseEntry", "createMedicine", "vendors", "vendorBills", "salesBills"].map((view) => (
              <button
                key={view}
                onClick={() => setPharmacyView(view as any)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pharmacyView === view
                  ? "bg-white text-hospital-blue shadow-xl"
                  : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {view.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
          <button onClick={() => setIsBillsModalOpen(true)} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-hospital-blue transition-all shadow-xl">
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {pharmacyView === "dashboard" && (
          <PharmacyDashboard
            totalPharmacyRevenue={totalPharmacyRevenue}
            medicines={medicines}
            recentBills={recentBills}
            setPharmacyView={setPharmacyView}
            setIsStockCheckModalOpen={setIsStockCheckModalOpen}
            setIsCreateMedModalOpen={setIsCreateMedModalOpen}
          />
        )}
        {pharmacyView === "createMedicine" && (
          <CreateMedicineView
            recentlyCreatedMedicines={recentlyCreatedMedicines}
            vendors={vendors}
            handleCreateMedicine={handleCreateMedicine}
            setPharmacyView={setPharmacyView}
          />
        )}
        {pharmacyView === "purchaseEntry" && (
          <PurchaseEntryView
            purchaseCurrentItem={purchaseCurrentItem}
            updatePurchaseCurrentItem={updatePurchaseCurrentItem}
            addCurrentItemToOrder={addCurrentItemToOrder}
            bulkOrderItems={bulkOrderItems}
            removeBulkOrderItem={removeBulkOrderItem}
            vendors={vendors}
            purchaseSupplierName={purchaseSupplierName}
            setPurchaseSupplierName={setPurchaseSupplierName}
            purchaseInvoiceNo={purchaseInvoiceNo}
            setPurchaseInvoiceNo={setPurchaseInvoiceNo}
            purchaseInvoiceDate={purchaseInvoiceDate}
            setPurchaseInvoiceDate={setPurchaseInvoiceDate}
            purchaseLRDate={purchaseLRDate}
            setPurchaseLRDate={setPurchaseLRDate}
            purchaseBillNo={purchaseBillNo}
            setPurchaseBillNo={setPurchaseBillNo}
            purchaseDLNo={purchaseDLNo}
            setPurchaseDLNo={setPurchaseDLNo}
            purchaseGstNo={purchaseGstNo}
            setPurchaseGstNo={setPurchaseGstNo}
            purchasePaymentMode={purchasePaymentMode}
            setPurchasePaymentMode={setPurchasePaymentMode}
            purchasePaidAmount={purchasePaidAmount}
            setPurchasePaidAmount={setPurchasePaidAmount}
            handleBulkOrderSubmit={handleBulkOrderSubmit}
            setPharmacyView={setPharmacyView}
          />
        )}
        {pharmacyView === "vendors" && (
          <VendorsView
            vendors={vendors}
            onAddVendor={handleAddVendor}
            onToggleVendorStatus={handleToggleVendorStatus}
            setPharmacyView={setPharmacyView}
          />
        )}
        {pharmacyView === "vendorBills" && (
          <VendorBillsView
            stockBills={stockBills}
            onAddVendorPaymentTerm={handleAddVendorPaymentTerm}
            onPrintBill={(bill) => printBulkOrderReceipt(bill, hospitalLogo)}
            setPharmacyView={setPharmacyView}
          />
        )}
        {pharmacyView === "salesEntry" && (
          <SalesEntryView
            medicines={medicines}
            salesCurrentItem={salesCurrentItem}
            updateSalesCurrentItem={updateSalesCurrentItem}
            addSalesCurrentItem={addSalesCurrentItem}
            salesItems={salesItems}
            removeSalesItem={removeSalesItem}
            salesPatientIP={salesPatientIP}
            handleSalesPatientIPChange={handleSalesPatientIPChange}
            ipLookupStatus={ipLookupStatus}
            allIPRecords={allIPRecords}
            salesPatientName={salesPatientName}
            setSalesPatientName={setSalesPatientName}
            salesPaymentMode={salesPaymentMode}
            setSalesPaymentMode={setSalesPaymentMode}
            salesPaidAmount={salesPaidAmount}
            setSalesPaidAmount={setSalesPaidAmount}
            salesBillNo={salesBillNo}
            handlePharmacySubmit={handlePharmacySubmit}
            setPharmacyView={setPharmacyView}
          />
        )}
        {pharmacyView === "salesBills" && (
          <SalesBillsView
            recentBills={recentBills}
            setRecentBills={setRecentBills}
            onPrintBill={(bill) => printSalesReceipt(bill, hospitalLogo)}
            setPharmacyView={setPharmacyView}
          />
        )}
      </div>

      <BillingArchiveModal isOpen={isBillsModalOpen} onClose={() => setIsBillsModalOpen(false)} recentBills={recentBills} stockBills={stockBills} />
      <InventoryAuditModal isOpen={isStockCheckModalOpen} onClose={() => setIsStockCheckModalOpen(false)} searchTerm={pharmacySearchTerm} setSearchTerm={setPharmacySearchTerm} filteredMedicines={filteredMedicines} onEdit={(m) => { setEditingMedicine(m); setIsEditMedModalOpen(true); }} onView={(m) => { setViewingMedicine(m); setIsViewMedModalOpen(true); }} />
      <MedicineDetailsModal isViewOpen={isViewMedModalOpen} onViewClose={() => setIsViewMedModalOpen(false)} isEditOpen={isEditMedModalOpen} onEditClose={() => setIsEditMedModalOpen(false)} medicine={viewingMedicine || editingMedicine} onEditSubmit={handleEditMedicine} />

      <Modal isOpen={isBulkOrderModalOpen} onClose={() => setIsBulkOrderModalOpen(false)} title="Create Bulk Purchase Order" size="xl">
        <form onSubmit={handleBulkOrderSubmit} className="space-y-6">
          <div className="space-y-2"><label className="text-[10px] font-black text-hospital-blue uppercase tracking-widest px-1">Vendor Name *</label><input required type="text" placeholder="e.g. PharmaDist India Pvt Ltd" value={bulkOrderVendor} onChange={(e) => setBulkOrderVendor(e.target.value)} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => setIsBulkOrderModalOpen(false)} className="py-5 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[11px]">Cancel</button>
            <button type="submit" className="py-5 bg-hospital-blue text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center space-x-2"><Zap className="w-4 h-4" /><span>Submit & Update Stock</span></button>
          </div>
        </form>
      </Modal>

      <SalesReceiptModal
        isOpen={showPharmacyReceipt}
        onClose={() => setShowPharmacyReceipt(false)}
        latestPharmacyBill={latestPharmacyBill}
        hospitalLogo={hospitalLogo}
        onReprint={(bill) => printSalesReceipt(bill, hospitalLogo)}
      />

      <PurchaseReceiptModal
        isOpen={showBulkOrderReceipt}
        onClose={() => setShowBulkOrderReceipt(false)}
        latestBulkOrderBill={latestBulkOrderBill}
        hospitalLogo={hospitalLogo}
        onReprint={(bill) => printBulkOrderReceipt(bill, hospitalLogo)}
      />
      </div>
    </ErrorBoundary>
  );
};

export default PharmacyModule;
