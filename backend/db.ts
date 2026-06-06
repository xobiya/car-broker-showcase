import dotenv from "dotenv";

dotenv.config();

// Define data interfaces matching our schema
export interface DBUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'broker' | 'admin';
}

export interface DBBroker {
  id: string;
  user_id: string;
  license_number: string;
  commission_rate: number;
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
  status: 'pending' | 'approved' | 'sold';
  image_url: string;
  description: string;
  fuel_type: string;
  transmission: string;
  location: string;
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
}

// Frontend facing CamelCase types
import { VehicleListing, Lead, Sale } from "../shared/types";

// Helper mappers
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
    location: v.location
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
    saleDate: s.sale_date
  };
}

// In-Memory Fallback Database Store
class InMemoryDB {
  users: DBUser[] = [
    { id: 'usr-admin-1', name: 'Abebe Kebede', email: 'abebe.k@autobroker.et', phone: '+251911223344', role: 'admin' },
    { id: 'usr-broker-1', name: 'Yonas Hailu', email: 'yonas.h@autobroker.et', phone: '+251912345678', role: 'broker' },
    { id: 'usr-broker-2', name: 'Tigist Assefa', email: 'tigist.a@autobroker.et', phone: '+251913456789', role: 'broker' },
    { id: 'usr-buyer-1', name: 'Dawit Lemma', email: 'dawit.l@gmail.com', phone: '+251914567890', role: 'buyer' }
  ];

  brokers: DBBroker[] = [
    { id: 'brk-1', user_id: 'usr-broker-1', license_number: 'ET-BRK-99882', commission_rate: 1.00 },
    { id: 'brk-2', user_id: 'usr-broker-2', license_number: 'ET-BRK-77661', commission_rate: 1.25 }
  ];

  vehicles: DBVehicle[] = [
    {
      id: 'veh-1',
      broker_id: 'brk-1',
      brand: 'Toyota',
      model: 'Land Cruiser 300 VXR',
      year: 2024,
      mileage: 1200,
      price: 24000000.00,
      original_price: 25500000.00,
      status: 'approved',
      image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
      description: 'Brand new Land Cruiser 300 VXR, imported from Dubai. Fully optioned, zero km driven locally.',
      fuel_type: 'Diesel',
      transmission: 'Automatic',
      location: 'Addis Ababa'
    },
    {
      id: 'veh-2',
      broker_id: 'brk-1',
      brand: 'Changan',
      model: 'UNI-K',
      year: 2024,
      mileage: 0,
      price: 8500000.00,
      original_price: 9200000.00,
      status: 'approved',
      image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      description: 'Modern luxury Chinese SUV, full electric version. Premium interior layout, active driver assists.',
      fuel_type: 'Electric',
      transmission: 'Automatic',
      location: 'Addis Ababa'
    },
    {
      id: 'veh-3',
      broker_id: 'brk-2',
      brand: 'Hyundai',
      model: 'Tucson',
      year: 2023,
      mileage: 15000,
      price: 6800000.00,
      original_price: 7200000.00,
      status: 'approved',
      image_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
      description: 'Local dealership purchased. Single owner, regular maintenance. Super clean interior and paint.',
      fuel_type: 'Benzine',
      transmission: 'Automatic',
      location: 'Addis Ababa'
    },
    {
      id: 'veh-4',
      broker_id: 'brk-2',
      brand: 'Suzuki',
      model: 'Dzire',
      year: 2022,
      mileage: 28000,
      price: 2300000.00,
      original_price: 2500000.00,
      status: 'pending',
      image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
      description: 'Highly economical city sedan. Low fuel consumption, manual transmission. Ideal for taxi service.',
      fuel_type: 'Benzine',
      transmission: 'Manual',
      location: 'Adama'
    }
  ];

  leads: DBLead[] = [
    {
      id: 'ld-1',
      vehicle_id: 'veh-1',
      buyer_id: 'usr-buyer-1',
      buyer_name: 'Dawit Lemma',
      buyer_email: 'dawit.l@gmail.com',
      buyer_phone: '+251914567890',
      message: 'Is the price negotiable? I would like to pay in cash.',
      inquiry_date: new Date().toISOString(),
      status: 'new'
    },
    {
      id: 'ld-2',
      vehicle_id: 'veh-3',
      buyer_id: null,
      buyer_name: 'Marta Demeke',
      buyer_email: 'marta.d@yahoo.com',
      buyer_phone: '+251918877665',
      message: 'Can we arrange a viewing in Bole this weekend?',
      inquiry_date: new Date().toISOString(),
      status: 'contacted'
    }
  ];

  sales: DBSale[] = [
    {
      id: 'sl-1',
      vehicle_id: 'veh-3',
      broker_id: 'brk-2',
      buyer_id: 'usr-buyer-1',
      sale_price: 6700000.00,
      commission: 83750.00,
      sale_date: new Date().toISOString()
    }
  ];
}

const memoryDb = new InMemoryDB();

// Dynamic Driver Loader
let pool: any = null;
let useMySQL = false;

async function initDB() {
  try {
    // Check environment variables
    if (!process.env.DB_HOST || !process.env.DB_USER) {
      console.log("⚠️ Database env variables (DB_HOST, DB_USER) not fully configured. Using simulated database.");
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

    // Test query
    const [rows] = await pool.query("SELECT 1");
    useMySQL = true;
    console.log("🔌 Connected successfully to MySQL database!");
  } catch (err: any) {
    console.log(`⚠️ MySQL Connection could not be initialized (${err.message}). Falling back to simulated database.`);
  }
}

// Initialize on import
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
    const status = "pending";

    if (useMySQL) {
      await pool.query(
        `INSERT INTO vehicles (id, broker_id, brand, model, year, mileage, price, original_price, status, image_url, description, fuel_type, transmission, location)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          v.broker_id,
          v.brand,
          v.model,
          v.year,
          v.mileage,
          v.price,
          v.original_price,
          status,
          v.image_url,
          v.description,
          v.fuel_type,
          v.transmission,
          v.location
        ]
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
        [
          id,
          l.vehicle_id,
          l.buyer_id,
          l.buyer_name,
          l.buyer_email,
          l.buyer_phone,
          l.message,
          status,
          inquiry_date
        ]
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
        [
          id,
          s.vehicle_id,
          s.broker_id,
          s.buyer_id,
          s.sale_price,
          s.commission,
          sale_date
        ]
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
        // MySQL error — fall back to in-memory demo accounts
        const u = memoryDb.users.find(user => user.email === email);
        return u || null;
      }
      return null;
    }
    const u = memoryDb.users.find(user => user.email === email);
    return u || null;
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
          commission_rate: 1.00
        });
      }
    }
    return { ...u, id };
  }
};
