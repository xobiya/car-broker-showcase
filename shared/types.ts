// --- AUTOBROKER ETHIOPIA SYSTEM TYPES ---

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "buyer" | "broker" | "admin";
}

export interface Broker {
  id: string;
  userId: string;
  licenseNumber: string;
  commissionRate: number;
}

export interface VehicleListing {
  id: string;
  brokerId: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number; // in ETB
  originalPrice: number; // in ETB
  status: "pending" | "approved" | "sold";
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
}
