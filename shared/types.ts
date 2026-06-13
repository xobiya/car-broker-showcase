// --- AUTOBROKER ETHIOPIA SYSTEM TYPES ---

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "buyer" | "broker" | "seller" | "admin";
  verified?: boolean;
  verificationStatus?: "unverified" | "pending" | "verified";
  idDocument?: string;
  bio?: string;
  avatar?: string;
  joinDate?: string;
}

export interface Broker {
  id: string;
  userId: string;
  licenseNumber: string;
  commissionRate: number;
  name?: string;
  email?: string;
  phone?: string;
  verified?: boolean;
  bio?: string;
  avatar?: string;
  joinDate?: string;
  totalSales?: number;
  totalListings?: number;
}

export interface VehicleListing {
  id: string;
  brokerId: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  originalPrice: number;
  status: "draft" | "pending" | "approved" | "rejected" | "sold";
  imageUrl: string;
  description: string;
  fuelType: string;
  transmission: string;
  location: string;
  condition?: string;
  bodyType?: string;
  driveType?: string;
  color?: string;
  doors?: number;
  seats?: number;
  engineSize?: string;
  engineType?: string;
  horsepower?: number;
  chassisNumber?: string;
  gallery?: string[];
  brokerName?: string;
  brokerPhone?: string;
  brokerLicense?: string;
  commissionRate?: number;
  commissionType?: string;
  videoUrl?: string;
  documents?: VehicleDocument[];
  inspectionStatus?: "not_inspected" | "pending" | "passed" | "failed";
  inspectionNotes?: string;
  inspectionDate?: string;
  coverPhotoIndex?: number;
  rejectionReason?: string;
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  name: string;
  type: "title" | "invoice" | "customs" | "inspection" | "insurance" | "other";
  fileUrl: string;
  uploadedAt: string;
}

export interface Lead {
  id: string;
  vehicleId: string;
  buyerId: string | null;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string;
  inquiryDate: string;
  status: "new" | "contacted" | "negotiating" | "sold" | "cancelled";
  vehicleBrand?: string;
  vehicleModel?: string;
  vehiclePrice?: number;
}

export interface Sale {
  id: string;
  vehicleId: string;
  brokerId: string;
  buyerId: string | null;
  salePrice: number;
  commission: number;
  saleDate: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  buyerName?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  adminId: string;
  adminName: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface InspectionRecord {
  id: string;
  vehicleId: string;
  inspectorName: string;
  status: "passed" | "failed" | "pending";
  notes: string;
  inspectedAt: string;
  items?: InspectionItem[];
}

export interface InspectionItem {
  name: string;
  passed: boolean;
  notes?: string;
}

export interface CommissionCalculation {
  salePrice: number;
  commissionRate: number;
  commissionType: "percentage" | "fixed";
  commissionAmount: number;
  brokerShare: number;
  platformShare: number;
  totalPayout: number;
}

export interface Report {
  id: string;
  reporterId: string | null;
  reporterName: string;
  targetType: "listing" | "broker" | "user";
  targetId: string;
  reason: string;
  description: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  targetSummary?: string;
}

export interface SavedVehicle {
  id: string;
  userId: string;
  vehicleId: string;
  savedAt: string;
  vehicle?: VehicleListing;
}

export interface TestDriveRequest {
  id: string;
  vehicleId: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  requestedAt: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehiclePrice?: number;
}
