import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import type { DBPayment } from "./types";
import {
  UserModel, BrokerModel, VehicleModel, LeadModel, SaleModel,
  AuditLogModel, DocumentModel, InspectionModel, SavedVehicleModel,
  ReportModel, TestDriveModel, PaymentModel, toPlain, toPlainArray
} from "./models";
import { seedDatabase } from "./seed";
import type {
  DBUser, DBBroker, DBVehicle, DBLead, DBSale, DBAuditLog,
  DBDocument, DBInspection, DBSavedVehicle, DBReport, DBTestDrive
} from "./types";
import type {
  VehicleListing, Lead, Sale, AuditLogEntry, VehicleDocument,
  InspectionRecord, SavedVehicle, TestDriveRequest, Report, User, Broker
} from "../../shared/types";

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
    id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role,
    verified: u.verified, verificationStatus: u.verification_status,
    idDocument: u.id_document, bio: u.bio, avatar: u.avatar, joinDate: u.join_date,
  };
}

function mapBroker(b: DBBroker): Broker {
  return {
    id: b.id, userId: b.user_id, licenseNumber: b.license_number,
    commissionRate: Number(b.commission_rate), verified: b.verified, bio: b.bio, avatar: b.avatar,
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

export async function initDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/autobroker_ethiopia";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB!");
  await seedDatabase();
}

export const db = {
  mapUser,

  isConnected: async (): Promise<boolean> => mongoose.connection.readyState === 1,
  getDBType: () => "mongodb" as const,

  // --- Vehicles ---
  getVehicles: async (): Promise<VehicleListing[]> => {
    const docs = await VehicleModel.find().lean();
    return toPlainArray<DBVehicle>(docs).map(mapVehicle);
  },

  addVehicle: async (v: Omit<DBVehicle, "id" | "status">): Promise<VehicleListing> => {
    const id = `veh-${Date.now()}`;
    const status = "draft" as const;
    await VehicleModel.create({ id, ...v, status });
    return mapVehicle({ ...v, id, status });
  },

  updateVehicle: async (id: string, updates: Partial<DBVehicle>): Promise<boolean> => {
    const result = await VehicleModel.updateOne({ id }, { $set: updates });
    return result.matchedCount > 0;
  },

  deleteVehicle: async (id: string): Promise<boolean> => {
    const result = await VehicleModel.deleteOne({ id });
    return result.deletedCount > 0;
  },

  // --- Leads ---
  getLeads: async (): Promise<Lead[]> => {
    const docs = await LeadModel.find().sort({ inquiry_date: -1 }).lean();
    return toPlainArray<DBLead>(docs).map(mapLead);
  },

  addLead: async (l: Omit<DBLead, "id" | "inquiry_date" | "status">): Promise<Lead> => {
    const id = `ld-${Date.now()}`;
    const inquiry_date = new Date().toISOString();
    const status = "new" as const;
    await LeadModel.create({ id, ...l, status, inquiry_date });
    return mapLead({ ...l, id, status, inquiry_date });
  },

  updateLeadStatus: async (id: string, status: Lead["status"]): Promise<boolean> => {
    const result = await LeadModel.updateOne({ id }, { $set: { status } });
    return result.matchedCount > 0;
  },

  // --- Sales ---
  getSales: async (): Promise<Sale[]> => {
    const docs = await SaleModel.find().sort({ sale_date: -1 }).lean();
    return toPlainArray<DBSale>(docs).map(mapSale);
  },

  addSale: async (s: Omit<DBSale, "id" | "sale_date">): Promise<Sale> => {
    const id = `sl-${Date.now()}`;
    const sale_date = new Date().toISOString();
    await SaleModel.create({ id, ...s, sale_date });
    return mapSale({ ...s, id, sale_date });
  },

  // --- Users & Brokers ---
  getUsers: async (): Promise<User[]> => {
    const docs = await UserModel.find().lean();
    return toPlainArray<DBUser>(docs).map(mapUser);
  },

  getBrokers: async (): Promise<Broker[]> => {
    const docs = await BrokerModel.find().lean();
    return toPlainArray<DBBroker>(docs).map(mapBroker);
  },

  getUserByEmail: async (email: string): Promise<DBUser | null> => {
    const doc = await UserModel.findOne({ email }).lean();
    return toPlain<DBUser>(doc);
  },

  getUserById: async (id: string): Promise<DBUser | null> => {
    const doc = await UserModel.findOne({ id }).lean();
    return toPlain<DBUser>(doc);
  },

  updateUser: async (id: string, updates: Partial<DBUser>): Promise<boolean> => {
    const result = await UserModel.updateOne({ id }, { $set: updates });
    return result.matchedCount > 0;
  },

  updateBroker: async (id: string, updates: Partial<DBBroker>): Promise<boolean> => {
    const result = await BrokerModel.updateOne({ id }, { $set: updates });
    return result.matchedCount > 0;
  },

  addUser: async (u: Omit<DBUser, "id"> & { password_hash?: string }): Promise<DBUser> => {
    const id = `usr-${Date.now()}`;
    await UserModel.create({ id, ...u });
    if (u.role === "broker") {
      const brokerId = `brk-${Date.now()}`;
      const license = `ET-BRK-${Math.floor(10000 + Math.random() * 90000)}`;
      await BrokerModel.create({ id: brokerId, user_id: id, license_number: license, commission_rate: 1.00, verified: false });
    }
    return { ...u, id };
  },

  // --- Payments ---
  getPayments: async (brokerId?: string): Promise<any[]> => {
    const query = brokerId ? { broker_id: brokerId } : {};
    const docs = await PaymentModel.find(query).sort({ paid_at: -1 }).lean();
    return toPlainArray<DBPayment>(docs);
  },

  createPayment: async (p: Omit<DBPayment, "id" | "paid_at">): Promise<any> => {
    const id = `pay-${Date.now()}`;
    const paid_at = p.status === "paid" ? new Date().toISOString() : null;
    await PaymentModel.create({ id, ...p, paid_at });
    return { id, ...p, paid_at };
  },

  updatePaymentStatus: async (id: string, status: string, transactionId?: string): Promise<boolean> => {
    const updates: any = { status };
    if (transactionId) updates.transaction_id = transactionId;
    if (status === "paid") updates.paid_at = new Date().toISOString();
    const result = await PaymentModel.updateOne({ id }, { $set: updates });
    return result.matchedCount > 0;
  },

  calculateCommission: (salePrice: number, commissionRate: number, commissionType: string = "percentage") => {
    let commissionAmount = commissionType === "fixed" ? commissionRate : salePrice * (commissionRate / 100);
    const platformShare = commissionAmount * 0.2;
    const brokerShare = commissionAmount * 0.8;
    return { commissionAmount, brokerShare, platformShare, totalPayout: salePrice - commissionAmount };
  },

  // --- Audit Log ---
  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    const docs = await AuditLogModel.find().sort({ timestamp: -1 }).lean();
    return toPlainArray<DBAuditLog>(docs).map(mapAuditLog);
  },

  addAuditLog: async (a: Omit<DBAuditLog, "id" | "timestamp">): Promise<AuditLogEntry> => {
    const id = `al-${Date.now()}`;
    const timestamp = new Date().toISOString();
    await AuditLogModel.create({ id, ...a, timestamp });
    return mapAuditLog({ ...a, id, timestamp });
  },

  // --- Documents ---
  getDocuments: async (vehicleId?: string): Promise<VehicleDocument[]> => {
    const query = vehicleId ? { vehicle_id: vehicleId } : {};
    const docs = await DocumentModel.find(query).lean();
    return toPlainArray<DBDocument>(docs).map(mapDocument);
  },

  addDocument: async (d: Omit<DBDocument, "id" | "uploaded_at">): Promise<VehicleDocument> => {
    const id = `doc-${Date.now()}`;
    const uploaded_at = new Date().toISOString();
    await DocumentModel.create({ id, ...d, uploaded_at });
    return mapDocument({ ...d, id, uploaded_at });
  },

  deleteDocument: async (id: string): Promise<boolean> => {
    const result = await DocumentModel.deleteOne({ id });
    return result.deletedCount > 0;
  },

  // --- Inspections ---
  getInspections: async (vehicleId?: string): Promise<InspectionRecord[]> => {
    const query = vehicleId ? { vehicle_id: vehicleId } : {};
    const docs = await InspectionModel.find(query).lean();
    return toPlainArray<DBInspection>(docs).map(mapInspection);
  },

  addInspection: async (i: Omit<DBInspection, "id" | "inspected_at">): Promise<InspectionRecord> => {
    const id = `ins-${Date.now()}`;
    const inspected_at = new Date().toISOString();
    await InspectionModel.create({ id, ...i, inspected_at });
    return mapInspection({ ...i, id, inspected_at });
  },

  updateInspection: async (id: string, updates: Partial<DBInspection>): Promise<boolean> => {
    const result = await InspectionModel.updateOne({ id }, { $set: updates });
    return result.matchedCount > 0;
  },

  // --- Saved Vehicles ---
  getSavedVehicles: async (userId: string): Promise<SavedVehicle[]> => {
    const docs = await SavedVehicleModel.find({ user_id: userId }).sort({ saved_at: -1 }).lean();
    return toPlainArray<DBSavedVehicle>(docs).map(mapSavedVehicle);
  },

  addSavedVehicle: async (userId: string, vehicleId: string): Promise<SavedVehicle> => {
    const id = `sv-${Date.now()}`;
    const saved_at = new Date().toISOString();
    await SavedVehicleModel.create({ id, user_id: userId, vehicle_id: vehicleId, saved_at });
    return mapSavedVehicle({ id, user_id: userId, vehicle_id: vehicleId, saved_at });
  },

  removeSavedVehicle: async (userId: string, vehicleId: string): Promise<boolean> => {
    const result = await SavedVehicleModel.deleteOne({ user_id: userId, vehicle_id: vehicleId });
    return result.deletedCount > 0;
  },

  isVehicleSaved: async (userId: string, vehicleId: string): Promise<boolean> => {
    const doc = await SavedVehicleModel.findOne({ user_id: userId, vehicle_id: vehicleId }).lean();
    return !!doc;
  },

  // --- Test Drives ---
  getTestDrives: async (userId?: string): Promise<TestDriveRequest[]> => {
    const query = userId ? { user_id: userId } : {};
    const docs = await TestDriveModel.find(query).sort({ requested_at: -1 }).lean();
    return toPlainArray<DBTestDrive>(docs).map(mapTestDrive);
  },

  addTestDrive: async (t: Omit<DBTestDrive, "id" | "requested_at" | "status">): Promise<TestDriveRequest> => {
    const id = `td-${Date.now()}`;
    const requested_at = new Date().toISOString();
    const status = "pending" as const;
    await TestDriveModel.create({ id, ...t, status, requested_at });
    return mapTestDrive({ ...t, id, status, requested_at });
  },

  updateTestDriveStatus: async (id: string, status: TestDriveRequest["status"]): Promise<boolean> => {
    const result = await TestDriveModel.updateOne({ id }, { $set: { status } });
    return result.matchedCount > 0;
  },

  // --- Reports ---
  getReports: async (): Promise<Report[]> => {
    const docs = await ReportModel.find().sort({ created_at: -1 }).lean();
    return toPlainArray<DBReport>(docs).map(mapReport);
  },

  addReport: async (r: Omit<DBReport, "id" | "created_at" | "status" | "admin_notes" | "resolved_at" | "resolved_by">): Promise<Report> => {
    const id = `rpt-${Date.now()}`;
    const created_at = new Date().toISOString();
    const status = "pending" as const;
    await ReportModel.create({ id, ...r, status, admin_notes: null, created_at, resolved_at: null, resolved_by: null });
    return mapReport({ ...r, id, status, admin_notes: null, created_at, resolved_at: null, resolved_by: null });
  },

  updateReportStatus: async (id: string, status: Report["status"], adminNotes?: string, resolvedBy?: string): Promise<boolean> => {
    const resolved_at = (status === "resolved" || status === "dismissed") ? new Date().toISOString() : null;
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
