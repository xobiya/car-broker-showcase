import express from "express";
import { db } from "../backend/db";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- Status ---
app.get("/api/status", async (_req, res) => {
  try {
    res.json({ configured: true, dbConnected: db.isUsingMySQL(), dbType: db.isUsingMySQL() ? "MySQL Server" : "In-Memory" });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- Auth ---
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });
    const user = await db.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "No user found with this email." });
    res.json(user);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    if (!name || !email || !role) return res.status(400).json({ error: "Name, email, and role are required." });
    const existing = await db.getUserByEmail(email);
    if (existing) return res.status(400).json({ error: "User with this email already exists." });
    const newUser = await db.addUser({ name, email, phone: phone || "", role });
    res.status(201).json(newUser);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- Vehicles ---
app.get("/api/vehicles", async (_req, res) => {
  try {
    const [vehicles, brokers, users] = await Promise.all([db.getVehicles(), db.getBrokers(), db.getUsers()]);
    const enriched = vehicles.map((v: any) => {
      const broker = brokers.find((b: any) => b.id === v.brokerId);
      const user = broker ? users.find((u: any) => u.id === broker.user_id) : null;
      return { ...v, brokerName: user?.name || "Unknown", brokerPhone: user?.phone || "", brokerLicense: broker?.license_number || "", brokerVerified: broker?.verified || false };
    });
    res.json(enriched);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/vehicles", async (req, res) => {
  try {
    const vehicle = await db.addVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/vehicles/:id", async (req, res) => {
  try {
    const success = await db.updateVehicle(req.params.id, req.body);
    if (success) { const v = await db.getVehicles(); res.json(v.find((x: any) => x.id === req.params.id)); }
    else res.status(404).json({ error: "Vehicle not found" });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/vehicles/:id/approve", async (req, res) => {
  try {
    await db.updateVehicle(req.params.id, { status: "approved" });
    await db.addAuditLog({ action: "approve_listing", admin_id: req.body.admin_id || "unknown", admin_name: req.body.admin_name || "Admin", target_type: "vehicle", target_id: req.params.id, details: `Approved vehicle listing` });
    res.json({ message: "Vehicle approved" });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/vehicles/:id/reject", async (req, res) => {
  try {
    await db.updateVehicle(req.params.id, { status: "rejected", rejection_reason: req.body.reason || "" });
    await db.addAuditLog({ action: "reject_listing", admin_id: req.body.admin_id || "unknown", admin_name: req.body.admin_name || "Admin", target_type: "vehicle", target_id: req.params.id, details: `Rejected: ${req.body.reason || "No reason"}` });
    res.json({ message: "Vehicle rejected" });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/vehicles/:id/submit", async (req, res) => {
  try {
    await db.updateVehicle(req.params.id, { status: "pending" });
    res.json({ message: "Vehicle submitted for approval" });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/vehicles/:id", async (req, res) => {
  try {
    const result = await db.deleteVehicle(req.params.id);
    res.json({ message: result ? "Vehicle deleted" : "Not found" });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- Leads ---
app.get("/api/leads", async (req, res) => {
  try {
    const all = await db.getLeads();
    res.json(req.query.brokerId ? all.filter((l: any) => l.brokerId === req.query.brokerId) : all);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/leads", async (req, res) => {
  try {
    const lead = await db.addLead(req.body);
    res.status(201).json(lead);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/leads/:id/status", async (req, res) => {
  try {
    await db.updateLeadStatus(req.params.id, req.body.status);
    res.json({ message: "Lead status updated" });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- Sales ---
app.get("/api/sales", async (_req, res) => {
  try { res.json(await db.getSales()); } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/sales", async (req, res) => {
  try {
    const sale = await db.addSale(req.body);
    if (req.body.vehicleId) await db.updateVehicle(req.body.vehicleId, { status: "sold" });
    if (req.body.leadId) await db.updateLeadStatus(req.body.leadId, "sold");
    res.status(201).json(sale);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- Brokers ---
app.get("/api/brokers", async (_req, res) => {
  try {
    const [brokers, users] = await Promise.all([db.getBrokers(), db.getUsers()]);
    const enriched = brokers.map((b: any) => {
      const user = users.find((u: any) => u.id === b.user_id);
      return { ...b, name: user?.name || "", email: user?.email || "", phone: user?.phone || "", avatar: user?.avatar || "", bio: user?.bio || "", totalSales: 0, totalListings: 0 };
    });
    res.json(enriched);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.get("/api/brokers/:id", async (req, res) => {
  try {
    const brokers = await db.getBrokers();
    const broker = brokers.find((b: any) => b.id === req.params.id);
    if (!broker) return res.status(404).json({ error: "Broker not found" });
    const users = await db.getUsers();
    const user = users.find((u: any) => u.id === broker.user_id);
    res.json({ ...broker, name: user?.name || "", email: user?.email || "", phone: user?.phone || "" });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- Users ---
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const success = await db.updateUser(req.params.id, req.body);
    if (success) { const u = await db.getUserById(req.params.id); res.json(u); }
    else res.status(404).json({ error: "User not found" });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/brokers/:id", async (req, res) => {
  try {
    const success = await db.updateBroker(req.params.id, req.body);
    res.json({ success });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- Stats ---
app.get("/api/stats", async (_req, res) => {
  try { res.json(await db.getStats()); } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- Audit Logs ---
app.get("/api/audit-logs", async (_req, res) => {
  try { res.json(await db.getAuditLogs()); } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/audit-logs", async (req, res) => {
  try {
    const log = await db.addAuditLog(req.body);
    res.status(201).json(log);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- Documents ---
app.get("/api/documents", async (req, res) => {
  try {
    const all = await db.getDocuments();
    res.json(req.query.vehicleId ? all.filter((d: any) => d.vehicleId === req.query.vehicleId) : all);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/documents", async (req, res) => {
  try {
    const doc = await db.addDocument(req.body);
    res.status(201).json(doc);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/documents/:id", async (req, res) => {
  try { res.json({ message: (await db.deleteDocument(req.params.id)) ? "Deleted" : "Not found" }); } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- Inspections ---
app.get("/api/inspections", async (req, res) => {
  try {
    const all = await db.getInspections();
    res.json(req.query.vehicleId ? all.filter((i: any) => i.vehicleId === req.query.vehicleId) : all);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/inspections", async (req, res) => {
  try {
    const ins = await db.addInspection(req.body);
    res.status(201).json(ins);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/inspections/:id", async (req, res) => {
  try {
    const success = await db.updateInspection(req.params.id, req.body);
    res.json({ success });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- Saved Vehicles ---
app.get("/api/saved-vehicles", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: "userId query param is required" });
    const items = await db.getSavedVehicles(userId);
    const vehicles = await db.getVehicles();
    const enriched = items.map((s: any) => ({ ...s, vehicle: vehicles.find((v: any) => v.id === s.vehicleId) }));
    res.json(enriched);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/saved-vehicles", async (req, res) => {
  try {
    const item = await db.addSavedVehicle(req.body.userId, req.body.vehicleId);
    res.status(201).json(item);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/saved-vehicles", async (req, res) => {
  try {
    const { userId, vehicleId } = req.body;
    const success = await db.removeSavedVehicle(userId, vehicleId);
    res.json({ success });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- Test Drives ---
app.get("/api/test-drives", async (req, res) => {
  try {
    const all = await db.getTestDrives();
    res.json(req.query.userId ? all.filter((t: any) => t.userId === req.query.userId) : all);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/test-drives", async (req, res) => {
  try {
    const td = await db.addTestDrive(req.body);
    res.status(201).json(td);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/test-drives/:id/status", async (req, res) => {
  try {
    const success = await db.updateTestDriveStatus(req.params.id, req.body.status);
    res.json({ success });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// --- Reports ---
app.get("/api/reports", async (_req, res) => {
  try { res.json(await db.getReports()); } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post("/api/reports", async (req, res) => {
  try {
    const report = await db.addReport(req.body);
    res.status(201).json(report);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.put("/api/reports/:id/status", async (req, res) => {
  try {
    const { status, admin_notes, resolved_by } = req.body;
    const success = await db.updateReportStatus(req.params.id, status, admin_notes, resolved_by);
    if (success) res.json({ message: "Report status updated" });
    else res.status(404).json({ error: "Report not found" });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

export default app;
