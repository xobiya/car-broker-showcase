import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(["buyer", "broker", "seller"], { message: "Role must be buyer, broker, or seller" }),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const vehicleSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().int().min(1886, "Invalid year"),
  price: z.coerce.number().positive("Price must be positive"),
  original_price: z.coerce.number().positive().optional(),
  mileage: z.coerce.number().int().min(0).default(0),
  image_url: z.string().optional(),
  description: z.string().optional(),
  fuel_type: z.string().optional(),
  transmission: z.string().optional(),
  location: z.string().optional(),
  condition: z.string().optional(),
  body_type: z.string().optional(),
  drive_type: z.string().optional(),
  color: z.string().optional(),
  doors: z.coerce.number().int().optional(),
  seats: z.coerce.number().int().optional(),
  engine_size: z.string().optional(),
  engine_type: z.string().optional(),
  horsepower: z.coerce.number().int().optional(),
  chassis_number: z.string().optional(),
  commission_rate: z.coerce.number().optional(),
  commission_type: z.string().optional(),
  video_url: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  gallery_images: z.any().optional(),
  ownership_document_url: z.string().optional(),
  ownership_document_name: z.string().optional(),
  status: z.enum(["draft", "pending", "approved", "rejected", "sold"]).optional(),
  registration_year: z.coerce.number().int().optional(),
  phone: z.string().optional(),
  cover_photo_index: z.coerce.number().int().optional(),
});

export const leadSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle ID is required"),
  buyer_name: z.string().min(1, "Name is required"),
  buyer_email: z.string().email("Invalid email"),
  buyer_phone: z.string().min(1, "Phone is required"),
  message: z.string().optional(),
});

export const saleSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle ID is required"),
  sale_price: z.coerce.number().positive("Sale price must be positive"),
  commission: z.coerce.number().min(0),
  buyer_name: z.string().optional(),
  leadId: z.string().optional(),
});

export const testDriveSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  preferred_date: z.string().min(1, "Date is required"),
  preferred_time: z.string().min(1, "Time is required"),
  message: z.string().optional(),
});

export const testDriveStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
});

export const leadStatusSchema = z.object({
  status: z.enum(["new", "contacted", "negotiating", "sold", "cancelled"]),
});

export const reportSchema = z.object({
  reporter_name: z.string().min(1, "Name is required"),
  target_type: z.enum(["listing", "broker", "user"]),
  target_id: z.string().min(1, "Target ID is required"),
  reason: z.string().min(1, "Reason is required"),
  description: z.string().optional(),
});

export const documentSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle ID is required"),
  name: z.string().min(1, "Document name is required"),
  type: z.enum(["title", "invoice", "customs", "inspection", "insurance", "other"]),
  file_url: z.string().min(1, "Valid file URL is required"),
});

export const inspectionSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle ID is required"),
  inspector_name: z.string().min(1, "Inspector name is required"),
  status: z.enum(["passed", "failed", "pending"]),
  notes: z.string().optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional().or(z.literal("")),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  topic: z.string().optional(),
  vehicleRef: z.string().optional(),
  message: z.string().optional(),
}).refine(data => !!data.phone || !!data.email, {
  message: "Either phone or email must be provided",
});

export const brokerUpdateSchema = z.object({
  bio: z.string().optional(),
  avatar: z.string().optional().or(z.literal("")),
  commission_rate: z.coerce.number().min(0).max(100).optional(),
  license_number: z.string().optional(),
});

export const vehicleUpdateSchema = vehicleSchema.omit({ status: true }).partial();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
