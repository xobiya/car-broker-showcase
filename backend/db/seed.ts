import { UserModel, BrokerModel, VehicleModel, LeadModel, SaleModel, AuditLogModel, DocumentModel, InspectionModel, SavedVehicleModel, ReportModel, TestDriveModel } from "./models";

const seedUsers = [
  { id: 'usr-admin-1', name: 'Abebe Kebede', email: 'abebe.k@autobroker.et', password_hash: '$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O', phone: '+251911223344', role: 'admin', verified: true, verification_status: 'verified', join_date: '2024-01-15' },
  { id: 'usr-broker-1', name: 'Yonas Hailu', email: 'yonas.h@autobroker.et', password_hash: '$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O', phone: '+251912345678', role: 'broker', verified: true, verification_status: 'verified', bio: 'Senior automotive broker with 8+ years of experience in import and local vehicle sales.', join_date: '2024-02-01' },
  { id: 'usr-broker-2', name: 'Tigist Assefa', email: 'tigist.a@autobroker.et', password_hash: '$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O', phone: '+251913456789', role: 'broker', verified: true, verification_status: 'verified', bio: 'Specializing in luxury and electric vehicles. Certified import specialist.', join_date: '2024-03-10' },
  { id: 'usr-buyer-1', name: 'Dawit Lemma', email: 'dawit.l@gmail.com', password_hash: '$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O', phone: '+251914567890', role: 'buyer', join_date: '2024-06-20' },
  { id: 'usr-buyer-2', name: 'Marta Demeke', email: 'marta.d@yahoo.com', password_hash: '$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O', phone: '+251918877665', role: 'buyer', join_date: '2024-08-05' },
  { id: 'usr-buyer-3', name: 'Solomon Girma', email: 'solomon.g@gmail.com', password_hash: '$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O', phone: '+251915556677', role: 'buyer', join_date: '2024-09-12' }
];

const seedBrokers = [
  { id: 'brk-1', user_id: 'usr-broker-1', license_number: 'ET-BRK-99882', commission_rate: 1.00, verified: true, bio: 'Senior automotive broker with 8+ years of experience.' },
  { id: 'brk-2', user_id: 'usr-broker-2', license_number: 'ET-BRK-77661', commission_rate: 1.25, verified: true, bio: 'Specializing in luxury and electric vehicles.' }
];

const seedVehicles = [
  { id: 'veh-1', broker_id: 'brk-1', brand: 'Toyota', model: 'Land Cruiser 300 VXR', year: 2024, mileage: 1200, price: 24000000.00, original_price: 25500000.00, status: 'approved', image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80', description: 'Brand new Land Cruiser 300 VXR, imported from Dubai. Fully optioned, zero km driven locally.', fuel_type: 'Diesel', transmission: 'Automatic', location: 'Addis Ababa', condition: 'New', body_type: 'SUV', drive_type: '4WD', color: 'Gold', doors: 5, seats: 7, engine_size: '3.5L', engine_type: 'V6', horsepower: 409, chassis_number: 'VJA300-2024-8888', commission_rate: 1.0, commission_type: 'percentage', inspection_status: 'passed', inspection_notes: 'All systems functional. Minor cosmetic wear on interior trim.' },
  { id: 'veh-2', broker_id: 'brk-1', brand: 'Changan', model: 'UNI-K', year: 2024, mileage: 0, price: 8500000.00, original_price: 9200000.00, status: 'approved', image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80', description: 'Modern luxury Chinese SUV, full electric version. Premium interior layout, active driver assists.', fuel_type: 'Electric', transmission: 'Automatic', location: 'Addis Ababa', condition: 'New', body_type: 'SUV', drive_type: 'FWD', color: 'Silver', doors: 5, seats: 5, engine_size: 'Electric', engine_type: 'Electric', horsepower: 215, commission_rate: 1.0, commission_type: 'percentage', inspection_status: 'pending' },
  { id: 'veh-3', broker_id: 'brk-2', brand: 'Hyundai', model: 'Tucson', year: 2023, mileage: 15000, price: 6800000.00, original_price: 7200000.00, status: 'sold', image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80', description: 'Local dealership purchased. Single owner, regular maintenance. Super clean interior and paint.', fuel_type: 'Benzine', transmission: 'Automatic', location: 'Addis Ababa', condition: 'Used', body_type: 'SUV', drive_type: 'AWD', color: 'Black', doors: 5, seats: 5, engine_size: '2.0L', engine_type: 'V4', horsepower: 156, commission_rate: 1.25, commission_type: 'percentage', inspection_status: 'passed' },
  { id: 'veh-4', broker_id: 'brk-2', brand: 'Suzuki', model: 'Dzire', year: 2022, mileage: 28000, price: 2300000.00, original_price: 2500000.00, status: 'approved', image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80', description: 'Highly economical city sedan. Low fuel consumption, manual transmission. Ideal for taxi service.', fuel_type: 'Benzine', transmission: 'Manual', location: 'Adama', condition: 'Used', body_type: 'Sedan', drive_type: 'FWD', color: 'White', doors: 4, seats: 5, engine_size: '1.2L', engine_type: 'V4', horsepower: 83, commission_rate: 1.25, commission_type: 'percentage', inspection_status: 'not_inspected' },
  { id: 'veh-5', broker_id: 'brk-1', brand: 'Toyota', model: 'Hilux', year: 2021, mileage: 45000, price: 9800000.00, original_price: 10500000.00, status: 'approved', image_url: 'https://images.unsplash.com/photo-1583264798270-fac3f3cb93a6?auto=format&fit=crop&w=800&q=80', description: 'Double cabin pickup, well maintained, perfect for commercial use.', fuel_type: 'Diesel', transmission: 'Manual', location: 'Bishoftu', condition: 'Used', body_type: 'Pickup', drive_type: '4WD', color: 'White', doors: 4, seats: 5, engine_size: '3.0L', engine_type: 'V4', horsepower: 171, commission_rate: 1.0, commission_type: 'percentage', inspection_status: 'not_inspected' },
  { id: 'veh-6', broker_id: 'brk-2', brand: 'Mercedes-Benz', model: 'C200', year: 2020, mileage: 52000, price: 8500000.00, original_price: 9000000.00, status: 'rejected', image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80', description: 'Avantgarde edition with full service history.', fuel_type: 'Benzine', transmission: 'Automatic', location: 'Addis Ababa', condition: 'Used', body_type: 'Sedan', drive_type: 'RWD', color: 'Black', doors: 4, seats: 5, engine_size: '2.0L', engine_type: 'V4', horsepower: 181, commission_rate: 1.25, commission_type: 'percentage', inspection_status: 'failed', rejection_reason: 'Documentation incomplete. Please upload customs clearance and proof of ownership.' },
];

const seedLeads = [
  { id: 'ld-1', vehicle_id: 'veh-1', buyer_id: 'usr-buyer-1', buyer_name: 'Dawit Lemma', buyer_email: 'dawit.l@gmail.com', buyer_phone: '+251914567890', message: 'Is the price negotiable? I would like to pay in cash.', inquiry_date: new Date().toISOString(), status: 'new' },
  { id: 'ld-2', vehicle_id: 'veh-3', buyer_id: null, buyer_name: 'Marta Demeke', buyer_email: 'marta.d@yahoo.com', buyer_phone: '+251918877665', message: 'Can we arrange a viewing in Bole this weekend?', inquiry_date: new Date().toISOString(), status: 'contacted' },
  { id: 'ld-3', vehicle_id: 'veh-1', buyer_id: null, buyer_name: 'Biruk Tadese', buyer_email: 'biruk.t@gmail.com', buyer_phone: '+251911223355', message: 'I am interested and would like to schedule a test drive.', inquiry_date: new Date(Date.now() - 86400000).toISOString(), status: 'negotiating' },
];

const seedSales = [
  { id: 'sl-1', vehicle_id: 'veh-3', broker_id: 'brk-2', buyer_id: 'usr-buyer-1', sale_price: 6700000.00, commission: 83750.00, sale_date: new Date().toISOString(), buyer_name: 'Dawit Lemma' },
];

const seedAuditLogs = [
  { id: 'al-1', action: 'approve_listing', admin_id: 'usr-admin-1', admin_name: 'Abebe Kebede', target_type: 'vehicle', target_id: 'veh-1', details: 'Approved listing Toyota Land Cruiser 300 VXR', timestamp: new Date(Date.now() - 172800000).toISOString() },
  { id: 'al-2', action: 'verify_broker', admin_id: 'usr-admin-1', admin_name: 'Abebe Kebede', target_type: 'broker', target_id: 'brk-2', details: 'Verified broker Tigist Assefa', timestamp: new Date(Date.now() - 259200000).toISOString() },
  { id: 'al-3', action: 'reject_listing', admin_id: 'usr-admin-1', admin_name: 'Abebe Kebede', target_type: 'vehicle', target_id: 'veh-6', details: 'Rejected listing Mercedes-Benz C200 - Documentation incomplete', timestamp: new Date(Date.now() - 86400000).toISOString() },
];

const seedDocuments = [
  { id: 'doc-1', vehicle_id: 'veh-1', name: 'Customs Clearance.pdf', type: 'customs', file_url: '#', uploaded_at: new Date().toISOString() },
  { id: 'doc-2', vehicle_id: 'veh-1', name: 'Title of Ownership.pdf', type: 'title', file_url: '#', uploaded_at: new Date().toISOString() },
];

const seedInspections = [
  { id: 'ins-1', vehicle_id: 'veh-1', inspector_name: 'Alex Maru', status: 'passed', notes: 'Vehicle is in excellent condition. No mechanical issues found.', inspected_at: new Date(Date.now() - 604800000).toISOString() },
  { id: 'ins-2', vehicle_id: 'veh-3', inspector_name: 'Alex Maru', status: 'passed', notes: 'Minor scratches on rear bumper. Otherwise good condition.', inspected_at: new Date(Date.now() - 1209600000).toISOString() },
];

const seedReports = [
  { id: 'rpt-1', reporter_id: 'usr-buyer-1', reporter_name: 'Dawit Lemma', target_type: 'listing', target_id: 'veh-6', reason: 'Inaccurate information', description: 'The mileage listed does not match the actual vehicle condition I inspected.', status: 'pending', admin_notes: null, created_at: new Date(Date.now() - 86400000).toISOString(), resolved_at: null, resolved_by: null },
  { id: 'rpt-2', reporter_id: null, reporter_name: 'Marta Demeke', target_type: 'broker', target_id: 'brk-2', reason: 'Suspicious activity', description: 'This broker asked for payment before showing the vehicle.', status: 'investigating', admin_notes: 'Contacting both parties for more information.', created_at: new Date(Date.now() - 172800000).toISOString(), resolved_at: null, resolved_by: null },
];

const seedSavedVehicles = [
  { id: 'sv-1', user_id: 'usr-buyer-1', vehicle_id: 'veh-1', saved_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'sv-2', user_id: 'usr-buyer-1', vehicle_id: 'veh-2', saved_at: new Date(Date.now() - 43200000).toISOString() },
];

const seedTestDrives = [
  { id: 'td-1', vehicle_id: 'veh-1', user_id: 'usr-buyer-1', name: 'Dawit Lemma', email: 'dawit.l@gmail.com', phone: '+251914567890', preferred_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], preferred_time: '10:00', message: 'I would like to test drive the Land Cruiser this weekend.', status: 'confirmed', requested_at: new Date(Date.now() - 172800000).toISOString() },
];

export async function seedDatabase() {
  console.log("Seeding database...");
  for (const u of seedUsers) await UserModel.updateOne({ id: u.id }, { $set: u }, { upsert: true });
  for (const b of seedBrokers) await BrokerModel.updateOne({ id: b.id }, { $set: b }, { upsert: true });
  for (const v of seedVehicles) await VehicleModel.updateOne({ id: v.id }, { $set: v }, { upsert: true });
  for (const l of seedLeads) await LeadModel.updateOne({ id: l.id }, { $set: l }, { upsert: true });
  for (const s of seedSales) await SaleModel.updateOne({ id: s.id }, { $set: s }, { upsert: true });
  for (const a of seedAuditLogs) await AuditLogModel.updateOne({ id: a.id }, { $set: a }, { upsert: true });
  for (const d of seedDocuments) await DocumentModel.updateOne({ id: d.id }, { $set: d }, { upsert: true });
  for (const i of seedInspections) await InspectionModel.updateOne({ id: i.id }, { $set: i }, { upsert: true });
  for (const r of seedReports) await ReportModel.updateOne({ id: r.id }, { $set: r }, { upsert: true });
  for (const sv of seedSavedVehicles) await SavedVehicleModel.updateOne({ id: sv.id }, { $set: sv }, { upsert: true });
  for (const t of seedTestDrives) await TestDriveModel.updateOne({ id: t.id }, { $set: t }, { upsert: true });
  console.log("Database seeded.");
}
