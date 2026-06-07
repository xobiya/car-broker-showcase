import dotenv from "dotenv";

dotenv.config();

export interface DBUser {
  id: string;
  name: string;
  email: string;
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

import { VehicleListing, Lead, Sale, AuditLogEntry, VehicleDocument, InspectionRecord, SavedVehicle, TestDriveRequest, Report } from "../shared/types";

function mapVehicle(v: DBVehicle): VehicleListing {
  return {
    id: v.id,
    brokerId: v.broker_id,
    brand: v.brand,
    model: v.model,
    year: v.year,
    mileage: v.mileage,
    price: Number(v.price),
    originalPrice: Number(v.original_price),
    status: v.status,
    imageUrl: v.image_url,
    description: v.description,
    fuelType: v.fuel_type,
    transmission: v.transmission,
    location: v.location,
    condition: v.condition,
    bodyType: v.body_type,
    driveType: v.drive_type,
    color: v.color,
    doors: v.doors,
    seats: v.seats,
    engineSize: v.engine_size,
    engineType: v.engine_type,
    horsepower: v.horsepower,
    chassisNumber: v.chassis_number,
    gallery: v.gallery,
    commissionRate: v.commission_rate,
    commissionType: v.commission_type,
    videoUrl: v.video_url,
    inspectionStatus: v.inspection_status,
    inspectionNotes: v.inspection_notes,
    inspectionDate: v.inspection_date,
    coverPhotoIndex: v.cover_photo_index,
    rejectionReason: v.rejection_reason,
  };
}

function mapLead(l: DBLead): Lead {
  return {
    id: l.id,
    vehicleId: l.vehicle_id,
    buyerId: l.buyer_id,
    buyerName: l.buyer_name,
    buyerEmail: l.buyer_email,
    buyerPhone: l.buyer_phone,
    message: l.message,
    inquiryDate: l.inquiry_date,
    status: l.status
  };
}

function mapSale(s: DBSale): Sale {
  return {
    id: s.id,
    vehicleId: s.vehicle_id,
    brokerId: s.broker_id,
    buyerId: s.buyer_id,
    salePrice: Number(s.sale_price),
    commission: Number(s.commission),
    saleDate: s.sale_date,
    buyerName: s.buyer_name,
  };
}

function mapAuditLog(a: DBAuditLog): AuditLogEntry {
  return {
    id: a.id,
    action: a.action,
    adminId: a.admin_id,
    adminName: a.admin_name,
    targetType: a.target_type,
    targetId: a.target_id,
    details: a.details,
    timestamp: a.timestamp,
  };
}

function mapDocument(d: DBDocument): VehicleDocument {
  return {
    id: d.id,
    vehicleId: d.vehicle_id,
    name: d.name,
    type: d.type as VehicleDocument["type"],
    fileUrl: d.file_url,
    uploadedAt: d.uploaded_at,
  };
}

function mapInspection(i: DBInspection): InspectionRecord {
  return {
    id: i.id,
    vehicleId: i.vehicle_id,
    inspectorName: i.inspector_name,
    status: i.status,
    notes: i.notes,
    inspectedAt: i.inspected_at,
  };
}

function mapReport(r: DBReport): Report {
  return {
    id: r.id,
    reporterId: r.reporter_id,
    reporterName: r.reporter_name,
    targetType: r.target_type as Report["targetType"],
    targetId: r.target_id,
    reason: r.reason,
    description: r.description,
    status: r.status as Report["status"],
    adminNotes: r.admin_notes || undefined,
    createdAt: r.created_at,
    resolvedAt: r.resolved_at || undefined,
    resolvedBy: r.resolved_by || undefined,
  };
}

function mapSavedVehicle(s: DBSavedVehicle): SavedVehicle {
  return {
    id: s.id,
    userId: s.user_id,
    vehicleId: s.vehicle_id,
    savedAt: s.saved_at,
  };
}

function mapTestDrive(t: DBTestDrive): TestDriveRequest {
  return {
    id: t.id,
    vehicleId: t.vehicle_id,
    userId: t.user_id,
    name: t.name,
    email: t.email,
    phone: t.phone,
    preferredDate: t.preferred_date,
    preferredTime: t.preferred_time,
    message: t.message,
    status: t.status as TestDriveRequest["status"],
    requestedAt: t.requested_at,
  };
}

class InMemoryDB {
  users: DBUser[] = [
    { id: 'usr-admin-1', name: 'Abebe Kebede', email: 'abebe.k@autobroker.et', phone: '+251911223344', role: 'admin', verified: true, verification_status: 'verified' },
    { id: 'usr-broker-1', name: 'Yonas Hailu', email: 'yonas.h@autobroker.et', phone: '+251912345678', role: 'broker', verified: true, verification_status: 'verified', bio: 'Senior automotive broker with 8+ years of experience in import and local vehicle sales.' },
    { id: 'usr-broker-2', name: 'Tigist Assefa', email: 'tigist.a@autobroker.et', phone: '+251913456789', role: 'broker', verified: true, verification_status: 'verified', bio: 'Specializing in luxury and electric vehicles. Certified import specialist.' },
    { id: 'usr-buyer-1', name: 'Dawit Lemma', email: 'dawit.l@gmail.com', phone: '+251914567890', role: 'buyer' }
  ];

  brokers: DBBroker[] = [
    { id: 'brk-1', user_id: 'usr-broker-1', license_number: 'ET-BRK-99882', commission_rate: 1.00, verified: true, bio: 'Senior automotive broker with 8+ years of experience.' },
    { id: 'brk-2', user_id: 'usr-broker-2', license_number: 'ET-BRK-77661', commission_rate: 1.25, verified: true, bio: 'Specializing in luxury and electric vehicles.' }
  ];

  vehicles: DBVehicle[] = [
    {
      id: 'veh-1', broker_id: 'brk-1', brand: 'Toyota', model: 'Land Cruiser 300 VXR', year: 2024,
      mileage: 1200, price: 24000000.00, original_price: 25500000.00, status: 'approved',
      image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      description: 'Brand new Land Cruiser 300 VXR, imported from Dubai. Fully optioned, zero km driven locally.',
      fuel_type: 'Diesel', transmission: 'Automatic', location: 'Addis Ababa',
      condition: 'New', body_type: 'SUV', drive_type: '4WD', color: 'Gold', doors: 5, seats: 7,
      engine_size: '3.5L', engine_type: 'V6', horsepower: 409, chassis_number: 'VJA300-2024-8888',
      commission_rate: 1.0, commission_type: 'percentage', inspection_status: 'passed',
      inspection_notes: 'All systems functional. Minor cosmetic wear on interior trim.',
    },
    {
      id: 'veh-2', broker_id: 'brk-1', brand: 'Changan', model: 'UNI-K', year: 2024,
      mileage: 0, price: 8500000.00, original_price: 9200000.00, status: 'approved',
      image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      description: 'Modern luxury Chinese SUV, full electric version. Premium interior layout, active driver assists.',
      fuel_type: 'Electric', transmission: 'Automatic', location: 'Addis Ababa',
      condition: 'New', body_type: 'SUV', drive_type: 'FWD', color: 'Silver', doors: 5, seats: 5,
      engine_size: 'Electric', engine_type: 'Electric', horsepower: 215,
      commission_rate: 1.0, commission_type: 'percentage', inspection_status: 'pending',
    },
    {
      id: 'veh-3', broker_id: 'brk-2', brand: 'Hyundai', model: 'Tucson', year: 2023,
      mileage: 15000, price: 6800000.00, original_price: 7200000.00, status: 'sold',
      image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
      description: 'Local dealership purchased. Single owner, regular maintenance. Super clean interior and paint.',
      fuel_type: 'Benzine', transmission: 'Automatic', location: 'Addis Ababa',
      condition: 'Used', body_type: 'SUV', drive_type: 'AWD', color: 'Black', doors: 5, seats: 5,
      engine_size: '2.0L', engine_type: 'V4', horsepower: 156,
      commission_rate: 1.25, commission_type: 'percentage', inspection_status: 'passed',
    },
    {
      id: 'veh-4', broker_id: 'brk-2', brand: 'Suzuki', model: 'Dzire', year: 2022,
      mileage: 28000, price: 2300000.00, original_price: 2500000.00, status: 'pending',
      image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
      description: 'Highly economical city sedan. Low fuel consumption, manual transmission. Ideal for taxi service.',
      fuel_type: 'Benzine', transmission: 'Manual', location: 'Adama',
      condition: 'Used', body_type: 'Sedan', drive_type: 'FWD', color: 'White', doors: 4, seats: 5,
      engine_size: '1.2L', engine_type: 'V4', horsepower: 83,
      commission_rate: 1.25, commission_type: 'percentage', inspection_status: 'not_inspected',
    },
    {
      id: 'veh-5', broker_id: 'brk-1', brand: 'Toyota', model: 'Hilux', year: 2021,
      mileage: 45000, price: 9800000.00, original_price: 10500000.00, status: 'draft',
      image_url: 'https://images.unsplash.com/photo-1583264798270-fac3f3cb93a6?auto=format&fit=crop&w=800&q=80',
      description: 'Double cabin pickup, well maintained, perfect for commercial use.',
      fuel_type: 'Diesel', transmission: 'Manual', location: 'Bishoftu',
      condition: 'Used', body_type: 'Pickup', drive_type: '4WD', color: 'White', doors: 4, seats: 5,
      engine_size: '3.0L', engine_type: 'V4', horsepower: 171,
      commission_rate: 1.0, commission_type: 'percentage', inspection_status: 'not_inspected',
    },
    {
      id: 'veh-6', broker_id: 'brk-2', brand: 'Mercedes-Benz', model: 'C200', year: 2020,
      mileage: 52000, price: 8500000.00, original_price: 9000000.00, status: 'rejected',
      image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
      description: 'Avantgarde edition with full service history.',
      fuel_type: 'Benzine', transmission: 'Automatic', location: 'Addis Ababa',
      condition: 'Used', body_type: 'Sedan', drive_type: 'RWD', color: 'Black', doors: 4, seats: 5,
      engine_size: '2.0L', engine_type: 'V4', horsepower: 181,
      commission_rate: 1.25, commission_type: 'percentage', inspection_status: 'failed',
      rejection_reason: 'Documentation incomplete. Please upload customs clearance and proof of ownership.',
    },
  ];

  leads: DBLead[] = [
    {
      id: 'ld-1', vehicle_id: 'veh-1', buyer_id: 'usr-buyer-1',
      buyer_name: 'Dawit Lemma', buyer_email: 'dawit.l@gmail.com', buyer_phone: '+251914567890',
      message: 'Is the price negotiable? I would like to pay in cash.',
      inquiry_date: new Date().toISOString(), status: 'new'
    },
    {
      id: 'ld-2', vehicle_id: 'veh-3', buyer_id: null,
      buyer_name: 'Marta Demeke', buyer_email: 'marta.d@yahoo.com', buyer_phone: '+251918877665',
      message: 'Can we arrange a viewing in Bole this weekend?',
      inquiry_date: new Date().toISOString(), status: 'contacted'
    },
    {
      id: 'ld-3', vehicle_id: 'veh-1', buyer_id: null,
      buyer_name: 'Biruk Tadese', buyer_email: 'biruk.t@gmail.com', buyer_phone: '+251911223355',
      message: 'I am interested and would like to schedule a test drive.',
      inquiry_date: new Date(Date.now() - 86400000).toISOString(), status: 'negotiating'
    },
  ];

  sales: DBSale[] = [
    {
      id: 'sl-1', vehicle_id: 'veh-3', broker_id: 'brk-2',
      buyer_id: 'usr-buyer-1', sale_price: 6700000.00, commission: 83750.00,
      sale_date: new Date().toISOString(), buyer_name: 'Dawit Lemma'
    }
  ];

  auditLogs: DBAuditLog[] = [
    { id: 'al-1', action: 'approve_listing', admin_id: 'usr-admin-1', admin_name: 'Abebe Kebede', target_type: 'vehicle', target_id: 'veh-1', details: 'Approved listing Toyota Land Cruiser 300 VXR', timestamp: new Date(Date.now() - 172800000).toISOString() },
    { id: 'al-2', action: 'verify_broker', admin_id: 'usr-admin-1', admin_name: 'Abebe Kebede', target_type: 'broker', target_id: 'brk-2', details: 'Verified broker Tigist Assefa', timestamp: new Date(Date.now() - 259200000).toISOString() },
    { id: 'al-3', action: 'reject_listing', admin_id: 'usr-admin-1', admin_name: 'Abebe Kebede', target_type: 'vehicle', target_id: 'veh-6', details: 'Rejected listing Mercedes-Benz C200 - Documentation incomplete', timestamp: new Date(Date.now() - 86400000).toISOString() },
  ];

  documents: DBDocument[] = [
    { id: 'doc-1', vehicle_id: 'veh-1', name: 'Customs Clearance.pdf', type: 'customs', file_url: '#', uploaded_at: new Date().toISOString() },
    { id: 'doc-2', vehicle_id: 'veh-1', name: 'Title of Ownership.pdf', type: 'title', file_url: '#', uploaded_at: new Date().toISOString() },
  ];

  inspections: DBInspection[] = [
    { id: 'ins-1', vehicle_id: 'veh-1', inspector_name: 'Alex Maru', status: 'passed', notes: 'Vehicle is in excellent condition. No mechanical issues found.', inspected_at: new Date(Date.now() - 604800000).toISOString() },
    { id: 'ins-2', vehicle_id: 'veh-3', inspector_name: 'Alex Maru', status: 'passed', notes: 'Minor scratches on rear bumper. Otherwise good condition.', inspected_at: new Date(Date.now() - 1209600000).toISOString() },
  ];

  reports: DBReport[] = [
    { id: 'rpt-1', reporter_id: 'usr-buyer-1', reporter_name: 'Dawit Lemma', target_type: 'listing', target_id: 'veh-6', reason: 'Inaccurate information', description: 'The mileage listed does not match the actual vehicle condition I inspected.', status: 'pending', admin_notes: null, created_at: new Date(Date.now() - 86400000).toISOString(), resolved_at: null, resolved_by: null },
    { id: 'rpt-2', reporter_id: null, reporter_name: 'Marta Demeke', target_type: 'broker', target_id: 'brk-2', reason: 'Suspicious activity', description: 'This broker asked for payment before showing the vehicle.', status: 'investigating', admin_notes: 'Contacting both parties for more information.', created_at: new Date(Date.now() - 172800000).toISOString(), resolved_at: null, resolved_by: null },
  ];

  savedVehicles: DBSavedVehicle[] = [
    { id: 'sv-1', user_id: 'usr-buyer-1', vehicle_id: 'veh-1', saved_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'sv-2', user_id: 'usr-buyer-1', vehicle_id: 'veh-2', saved_at: new Date(Date.now() - 43200000).toISOString() },
  ];

  testDrives: DBTestDrive[] = [
    { id: 'td-1', vehicle_id: 'veh-1', user_id: 'usr-buyer-1', name: 'Dawit Lemma', email: 'dawit.l@gmail.com', phone: '+251914567890', preferred_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], preferred_time: '10:00', message: 'I would like to test drive the Land Cruiser this weekend.', status: 'confirmed', requested_at: new Date(Date.now() - 172800000).toISOString() },
  ];
}

const memoryDb = new InMemoryDB();

let pool: any = null;
let useMySQL = false;

async function initDB() {
  try {
    if (!process.env.DB_HOST || !process.env.DB_USER) {
      console.log("Using simulated database.");
      return;
    }
    const mysql = await import("mysql2/promise");
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_DATABASE || "autobroker_ethiopia",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    const [rows] = await pool.query("SELECT 1");
    useMySQL = true;
    console.log("Connected successfully to MySQL database!");
  } catch (err: any) {
    console.log(`MySQL not available (${err.message}). Using simulated database.`);
  }
}

initDB();

export const db = {
  isUsingMySQL: () => useMySQL,

  // --- Vehicles ---
  getVehicles: async (): Promise<VehicleListing[]> => {
    if (useMySQL) {
      const [rows] = await pool.query("SELECT * FROM vehicles");
      return (rows as DBVehicle[]).map(mapVehicle);
    }
    return memoryDb.vehicles.map(mapVehicle);
  },

  addVehicle: async (v: Omit<DBVehicle, "id" | "status">): Promise<VehicleListing> => {
    const id = `veh-${Date.now()}`;
    const status = "draft";
    if (useMySQL) {
      await pool.query(
        `INSERT INTO vehicles (id, broker_id, brand, model, year, mileage, price, original_price, status, image_url, description, fuel_type, transmission, location, condition, body_type, drive_type, color, doors, seats, engine_size, engine_type, horsepower, chassis_number, commission_rate, commission_type, video_url, inspection_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, v.broker_id, v.brand, v.model, v.year, v.mileage, v.price, v.original_price, status, v.image_url, v.description, v.fuel_type, v.transmission, v.location, v.condition || null, v.body_type || null, v.drive_type || null, v.color || null, v.doors || null, v.seats || null, v.engine_size || null, v.engine_type || null, v.horsepower || null, v.chassis_number || null, v.commission_rate || null, v.commission_type || null, v.video_url || null, v.inspection_status || 'not_inspected']
      );
    } else {
      memoryDb.vehicles.push({ ...v, id, status });
    }
    return mapVehicle({ ...v, id, status });
  },

  updateVehicle: async (id: string, updates: Partial<DBVehicle>): Promise<boolean> => {
    if (useMySQL) {
      const keys = Object.keys(updates);
      if (keys.length === 0) return true;
      const setClause = keys.map(k => `${k} = ?`).join(", ");
      const values = [...Object.values(updates), id];
      const [result]: any = await pool.query(`UPDATE vehicles SET ${setClause} WHERE id = ?`, values);
      return result.affectedRows > 0;
    } else {
      const index = memoryDb.vehicles.findIndex(v => v.id === id);
      if (index === -1) return false;
      memoryDb.vehicles[index] = { ...memoryDb.vehicles[index], ...updates };
      return true;
    }
  },

  deleteVehicle: async (id: string): Promise<boolean> => {
    if (useMySQL) {
      const [result]: any = await pool.query("DELETE FROM vehicles WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } else {
      const index = memoryDb.vehicles.findIndex(v => v.id === id);
      if (index === -1) return false;
      memoryDb.vehicles.splice(index, 1);
      return true;
    }
  },

  // --- Leads ---
  getLeads: async (): Promise<Lead[]> => {
    if (useMySQL) {
      const [rows] = await pool.query("SELECT * FROM leads ORDER BY inquiry_date DESC");
      return (rows as DBLead[]).map(mapLead);
    }
    return [...memoryDb.leads].sort((a, b) => b.inquiry_date.localeCompare(a.inquiry_date)).map(mapLead);
  },

  addLead: async (l: Omit<DBLead, "id" | "inquiry_date" | "status">): Promise<Lead> => {
    const id = `ld-${Date.now()}`;
    const inquiry_date = new Date().toISOString();
    const status = "new";
    if (useMySQL) {
      await pool.query(
        `INSERT INTO leads (id, vehicle_id, buyer_id, buyer_name, buyer_email, buyer_phone, message, status, inquiry_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, l.vehicle_id, l.buyer_id, l.buyer_name, l.buyer_email, l.buyer_phone, l.message, status, inquiry_date]
      );
    } else {
      memoryDb.leads.push({ ...l, id, status, inquiry_date });
    }
    return mapLead({ ...l, id, status, inquiry_date });
  },

  updateLeadStatus: async (id: string, status: Lead["status"]): Promise<boolean> => {
    if (useMySQL) {
      const [result]: any = await pool.query("UPDATE leads SET status = ? WHERE id = ?", [status, id]);
      return result.affectedRows > 0;
    } else {
      const index = memoryDb.leads.findIndex(l => l.id === id);
      if (index === -1) return false;
      memoryDb.leads[index].status = status;
      return true;
    }
  },

  // --- Sales ---
  getSales: async (): Promise<Sale[]> => {
    if (useMySQL) {
      const [rows] = await pool.query("SELECT * FROM sales ORDER BY sale_date DESC");
      return (rows as DBSale[]).map(mapSale);
    }
    return [...memoryDb.sales].sort((a, b) => b.sale_date.localeCompare(a.sale_date)).map(mapSale);
  },

  addSale: async (s: Omit<DBSale, "id" | "sale_date">): Promise<Sale> => {
    const id = `sl-${Date.now()}`;
    const sale_date = new Date().toISOString();
    if (useMySQL) {
      await pool.query(
        `INSERT INTO sales (id, vehicle_id, broker_id, buyer_id, sale_price, commission, sale_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, s.vehicle_id, s.broker_id, s.buyer_id, s.sale_price, s.commission, sale_date]
      );
    } else {
      memoryDb.sales.push({ ...s, id, sale_date });
    }
    return mapSale({ ...s, id, sale_date });
  },

  // --- Users & Brokers ---
  getUsers: async (): Promise<DBUser[]> => {
    if (useMySQL) {
      const [rows] = await pool.query("SELECT * FROM users");
      return rows as DBUser[];
    }
    return memoryDb.users;
  },

  getBrokers: async (): Promise<DBBroker[]> => {
    if (useMySQL) {
      const [rows] = await pool.query("SELECT * FROM brokers");
      return rows as DBBroker[];
    }
    return memoryDb.brokers;
  },

  getUserByEmail: async (email: string): Promise<DBUser | null> => {
    if (useMySQL) {
      try {
        const [rows]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length > 0) return rows[0];
      } catch (err) {
        const u = memoryDb.users.find(user => user.email === email);
        return u || null;
      }
      return null;
    }
    const u = memoryDb.users.find(user => user.email === email);
    return u || null;
  },

  getUserById: async (id: string): Promise<DBUser | null> => {
    if (useMySQL) {
      const [rows]: any = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
      return rows.length > 0 ? rows[0] : null;
    }
    return memoryDb.users.find(u => u.id === id) || null;
  },

  updateUser: async (id: string, updates: Partial<DBUser>): Promise<boolean> => {
    if (useMySQL) {
      const keys = Object.keys(updates);
      if (keys.length === 0) return true;
      const setClause = keys.map(k => `${k} = ?`).join(", ");
      const values = [...Object.values(updates), id];
      const [result]: any = await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, values);
      return result.affectedRows > 0;
    } else {
      const index = memoryDb.users.findIndex(u => u.id === id);
      if (index === -1) return false;
      memoryDb.users[index] = { ...memoryDb.users[index], ...updates };
      return true;
    }
  },

  updateBroker: async (id: string, updates: Partial<DBBroker>): Promise<boolean> => {
    if (useMySQL) {
      const keys = Object.keys(updates);
      if (keys.length === 0) return true;
      const setClause = keys.map(k => `${k} = ?`).join(", ");
      const values = [...Object.values(updates), id];
      const [result]: any = await pool.query(`UPDATE brokers SET ${setClause} WHERE id = ?`, values);
      return result.affectedRows > 0;
    } else {
      const index = memoryDb.brokers.findIndex(b => b.id === id);
      if (index === -1) return false;
      memoryDb.brokers[index] = { ...memoryDb.brokers[index], ...updates };
      return true;
    }
  },

  addUser: async (u: Omit<DBUser, "id">): Promise<DBUser> => {
    const id = `usr-${Date.now()}`;
    if (useMySQL) {
      await pool.query(
        "INSERT INTO users (id, name, email, phone, role) VALUES (?, ?, ?, ?, ?)",
        [id, u.name, u.email, u.phone, u.role]
      );
      if (u.role === "broker") {
        const brokerId = `brk-${Date.now()}`;
        const license = `ET-BRK-${Math.floor(10000 + Math.random() * 90000)}`;
        await pool.query(
          "INSERT INTO brokers (id, user_id, license_number, commission_rate) VALUES (?, ?, ?, ?)",
          [brokerId, id, license, 1.00]
        );
      }
    } else {
      memoryDb.users.push({ ...u, id });
      if (u.role === "broker") {
        const brokerId = `brk-${Date.now()}`;
        const license = `ET-BRK-${Math.floor(10000 + Math.random() * 90000)}`;
        memoryDb.brokers.push({
          id: brokerId,
          user_id: id,
          license_number: license,
          commission_rate: 1.00,
          verified: false,
        });
      }
    }
    return { ...u, id };
  },

  // --- Audit Log ---
  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    if (useMySQL) {
      const [rows] = await pool.query("SELECT * FROM audit_logs ORDER BY timestamp DESC");
      return (rows as DBAuditLog[]).map(mapAuditLog);
    }
    return [...memoryDb.auditLogs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map(mapAuditLog);
  },

  addAuditLog: async (a: Omit<DBAuditLog, "id" | "timestamp">): Promise<AuditLogEntry> => {
    const id = `al-${Date.now()}`;
    const timestamp = new Date().toISOString();
    if (useMySQL) {
      await pool.query(
        `INSERT INTO audit_logs (id, action, admin_id, admin_name, target_type, target_id, details, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, a.action, a.admin_id, a.admin_name, a.target_type, a.target_id, a.details, timestamp]
      );
    } else {
      memoryDb.auditLogs.push({ ...a, id, timestamp });
    }
    return mapAuditLog({ ...a, id, timestamp });
  },

  // --- Documents ---
  getDocuments: async (vehicleId?: string): Promise<VehicleDocument[]> => {
    if (useMySQL) {
      const query = vehicleId ? "SELECT * FROM documents WHERE vehicle_id = ?" : "SELECT * FROM documents";
      const params = vehicleId ? [vehicleId] : [];
      const [rows] = await pool.query(query, params);
      return (rows as DBDocument[]).map(mapDocument);
    }
    let docs = memoryDb.documents;
    if (vehicleId) docs = docs.filter(d => d.vehicle_id === vehicleId);
    return docs.map(mapDocument);
  },

  addDocument: async (d: Omit<DBDocument, "id" | "uploaded_at">): Promise<VehicleDocument> => {
    const id = `doc-${Date.now()}`;
    const uploaded_at = new Date().toISOString();
    if (useMySQL) {
      await pool.query(
        `INSERT INTO documents (id, vehicle_id, name, type, file_url, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, d.vehicle_id, d.name, d.type, d.file_url, uploaded_at]
      );
    } else {
      memoryDb.documents.push({ ...d, id, uploaded_at });
    }
    return mapDocument({ ...d, id, uploaded_at });
  },

  deleteDocument: async (id: string): Promise<boolean> => {
    if (useMySQL) {
      const [result]: any = await pool.query("DELETE FROM documents WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } else {
      const idx = memoryDb.documents.findIndex(d => d.id === id);
      if (idx === -1) return false;
      memoryDb.documents.splice(idx, 1);
      return true;
    }
  },

  // --- Inspections ---
  getInspections: async (vehicleId?: string): Promise<InspectionRecord[]> => {
    if (useMySQL) {
      const query = vehicleId ? "SELECT * FROM inspections WHERE vehicle_id = ?" : "SELECT * FROM inspections";
      const params = vehicleId ? [vehicleId] : [];
      const [rows] = await pool.query(query, params);
      return (rows as DBInspection[]).map(mapInspection);
    }
    let inspections = memoryDb.inspections;
    if (vehicleId) inspections = inspections.filter(i => i.vehicle_id === vehicleId);
    return inspections.map(mapInspection);
  },

  addInspection: async (i: Omit<DBInspection, "id" | "inspected_at">): Promise<InspectionRecord> => {
    const id = `ins-${Date.now()}`;
    const inspected_at = new Date().toISOString();
    if (useMySQL) {
      await pool.query(
        `INSERT INTO inspections (id, vehicle_id, inspector_name, status, notes, inspected_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, i.vehicle_id, i.inspector_name, i.status, i.notes, inspected_at]
      );
    } else {
      memoryDb.inspections.push({ ...i, id, inspected_at });
    }
    return mapInspection({ ...i, id, inspected_at });
  },

  updateInspection: async (id: string, updates: Partial<DBInspection>): Promise<boolean> => {
    if (useMySQL) {
      const keys = Object.keys(updates);
      if (keys.length === 0) return true;
      const setClause = keys.map(k => `${k} = ?`).join(", ");
      const values = [...Object.values(updates), id];
      const [result]: any = await pool.query(`UPDATE inspections SET ${setClause} WHERE id = ?`, values);
      return result.affectedRows > 0;
    } else {
      const index = memoryDb.inspections.findIndex(i => i.id === id);
      if (index === -1) return false;
      memoryDb.inspections[index] = { ...memoryDb.inspections[index], ...updates };
      return true;
    }
  },

  // --- Saved Vehicles ---
  getSavedVehicles: async (userId: string): Promise<SavedVehicle[]> => {
    if (useMySQL) {
      const [rows] = await pool.query("SELECT * FROM saved_vehicles WHERE user_id = ? ORDER BY saved_at DESC", [userId]);
      return (rows as DBSavedVehicle[]).map(mapSavedVehicle);
    }
    return memoryDb.savedVehicles.filter(s => s.user_id === userId).sort((a, b) => b.saved_at.localeCompare(a.saved_at)).map(mapSavedVehicle);
  },

  addSavedVehicle: async (userId: string, vehicleId: string): Promise<SavedVehicle> => {
    const id = `sv-${Date.now()}`;
    const saved_at = new Date().toISOString();
    if (useMySQL) {
      await pool.query(
        "INSERT INTO saved_vehicles (id, user_id, vehicle_id, saved_at) VALUES (?, ?, ?, ?)",
        [id, userId, vehicleId, saved_at]
      );
    } else {
      memoryDb.savedVehicles.push({ id, user_id: userId, vehicle_id: vehicleId, saved_at });
    }
    return mapSavedVehicle({ id, user_id: userId, vehicle_id: vehicleId, saved_at });
  },

  removeSavedVehicle: async (userId: string, vehicleId: string): Promise<boolean> => {
    if (useMySQL) {
      const [result]: any = await pool.query("DELETE FROM saved_vehicles WHERE user_id = ? AND vehicle_id = ?", [userId, vehicleId]);
      return result.affectedRows > 0;
    } else {
      const idx = memoryDb.savedVehicles.findIndex(s => s.user_id === userId && s.vehicle_id === vehicleId);
      if (idx === -1) return false;
      memoryDb.savedVehicles.splice(idx, 1);
      return true;
    }
  },

  isVehicleSaved: async (userId: string, vehicleId: string): Promise<boolean> => {
    if (useMySQL) {
      const [rows]: any = await pool.query("SELECT COUNT(*) as count FROM saved_vehicles WHERE user_id = ? AND vehicle_id = ?", [userId, vehicleId]);
      return rows[0].count > 0;
    }
    return memoryDb.savedVehicles.some(s => s.user_id === userId && s.vehicle_id === vehicleId);
  },

  // --- Test Drives ---
  getTestDrives: async (userId?: string): Promise<TestDriveRequest[]> => {
    if (useMySQL) {
      const query = userId ? "SELECT * FROM test_drives WHERE user_id = ? ORDER BY requested_at DESC" : "SELECT * FROM test_drives ORDER BY requested_at DESC";
      const params = userId ? [userId] : [];
      const [rows] = await pool.query(query, params);
      return (rows as DBTestDrive[]).map(mapTestDrive);
    }
    let drives = memoryDb.testDrives;
    if (userId) drives = drives.filter(d => d.user_id === userId);
    return [...drives].sort((a, b) => b.requested_at.localeCompare(a.requested_at)).map(mapTestDrive);
  },

  addTestDrive: async (t: Omit<DBTestDrive, "id" | "requested_at" | "status">): Promise<TestDriveRequest> => {
    const id = `td-${Date.now()}`;
    const requested_at = new Date().toISOString();
    const status = "pending";
    if (useMySQL) {
      await pool.query(
        `INSERT INTO test_drives (id, vehicle_id, user_id, name, email, phone, preferred_date, preferred_time, message, status, requested_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, t.vehicle_id, t.user_id, t.name, t.email, t.phone, t.preferred_date, t.preferred_time, t.message, status, requested_at]
      );
    } else {
      memoryDb.testDrives.push({ ...t, id, status, requested_at });
    }
    return mapTestDrive({ ...t, id, status, requested_at });
  },

  updateTestDriveStatus: async (id: string, status: TestDriveRequest["status"]): Promise<boolean> => {
    if (useMySQL) {
      const [result]: any = await pool.query("UPDATE test_drives SET status = ? WHERE id = ?", [status, id]);
      return result.affectedRows > 0;
    } else {
      const index = memoryDb.testDrives.findIndex(t => t.id === id);
      if (index === -1) return false;
      memoryDb.testDrives[index].status = status;
      return true;
    }
  },

  // --- Reports ---
  getReports: async (): Promise<Report[]> => {
    if (useMySQL) {
      const [rows] = await pool.query("SELECT * FROM reports ORDER BY created_at DESC");
      return (rows as DBReport[]).map(mapReport);
    }
    return [...memoryDb.reports].sort((a, b) => b.created_at.localeCompare(a.created_at)).map(mapReport);
  },

  addReport: async (r: Omit<DBReport, "id" | "created_at" | "status" | "admin_notes" | "resolved_at" | "resolved_by">): Promise<Report> => {
    const id = `rpt-${Date.now()}`;
    const created_at = new Date().toISOString();
    const status = "pending";
    if (useMySQL) {
      await pool.query(
        `INSERT INTO reports (id, reporter_id, reporter_name, target_type, target_id, reason, description, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, r.reporter_id, r.reporter_name, r.target_type, r.target_id, r.reason, r.description, status, created_at]
      );
    } else {
      memoryDb.reports.push({ ...r, id, status, admin_notes: null, created_at, resolved_at: null, resolved_by: null });
    }
    return mapReport({ ...r, id, status, admin_notes: null, created_at, resolved_at: null, resolved_by: null });
  },

  updateReportStatus: async (id: string, status: Report["status"], adminNotes?: string, resolvedBy?: string): Promise<boolean> => {
    if (useMySQL) {
      const resolved_at = status === "resolved" || status === "dismissed" ? new Date().toISOString() : null;
      await pool.query(
        "UPDATE reports SET status = ?, admin_notes = ?, resolved_by = ?, resolved_at = ? WHERE id = ?",
        [status, adminNotes || null, resolvedBy || null, resolved_at, id]
      );
      return true;
    } else {
      const index = memoryDb.reports.findIndex(r => r.id === id);
      if (index === -1) return false;
      memoryDb.reports[index].status = status;
      if (adminNotes !== undefined) memoryDb.reports[index].admin_notes = adminNotes;
      if (resolvedBy) memoryDb.reports[index].resolved_by = resolvedBy;
      if (status === "resolved" || status === "dismissed") memoryDb.reports[index].resolved_at = new Date().toISOString();
      return true;
    }
  },

  // --- Stats ---
  getStats: async () => {
    const vehicles = await db.getVehicles();
    const leads = await db.getLeads();
    const sales = await db.getSales();
    const brokers = await db.getBrokers();
    const users = await db.getUsers();
    return {
      totals: {
        vehicles: vehicles.length,
        draftVehicles: vehicles.filter(v => v.status === "draft").length,
        pendingVehicles: vehicles.filter(v => v.status === "pending").length,
        approvedVehicles: vehicles.filter(v => v.status === "approved").length,
        rejectedVehicles: vehicles.filter(v => v.status === "rejected").length,
        soldVehicles: vehicles.filter(v => v.status === "sold").length,
        leads: leads.length,
        sales: sales.length,
        brokers: brokers.length,
        users: users.length,
        revenue: sales.reduce((sum, s) => sum + Number(s.salePrice), 0),
        commission: sales.reduce((sum, s) => sum + Number(s.commission), 0),
      }
    };
  },
};
