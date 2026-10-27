export type UserRole = 'buyer' | 'seller' | 'broker' | 'admin';
export type User = {
  id: string; name: string; email: string; phone?: string; role: UserRole;
  verified?: boolean; verificationStatus?: 'unverified' | 'pending' | 'verified';
  bio?: string; avatar?: string; joinDate?: string;
};
export type VehicleStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'sold';
export type Vehicle = {
  id: string; brokerId?: string; brand: string; model: string; year: number; mileage: number;
  price: number; originalPrice?: number; status?: VehicleStatus; imageUrl?: string; gallery?: string[];
  description?: string; fuelType?: string; transmission?: string; location?: string; condition?: string;
  bodyType?: string; driveType?: string; color?: string; doors?: number; seats?: number;
  engineSize?: string; engineType?: string; horsepower?: number; brokerName?: string; brokerPhone?: string;
  brokerLicense?: string; brokerVerified?: boolean; sellerName?: string; sellerEmail?: string;
  sellerPhone?: string; sellerRole?: string; phone?: string; videoUrl?: string;
  inspectionStatus?: 'not_inspected' | 'pending' | 'passed' | 'failed'; inspectionNotes?: string;
  inspectionDate?: string; ownershipDocumentUrl?: string; ownershipDocumentName?: string; rejectionReason?: string;
  chassisNumber?: string;
};
export type SavedVehicle = { id: string; userId: string; vehicleId: string; savedAt?: string; vehicle?: Vehicle };
export type LeadStatus = 'new' | 'contacted' | 'negotiating' | 'sold' | 'cancelled';
export type Lead = {
  id: string; vehicleId: string; buyerId: string | null; buyerName: string; buyerEmail: string;
  buyerPhone: string; message: string; inquiryDate: string; status: LeadStatus;
  vehicleBrand?: string; vehicleModel?: string; vehiclePrice?: number;
};
export type TestDriveRequest = {
  id: string; vehicleId: string; userId: string | null; name: string; email: string; phone: string;
  preferredDate: string; preferredTime: string; message: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'; requestedAt: string;
  vehicleBrand?: string; vehicleModel?: string; vehiclePrice?: number;
};
export type RegisterInput = {
  name: string; email: string; password: string; phone?: string; role: Exclude<UserRole, 'admin'>;
};
export type VehicleFilters = {
  search?: string; brand?: string; model?: string; minPrice?: string; maxPrice?: string;
  year?: string; location?: string; fuelType?: string; condition?: string; bodyType?: string;
  sort?: string; page?: number; limit?: number; status?: string;
};
