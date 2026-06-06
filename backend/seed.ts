import dotenv from "dotenv";
import mysql from "mysql2/promise";

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
  { id: "usr-admin-1", name: "Abebe Kebede", email: "abebe.k@autobroker.et", phone: "+251911223344", role: "admin" },
  { id: "usr-broker-1", name: "Yonas Hailu", email: "yonas.h@autobroker.et", phone: "+251912345678", role: "broker" },
  { id: "usr-broker-2", name: "Tigist Assefa", email: "tigist.a@autobroker.et", phone: "+251913456789", role: "broker" },
  { id: "usr-buyer-1", name: "Dawit Lemma", email: "dawit.l@gmail.com", phone: "+251914567890", role: "buyer" },
  { id: "usr-buyer-2", name: "Marta Demeke", email: "marta.d@yahoo.com", phone: "+251918877665", role: "buyer" },
  { id: "usr-buyer-3", name: "Solomon Girma", email: "solomon.g@gmail.com", phone: "+251915556677", role: "buyer" },
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

async function seedMySQL() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "autobroker_ethiopia",
    multipleStatements: true,
  });

  // Truncate existing data
  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  for (const t of ["sales", "leads", "vehicles", "brokers", "users"]) {
    await connection.query(`DELETE FROM ${t}`);
  }
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");

  // Insert users
  for (const u of users) {
    await connection.query("INSERT INTO users (id, name, email, phone, role) VALUES (?, ?, ?, ?, ?)", [u.id, u.name, u.email, u.phone, u.role]);
  }

  // Insert brokers
  for (const b of brokers) {
    await connection.query("INSERT INTO brokers (id, user_id, license_number, commission_rate) VALUES (?, ?, ?, ?)", [b.id, b.user_id, b.license_number, b.commission_rate]);
  }

  // Insert vehicles
  for (const v of vehicles) {
    await connection.query(
      `INSERT INTO vehicles (id, broker_id, brand, model, year, mileage, price, original_price, status, image_url, description, fuel_type, transmission, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [v.id, v.broker_id, v.brand, v.model, v.year, v.mileage, v.price, v.original_price, v.status, v.image_url, v.description, v.fuel_type, v.transmission, v.location]
    );
  }

  // Insert leads
  for (const l of leads) {
    await connection.query(
      "INSERT INTO leads (id, vehicle_id, buyer_id, buyer_name, buyer_email, buyer_phone, message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [l.id, l.vehicle_id, l.buyer_id, l.buyer_name, l.buyer_email, l.buyer_phone, l.message, l.status]
    );
  }

  // Insert sales
  for (const s of sales) {
    await connection.query(
      "INSERT INTO sales (id, vehicle_id, broker_id, buyer_id, sale_price, commission) VALUES (?, ?, ?, ?, ?, ?)",
      [s.id, s.vehicle_id, s.broker_id, s.buyer_id, s.sale_price, s.commission]
    );
  }

  console.log("MySQL seeded successfully!");
  await connection.end();
}

function generateSeedScript(): string {
  const lines: string[] = [];

  // Users
  lines.push("-- Seed Users");
  for (const u of users) {
    lines.push(`CALL AddOrIgnoreUser('${u.id}', '${u.name}', '${u.email}', '${u.phone}', '${u.role}');`);
  }

  lines.push("\n-- Seed Brokers");
  for (const b of brokers) {
    lines.push(`CALL AddOrIgnoreBroker('${b.id}', '${b.user_id}', '${b.license_number}', ${b.commission_rate});`);
  }

  lines.push("\n-- Seed Vehicles");
  for (const v of vehicles) {
    const desc = v.description.replace(/'/g, "''");
    lines.push(
      `INSERT IGNORE INTO vehicles (id, broker_id, brand, model, year, mileage, price, original_price, status, image_url, description, fuel_type, transmission, location) VALUES ('${v.id}', '${v.broker_id}', '${v.brand}', '${v.model}', ${v.year}, ${v.mileage}, ${v.price}, ${v.original_price}, '${v.status}', '${v.image_url}', '${desc}', '${v.fuel_type}', '${v.transmission}', '${v.location}');`
    );
  }

  lines.push("\n-- Seed Leads");
  for (const l of leads) {
    const msg = l.message.replace(/'/g, "''");
    const buyerId = l.buyer_id ? `'${l.buyer_id}'` : "NULL";
    lines.push(`INSERT IGNORE INTO leads (id, vehicle_id, buyer_id, buyer_name, buyer_email, buyer_phone, message, status) VALUES ('${l.id}', '${l.vehicle_id}', ${buyerId}, '${l.buyer_name}', '${l.buyer_email}', '${l.buyer_phone}', '${msg}', '${l.status}');`);
  }

  lines.push("\n-- Seed Sales");
  for (const s of sales) {
    lines.push(`INSERT IGNORE INTO sales (id, vehicle_id, broker_id, buyer_id, sale_price, commission) VALUES ('${s.id}', '${s.vehicle_id}', '${s.broker_id}', '${s.buyer_id}', ${s.sale_price}, ${s.commission});`);
  }

  return lines.join("\n");
}

async function main() {
  const outputSql = process.argv.includes("--sql");
  const useMySQL = process.argv.includes("--mysql");

  if (outputSql) {
    console.log("-- AutoBroker Ethiopia Seed Data");
    console.log("-- Generated by seed.ts\n");
    console.log(generateSeedScript());
    console.log("\n-- End of seed data");
    process.exit(0);
  }

  if (useMySQL) {
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
    console.log("Run with --mysql to seed a MySQL database");
    console.log("Run with --sql to generate SQL statements\n");

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

    console.log("To use in-memory mode, copy the seed data arrays into backend/db.ts.");
    console.log("Or start the server normally - it already seeds on startup.\n");
  }
}

main();
