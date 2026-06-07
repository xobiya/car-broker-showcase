import express from "express";
import path from "path";
import dotenv from "dotenv";
import { db } from "./db";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

if (!process.env.VERCEL) {
  app.use("/assets", express.static(path.join(process.cwd(), "assets")));
}

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 1. Status
app.get("/api/status", async (req, res) => {
  res.json({
    configured: true,
    dbConnected: db.isUsingMySQL(),
    dbType: db.isUsingMySQL() ? "MySQL Server" : "Simulated Database (In-Memory)"
  });
});

// 2. Auth
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    if (!name || !email || !role) return res.status(400).json({ error: "Name, email, and role are required." });
    const existing = await db.getUserByEmail(email);
    if (existing) return res.status(400).json({ error: "User with this email already exists." });
    const newUser = await db.addUser({ name, email, phone: phone || "", role });
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });
    const user = await db.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "No user found with this email." });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Vehicles
app.get("/api/vehicles", async (req, res) => {
  try {
    const vehicles = await db.getVehicles();
    const brokers = await db.getBrokers();
    const users = await db.getUsers();
    const enriched = vehicles.map(v => {
      const broker = brokers.find(b => b.id === v.brokerId);
      const user = broker ? users.find(u => u.id === broker.user_id) : null;
      return {
        ...v,
        brokerName: user?.name || "Unknown Broker",
        brokerPhone: user?.phone || "",
        brokerLicense: broker?.license_number || "",
        brokerVerified: broker?.verified || false,
      };
    });
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/vehicles", async (req, res) => {
  try {
    const newVehicle = await db.addVehicle({
      broker_id: req.body.broker_id || "brk-1",
      brand: req.body.brand,
      model: req.body.model,
      year: parseInt(req.body.year),
      mileage: parseInt(req.body.mileage) || 0,
      price: parseFloat(req.body.price),
      original_price: parseFloat(req.body.original_price || req.body.price),
      image_url: req.body.image_url || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      description: req.body.description || "",
      fuel_type: req.body.fuel_type || "Benzine",
      transmission: req.body.transmission || "Automatic",
      location: req.body.location || "Addis Ababa",
      condition: req.body.condition,
      body_type: req.body.body_type,
      drive_type: req.body.drive_type,
      color: req.body.color,
      doors: req.body.doors,
      seats: req.body.seats,
      engine_size: req.body.engine_size,
      engine_type: req.body.engine_type,
      horsepower: req.body.horsepower,
      chassis_number: req.body.chassis_number,
      commission_rate: req.body.commission_rate,
      commission_type: req.body.commission_type,
      video_url: req.body.video_url,
      gallery: req.body.gallery,
      cover_photo_index: req.body.cover_photo_index,
    });
    res.status(201).json(newVehicle);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/vehicles/:id", async (req, res) => {
  try {
    const success = await db.updateVehicle(req.params.id, req.body);
    if (success) res.json({ message: "Vehicle updated successfully" });
    else res.status(404).json({ error: "Vehicle not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/vehicles/:id/approve", async (req, res) => {
  try {
    const success = await db.updateVehicle(req.params.id, { status: "approved" });
    if (success) res.json({ message: "Vehicle approved successfully" });
    else res.status(404).json({ error: "Vehicle not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/vehicles/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    const success = await db.updateVehicle(req.params.id, { status: "rejected", rejection_reason: reason || "" });
    if (success) res.json({ message: "Vehicle rejected" });
    else res.status(404).json({ error: "Vehicle not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/vehicles/:id/submit", async (req, res) => {
  try {
    const success = await db.updateVehicle(req.params.id, { status: "pending" });
    if (success) res.json({ message: "Vehicle submitted for approval" });
    else res.status(404).json({ error: "Vehicle not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/vehicles/:id", async (req, res) => {
  try {
    const success = await db.deleteVehicle(req.params.id);
    if (success) res.json({ message: "Vehicle deleted successfully" });
    else res.status(404).json({ error: "Vehicle not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Leads
app.get("/api/leads", async (req, res) => {
  try {
    const leads = await db.getLeads();
    const vehicles = await db.getVehicles();
    const enriched = leads.map(l => {
      const v = vehicles.find(veh => veh.id === l.vehicleId);
      return { ...l, vehicleBrand: v?.brand, vehicleModel: v?.model, vehiclePrice: v?.price };
    });
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/leads", async (req, res) => {
  try {
    const { vehicle_id, buyer_id, buyer_name, buyer_email, buyer_phone, message } = req.body;
    const newLead = await db.addLead({ vehicle_id, buyer_id: buyer_id || null, buyer_name, buyer_email, buyer_phone, message: message || "" });
    res.status(201).json(newLead);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/leads/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const success = await db.updateLeadStatus(req.params.id, status);
    if (success) res.json({ message: "Lead status updated" });
    else res.status(404).json({ error: "Lead not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Sales
app.get("/api/sales", async (req, res) => {
  try {
    const sales = await db.getSales();
    const vehicles = await db.getVehicles();
    const enriched = sales.map(s => {
      const v = vehicles.find(veh => veh.id === s.vehicleId);
      return { ...s, vehicleBrand: v?.brand, vehicleModel: v?.model };
    });
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sales", async (req, res) => {
  try {
    const { vehicle_id, broker_id, buyer_id, sale_price, commission, buyer_name } = req.body;
    const newSale = await db.addSale({
      vehicle_id, broker_id, buyer_id: buyer_id || null,
      sale_price: parseFloat(sale_price), commission: parseFloat(commission), buyer_name: buyer_name || ""
    });
    await db.updateVehicle(vehicle_id, { status: "sold" });
    res.status(201).json(newSale);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Brokers (enriched)
app.get("/api/brokers", async (req, res) => {
  try {
    const brokers = await db.getBrokers();
    const users = await db.getUsers();
    const enriched = brokers.map(b => {
      const user = users.find(u => u.id === b.user_id);
      return {
        id: b.id, userId: b.user_id,
        name: user?.name || "Unknown", email: user?.email || "", phone: user?.phone || "",
        licenseNumber: b.license_number, commissionRate: b.commission_rate,
        verified: b.verified || false, bio: b.bio || user?.bio || "",
        avatar: user?.avatar || "", joinDate: user?.join_date || "",
      };
    });
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Users
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const { name, email, phone, bio, avatar } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    const success = await db.updateUser(req.params.id, updates);
    if (success) res.json({ message: "Profile updated successfully" });
    else res.status(404).json({ error: "User not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/brokers/:id", async (req, res) => {
  try {
    const { license_number, commission_rate, bio, avatar } = req.body;
    const updates: any = {};
    if (license_number !== undefined) updates.license_number = license_number;
    if (commission_rate !== undefined) updates.commission_rate = commission_rate;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    const success = await db.updateBroker(req.params.id, updates);
    if (success) res.json({ message: "Broker profile updated" });
    else res.status(404).json({ error: "Broker not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Stats
app.get("/api/stats", async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Audit Logs
app.get("/api/audit-logs", async (req, res) => {
  try {
    const logs = await db.getAuditLogs();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/audit-logs", async (req, res) => {
  try {
    const { action, admin_id, admin_name, target_type, target_id, details } = req.body;
    const log = await db.addAuditLog({ action, admin_id, admin_name, target_type, target_id, details });
    res.status(201).json(log);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Documents
app.get("/api/documents", async (req, res) => {
  try {
    const vehicleId = req.query.vehicleId as string | undefined;
    const docs = await db.getDocuments(vehicleId);
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/documents", async (req, res) => {
  try {
    const { vehicle_id, name, type, file_url } = req.body;
    const doc = await db.addDocument({ vehicle_id, name, type, file_url });
    res.status(201).json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/documents/:id", async (req, res) => {
  try {
    const success = await db.deleteDocument(req.params.id);
    if (success) res.json({ message: "Document deleted" });
    else res.status(404).json({ error: "Document not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 11. Inspections
app.get("/api/inspections", async (req, res) => {
  try {
    const vehicleId = req.query.vehicleId as string | undefined;
    const inspections = await db.getInspections(vehicleId);
    res.json(inspections);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/inspections", async (req, res) => {
  try {
    const { vehicle_id, inspector_name, status, notes } = req.body;
    const inspection = await db.addInspection({ vehicle_id, inspector_name, status, notes });
    await db.updateVehicle(vehicle_id, { inspection_status: status, inspection_notes: notes, inspection_date: inspection.inspectedAt });
    res.status(201).json(inspection);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/inspections/:id", async (req, res) => {
  try {
    const success = await db.updateInspection(req.params.id, req.body);
    if (success) res.json({ message: "Inspection updated" });
    else res.status(404).json({ error: "Inspection not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 12. Saved Vehicles
app.get("/api/saved-vehicles", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const saved = await db.getSavedVehicles(userId as string);
    const vehicles = await db.getVehicles();
    const enriched = saved.map(s => {
      const v = vehicles.find(veh => veh.id === s.vehicleId);
      return { ...s, vehicle: v || null };
    }).filter(s => s.vehicle !== null);
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/saved-vehicles", async (req, res) => {
  try {
    const { userId, vehicleId } = req.body;
    if (!userId || !vehicleId) return res.status(400).json({ error: "userId and vehicleId are required" });
    const existing = await db.isVehicleSaved(userId, vehicleId);
    if (existing) return res.status(409).json({ error: "Vehicle already saved" });
    const saved = await db.addSavedVehicle(userId, vehicleId);
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/saved-vehicles", async (req, res) => {
  try {
    const { userId, vehicleId } = req.body;
    if (!userId || !vehicleId) return res.status(400).json({ error: "userId and vehicleId are required" });
    const success = await db.removeSavedVehicle(userId, vehicleId);
    if (success) res.json({ message: "Vehicle removed from saved" });
    else res.status(404).json({ error: "Saved vehicle not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 13. Test Drives
app.get("/api/test-drives", async (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    const drives = await db.getTestDrives(userId);
    const vehicles = await db.getVehicles();
    const enriched = drives.map(d => {
      const v = vehicles.find(veh => veh.id === d.vehicleId);
      return { ...d, vehicleBrand: v?.brand, vehicleModel: v?.model, vehiclePrice: v?.price };
    });
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/test-drives", async (req, res) => {
  try {
    const { vehicle_id, user_id, name, email, phone, preferred_date, preferred_time, message } = req.body;
    if (!vehicle_id || !name || !phone || !preferred_date || !preferred_time) {
      return res.status(400).json({ error: "vehicle_id, name, phone, preferred_date, and preferred_time are required" });
    }
    const drive = await db.addTestDrive({
      vehicle_id, user_id: user_id || null, name, email: email || "",
      phone, preferred_date, preferred_time, message: message || ""
    });
    res.status(201).json(drive);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/test-drives/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const success = await db.updateTestDriveStatus(req.params.id, status);
    if (success) res.json({ message: "Test drive status updated" });
    else res.status(404).json({ error: "Test drive not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 14. Reports
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await db.getReports();
    const vehicles = await db.getVehicles();
    const brokers = await db.getBrokers();
    const users = await db.getUsers();
    const enriched = reports.map(r => {
      let summary = "";
      if (r.targetType === "listing") {
        const v = vehicles.find(veh => veh.id === r.targetId);
        summary = v ? `${v.brand} ${v.model} (${v.year})` : "Unknown listing";
      } else if (r.targetType === "broker") {
        const b = brokers.find(bk => bk.id === r.targetId);
        const u = b ? users.find(usr => usr.id === b.user_id) : null;
        summary = u?.name || "Unknown broker";
      } else {
        const u = users.find(usr => usr.id === r.targetId);
        summary = u?.name || "Unknown user";
      }
      return { ...r, targetSummary: summary };
    });
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/reports", async (req, res) => {
  try {
    const { reporter_id, reporter_name, target_type, target_id, reason, description } = req.body;
    if (!reporter_name || !target_type || !target_id || !reason) {
      return res.status(400).json({ error: "reporter_name, target_type, target_id, and reason are required" });
    }
    const report = await db.addReport({
      reporter_id: reporter_id || null,
      reporter_name,
      target_type,
      target_id,
      reason,
      description: description || "",
    });
    res.status(201).json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/reports/:id/status", async (req, res) => {
  try {
    const { status, admin_notes, resolved_by } = req.body;
    const validStatuses = ["pending", "investigating", "resolved", "dismissed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be one of: " + validStatuses.join(", ") });
    }
    const success = await db.updateReportStatus(req.params.id, status, admin_notes, resolved_by);
    if (success) res.json({ message: "Report status updated" });
    else res.status(404).json({ error: "Report not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Express + Vite Integration (local dev only)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root: path.join(process.cwd(), "frontend"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "frontend", "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
