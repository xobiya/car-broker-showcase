import dotenv from "dotenv";
dotenv.config();

const DB_TYPE = process.env.DB_TYPE || "mongodb";

export interface DBUser {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  phone: string;
  role: 'buyer' | 'broker' | 'admin';
  verified?: boolean;
  verification_status?: 'unverified' | 'pending' | 'verified';
  id_document?: string;
  bio?: string;
  avatar?: string;
  join_date?: string;
}

export interface DBBroker {
  id: string;
  user_id: string;
  license_number: string;
  commission_rate: number;
  verified?: boolean;
  bio?: string;
  avatar?: string;
}

export interface DBVehicle {
  id: string;
  broker_id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  original_price: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'sold';
  image_url: string;
  description: string;
  fuel_type: string;
  transmission: string;
  location: string;
  condition?: string;
  body_type?: string;
  drive_type?: string;
  color?: string;
  doors?: number;
  seats?: number;
  engine_size?: string;
  engine_type?: string;
  horsepower?: number;
  chassis_number?: string;
  gallery?: string[];
  commission_rate?: number;
  commission_type?: string;
  video_url?: string;
  inspection_status?: 'not_inspected' | 'pending' | 'passed' | 'failed';
  inspection_notes?: string;
  inspection_date?: string;
  cover_photo_index?: number;
  rejection_reason?: string;
}

export interface DBLead {
  id: string;
  vehicle_id: string;
  buyer_id: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  message: string;
  inquiry_date: string;
  status: 'new' | 'contacted' | 'negotiating' | 'sold' | 'cancelled';
}

export interface DBSale {
  id: string;
  vehicle_id: string;
  broker_id: string;
  buyer_id: string | null;
  sale_price: number;
  commission: number;
  sale_date: string;
  buyer_name?: string;
}

export interface DBAuditLog {
  id: string;
  action: string;
  admin_id: string;
  admin_name: string;
  target_type: string;
  target_id: string;
  details: string;
  timestamp: string;
}

export interface DBDocument {
  id: string;
  vehicle_id: string;
  name: string;
  type: string;
  file_url: string;
  uploaded_at: string;
}

export interface DBInspection {
  id: string;
  vehicle_id: string;
  inspector_name: string;
  status: 'passed' | 'failed' | 'pending';
  notes: string;
  inspected_at: string;
}

export interface DBSavedVehicle {
  id: string;
  user_id: string;
  vehicle_id: string;
  saved_at: string;
}

export interface DBReport {
  id: string;
  reporter_id: string | null;
  reporter_name: string;
  target_type: string;
  target_id: string;
  reason: string;
  description: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface DBTestDrive {
  id: string;
  vehicle_id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  message: string;
  status: string;
  requested_at: string;
}

import { VehicleListing, Lead, Sale, AuditLogEntry, VehicleDocument, InspectionRecord, SavedVehicle, TestDriveRequest, Report, User, Broker } from "../shared/types";

function mapVehicle(v: DBVehicle): VehicleListing {
  return {
    id: v.id, brokerId: v.broker_id, brand: v.brand, model: v.model, year: v.year,
    mileage: v.mileage, price: Number(v.price), originalPrice: Number(v.original_price),
    status: v.status, imageUrl: v.image_url, description: v.description,
    fuelType: v.fuel_type, transmission: v.transmission, location: v.location,
    condition: v.condition, bodyType: v.body_type, driveType: v.drive_type,
    color: v.color, doors: v.doors, seats: v.seats, engineSize: v.engine_size,
    engineType: v.engine_type, horsepower: v.horsepower, chassisNumber: v.chassis_number,
    gallery: v.gallery, commissionRate: v.commission_rate, commissionType: v.commission_type,
    videoUrl: v.video_url, inspectionStatus: v.inspection_status,
    inspectionNotes: v.inspection_notes, inspectionDate: v.inspection_date,
    coverPhotoIndex: v.cover_photo_index, rejectionReason: v.rejection_reason,
  };
}

function mapUser(u: DBUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    verified: u.verified,
    verificationStatus: u.verification_status,
    idDocument: u.id_document,
    bio: u.bio,
    avatar: u.avatar,
    joinDate: u.join_date,
  };
}

function mapBroker(b: DBBroker): Broker {
  return {
    id: b.id,
    userId: b.user_id,
    licenseNumber: b.license_number,
    commissionRate: Number(b.commission_rate),
    verified: b.verified,
    bio: b.bio,
    avatar: b.avatar,
  };
}

function mapLead(l: DBLead): Lead {
  return {
    id: l.id, vehicleId: l.vehicle_id, buyerId: l.buyer_id, buyerName: l.buyer_name,
    buyerEmail: l.buyer_email, buyerPhone: l.buyer_phone, message: l.message,
    inquiryDate: l.inquiry_date, status: l.status,
  };
}

function mapSale(s: DBSale): Sale {
  return {
    id: s.id, vehicleId: s.vehicle_id, brokerId: s.broker_id, buyerId: s.buyer_id,
    salePrice: Number(s.sale_price), commission: Number(s.commission),
    saleDate: s.sale_date, buyerName: s.buyer_name,
  };
}

function mapAuditLog(a: DBAuditLog): AuditLogEntry {
  return {
    id: a.id, action: a.action, adminId: a.admin_id, adminName: a.admin_name,
    targetType: a.target_type, targetId: a.target_id, details: a.details, timestamp: a.timestamp,
  };
}

function mapDocument(d: DBDocument): VehicleDocument {
  return {
    id: d.id, vehicleId: d.vehicle_id, name: d.name, type: d.type as VehicleDocument["type"],
    fileUrl: d.file_url, uploadedAt: d.uploaded_at,
  };
}

function mapInspection(i: DBInspection): InspectionRecord {
  return {
    id: i.id, vehicleId: i.vehicle_id, inspectorName: i.inspector_name,
    status: i.status, notes: i.notes, inspectedAt: i.inspected_at,
  };
}

function mapReport(r: DBReport): Report {
  return {
    id: r.id, reporterId: r.reporter_id, reporterName: r.reporter_name,
    targetType: r.target_type as Report["targetType"], targetId: r.target_id,
    reason: r.reason, description: r.description, status: r.status as Report["status"],
    adminNotes: r.admin_notes || undefined, createdAt: r.created_at,
    resolvedAt: r.resolved_at || undefined, resolvedBy: r.resolved_by || undefined,
  };
}

function mapSavedVehicle(s: DBSavedVehicle): SavedVehicle {
  return {
    id: s.id, userId: s.user_id, vehicleId: s.vehicle_id, savedAt: s.saved_at,
  };
}

function mapTestDrive(t: DBTestDrive): TestDriveRequest {
  return {
    id: t.id, vehicleId: t.vehicle_id, userId: t.user_id, name: t.name,
    email: t.email, phone: t.phone, preferredDate: t.preferred_date,
    preferredTime: t.preferred_time, message: t.message,
    status: t.status as TestDriveRequest["status"], requestedAt: t.requested_at,
  };
}

// ===================== MONGODB =====================

import mongoose from "mongoose";

function toPlain<T>(doc: any): T {
  if (!doc) return null as any;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  delete obj._id;
  delete obj.__v;
  return obj as T;
}

function toPlainArray<T>(docs: any[]): T[] {
  return docs.map(d => toPlain<T>(d));
}

const baseFields = { id: { type: String, unique: true, required: true } };

const userSchema = new mongoose.Schema({
  ...baseFields, name: String, email: { type: String, unique: true }, password_hash: String, phone: String,
  role: { type: String, enum: ['buyer', 'broker', 'admin'] }, verified: Boolean,
  verification_status: String, id_document: String, bio: String, avatar: String, join_date: String,
});

const brokerSchema = new mongoose.Schema({
  ...baseFields, user_id: String, license_number: String, commission_rate: Number,
  verified: Boolean, bio: String, avatar: String,
});

const vehicleSchema = new mongoose.Schema({
  ...baseFields, broker_id: String, brand: String, model: String, year: Number,
  mileage: Number, price: Number, original_price: Number,
  status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected', 'sold'], default: 'draft' },
  image_url: String, description: String, fuel_type: String, transmission: String, location: String,
  condition: String, body_type: String, drive_type: String, color: String, doors: Number, seats: Number,
  engine_size: String, engine_type: String, horsepower: Number, chassis_number: String,
  gallery: [String], commission_rate: Number, commission_type: String, video_url: String,
  inspection_status: { type: String, enum: ['not_inspected', 'pending', 'passed', 'failed'], default: 'not_inspected' },
  inspection_notes: String, inspection_date: String, cover_photo_index: Number, rejection_reason: String,
});

const leadSchema = new mongoose.Schema({
  ...baseFields, vehicle_id: String, buyer_id: { type: String, default: null },
  buyer_name: String, buyer_email: String, buyer_phone: String, message: String,
  inquiry_date: String, status: { type: String, enum: ['new', 'contacted', 'negotiating', 'sold', 'cancelled'], default: 'new' },
});

const saleSchema = new mongoose.Schema({
  ...baseFields, vehicle_id: String, broker_id: String, buyer_id: { type: String, default: null },
  sale_price: Number, commission: Number, sale_date: String, buyer_name: String,
});

const auditLogSchema = new mongoose.Schema({
  ...baseFields, action: String, admin_id: String, admin_name: String,
  target_type: String, target_id: String, details: String, timestamp: String,
});

const documentSchema = new mongoose.Schema({
  ...baseFields, vehicle_id: String, name: String, type: String, file_url: String, uploaded_at: String,
});

const inspectionSchema = new mongoose.Schema({
  ...baseFields, vehicle_id: String, inspector_name: String,
  status: { type: String, enum: ['passed', 'failed', 'pending'] }, notes: String, inspected_at: String,
});

const savedVehicleSchema = new mongoose.Schema({
  ...baseFields, user_id: String, vehicle_id: String, saved_at: String,
});

const reportSchema = new mongoose.Schema({
  ...baseFields, reporter_id: { type: String, default: null }, reporter_name: String,
  target_type: String, target_id: String, reason: String, description: String,
  status: { type: String, default: 'pending' }, admin_notes: { type: String, default: null },
  created_at: String, resolved_at: { type: String, default: null }, resolved_by: { type: String, default: null },
});

const testDriveSchema = new mongoose.Schema({
  ...baseFields, vehicle_id: String, user_id: { type: String, default: null },
  name: String, email: String, phone: String, preferred_date: String, preferred_time: String,
  message: String, status: { type: String, default: 'pending' }, requested_at: String,
});

const UserModel = mongoose.model('User', userSchema, 'users');
const BrokerModel = mongoose.model('Broker', brokerSchema, 'brokers');
const VehicleModel = mongoose.model('Vehicle', vehicleSchema, 'vehicles');
const LeadModel = mongoose.model('Lead', leadSchema, 'leads');
const SaleModel = mongoose.model('Sale', saleSchema, 'sales');
const AuditLogModel = mongoose.model('AuditLog', auditLogSchema, 'audit_logs');
const DocumentModel = mongoose.model('Document', documentSchema, 'documents');
const InspectionModel = mongoose.model('Inspection', inspectionSchema, 'inspections');
const SavedVehicleModel = mongoose.model('SavedVehicle', savedVehicleSchema, 'saved_vehicles');
const ReportModel = mongoose.model('Report', reportSchema, 'reports');
const TestDriveModel = mongoose.model('TestDrive', testDriveSchema, 'test_drives');

// ===================== MYSQL =====================

import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

function mysqlQuery(sql: string, params?: any[]) {
  if (!pool) throw new Error("MySQL pool not initialized");
  return pool.query(sql, params);
}

// ===================== SEED DATA =====================

const seedUsers: DBUser[] = [
  { id: 'usr-admin-1', name: 'Abebe Kebede', email: 'abebe.k@autobroker.et', password_hash: '$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O', phone: '+251911223344', role: 'admin', verified: true, verification_status: 'verified' },
  { id: 'usr-broker-1', name: 'Yonas Hailu', email: 'yonas.h@autobroker.et', password_hash: '$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O', phone: '+251912345678', role: 'broker', verified: true, verification_status: 'verified', bio: 'Senior automotive broker with 8+ years of experience in import and local vehicle sales.' },
  { id: 'usr-broker-2', name: 'Tigist Assefa', email: 'tigist.a@autobroker.et', password_hash: '$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O', phone: '+251913456789', role: 'broker', verified: true, verification_status: 'verified', bio: 'Specializing in luxury and electric vehicles. Certified import specialist.' },
  { id: 'usr-buyer-1', name: 'Dawit Lemma', email: 'dawit.l@gmail.com', password_hash: '$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O', phone: '+251914567890', role: 'buyer' }
];

const seedBrokers: DBBroker[] = [
  { id: 'brk-1', user_id: 'usr-broker-1', license_number: 'ET-BRK-99882', commission_rate: 1.00, verified: true, bio: 'Senior automotive broker with 8+ years of experience.' },
  { id: 'brk-2', user_id: 'usr-broker-2', license_number: 'ET-BRK-77661', commission_rate: 1.25, verified: true, bio: 'Specializing in luxury and electric vehicles.' }
];

const seedVehicles: DBVehicle[] = [
  { id: 'veh-1', broker_id: 'brk-1', brand: 'Toyota', model: 'Land Cruiser 300 VXR', year: 2024, mileage: 1200, price: 24000000.00, original_price: 25500000.00, status: 'approved', image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', description: 'Brand new Land Cruiser 300 VXR, imported from Dubai. Fully optioned, zero km driven locally.', fuel_type: 'Diesel', transmission: 'Automatic', location: 'Addis Ababa', condition: 'New', body_type: 'SUV', drive_type: '4WD', color: 'Gold', doors: 5, seats: 7, engine_size: '3.5L', engine_type: 'V6', horsepower: 409, chassis_number: 'VJA300-2024-8888', commission_rate: 1.0, commission_type: 'percentage', inspection_status: 'passed', inspection_notes: 'All systems functional. Minor cosmetic wear on interior trim.' },
  { id: 'veh-2', broker_id: 'brk-1', brand: 'Changan', model: 'UNI-K', year: 2024, mileage: 0, price: 8500000.00, original_price: 9200000.00, status: 'approved', image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', description: 'Modern luxury Chinese SUV, full electric version. Premium interior layout, active driver assists.', fuel_type: 'Electric', transmission: 'Automatic', location: 'Addis Ababa', condition: 'New', body_type: 'SUV', drive_type: 'FWD', color: 'Silver', doors: 5, seats: 5, engine_size: 'Electric', engine_type: 'Electric', horsepower: 215, commission_rate: 1.0, commission_type: 'percentage', inspection_status: 'pending' },
  { id: 'veh-3', broker_id: 'brk-2', brand: 'Hyundai', model: 'Tucson', year: 2023, mileage: 15000, price: 6800000.00, original_price: 7200000.00, status: 'sold', image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', description: 'Local dealership purchased. Single owner, regular maintenance. Super clean interior and paint.', fuel_type: 'Benzine', transmission: 'Automatic', location: 'Addis Ababa', condition: 'Used', body_type: 'SUV', drive_type: 'AWD', color: 'Black', doors: 5, seats: 5, engine_size: '2.0L', engine_type: 'V4', horsepower: 156, commission_rate: 1.25, commission_type: 'percentage', inspection_status: 'passed' },
  { id: 'veh-4', broker_id: 'brk-2', brand: 'Suzuki', model: 'Dzire', year: 2022, mileage: 28000, price: 2300000.00, original_price: 2500000.00, status: 'approved', image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80', description: 'Highly economical city sedan. Low fuel consumption, manual transmission. Ideal for taxi service.', fuel_type: 'Benzine', transmission: 'Manual', location: 'Adama', condition: 'Used', body_type: 'Sedan', drive_type: 'FWD', color: 'White', doors: 4, seats: 5, engine_size: '1.2L', engine_type: 'V4', horsepower: 83, commission_rate: 1.25, commission_type: 'percentage', inspection_status: 'not_inspected' },
  { id: 'veh-5', broker_id: 'brk-1', brand: 'Toyota', model: 'Hilux', year: 2021, mileage: 45000, price: 9800000.00, original_price: 10500000.00, status: 'approved', image_url: 'https://images.unsplash.com/photo-1583264798270-fac3f3cb93a6?auto=format&fit=crop&w=800&q=80', description: 'Double cabin pickup, well maintained, perfect for commercial use.', fuel_type: 'Diesel', transmission: 'Manual', location: 'Bishoftu', condition: 'Used', body_type: 'Pickup', drive_type: '4WD', color: 'White', doors: 4, seats: 5, engine_size: '3.0L', engine_type: 'V4', horsepower: 171, commission_rate: 1.0, commission_type: 'percentage', inspection_status: 'not_inspected' },
  { id: 'veh-6', broker_id: 'brk-2', brand: 'Mercedes-Benz', model: 'C200', year: 2020, mileage: 52000, price: 8500000.00, original_price: 9000000.00, status: 'rejected', image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80', description: 'Avantgarde edition with full service history.', fuel_type: 'Benzine', transmission: 'Automatic', location: 'Addis Ababa', condition: 'Used', body_type: 'Sedan', drive_type: 'RWD', color: 'Black', doors: 4, seats: 5, engine_size: '2.0L', engine_type: 'V4', horsepower: 181, commission_rate: 1.25, commission_type: 'percentage', inspection_status: 'failed', rejection_reason: 'Documentation incomplete. Please upload customs clearance and proof of ownership.' },
];

const seedLeads: DBLead[] = [
  { id: 'ld-1', vehicle_id: 'veh-1', buyer_id: 'usr-buyer-1', buyer_name: 'Dawit Lemma', buyer_email: 'dawit.l@gmail.com', buyer_phone: '+251914567890', message: 'Is the price negotiable? I would like to pay in cash.', inquiry_date: new Date().toISOString(), status: 'new' },
  { id: 'ld-2', vehicle_id: 'veh-3', buyer_id: null, buyer_name: 'Marta Demeke', buyer_email: 'marta.d@yahoo.com', buyer_phone: '+251918877665', message: 'Can we arrange a viewing in Bole this weekend?', inquiry_date: new Date().toISOString(), status: 'contacted' },
  { id: 'ld-3', vehicle_id: 'veh-1', buyer_id: null, buyer_name: 'Biruk Tadese', buyer_email: 'biruk.t@gmail.com', buyer_phone: '+251911223355', message: 'I am interested and would like to schedule a test drive.', inquiry_date: new Date(Date.now() - 86400000).toISOString(), status: 'negotiating' },
];

const seedSales: DBSale[] = [
  { id: 'sl-1', vehicle_id: 'veh-3', broker_id: 'brk-2', buyer_id: 'usr-buyer-1', sale_price: 6700000.00, commission: 83750.00, sale_date: new Date().toISOString(), buyer_name: 'Dawit Lemma' },
];

const seedAuditLogs: DBAuditLog[] = [
  { id: 'al-1', action: 'approve_listing', admin_id: 'usr-admin-1', admin_name: 'Abebe Kebede', target_type: 'vehicle', target_id: 'veh-1', details: 'Approved listing Toyota Land Cruiser 300 VXR', timestamp: new Date(Date.now() - 172800000).toISOString() },
  { id: 'al-2', action: 'verify_broker', admin_id: 'usr-admin-1', admin_name: 'Abebe Kebede', target_type: 'broker', target_id: 'brk-2', details: 'Verified broker Tigist Assefa', timestamp: new Date(Date.now() - 259200000).toISOString() },
  { id: 'al-3', action: 'reject_listing', admin_id: 'usr-admin-1', admin_name: 'Abebe Kebede', target_type: 'vehicle', target_id: 'veh-6', details: 'Rejected listing Mercedes-Benz C200 - Documentation incomplete', timestamp: new Date(Date.now() - 86400000).toISOString() },
];

const seedDocuments: DBDocument[] = [
  { id: 'doc-1', vehicle_id: 'veh-1', name: 'Customs Clearance.pdf', type: 'customs', file_url: '#', uploaded_at: new Date().toISOString() },
  { id: 'doc-2', vehicle_id: 'veh-1', name: 'Title of Ownership.pdf', type: 'title', file_url: '#', uploaded_at: new Date().toISOString() },
];

const seedInspections: DBInspection[] = [
  { id: 'ins-1', vehicle_id: 'veh-1', inspector_name: 'Alex Maru', status: 'passed', notes: 'Vehicle is in excellent condition. No mechanical issues found.', inspected_at: new Date(Date.now() - 604800000).toISOString() },
  { id: 'ins-2', vehicle_id: 'veh-3', inspector_name: 'Alex Maru', status: 'passed', notes: 'Minor scratches on rear bumper. Otherwise good condition.', inspected_at: new Date(Date.now() - 1209600000).toISOString() },
];

const seedReports: DBReport[] = [
  { id: 'rpt-1', reporter_id: 'usr-buyer-1', reporter_name: 'Dawit Lemma', target_type: 'listing', target_id: 'veh-6', reason: 'Inaccurate information', description: 'The mileage listed does not match the actual vehicle condition I inspected.', status: 'pending', admin_notes: null, created_at: new Date(Date.now() - 86400000).toISOString(), resolved_at: null, resolved_by: null },
  { id: 'rpt-2', reporter_id: null, reporter_name: 'Marta Demeke', target_type: 'broker', target_id: 'brk-2', reason: 'Suspicious activity', description: 'This broker asked for payment before showing the vehicle.', status: 'investigating', admin_notes: 'Contacting both parties for more information.', created_at: new Date(Date.now() - 172800000).toISOString(), resolved_at: null, resolved_by: null },
];

const seedSavedVehicles: DBSavedVehicle[] = [
  { id: 'sv-1', user_id: 'usr-buyer-1', vehicle_id: 'veh-1', saved_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'sv-2', user_id: 'usr-buyer-1', vehicle_id: 'veh-2', saved_at: new Date(Date.now() - 43200000).toISOString() },
];

const seedTestDrives: DBTestDrive[] = [
  { id: 'td-1', vehicle_id: 'veh-1', user_id: 'usr-buyer-1', name: 'Dawit Lemma', email: 'dawit.l@gmail.com', phone: '+251914567890', preferred_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], preferred_time: '10:00', message: 'I would like to test drive the Land Cruiser this weekend.', status: 'confirmed', requested_at: new Date(Date.now() - 172800000).toISOString() },
];

// ===================== INIT =====================

async function seedMongoDB() {
  const count = await UserModel.countDocuments();
  if (count > 0) {
    // Check if the existing users have password_hash
    const anyUserWithoutHash = await UserModel.findOne({ password_hash: { $exists: false } });
    if (!anyUserWithoutHash) {
      return;
    }
    console.log("Found users without password_hash in MongoDB. Updating seed users...");
    for (const u of seedUsers) {
      await UserModel.updateOne({ id: u.id }, { $set: { password_hash: u.password_hash } });
    }
    return;
  }
  console.log("Seeding MongoDB...");
  await UserModel.insertMany(seedUsers);
  await BrokerModel.insertMany(seedBrokers);
  await VehicleModel.insertMany(seedVehicles);
  await LeadModel.insertMany(seedLeads);
  await SaleModel.insertMany(seedSales);
  await AuditLogModel.insertMany(seedAuditLogs);
  await DocumentModel.insertMany(seedDocuments);
  await InspectionModel.insertMany(seedInspections);
  await ReportModel.insertMany(seedReports);
  await SavedVehicleModel.insertMany(seedSavedVehicles);
  await TestDriveModel.insertMany(seedTestDrives);
  console.log("MongoDB seeded.");
}

async function seedMySQL() {
  const [rows]: any = await mysqlQuery("SELECT COUNT(*) as count FROM users");
  if (rows[0].count > 0) {
    // Check if any user lacks password_hash
    const [usersWithoutHash]: any = await mysqlQuery("SELECT COUNT(*) as count FROM users WHERE password_hash IS NULL");
    if (usersWithoutHash[0].count > 0) {
      console.log("Found users without password_hash in MySQL. Updating seed users...");
      for (const u of seedUsers) {
        await mysqlQuery("UPDATE users SET password_hash = ? WHERE id = ?", [u.password_hash || null, u.id]);
      }
    }
    return;
  }
  console.log("Seeding MySQL...");
  for (const u of seedUsers) {
    await mysqlQuery("INSERT IGNORE INTO users (id, name, email, password_hash, phone, role, verified, verification_status, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [u.id, u.name, u.email, u.password_hash || null, u.phone, u.role, u.verified || false, u.verification_status || 'unverified', u.bio || null]);
  }
  for (const b of seedBrokers) {
    await mysqlQuery("INSERT IGNORE INTO brokers (id, user_id, license_number, commission_rate, verified, bio) VALUES (?, ?, ?, ?, ?, ?)", [b.id, b.user_id, b.license_number, b.commission_rate, b.verified || false, b.bio || null]);
  }
  for (const v of seedVehicles) {
    await mysqlQuery("INSERT IGNORE INTO vehicles (id, broker_id, brand, model, year, mileage, price, original_price, status, image_url, description, fuel_type, transmission, location, condition, body_type, drive_type, color, doors, seats, engine_size, engine_type, horsepower, chassis_number, commission_rate, commission_type, inspection_status, inspection_notes, rejection_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [v.id, v.broker_id, v.brand, v.model, v.year, v.mileage, v.price, v.original_price, v.status, v.image_url, v.description, v.fuel_type, v.transmission, v.location, v.condition || null, v.body_type || null, v.drive_type || null, v.color || null, v.doors || null, v.seats || null, v.engine_size || null, v.engine_type || null, v.horsepower || null, v.chassis_number || null, v.commission_rate || null, v.commission_type || null, v.inspection_status || 'not_inspected', v.inspection_notes || null, v.rejection_reason || null]);
  }
  for (const l of seedLeads) {
    await mysqlQuery("INSERT IGNORE INTO leads (id, vehicle_id, buyer_id, buyer_name, buyer_email, buyer_phone, message, inquiry_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [l.id, l.vehicle_id, l.buyer_id, l.buyer_name, l.buyer_email, l.buyer_phone, l.message, l.inquiry_date, l.status]);
  }
  for (const s of seedSales) {
    await mysqlQuery("INSERT IGNORE INTO sales (id, vehicle_id, broker_id, buyer_id, sale_price, commission, sale_date, buyer_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [s.id, s.vehicle_id, s.broker_id, s.buyer_id, s.sale_price, s.commission, s.sale_date, s.buyer_name || null]);
  }
  for (const a of seedAuditLogs) {
    await mysqlQuery("INSERT IGNORE INTO audit_logs (id, action, admin_id, admin_name, target_type, target_id, details, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [a.id, a.action, a.admin_id, a.admin_name, a.target_type, a.target_id, a.details, a.timestamp]);
  }
  for (const d of seedDocuments) {
    await mysqlQuery("INSERT IGNORE INTO documents (id, vehicle_id, name, type, file_url, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)", [d.id, d.vehicle_id, d.name, d.type, d.file_url, d.uploaded_at]);
  }
  for (const i of seedInspections) {
    await mysqlQuery("INSERT IGNORE INTO inspections (id, vehicle_id, inspector_name, status, notes, inspected_at) VALUES (?, ?, ?, ?, ?, ?)", [i.id, i.vehicle_id, i.inspector_name, i.status, i.notes, i.inspected_at]);
  }
  for (const sv of seedSavedVehicles) {
    await mysqlQuery("INSERT IGNORE INTO saved_vehicles (id, user_id, vehicle_id, saved_at) VALUES (?, ?, ?, ?)", [sv.id, sv.user_id, sv.vehicle_id, sv.saved_at]);
  }
  for (const r of seedReports) {
    await mysqlQuery("INSERT IGNORE INTO reports (id, reporter_id, reporter_name, target_type, target_id, reason, description, status, admin_notes, created_at, resolved_at, resolved_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [r.id, r.reporter_id, r.reporter_name, r.target_type, r.target_id, r.reason, r.description, r.status, r.admin_notes, r.created_at, r.resolved_at, r.resolved_by]);
  }
  for (const t of seedTestDrives) {
    await mysqlQuery("INSERT IGNORE INTO test_drives (id, vehicle_id, user_id, name, email, phone, preferred_date, preferred_time, message, status, requested_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [t.id, t.vehicle_id, t.user_id, t.name, t.email, t.phone, t.preferred_date, t.preferred_time, t.message, t.status, t.requested_at]);
  }
  console.log("MySQL seeded.");
}

export async function initDB() {
  if (DB_TYPE === "mysql") {
    const host = process.env.DB_HOST || "localhost";
    const user = process.env.DB_USER || "root";
    const password = process.env.DB_PASSWORD || "";
    const database = process.env.DB_DATABASE || "autobroker_ethiopia";
    pool = mysql.createPool({ host, user, password, database, waitForConnections: true, connectionLimit: 10, queueLimit: 0 });
    await mysqlQuery("SELECT 1");
    console.log("Connected to MySQL!");
    await seedMySQL();
  } else {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/autobroker_ethiopia";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB!");
    await seedMongoDB();
  }
}

// ===================== DB API =====================

export const db = {
  getDBType: () => DB_TYPE,
  mapUser,

  isConnected: async (): Promise<boolean> => {
    if (DB_TYPE === "mysql") {
      if (!pool) return false;
      try {
        await mysqlQuery("SELECT 1");
        return true;
      } catch { return false; }
    }
    return mongoose.connection.readyState === 1;
  },

  // --- Vehicles ---
  getVehicles: async (): Promise<VehicleListing[]> => {
    if (DB_TYPE === "mysql") {
      const [rows] = await mysqlQuery("SELECT * FROM vehicles");
      return (rows as DBVehicle[]).map(mapVehicle);
    }
    const docs = await VehicleModel.find().lean();
    return toPlainArray<DBVehicle>(docs).map(mapVehicle);
  },

  addVehicle: async (v: Omit<DBVehicle, "id" | "status">): Promise<VehicleListing> => {
    const id = `veh-${Date.now()}`;
    const status = "draft";
    if (DB_TYPE === "mysql") {
      await mysqlQuery("INSERT INTO vehicles (id, broker_id, brand, model, year, mileage, price, original_price, status, image_url, description, fuel_type, transmission, location, condition, body_type, drive_type, color, doors, seats, engine_size, engine_type, horsepower, chassis_number, commission_rate, commission_type, video_url, inspection_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, v.broker_id, v.brand, v.model, v.year, v.mileage, v.price, v.original_price, status, v.image_url, v.description, v.fuel_type, v.transmission, v.location, v.condition || null, v.body_type || null, v.drive_type || null, v.color || null, v.doors || null, v.seats || null, v.engine_size || null, v.engine_type || null, v.horsepower || null, v.chassis_number || null, v.commission_rate || null, v.commission_type || null, v.video_url || null, v.inspection_status || 'not_inspected']);
    } else {
      await VehicleModel.create({ id, ...v, status });
    }
    return mapVehicle({ ...v, id, status });
  },

  updateVehicle: async (id: string, updates: Partial<DBVehicle>): Promise<boolean> => {
    if (DB_TYPE === "mysql") {
      const keys = Object.keys(updates);
      if (keys.length === 0) return true;
      const setClause = keys.map(k => `${k} = ?`).join(", ");
      const [result]: any = await mysqlQuery(`UPDATE vehicles SET ${setClause} WHERE id = ?`, [...Object.values(updates), id]);
      return result.affectedRows > 0;
    }
    const result = await VehicleModel.updateOne({ id }, { $set: updates });
    return result.matchedCount > 0;
  },

  deleteVehicle: async (id: string): Promise<boolean> => {
    if (DB_TYPE === "mysql") {
      const [result]: any = await mysqlQuery("DELETE FROM vehicles WHERE id = ?", [id]);
      return result.affectedRows > 0;
    }
    const result = await VehicleModel.deleteOne({ id });
    return result.deletedCount > 0;
  },

  // --- Leads ---
  getLeads: async (): Promise<Lead[]> => {
    if (DB_TYPE === "mysql") {
      const [rows] = await mysqlQuery("SELECT * FROM leads ORDER BY inquiry_date DESC");
      return (rows as DBLead[]).map(mapLead);
    }
    const docs = await LeadModel.find().sort({ inquiry_date: -1 }).lean();
    return toPlainArray<DBLead>(docs).map(mapLead);
  },

  addLead: async (l: Omit<DBLead, "id" | "inquiry_date" | "status">): Promise<Lead> => {
    const id = `ld-${Date.now()}`;
    const inquiry_date = new Date().toISOString();
    const status = "new";
    if (DB_TYPE === "mysql") {
      await mysqlQuery("INSERT INTO leads (id, vehicle_id, buyer_id, buyer_name, buyer_email, buyer_phone, message, status, inquiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, l.vehicle_id, l.buyer_id, l.buyer_name, l.buyer_email, l.buyer_phone, l.message, status, inquiry_date]);
    } else {
      await LeadModel.create({ id, ...l, status, inquiry_date });
    }
    return mapLead({ ...l, id, status, inquiry_date });
  },

  updateLeadStatus: async (id: string, status: Lead["status"]): Promise<boolean> => {
    if (DB_TYPE === "mysql") {
      const [result]: any = await mysqlQuery("UPDATE leads SET status = ? WHERE id = ?", [status, id]);
      return result.affectedRows > 0;
    }
    const result = await LeadModel.updateOne({ id }, { $set: { status } });
    return result.matchedCount > 0;
  },

  // --- Sales ---
  getSales: async (): Promise<Sale[]> => {
    if (DB_TYPE === "mysql") {
      const [rows] = await mysqlQuery("SELECT * FROM sales ORDER BY sale_date DESC");
      return (rows as DBSale[]).map(mapSale);
    }
    const docs = await SaleModel.find().sort({ sale_date: -1 }).lean();
    return toPlainArray<DBSale>(docs).map(mapSale);
  },

  addSale: async (s: Omit<DBSale, "id" | "sale_date">): Promise<Sale> => {
    const id = `sl-${Date.now()}`;
    const sale_date = new Date().toISOString();
    if (DB_TYPE === "mysql") {
      await mysqlQuery("INSERT INTO sales (id, vehicle_id, broker_id, buyer_id, sale_price, commission, sale_date) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, s.vehicle_id, s.broker_id, s.buyer_id, s.sale_price, s.commission, sale_date]);
    } else {
      await SaleModel.create({ id, ...s, sale_date });
    }
    return mapSale({ ...s, id, sale_date });
  },

  // --- Users & Brokers ---
  getUsers: async (): Promise<User[]> => {
    if (DB_TYPE === "mysql") {
      const [rows] = await mysqlQuery("SELECT * FROM users");
      return (rows as DBUser[]).map(mapUser);
    }
    const docs = await UserModel.find().lean();
    return toPlainArray<DBUser>(docs).map(mapUser);
  },

  getBrokers: async (): Promise<Broker[]> => {
    if (DB_TYPE === "mysql") {
      const [rows] = await mysqlQuery("SELECT * FROM brokers");
      return (rows as DBBroker[]).map(mapBroker);
    }
    const docs = await BrokerModel.find().lean();
    return toPlainArray<DBBroker>(docs).map(mapBroker);
  },

  getUserByEmail: async (email: string): Promise<DBUser | null> => {
    if (DB_TYPE === "mysql") {
      const [rows]: any = await mysqlQuery("SELECT * FROM users WHERE email = ?", [email]);
      return rows.length > 0 ? rows[0] : null;
    }
    const doc = await UserModel.findOne({ email }).lean();
    return toPlain<DBUser>(doc);
  },

  getUserById: async (id: string): Promise<DBUser | null> => {
    if (DB_TYPE === "mysql") {
      const [rows]: any = await mysqlQuery("SELECT * FROM users WHERE id = ?", [id]);
      return rows.length > 0 ? rows[0] : null;
    }
    const doc = await UserModel.findOne({ id }).lean();
    return toPlain<DBUser>(doc);
  },

  updateUser: async (id: string, updates: Partial<DBUser>): Promise<boolean> => {
    if (DB_TYPE === "mysql") {
      const keys = Object.keys(updates);
      if (keys.length === 0) return true;
      const setClause = keys.map(k => `${k} = ?`).join(", ");
      const [result]: any = await mysqlQuery(`UPDATE users SET ${setClause} WHERE id = ?`, [...Object.values(updates), id]);
      return result.affectedRows > 0;
    }
    const result = await UserModel.updateOne({ id }, { $set: updates });
    return result.matchedCount > 0;
  },

  updateBroker: async (id: string, updates: Partial<DBBroker>): Promise<boolean> => {
    if (DB_TYPE === "mysql") {
      const keys = Object.keys(updates);
      if (keys.length === 0) return true;
      const setClause = keys.map(k => `${k} = ?`).join(", ");
      const [result]: any = await mysqlQuery(`UPDATE brokers SET ${setClause} WHERE id = ?`, [...Object.values(updates), id]);
      return result.affectedRows > 0;
    }
    const result = await BrokerModel.updateOne({ id }, { $set: updates });
    return result.matchedCount > 0;
  },

  addUser: async (u: Omit<DBUser, "id"> & { password_hash?: string }): Promise<DBUser> => {
    const id = `usr-${Date.now()}`;
    if (DB_TYPE === "mysql") {
      await mysqlQuery("INSERT INTO users (id, name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?, ?)", [id, u.name, u.email, u.password_hash || null, u.phone, u.role]);
      if (u.role === "broker") {
        const brokerId = `brk-${Date.now()}`;
        const license = `ET-BRK-${Math.floor(10000 + Math.random() * 90000)}`;
        await mysqlQuery("INSERT INTO brokers (id, user_id, license_number, commission_rate) VALUES (?, ?, ?, ?)", [brokerId, id, license, 1.00]);
      }
    } else {
      await UserModel.create({ id, ...u });
      if (u.role === "broker") {
        const brokerId = `brk-${Date.now()}`;
        const license = `ET-BRK-${Math.floor(10000 + Math.random() * 90000)}`;
        await BrokerModel.create({ id: brokerId, user_id: id, license_number: license, commission_rate: 1.00, verified: false });
      }
    }
    return { ...u, id };
  },

  // --- Audit Log ---
  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    if (DB_TYPE === "mysql") {
      const [rows] = await mysqlQuery("SELECT * FROM audit_logs ORDER BY timestamp DESC");
      return (rows as DBAuditLog[]).map(mapAuditLog);
    }
    const docs = await AuditLogModel.find().sort({ timestamp: -1 }).lean();
    return toPlainArray<DBAuditLog>(docs).map(mapAuditLog);
  },

  addAuditLog: async (a: Omit<DBAuditLog, "id" | "timestamp">): Promise<AuditLogEntry> => {
    const id = `al-${Date.now()}`;
    const timestamp = new Date().toISOString();
    if (DB_TYPE === "mysql") {
      await mysqlQuery("INSERT INTO audit_logs (id, action, admin_id, admin_name, target_type, target_id, details, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [id, a.action, a.admin_id, a.admin_name, a.target_type, a.target_id, a.details, timestamp]);
    } else {
      await AuditLogModel.create({ id, ...a, timestamp });
    }
    return mapAuditLog({ ...a, id, timestamp });
  },

  // --- Documents ---
  getDocuments: async (vehicleId?: string): Promise<VehicleDocument[]> => {
    if (DB_TYPE === "mysql") {
      const query = vehicleId ? "SELECT * FROM documents WHERE vehicle_id = ?" : "SELECT * FROM documents";
      const params = vehicleId ? [vehicleId] : [];
      const [rows] = await mysqlQuery(query, params);
      return (rows as DBDocument[]).map(mapDocument);
    }
    const query = vehicleId ? { vehicle_id: vehicleId } : {};
    const docs = await DocumentModel.find(query).lean();
    return toPlainArray<DBDocument>(docs).map(mapDocument);
  },

  addDocument: async (d: Omit<DBDocument, "id" | "uploaded_at">): Promise<VehicleDocument> => {
    const id = `doc-${Date.now()}`;
    const uploaded_at = new Date().toISOString();
    if (DB_TYPE === "mysql") {
      await mysqlQuery("INSERT INTO documents (id, vehicle_id, name, type, file_url, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)", [id, d.vehicle_id, d.name, d.type, d.file_url, uploaded_at]);
    } else {
      await DocumentModel.create({ id, ...d, uploaded_at });
    }
    return mapDocument({ ...d, id, uploaded_at });
  },

  deleteDocument: async (id: string): Promise<boolean> => {
    if (DB_TYPE === "mysql") {
      const [result]: any = await mysqlQuery("DELETE FROM documents WHERE id = ?", [id]);
      return result.affectedRows > 0;
    }
    const result = await DocumentModel.deleteOne({ id });
    return result.deletedCount > 0;
  },

  // --- Inspections ---
  getInspections: async (vehicleId?: string): Promise<InspectionRecord[]> => {
    if (DB_TYPE === "mysql") {
      const query = vehicleId ? "SELECT * FROM inspections WHERE vehicle_id = ?" : "SELECT * FROM inspections";
      const params = vehicleId ? [vehicleId] : [];
      const [rows] = await mysqlQuery(query, params);
      return (rows as DBInspection[]).map(mapInspection);
    }
    const query = vehicleId ? { vehicle_id: vehicleId } : {};
    const docs = await InspectionModel.find(query).lean();
    return toPlainArray<DBInspection>(docs).map(mapInspection);
  },

  addInspection: async (i: Omit<DBInspection, "id" | "inspected_at">): Promise<InspectionRecord> => {
    const id = `ins-${Date.now()}`;
    const inspected_at = new Date().toISOString();
    if (DB_TYPE === "mysql") {
      await mysqlQuery("INSERT INTO inspections (id, vehicle_id, inspector_name, status, notes, inspected_at) VALUES (?, ?, ?, ?, ?, ?)", [id, i.vehicle_id, i.inspector_name, i.status, i.notes, inspected_at]);
    } else {
      await InspectionModel.create({ id, ...i, inspected_at });
    }
    return mapInspection({ ...i, id, inspected_at });
  },

  updateInspection: async (id: string, updates: Partial<DBInspection>): Promise<boolean> => {
    if (DB_TYPE === "mysql") {
      const keys = Object.keys(updates);
      if (keys.length === 0) return true;
      const setClause = keys.map(k => `${k} = ?`).join(", ");
      const [result]: any = await mysqlQuery(`UPDATE inspections SET ${setClause} WHERE id = ?`, [...Object.values(updates), id]);
      return result.affectedRows > 0;
    }
    const result = await InspectionModel.updateOne({ id }, { $set: updates });
    return result.matchedCount > 0;
  },

  // --- Saved Vehicles ---
  getSavedVehicles: async (userId: string): Promise<SavedVehicle[]> => {
    if (DB_TYPE === "mysql") {
      const [rows] = await mysqlQuery("SELECT * FROM saved_vehicles WHERE user_id = ? ORDER BY saved_at DESC", [userId]);
      return (rows as DBSavedVehicle[]).map(mapSavedVehicle);
    }
    const docs = await SavedVehicleModel.find({ user_id: userId }).sort({ saved_at: -1 }).lean();
    return toPlainArray<DBSavedVehicle>(docs).map(mapSavedVehicle);
  },

  addSavedVehicle: async (userId: string, vehicleId: string): Promise<SavedVehicle> => {
    const id = `sv-${Date.now()}`;
    const saved_at = new Date().toISOString();
    if (DB_TYPE === "mysql") {
      await mysqlQuery("INSERT INTO saved_vehicles (id, user_id, vehicle_id, saved_at) VALUES (?, ?, ?, ?)", [id, userId, vehicleId, saved_at]);
    } else {
      await SavedVehicleModel.create({ id, user_id: userId, vehicle_id: vehicleId, saved_at });
    }
    return mapSavedVehicle({ id, user_id: userId, vehicle_id: vehicleId, saved_at });
  },

  removeSavedVehicle: async (userId: string, vehicleId: string): Promise<boolean> => {
    if (DB_TYPE === "mysql") {
      const [result]: any = await mysqlQuery("DELETE FROM saved_vehicles WHERE user_id = ? AND vehicle_id = ?", [userId, vehicleId]);
      return result.affectedRows > 0;
    }
    const result = await SavedVehicleModel.deleteOne({ user_id: userId, vehicle_id: vehicleId });
    return result.deletedCount > 0;
  },

  isVehicleSaved: async (userId: string, vehicleId: string): Promise<boolean> => {
    if (DB_TYPE === "mysql") {
      const [rows]: any = await mysqlQuery("SELECT COUNT(*) as count FROM saved_vehicles WHERE user_id = ? AND vehicle_id = ?", [userId, vehicleId]);
      return rows[0].count > 0;
    }
    const doc = await SavedVehicleModel.findOne({ user_id: userId, vehicle_id: vehicleId }).lean();
    return !!doc;
  },

  // --- Test Drives ---
  getTestDrives: async (userId?: string): Promise<TestDriveRequest[]> => {
    if (DB_TYPE === "mysql") {
      const query = userId ? "SELECT * FROM test_drives WHERE user_id = ? ORDER BY requested_at DESC" : "SELECT * FROM test_drives ORDER BY requested_at DESC";
      const params = userId ? [userId] : [];
      const [rows] = await mysqlQuery(query, params);
      return (rows as DBTestDrive[]).map(mapTestDrive);
    }
    const query = userId ? { user_id: userId } : {};
    const docs = await TestDriveModel.find(query).sort({ requested_at: -1 }).lean();
    return toPlainArray<DBTestDrive>(docs).map(mapTestDrive);
  },

  addTestDrive: async (t: Omit<DBTestDrive, "id" | "requested_at" | "status">): Promise<TestDriveRequest> => {
    const id = `td-${Date.now()}`;
    const requested_at = new Date().toISOString();
    const status = "pending";
    if (DB_TYPE === "mysql") {
      await mysqlQuery("INSERT INTO test_drives (id, vehicle_id, user_id, name, email, phone, preferred_date, preferred_time, message, status, requested_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, t.vehicle_id, t.user_id, t.name, t.email, t.phone, t.preferred_date, t.preferred_time, t.message, status, requested_at]);
    } else {
      await TestDriveModel.create({ id, ...t, status, requested_at });
    }
    return mapTestDrive({ ...t, id, status, requested_at });
  },

  updateTestDriveStatus: async (id: string, status: TestDriveRequest["status"]): Promise<boolean> => {
    if (DB_TYPE === "mysql") {
      const [result]: any = await mysqlQuery("UPDATE test_drives SET status = ? WHERE id = ?", [status, id]);
      return result.affectedRows > 0;
    }
    const result = await TestDriveModel.updateOne({ id }, { $set: { status } });
    return result.matchedCount > 0;
  },

  // --- Reports ---
  getReports: async (): Promise<Report[]> => {
    if (DB_TYPE === "mysql") {
      const [rows] = await mysqlQuery("SELECT * FROM reports ORDER BY created_at DESC");
      return (rows as DBReport[]).map(mapReport);
    }
    const docs = await ReportModel.find().sort({ created_at: -1 }).lean();
    return toPlainArray<DBReport>(docs).map(mapReport);
  },

  addReport: async (r: Omit<DBReport, "id" | "created_at" | "status" | "admin_notes" | "resolved_at" | "resolved_by">): Promise<Report> => {
    const id = `rpt-${Date.now()}`;
    const created_at = new Date().toISOString();
    const status = "pending";
    if (DB_TYPE === "mysql") {
      await mysqlQuery("INSERT INTO reports (id, reporter_id, reporter_name, target_type, target_id, reason, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, r.reporter_id, r.reporter_name, r.target_type, r.target_id, r.reason, r.description, status, created_at]);
    } else {
      await ReportModel.create({ id, ...r, status, admin_notes: null, created_at, resolved_at: null, resolved_by: null });
    }
    return mapReport({ ...r, id, status, admin_notes: null, created_at, resolved_at: null, resolved_by: null });
  },

  updateReportStatus: async (id: string, status: Report["status"], adminNotes?: string, resolvedBy?: string): Promise<boolean> => {
    const resolved_at = (status === "resolved" || status === "dismissed") ? new Date().toISOString() : null;
    if (DB_TYPE === "mysql") {
      await mysqlQuery("UPDATE reports SET status = ?, admin_notes = ?, resolved_by = ?, resolved_at = ? WHERE id = ?", [status, adminNotes || null, resolvedBy || null, resolved_at, id]);
      return true;
    }
    const result = await ReportModel.updateOne({ id }, { $set: { status, admin_notes: adminNotes || null, resolved_by: resolvedBy || null, resolved_at } });
    return result.matchedCount > 0;
  },

  // --- Stats ---
  getStats: async () => {
    const [vehicles, leads, sales, brokers, users] = await Promise.all([db.getVehicles(), db.getLeads(), db.getSales(), db.getBrokers(), db.getUsers()]);
    return {
      totals: {
        vehicles: vehicles.length, draftVehicles: vehicles.filter(v => v.status === "draft").length,
        pendingVehicles: vehicles.filter(v => v.status === "pending").length,
        approvedVehicles: vehicles.filter(v => v.status === "approved").length,
        rejectedVehicles: vehicles.filter(v => v.status === "rejected").length,
        soldVehicles: vehicles.filter(v => v.status === "sold").length,
        leads: leads.length, sales: sales.length, brokers: brokers.length, users: users.length,
        revenue: sales.reduce((sum, s) => sum + Number(s.salePrice), 0),
        commission: sales.reduce((sum, s) => sum + Number(s.commission), 0),
      }
    };
  },
};
