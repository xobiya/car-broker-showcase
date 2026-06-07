import dotenv from "dotenv";
import mongoose from "mongoose";
import mysql from "mysql2/promise";
import "./db";

dotenv.config();

const ASSETS = "/assets/";

const images = [
  "photo_2026-06-06_17-14-20.jpg",
  "photo_2026-06-06_17-14-19.jpg",
  "photo_2026-06-06_17-14-17.jpg",
  "photo_2026-06-06_17-14-16.jpg",
  "photo_2026-06-06_17-14-13.jpg",
  "photo_2026-06-06_17-14-12.jpg",
  "photo_2026-06-06_17-14-11.jpg",
  "photo_2026-06-06_17-13-47.jpg",
  "photo_2026-06-06_17-13-46.jpg",
  "photo_2026-06-06_17-13-44.jpg",
  "photo_2026-06-06_17-13-43.jpg",
  "photo_2026-06-06_17-11-50.jpg",
  "photo_2026-06-06_17-11-36.jpg",
  "photo_2026-06-06_17-11-34.jpg",
  "photo_2026-06-06_17-11-32.jpg",
  "photo_2026-06-06_17-11-09.jpg",
  "photo_2026-06-06_17-11-06.jpg",
  "photo_2026-06-06_17-08-30.jpg",
];

const img = (i: number) => `${ASSETS}${images[i % images.length]}`;

interface SeedVehicle {
  id: string;
  broker_id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  original_price: number;
  status: "pending" | "approved" | "sold";
  image_url: string;
  gallery: string[];
  description: string;
  fuel_type: string;
  transmission: string;
  location: string;
  condition: string;
  body_type: string;
  drive_type: string;
  color: string;
  doors: number;
  seats: number;
  engine_size: string;
  engine_type: string;
  horsepower: number;
  chassis_number: string;
  commission_rate: number;
  commission_type: string;
  inspection_status?: string;
}

const vehicles: SeedVehicle[] = [
  {
    id: "veh-1", broker_id: "brk-1",
    brand: "Toyota", model: "Vitz 1.0 F", year: 2019, mileage: 62000,
    price: 1850000, original_price: 2100000, status: "approved",
    image_url: img(0), gallery: [img(0), img(1), img(2)],
    description: "Japanese import, fuel-efficient hatchback. Perfect for city driving. Low maintenance cost, genuine 62k km. Tax cleared.",
    fuel_type: "Benzine", transmission: "Automatic", location: "Addis Ababa",
    condition: "Used", body_type: "Hatchback", drive_type: "FWD",
    color: "White", doors: 5, seats: 5, engine_size: "1.0L", engine_type: "V4",
    horsepower: 69, chassis_number: "KSP90-1234567", commission_rate: 1.0, commission_type: "percentage",
  },
  {
    id: "veh-2", broker_id: "brk-1",
    brand: "Toyota", model: "Yaris 1.3 G", year: 2020, mileage: 45000,
    price: 2200000, original_price: 2500000, status: "approved",
    image_url: img(3), gallery: [img(3), img(4), img(5)],
    description: "Reliable Toyota Yaris 1.3L, excellent fuel economy. Imported from Japan, one local owner. Full service history available.",
    fuel_type: "Benzine", transmission: "Automatic", location: "Addis Ababa",
    condition: "Used", body_type: "Hatchback", drive_type: "FWD",
    color: "Silver", doors: 5, seats: 5, engine_size: "1.3L", engine_type: "V4",
    horsepower: 86, chassis_number: "NSP130-9876543", commission_rate: 1.0, commission_type: "percentage",
  },
  {
    id: "veh-3", broker_id: "brk-1",
    brand: "BYD", model: "Atto 3", year: 2024, mileage: 5000,
    price: 5200000, original_price: 5800000, status: "approved",
    image_url: img(6), gallery: [img(6), img(7), img(8)],
    description: "Brand new BYD Atto 3 electric SUV. 420km range, premium interior with rotating touchscreen. Zero emissions, imported directly from China.",
    fuel_type: "Electric", transmission: "Automatic", location: "Addis Ababa",
    condition: "New", body_type: "SUV", drive_type: "FWD",
    color: "Blue", doors: 5, seats: 5, engine_size: "Electric", engine_type: "Electric",
    horsepower: 201, chassis_number: "BYD-ATTO3-2024-001", commission_rate: 1.5, commission_type: "percentage",
  },
  {
    id: "veh-4", broker_id: "brk-2",
    brand: "Toyota", model: "Corolla 1.8", year: 2021, mileage: 38000,
    price: 3200000, original_price: 3600000, status: "approved",
    image_url: img(9), gallery: [img(9), img(10), img(11)],
    description: "Toyota Corolla 1.8L, GCC specs. Clean interior, leather seats, sunroof, reverse camera. Well maintained by original owner.",
    fuel_type: "Benzine", transmission: "Automatic", location: "Addis Ababa",
    condition: "Used", body_type: "Sedan", drive_type: "FWD",
    color: "Gray", doors: 4, seats: 5, engine_size: "1.8L", engine_type: "V4",
    horsepower: 140, chassis_number: "ZRE172-4567890", commission_rate: 1.25, commission_type: "percentage",
  },
  {
    id: "veh-5", broker_id: "brk-2",
    brand: "Suzuki", model: "Swift 1.2 GL", year: 2022, mileage: 22000,
    price: 1650000, original_price: 1900000, status: "approved",
    image_url: img(12), gallery: [img(12), img(13), img(14)],
    description: "Economical Suzuki Swift 1.2L. Very low fuel consumption, ideal for city commuting. Light steering, easy parking, modern interior.",
    fuel_type: "Benzine", transmission: "Manual", location: "Addis Ababa",
    condition: "Used", body_type: "Hatchback", drive_type: "FWD",
    color: "Red", doors: 5, seats: 5, engine_size: "1.2L", engine_type: "V4",
    horsepower: 83, chassis_number: "ZC83S-1122334", commission_rate: 1.25, commission_type: "percentage",
  },
  {
    id: "veh-6", broker_id: "brk-1",
    brand: "Hyundai", model: "Tucson 2.0", year: 2023, mileage: 15000,
    price: 5800000, original_price: 6500000, status: "approved",
    image_url: img(15), gallery: [img(15), img(16), img(17)],
    description: "Hyundai Tucson 2.0L AWD. GCC imported, premium trim with panoramic roof, heated seats, Apple CarPlay. Like new condition.",
    fuel_type: "Benzine", transmission: "Automatic", location: "Addis Ababa",
    condition: "Used", body_type: "SUV", drive_type: "AWD",
    color: "Black", doors: 5, seats: 5, engine_size: "2.0L", engine_type: "V4",
    horsepower: 156, chassis_number: "TLE-HYUN-2023-001", commission_rate: 1.0, commission_type: "percentage",
  },
  {
    id: "veh-7", broker_id: "brk-2",
    brand: "Toyota", model: "Passo 1.0", year: 2018, mileage: 78000,
    price: 1400000, original_price: 1600000, status: "approved",
    image_url: img(0), gallery: [img(0), img(2), img(5)],
    description: "Toyota Passo 1.0L, very economical city car. Japanese import, genuine mileage. Great first car, cheap on fuel and parts.",
    fuel_type: "Benzine", transmission: "Automatic", location: "Adama",
    condition: "Used", body_type: "Hatchback", drive_type: "FWD",
    color: "White", doors: 5, seats: 5, engine_size: "1.0L", engine_type: "V4",
    horsepower: 70, chassis_number: "KGC30-9988776", commission_rate: 1.25, commission_type: "percentage",
  },
  {
    id: "veh-8", broker_id: "brk-1",
    brand: "Toyota", model: "Land Cruiser 300 VXR", year: 2024, mileage: 8000,
    price: 22000000, original_price: 25000000, status: "pending",
    image_url: img(1), gallery: [img(1), img(3), img(7)],
    description: "Brand new Land Cruiser 300 VXR, fully loaded. 3.5L V6 twin-turbo, 10 airbags, JBL sound, rear entertainment. Dubai import, zero defect.",
    fuel_type: "Diesel", transmission: "Automatic", location: "Addis Ababa",
    condition: "New", body_type: "SUV", drive_type: "4WD",
    color: "Gold", doors: 5, seats: 7, engine_size: "3.5L", engine_type: "V6",
    horsepower: 409, chassis_number: "VJA300-2024-8888", commission_rate: 1.0, commission_type: "percentage",
  },
  {
    id: "veh-9", broker_id: "brk-2",
    brand: "BYD", model: "Seagull", year: 2025, mileage: 500,
    price: 2800000, original_price: 3200000, status: "pending",
    image_url: img(8), gallery: [img(8), img(10), img(14)],
    description: "BYD Seagull mini EV. 305km range, perfect for city commuting. Ultra-low running cost, modern design with smart connectivity features.",
    fuel_type: "Electric", transmission: "Automatic", location: "Addis Ababa",
    condition: "New", body_type: "Hatchback", drive_type: "FWD",
    color: "Green", doors: 5, seats: 4, engine_size: "Electric", engine_type: "Electric",
    horsepower: 74, chassis_number: "BYD-SG-2025-001", commission_rate: 1.25, commission_type: "percentage",
  },
  {
    id: "veh-10", broker_id: "brk-1",
    brand: "Toyota", model: "Hiace Commuter", year: 2023, mileage: 35000,
    price: 7500000, original_price: 8200000, status: "approved",
    image_url: img(11), gallery: [img(11), img(13), img(16)],
    description: "Toyota Hiace 15-seater minibus. Ideal for transport business, tourist shuttles, or staff transport. Well maintained, zero accidents.",
    fuel_type: "Diesel", transmission: "Manual", location: "Addis Ababa",
    condition: "Used", body_type: "Van", drive_type: "RWD",
    color: "White", doors: 4, seats: 15, engine_size: "2.5L", engine_type: "V4",
    horsepower: 117, chassis_number: "TRH200-3456789", commission_rate: 1.0, commission_type: "percentage",
  },
];

const users = [
  { id: "usr-admin-1", name: "Abebe Kebede", email: "abebe.k@autobroker.et", password_hash: "$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O", phone: "+251911223344", role: "admin" },
  { id: "usr-broker-1", name: "Yonas Hailu", email: "yonas.h@autobroker.et", password_hash: "$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O", phone: "+251912345678", role: "broker" },
  { id: "usr-broker-2", name: "Tigist Assefa", email: "tigist.a@autobroker.et", password_hash: "$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O", phone: "+251913456789", role: "broker" },
  { id: "usr-buyer-1", name: "Dawit Lemma", email: "dawit.l@gmail.com", password_hash: "$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O", phone: "+251914567890", role: "buyer" },
  { id: "usr-buyer-2", name: "Marta Demeke", email: "marta.d@yahoo.com", password_hash: "$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O", phone: "+251918877665", role: "buyer" },
  { id: "usr-buyer-3", name: "Solomon Girma", email: "solomon.g@gmail.com", password_hash: "$2b$10$eBUHz99uAsHqj6Va7U00x.A9HJGpcmCXtH/gRSCzK4.f.JjaesJ8O", phone: "+251915556677", role: "buyer" },
];

const brokers = [
  { id: "brk-1", user_id: "usr-broker-1", license_number: "ET-BRK-99882", commission_rate: 1.00 },
  { id: "brk-2", user_id: "usr-broker-2", license_number: "ET-BRK-77661", commission_rate: 1.25 },
];

const leads = [
  { id: "ld-1", vehicle_id: "veh-1", buyer_id: "usr-buyer-1", buyer_name: "Dawit Lemma", buyer_email: "dawit.l@gmail.com", buyer_phone: "+251914567890", message: "Is the Vitz still available? I'd like to inspect it this weekend.", status: "new" },
  { id: "ld-2", vehicle_id: "veh-3", buyer_id: null, buyer_name: "Marta Demeke", buyer_email: "marta.d@yahoo.com", buyer_phone: "+251918877665", message: "Can I test drive the BYD Atto 3 tomorrow? I'm serious about buying.", status: "contacted" },
  { id: "ld-3", vehicle_id: "veh-6", buyer_id: "usr-buyer-3", buyer_name: "Solomon Girma", buyer_email: "solomon.g@gmail.com", buyer_phone: "+251915556677", message: "Negotiating the Tucson price. Can you do 5.5M ETB cash?", status: "negotiating" },
  { id: "ld-4", vehicle_id: "veh-5", buyer_id: null, buyer_name: "Hanna Wondimu", buyer_email: "hanna.w@outlook.com", buyer_phone: "+251916665544", message: "Is the Swift manual or automatic? Please send more photos.", status: "new" },
];

const sales = [
  { id: "sl-1", vehicle_id: "veh-4", broker_id: "brk-2", buyer_id: "usr-buyer-1", sale_price: 3150000, commission: 31500 },
];

async function seedMongoDB() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/autobroker_ethiopia";
  await mongoose.connect(uri);
  console.log("Connected to MongoDB, dropping existing data...");

  const db = mongoose.connection.db;
  if (!db) throw new Error("Database not initialized");
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.dropCollection(col.name);
  }

  console.log("Seeding MongoDB...");
  await mongoose.model("User").insertMany(users);
  await mongoose.model("Broker").insertMany(brokers);
  await mongoose.model("Vehicle").insertMany(vehicles.map(v => ({ ...v, inspection_status: v.inspection_status || "not_inspected" })));
  await mongoose.model("Lead").insertMany(leads.map(l => ({ ...l, inquiry_date: new Date().toISOString() })));
  await mongoose.model("Sale").insertMany(sales.map(s => ({ ...s, sale_date: new Date().toISOString(), buyer_name: "" })));
  await mongoose.model("AuditLog").insertMany([
    { id: "al-1", action: "approve_listing", admin_id: "usr-admin-1", admin_name: "Abebe Kebede", target_type: "vehicle", target_id: "veh-1", details: "Approved listing Toyota Vitz", timestamp: new Date().toISOString() },
  ]);

  console.log("MongoDB seeded successfully!");
  await mongoose.disconnect();
}

async function seedMySQL() {
  const host = process.env.DB_HOST || "localhost";
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_DATABASE || "autobroker_ethiopia";

  const conn = await mysql.createConnection({ host, user, password, multipleStatements: true });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  await conn.query(`USE \`${database}\``);

  console.log("Connected to MySQL, dropping existing data...");

  const tables = ["test_drives", "reports", "saved_vehicles", "inspections", "documents", "audit_logs", "sales", "leads", "vehicles", "brokers", "users"];
  for (const table of tables) {
    await conn.query(`DROP TABLE IF EXISTS \`${table}\``);
  }

  // Re-create tables using schema.sql equivalent
  await conn.query(`
    CREATE TABLE users (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255), phone VARCHAR(50), role VARCHAR(50) NOT NULL DEFAULT 'buyer', verified BOOLEAN DEFAULT FALSE, verification_status VARCHAR(50) DEFAULT 'unverified', id_document TEXT, bio TEXT, avatar VARCHAR(500), join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE brokers (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255) NOT NULL, license_number VARCHAR(100), commission_rate DECIMAL(5,2) DEFAULT 1.00, verified BOOLEAN DEFAULT FALSE, bio TEXT, avatar VARCHAR(500), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);
    CREATE TABLE vehicles (id VARCHAR(255) PRIMARY KEY, broker_id VARCHAR(255) NOT NULL, brand VARCHAR(100) NOT NULL, model VARCHAR(100) NOT NULL, year INT NOT NULL, mileage INT NOT NULL DEFAULT 0, price DECIMAL(15,2) NOT NULL, original_price DECIMAL(15,2) NOT NULL, status VARCHAR(50) NOT NULL DEFAULT 'draft', image_url VARCHAR(500), description TEXT, fuel_type VARCHAR(50) NOT NULL DEFAULT 'Benzine', transmission VARCHAR(50) NOT NULL DEFAULT 'Automatic', location VARCHAR(100) NOT NULL DEFAULT 'Addis Ababa', condition VARCHAR(50), body_type VARCHAR(50), drive_type VARCHAR(50), color VARCHAR(50), doors INT, seats INT, engine_size VARCHAR(50), engine_type VARCHAR(50), horsepower INT, chassis_number VARCHAR(100), gallery JSON, commission_rate DECIMAL(5,2), commission_type VARCHAR(50) DEFAULT 'percentage', video_url VARCHAR(500), inspection_status VARCHAR(50) DEFAULT 'not_inspected', inspection_notes TEXT, inspection_date TIMESTAMP NULL, cover_photo_index INT DEFAULT 0, rejection_reason TEXT, FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE CASCADE);
    CREATE TABLE leads (id VARCHAR(255) PRIMARY KEY, vehicle_id VARCHAR(255) NOT NULL, buyer_id VARCHAR(255), buyer_name VARCHAR(255) NOT NULL, buyer_email VARCHAR(255) NOT NULL, buyer_phone VARCHAR(50) NOT NULL, message TEXT, inquiry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, status VARCHAR(50) NOT NULL DEFAULT 'new', FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE);
    CREATE TABLE sales (id VARCHAR(255) PRIMARY KEY, vehicle_id VARCHAR(255) NOT NULL, broker_id VARCHAR(255) NOT NULL, buyer_id VARCHAR(255), buyer_name VARCHAR(255), sale_price DECIMAL(15,2) NOT NULL, commission DECIMAL(15,2) NOT NULL, sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE, FOREIGN KEY (broker_id) REFERENCES brokers(id) ON DELETE CASCADE);
    CREATE TABLE audit_logs (id VARCHAR(255) PRIMARY KEY, action VARCHAR(100) NOT NULL, admin_id VARCHAR(255) NOT NULL, admin_name VARCHAR(255) NOT NULL, target_type VARCHAR(50) NOT NULL, target_id VARCHAR(255) NOT NULL, details TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE);
    CREATE TABLE documents (id VARCHAR(255) PRIMARY KEY, vehicle_id VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, type VARCHAR(50) NOT NULL, file_url TEXT NOT NULL, uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE);
    CREATE TABLE saved_vehicles (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255) NOT NULL, vehicle_id VARCHAR(255) NOT NULL, saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE, UNIQUE KEY unique_user_vehicle (user_id, vehicle_id));
    CREATE TABLE reports (id VARCHAR(255) PRIMARY KEY, reporter_id VARCHAR(255), reporter_name VARCHAR(255) NOT NULL, target_type VARCHAR(50) NOT NULL, target_id VARCHAR(255) NOT NULL, reason VARCHAR(255) NOT NULL, description TEXT, status VARCHAR(50) NOT NULL DEFAULT 'pending', admin_notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, resolved_at TIMESTAMP NULL, resolved_by VARCHAR(255), FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL);
    CREATE TABLE test_drives (id VARCHAR(255) PRIMARY KEY, vehicle_id VARCHAR(255) NOT NULL, user_id VARCHAR(255), name VARCHAR(255) NOT NULL, email VARCHAR(255), phone VARCHAR(50) NOT NULL, preferred_date DATE NOT NULL, preferred_time VARCHAR(10) NOT NULL, message TEXT, status VARCHAR(50) NOT NULL DEFAULT 'pending', requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE);
    CREATE TABLE inspections (id VARCHAR(255) PRIMARY KEY, vehicle_id VARCHAR(255) NOT NULL, inspector_name VARCHAR(255) NOT NULL, status VARCHAR(50) NOT NULL DEFAULT 'pending', notes TEXT, inspected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE);
  `);

  console.log("Seeding MySQL...");
  for (const u of users) {
    await conn.query("INSERT INTO users (id, name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?, ?)", [u.id, u.name, u.email, u.password_hash || null, u.phone, (u as any).role || "buyer"]);
  }
  for (const b of brokers) {
    await conn.query("INSERT INTO brokers (id, user_id, license_number, commission_rate) VALUES (?, ?, ?, ?)", [b.id, b.user_id, b.license_number, b.commission_rate]);
  }
  for (const v of vehicles) {
    await conn.query("INSERT INTO vehicles (id, broker_id, brand, model, year, mileage, price, original_price, status, image_url, description, fuel_type, transmission, location, condition, body_type, drive_type, color, doors, seats, engine_size, engine_type, horsepower, chassis_number, commission_rate, commission_type, inspection_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [v.id, v.broker_id, v.brand, v.model, v.year, v.mileage, v.price, v.original_price, v.status, v.image_url, v.description, v.fuel_type, v.transmission, v.location, v.condition, v.body_type, v.drive_type, v.color, v.doors, v.seats, v.engine_size, v.engine_type, v.horsepower, v.chassis_number, v.commission_rate, v.commission_type, v.inspection_status || 'not_inspected']);
  }
  for (const l of leads) {
    await conn.query("INSERT INTO leads (id, vehicle_id, buyer_id, buyer_name, buyer_email, buyer_phone, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [l.id, l.vehicle_id, l.buyer_id, l.buyer_name, l.buyer_email, l.buyer_phone, l.message, l.status]);
  }
  for (const s of sales) {
    await conn.query("INSERT INTO sales (id, vehicle_id, broker_id, buyer_id, sale_price, commission) VALUES (?, ?, ?, ?, ?, ?)", [s.id, s.vehicle_id, s.broker_id, s.buyer_id, s.sale_price, s.commission]);
  }
  await conn.query("INSERT INTO audit_logs (id, action, admin_id, admin_name, target_type, target_id, details) VALUES ('al-1', 'approve_listing', 'usr-admin-1', 'Abebe Kebede', 'vehicle', 'veh-1', 'Approved listing Toyota Vitz')");

  console.log("MySQL seeded successfully!");
  await conn.end();
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--mongodb")) {
    try {
      await seedMongoDB();
    } catch (err: any) {
      console.error("MongoDB seeding failed:", err.message);
      process.exit(1);
    }
  } else if (args.includes("--mysql")) {
    try {
      await seedMySQL();
    } catch (err: any) {
      console.error("MySQL seeding failed:", err.message);
      process.exit(1);
    }
  } else {
    console.log("\n===========================================");
    console.log("  AutoBroker Ethiopia - Seed Data");
    console.log("===========================================\n");

    console.log(`Users: ${users.length}`);
    console.log(`Brokers: ${brokers.length}`);
    console.log(`Vehicles: ${vehicles.length}`);
    console.log(`Leads: ${leads.length}`);
    console.log(`Sales: ${sales.length}\n`);

    console.log("Vehicle inventory:");
    vehicles.forEach(v => {
      console.log(`  ${v.brand} ${v.model} (${v.year}) - ETB ${v.price.toLocaleString()} - ${v.status}`);
    });

    console.log("\nImage assets:");
    console.log(`  ${images.length} images available in /assets/`);
    console.log("  Served via http://localhost:3000/assets/...\n");

    console.log("To seed MongoDB, run:  npx tsx backend/seed.ts --mongodb");
    console.log("To seed MySQL, run:    npx tsx backend/seed.ts --mysql");
    console.log("Or just start the server - it auto-seeds on first connection.\n");
  }
}

main();
