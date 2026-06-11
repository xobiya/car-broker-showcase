import mongoose, { Schema } from "mongoose";

const baseFields = { id: { type: String, unique: true, required: true } };

const userSchema = new Schema({
  ...baseFields, name: String, email: { type: String, unique: true }, password_hash: String, phone: String,
  role: { type: String, enum: ['buyer', 'broker', 'admin'] }, verified: Boolean,
  verification_status: String, id_document: String, bio: String, avatar: String, join_date: String,
});

const brokerSchema = new Schema({
  ...baseFields, user_id: String, license_number: String, commission_rate: Number,
  verified: Boolean, bio: String, avatar: String,
});

const vehicleSchema = new Schema({
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

const leadSchema = new Schema({
  ...baseFields, vehicle_id: String, buyer_id: { type: String, default: null },
  buyer_name: String, buyer_email: String, buyer_phone: String, message: String,
  inquiry_date: String, status: { type: String, enum: ['new', 'contacted', 'negotiating', 'sold', 'cancelled'], default: 'new' },
});

const saleSchema = new Schema({
  ...baseFields, vehicle_id: String, broker_id: String, buyer_id: { type: String, default: null },
  sale_price: Number, commission: Number, sale_date: String, buyer_name: String,
});

const auditLogSchema = new Schema({
  ...baseFields, action: String, admin_id: String, admin_name: String,
  target_type: String, target_id: String, details: String, timestamp: String,
});

const documentSchema = new Schema({
  ...baseFields, vehicle_id: String, name: String, type: String, file_url: String, uploaded_at: String,
});

const inspectionSchema = new Schema({
  ...baseFields, vehicle_id: String, inspector_name: String,
  status: { type: String, enum: ['passed', 'failed', 'pending'] }, notes: String, inspected_at: String,
});

const savedVehicleSchema = new Schema({
  ...baseFields, user_id: String, vehicle_id: String, saved_at: String,
});

const reportSchema = new Schema({
  ...baseFields, reporter_id: { type: String, default: null }, reporter_name: String,
  target_type: String, target_id: String, reason: String, description: String,
  status: { type: String, default: 'pending' }, admin_notes: { type: String, default: null },
  created_at: String, resolved_at: { type: String, default: null }, resolved_by: { type: String, default: null },
});

const paymentSchema = new Schema({
  ...baseFields, sale_id: String, broker_id: String, amount: Number,
  platform_fee: Number, broker_payout: Number, status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  payment_method: String, transaction_id: String, paid_at: { type: String, default: null },
});

const testDriveSchema = new Schema({
  ...baseFields, vehicle_id: String, user_id: { type: String, default: null },
  name: String, email: String, phone: String, preferred_date: String, preferred_time: String,
  message: String, status: { type: String, default: 'pending' }, requested_at: String,
});

export const UserModel = mongoose.model('User', userSchema, 'users');
export const BrokerModel = mongoose.model('Broker', brokerSchema, 'brokers');
export const VehicleModel = mongoose.model('Vehicle', vehicleSchema, 'vehicles');
export const LeadModel = mongoose.model('Lead', leadSchema, 'leads');
export const SaleModel = mongoose.model('Sale', saleSchema, 'sales');
export const AuditLogModel = mongoose.model('AuditLog', auditLogSchema, 'audit_logs');
export const DocumentModel = mongoose.model('Document', documentSchema, 'documents');
export const InspectionModel = mongoose.model('Inspection', inspectionSchema, 'inspections');
export const SavedVehicleModel = mongoose.model('SavedVehicle', savedVehicleSchema, 'saved_vehicles');
export const ReportModel = mongoose.model('Report', reportSchema, 'reports');
export const PaymentModel = mongoose.model('Payment', paymentSchema, 'payments');
export const TestDriveModel = mongoose.model('TestDrive', testDriveSchema, 'test_drives');

export function toPlain<T>(doc: any): T {
  if (!doc) return null as any;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  delete obj._id;
  delete obj.__v;
  return obj as T;
}

export function toPlainArray<T>(docs: any[]): T[] {
  return docs.map(d => toPlain<T>(d));
}
