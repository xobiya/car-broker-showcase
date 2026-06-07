-- AutoBroker Ethiopia Database Schema
-- Complete schema with all tables for the car broker system

CREATE DATABASE IF NOT EXISTS autobroker_ethiopia;
USE autobroker_ethiopia;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'buyer',
    verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(50) DEFAULT 'unverified',
    id_document TEXT,
    bio TEXT,
    avatar VARCHAR(500),
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Brokers Table
CREATE TABLE IF NOT EXISTS brokers (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    commission_rate DECIMAL(5,2) DEFAULT 1.00,
    verified BOOLEAN DEFAULT FALSE,
    bio TEXT,
    avatar VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(255) PRIMARY KEY,
    broker_id VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    mileage INT NOT NULL DEFAULT 0,
    price DECIMAL(15,2) NOT NULL,
    original_price DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    image_url VARCHAR(500),
    description TEXT,
    fuel_type VARCHAR(50) NOT NULL DEFAULT 'Benzine',
    transmission VARCHAR(50) NOT NULL DEFAULT 'Automatic',
    location VARCHAR(100) NOT NULL DEFAULT 'Addis Ababa',
    condition VARCHAR(50),
    body_type VARCHAR(50),
    drive_type VARCHAR(50),
    color VARCHAR(50),
    doors INT,
    seats INT,
    engine_size VARCHAR(50),
    engine_type VARCHAR(50),
    horsepower INT,
    chassis_number VARCHAR(100),
    gallery JSON,
    commission_rate DECIMAL(5,2),
    commission_type VARCHAR(50) DEFAULT 'percentage',
    video_url VARCHAR(500),
    inspection_status VARCHAR(50) DEFAULT 'not_inspected',
    inspection_notes TEXT,
    inspection_date TIMESTAMP NULL,
    cover_photo_index INT DEFAULT 0,
    rejection_reason TEXT,
    FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE CASCADE
);

-- 4. Leads / Inquiries Table
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(255) PRIMARY KEY,
    vehicle_id VARCHAR(255) NOT NULL,
    buyer_id VARCHAR(255),
    buyer_name VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(50) NOT NULL,
    message TEXT,
    inquiry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 5. Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(255) PRIMARY KEY,
    vehicle_id VARCHAR(255) NOT NULL,
    broker_id VARCHAR(255) NOT NULL,
    buyer_id VARCHAR(255),
    buyer_name VARCHAR(255),
    sale_price DECIMAL(15,2) NOT NULL,
    commission DECIMAL(15,2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE CASCADE
);

-- 6. Audit Log Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(255) PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    admin_id VARCHAR(255) NOT NULL,
    admin_name VARCHAR(255) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(255) PRIMARY KEY,
    vehicle_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 8. Saved Vehicles Table
CREATE TABLE IF NOT EXISTS saved_vehicles (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    vehicle_id VARCHAR(255) NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_vehicle (user_id, vehicle_id)
);

-- 9. Reports Table (Trust & Safety)
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(255) PRIMARY KEY,
    reporter_id VARCHAR(255),
    reporter_name VARCHAR(255) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolved_by VARCHAR(255),
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 10. Test Drives Table
CREATE TABLE IF NOT EXISTS test_drives (
    id VARCHAR(255) PRIMARY KEY,
    vehicle_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time VARCHAR(10) NOT NULL,
    message TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 11. Inspections Table
CREATE TABLE IF NOT EXISTS inspections (
    id VARCHAR(255) PRIMARY KEY,
    vehicle_id VARCHAR(255) NOT NULL,
    inspector_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    notes TEXT,
    inspected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- SEED DATA

INSERT IGNORE INTO users (id, name, email, password_hash, phone, role, verified, verification_status, bio) VALUES
('usr-admin-1', 'Abebe Kebede', 'abebe.k@autobroker.et', '$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O', '+251911223344', 'admin', TRUE, 'verified', 'Platform administrator'),
('usr-broker-1', 'Yonas Hailu', 'yonas.h@autobroker.et', '$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O', '+251912345678', 'broker', TRUE, 'verified', 'Senior automotive broker with 8+ years of experience.'),
('usr-broker-2', 'Tigist Assefa', 'tigist.a@autobroker.et', '$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O', '+251913456789', 'broker', TRUE, 'verified', 'Specializing in luxury and electric vehicles.'),
('usr-buyer-1', 'Dawit Lemma', 'dawit.l@gmail.com', '$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O', '+251914567890', 'buyer', FALSE, 'unverified', NULL);

INSERT IGNORE INTO brokers (id, user_id, license_number, commission_rate, verified, bio) VALUES
('brk-1', 'usr-broker-1', 'ET-BRK-99882', 1.00, TRUE, 'Senior automotive broker with 8+ years of experience.'),
('brk-2', 'usr-broker-2', 'ET-BRK-77661', 1.25, TRUE, 'Specializing in luxury and electric vehicles.');

INSERT IGNORE INTO vehicles (id, broker_id, brand, model, year, mileage, price, original_price, status, image_url, description, fuel_type, transmission, location, condition, body_type, drive_type, color, doors, seats, engine_size, engine_type, horsepower, chassis_number, commission_rate, commission_type, inspection_status, video_url) VALUES
('veh-1', 'brk-1', 'Toyota', 'Land Cruiser 300 VXR', 2024, 1200, 24000000.00, 25500000.00, 'approved', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', 'Brand new Land Cruiser 300 VXR, imported from Dubai.', 'Diesel', 'Automatic', 'Addis Ababa', 'New', 'SUV', '4WD', 'Gold', 5, 7, '3.5L', 'V6', 409, 'VJA300-2024-8888', 1.0, 'percentage', 'passed', ''),
('veh-2', 'brk-1', 'Changan', 'UNI-K', 2024, 0, 8500000.00, 9200000.00, 'approved', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', 'Modern luxury Chinese SUV, full electric version.', 'Electric', 'Automatic', 'Addis Ababa', 'New', 'SUV', 'FWD', 'Silver', 5, 5, 'Electric', 'Electric', 215, 'CH-UNIK-2024-002', 1.0, 'percentage', 'pending', ''),
('veh-3', 'brk-2', 'Hyundai', 'Tucson', 2023, 15000, 6800000.00, 7200000.00, 'approved', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', 'Single owner, regular maintenance.', 'Benzine', 'Automatic', 'Addis Ababa', 'Used', 'SUV', 'AWD', 'Black', 5, 5, '2.0L', 'V4', 156, 'TLE-HYUN-2023-001', 1.25, 'percentage', 'passed', ''),
('veh-4', 'brk-2', 'Suzuki', 'Dzire', 2022, 28000, 2300000.00, 2500000.00, 'pending', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80', 'Highly economical city sedan.', 'Benzine', 'Manual', 'Adama', 'Used', 'Sedan', 'FWD', 'White', 4, 5, '1.2L', 'V4', 83, 'DZIRE-2022-004', 1.25, 'percentage', 'not_inspected', '');

INSERT IGNORE INTO leads (id, vehicle_id, buyer_id, buyer_name, buyer_email, buyer_phone, message, status) VALUES
('ld-1', 'veh-1', 'usr-buyer-1', 'Dawit Lemma', 'dawit.l@gmail.com', '+251914567890', 'Is the price negotiable?', 'new'),
('ld-2', 'veh-3', NULL, 'Marta Demeke', 'marta.d@yahoo.com', '+251918877665', 'Can we arrange a viewing?', 'contacted');

INSERT IGNORE INTO sales (id, vehicle_id, broker_id, buyer_id, sale_price, commission) VALUES
('sl-1', 'veh-3', 'brk-2', 'usr-buyer-1', 6700000.00, 83750.00);

INSERT IGNORE INTO audit_logs (id, action, admin_id, admin_name, target_type, target_id, details) VALUES
('al-1', 'approve_listing', 'usr-admin-1', 'Abebe Kebede', 'vehicle', 'veh-1', 'Approved listing Toyota Land Cruiser 300 VXR'),
('al-2', 'verify_broker', 'usr-admin-1', 'Abebe Kebede', 'broker', 'brk-2', 'Verified broker Tigist Assefa');
