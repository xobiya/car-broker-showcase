-- AutoBroker Ethiopia Database Schema
-- Run this schema in your MySQL database to set up the tables and populate seed data.

CREATE DATABASE IF NOT EXISTS autobroker_ethiopia;
USE autobroker_ethiopia;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'buyer' -- 'buyer', 'broker', 'admin'
);

-- 2. Brokers Table (Extends Users with role='broker')
CREATE TABLE IF NOT EXISTS brokers (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    commission_rate DECIMAL(5,2) DEFAULT 1.00, -- e.g. 1.00%
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
    price DECIMAL(15,2) NOT NULL, -- Sourced price in ETB
    original_price DECIMAL(15,2) NOT NULL, -- MSRP price in ETB
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'sold'
    image_url VARCHAR(500),
    description TEXT,
    fuel_type VARCHAR(50) NOT NULL DEFAULT 'Benzine', -- 'Benzine', 'Diesel', 'Electric', 'Hybrid'
    transmission VARCHAR(50) NOT NULL DEFAULT 'Automatic', -- 'Automatic', 'Manual'
    location VARCHAR(100) NOT NULL DEFAULT 'Addis Ababa',
    FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE CASCADE
);

-- 4. Leads / Inquiries Table
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(255) PRIMARY KEY,
    vehicle_id VARCHAR(255) NOT NULL,
    buyer_id VARCHAR(255), -- Optional if buyer is registered
    buyer_name VARCHAR(255) NOT NULL,
    buyer_email VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(50) NOT NULL,
    message TEXT,
    inquiry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'negotiating', 'sold', 'cancelled'
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- 5. Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(255) PRIMARY KEY,
    vehicle_id VARCHAR(255) NOT NULL,
    broker_id VARCHAR(255) NOT NULL,
    buyer_id VARCHAR(255),
    sale_price DECIMAL(15,2) NOT NULL,
    commission DECIMAL(15,2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE CASCADE
);

-- SEED DATA FOR DEMONSTRATION

-- Seed Users (Admin, Brokers, Buyers)
INSERT IGNORE INTO users (id, name, email, phone, role) VALUES
('usr-admin-1', 'Abebe Kebede', 'abebe.k@autobroker.et', '+251911223344', 'admin'),
('usr-broker-1', 'Yonas Hailu', 'yonas.h@autobroker.et', '+251912345678', 'broker'),
('usr-broker-2', 'Tigist Assefa', 'tigist.a@autobroker.et', '+251913456789', 'broker'),
('usr-buyer-1', 'Dawit Lemma', 'dawit.l@gmail.com', '+251914567890', 'buyer');

-- Seed Brokers
INSERT IGNORE INTO brokers (id, user_id, license_number, commission_rate) VALUES
('brk-1', 'usr-broker-1', 'ET-BRK-99882', 1.00),
('brk-2', 'usr-broker-2', 'ET-BRK-77661', 1.25);

-- Seed Vehicles
INSERT IGNORE INTO vehicles (id, broker_id, brand, model, year, mileage, price, original_price, status, image_url, description, fuel_type, transmission, location) VALUES
('veh-1', 'brk-1', 'Toyota', 'Land Cruiser 300 VXR', 2024, 1200, 24000000.00, 25500000.00, 'approved', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', 'Brand new Land Cruiser 300 VXR, imported from Dubai. Fully optioned, zero km driven locally.', 'Diesel', 'Automatic', 'Addis Ababa'),
('veh-2', 'brk-1', 'Changan', 'UNI-K', 2024, 0, 8500000.00, 9200000.00, 'approved', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', 'Modern luxury Chinese SUV, full electric version. Premium interior layout, active driver assists.', 'Electric', 'Automatic', 'Addis Ababa'),
('veh-3', 'brk-2', 'Hyundai', 'Tucson', 2023, 15000, 6800000.00, 7200000.00, 'approved', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', 'Local dealership purchased. Single owner, regular maintenance. Super clean interior and paint.', 'Benzine', 'Automatic', 'Addis Ababa'),
('veh-4', 'brk-2', 'Suzuki', 'Dzire', 2022, 28000, 2300000.00, 2500000.00, 'pending', 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80', 'Highly economical city sedan. Low fuel consumption, manual transmission. Ideal for taxi service.', 'Benzine', 'Manual', 'Adama');

-- Seed Leads
INSERT IGNORE INTO leads (id, vehicle_id, buyer_id, buyer_name, buyer_email, buyer_phone, message, status) VALUES
('ld-1', 'veh-1', 'usr-buyer-1', 'Dawit Lemma', 'dawit.l@gmail.com', '+251914567890', 'Is the price negotiable? I would like to pay in cash.', 'new'),
('ld-2', 'veh-3', NULL, 'Marta Demeke', 'marta.d@yahoo.com', '+251918877665', 'Can we arrange a viewing in Bole this weekend?', 'contacted');

-- Seed Sales
INSERT IGNORE INTO sales (id, vehicle_id, broker_id, buyer_id, sale_price, commission) VALUES
('sl-1', 'veh-3', 'brk-2', 'usr-buyer-1', 6700000.00, 83750.00);
