export interface DBUser {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  phone: string;
  role: 'buyer' | 'broker' | 'seller' | 'admin';
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

export interface DBPayment {
  id: string;
  sale_id: string;
  broker_id: string;
  amount: number;
  platform_fee: number;
  broker_payout: number;
  status: 'pending' | 'paid' | 'failed';
  payment_method: string;
  transaction_id: string;
  paid_at: string | null;
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
