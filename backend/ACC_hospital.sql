-- Create Hospital Database
CREATE DATABASE IF NOT EXISTS acc_hospital;
USE acc_hospital;

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed a default admin account for login
INSERT INTO users (username, password, name, email, role, status)
VALUES ('admin', 'admin123', 'Administrator', 'admin@hospital.com', 'Admin', 'Active')
ON DUPLICATE KEY UPDATE
    password = VALUES(password),
    name = VALUES(name),
    email = VALUES(email),
    role = VALUES(role),
    status = VALUES(status);

-- Create Patients Table (Complete with all registration fields)
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL UNIQUE,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20),
    weight DECIMAL(5,2),
    contact VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    dob DATE,
    bloodGroup VARCHAR(10),
    emergencyName VARCHAR(100),
    emergencyContact VARCHAR(20),
    reason VARCHAR(500),
    paymentMethod VARCHAR(50),
    address VARCHAR(255),
    assignedDoctor VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    serial VARCHAR(20),
    admissionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    doctor_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    mobile_no VARCHAR(15) NOT NULL,
    
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    
    designation VARCHAR(100),
    study VARCHAR(100),
    experience INT,
    consultancy VARCHAR(100),
    kmc VARCHAR(50),
    image LONGTEXT,
    monday_from TIME,
    monday_to TIME,
    
    tuesday_from TIME,
    tuesday_to TIME,
    
    wednesday_from TIME,
    wednesday_to TIME,
    
    thursday_from TIME,
    thursday_to TIME,
    
    friday_from TIME,
    friday_to TIME,
    
    saturday_from TIME,
    saturday_to TIME,
    
    sunday_from TIME,
    sunday_to TIME,
    status VARCHAR(20) DEFAULT 'Available',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Staff Table
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    age INT,
    emergency_contact VARCHAR(20),
    experience VARCHAR(50),
    study VARCHAR(100),
    joining_date DATE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    avatar LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id VARCHAR(100) UNIQUE,
    patient_id VARCHAR(50),
    patient_name VARCHAR(150),
    doctor VARCHAR(150),
    date DATE,
    time VARCHAR(20),
    type VARCHAR(50),
    urgent TINYINT(1) DEFAULT 0,
    reason TEXT,
    medical_history TEXT,
    referral_source VARCHAR(150),
    preferred_contact VARCHAR(150),
    clinical_data TEXT,
    status VARCHAR(50) DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Medicine Table
CREATE TABLE medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id VARCHAR(20) UNIQUE,
    medicine_name VARCHAR(200) NOT NULL,
    hsn_code VARCHAR(50),
    tax_percentage DECIMAL(5,2),
    dosage VARCHAR(100),
    pack VARCHAR(100),
    company_name VARCHAR(255),
    vendor_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_name VARCHAR(200) NOT NULL,
    hsn_code VARCHAR(50),
    company VARCHAR(255),
    batch_no VARCHAR(100),
    qty INT DEFAULT 0,
    qty_free INT DEFAULT 0,
    purchase_price DECIMAL(12,2) DEFAULT 0.00,
    mrp DECIMAL(12,2) DEFAULT 0.00,
    expiry_date VARCHAR(20),
    discount_percent DECIMAL(5,2) DEFAULT 0.00,
    tax_percent DECIMAL(5,2) DEFAULT 0.00,
    supplier_name VARCHAR(255),
    invoice_no VARCHAR(100),
    invoice_date VARCHAR(20),
    payment_mode VARCHAR(50),
    paid_amount DECIMAL(12,2) DEFAULT 0.00,
    grand_total DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_no VARCHAR(50),
    patient_id VARCHAR(50),
    patient_name VARCHAR(150),
    payment_mode VARCHAR(50),
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT,
    medicine_id INT,
    medicine_name VARCHAR(255),
    batch_no VARCHAR(100),
    qty INT,
    mrp DECIMAL(10,2),
    discount DECIMAL(10,2),
    tax DECIMAL(10,2),
    total DECIMAL(10,2),

    FOREIGN KEY (sale_id)
    REFERENCES sales(id)
);

-- Stock table to track available quantities for medicines
CREATE TABLE IF NOT EXISTS stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    available_qty INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
);

CREATE TABLE beds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bed_id VARCHAR(50) UNIQUE,
    ward_no VARCHAR(50),
    ward_type VARCHAR(50),
    charge_per_day DECIMAL(10,2),
    status ENUM('Vacant','Occupied','Hold') DEFAULT 'Vacant',
    is_occupied TINYINT(1) DEFAULT 0,
    is_reserved TINYINT(1) DEFAULT 0,
    patient_name VARCHAR(150) NULL,
    patient_id VARCHAR(50) NULL,
    estimated_discharge VARCHAR(50) NULL,
    reservation_expiry VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_no VARCHAR(50) UNIQUE,
    uhid VARCHAR(50),
    patient_name VARCHAR(150),
    age INT,
    mobile_no VARCHAR(20),
    attendant_name VARCHAR(100),
    attendant_mobile VARCHAR(20),
    admitting_doctor VARCHAR(100),
    primary_doctor VARCHAR(100),
    department VARCHAR(100),
    ward_type VARCHAR(50),
    admission_date DATETIME,
    status ENUM('Admitted','Discharged') DEFAULT 'Admitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bed_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bed_id VARCHAR(50),
    ip_no VARCHAR(50),
    patient_name VARCHAR(150),
    allocated_date DATETIME,
    discharge_date DATETIME NULL,
    total_days INT DEFAULT 0,
    status ENUM('Active','Completed') DEFAULT 'Active'
);

CREATE TABLE bed_bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_no VARCHAR(50),
    ip_no VARCHAR(50),
    patient_name VARCHAR(150),
    bed_id VARCHAR(50),
    ward_type VARCHAR(50),
    days_stayed INT,
    charge_per_day DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_no VARCHAR(50),
    supplier_name VARCHAR(200),
    invoice_no VARCHAR(100),
    invoice_date VARCHAR(20),
    lr_date VARCHAR(20),
    bill_no VARCHAR(100),
    dl_no VARCHAR(100),
    payment_mode VARCHAR(50),
    paid_amount DECIMAL(10,2),
    grand_total DECIMAL(10,2),
    balance_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'Active',
    total_delivered_qty INT DEFAULT 0,
    total_paid_qty INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT,
    medicine_id INT,
    medicine_name VARCHAR(255),
    batch_no VARCHAR(100),
    qty INT,
    free_qty INT,
    purchase_price DECIMAL(10,2),
    mrp DECIMAL(10,2),
    expiry_date VARCHAR(20),
    discount_percentage DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    tax_percentage DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS purchase_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT,
    payment_date VARCHAR(20),
    amount_paid DECIMAL(10,2),
    items_paid_count INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id VARCHAR(20),
    supplier_name VARCHAR(200),
    mobile VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    contact_person VARCHAR(100),
    dl_no VARCHAR(100),
    gst_no VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lab_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(30) UNIQUE,
    uhid VARCHAR(30),
    ip_no VARCHAR(30),
    patient_name VARCHAR(100),
    doctor_name VARCHAR(100),
    test_name VARCHAR(100),
    order_date DATETIME,
    status VARCHAR(20) DEFAULT 'Pending'
);

CREATE TABLE lab_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    test_name VARCHAR(100),
    parameter_name VARCHAR(100),
    result_value VARCHAR(50),
    unit VARCHAR(50),
    reference_range VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lab_test_master (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_name VARCHAR(100),
    department VARCHAR(50)
);

CREATE TABLE lab_test_parameters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_name VARCHAR(100),
    parameter_name VARCHAR(100),
    unit VARCHAR(50),
    reference_range VARCHAR(50)
);

CREATE TABLE revenue_ledger (
    id INT AUTO_INCREMENT PRIMARY KEY,

    ledger_no VARCHAR(50) UNIQUE,

    patient_id INT,
    patient_name VARCHAR(150),

    department VARCHAR(100),

    service_name VARCHAR(200),

    amount DECIMAL(10,2) NOT NULL,

    reference_id VARCHAR(100),

    payment_status ENUM('Pending','Paid') DEFAULT 'Pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE revenue_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    ledger_id INT,

    payment_mode VARCHAR(50),

    paid_amount DECIMAL(10,2),

    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    remarks TEXT,

    FOREIGN KEY (ledger_id)
    REFERENCES revenue_ledger(id)
    ON DELETE CASCADE
);

CREATE TABLE revenue_departments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    department_name VARCHAR(100),

    status ENUM('Active','Inactive')
    DEFAULT 'Active'
);


CREATE TABLE discharge_summary (
    discharge_id INT AUTO_INCREMENT PRIMARY KEY,

    patient_id INT NOT NULL,
    ip_no VARCHAR(30),
    patient_name VARCHAR(150),

    discharge_date DATE,

    chief_complaints TEXT,
    present_history TEXT,
    hospital_course TEXT,

    temperature DECIMAL(5,2),
    pulse INT,
    bp VARCHAR(20),
    resp INT,
    spo2 DECIMAL(5,2),
    condition_at_discharge VARCHAR(100),

    final_diagnosis TEXT,
    medications TEXT,
    discharge_advice TEXT,
    review_date DATE,

    finalize_report BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
    REFERENCES patients(id)
);

CREATE TABLE expense_bills (

id INT PRIMARY KEY AUTO_INCREMENT,

doctor_name VARCHAR(150),

from_date DATE,

to_date DATE,

bill_date DATE,

doctor_fee DECIMAL(10,2) DEFAULT 0,

snacks DECIMAL(10,2) DEFAULT 0,

food DECIMAL(10,2) DEFAULT 0,

accommodation DECIMAL(10,2) DEFAULT 0,

medicine DECIMAL(10,2) DEFAULT 0,

other_expense DECIMAL(10,2) DEFAULT 0,

total DECIMAL(10,2) DEFAULT 0,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);