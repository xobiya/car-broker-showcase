import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";
import { db } from "./db";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Serve assets folder for local images (only in non-Vercel env)
if (!process.env.VERCEL) {
  app.use("/assets", express.static(path.join(process.cwd(), "assets")));
}

// Increase request size limit for image uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Lazy initializer for Gemini client to prevent startup crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined. Please add it in the Secrets panel inside AI Studio.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. API Status Endpoint (Includes DB status)
app.get("/api/status", async (req, res) => {
  res.json({
    configured: typeof process.env.GEMINI_API_KEY === "string" && process.env.GEMINI_API_KEY.length > 0,
    dbConnected: db.isUsingMySQL(),
    dbType: db.isUsingMySQL() ? "MySQL Server" : "Simulated Database (In-Memory)"
  });
});

// 2. Auth Endpoints
app.post("/api/auth/register", async (req, res) => {
  console.log("POST /api/auth/register", req.body);
  try {
    const { name, email, phone, role } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: "Name, email, and role are required." });
    }
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "User with this email already exists." });
    }
    const newUser = await db.addUser({ name, email, phone: phone || "", role });
    res.status(201).json(newUser);
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  console.log("POST /api/auth/login", req.body);
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "No user found with this email." });
    }
    res.json(user);
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Chat Endpoint (AI Sourcing Concierge)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, systemInstruction, temperature, enableSearch, history } = req.body;
    const ai = getGemini();

    const tools: any[] = [];
    if (enableSearch) {
      tools.push({ googleSearch: {} });
    }

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role,
          parts: [{ text: h.text }],
        });
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: {
        systemInstruction: systemInstruction || "You are an expert car broker AI assistant for AutoBroker Ethiopia. Help buyers inspect vehicle specifications, price terms in ETB, and understand import commission structures.",
        temperature: typeof temperature === "number" ? temperature : 0.7,
        tools: tools.length > 0 ? tools : undefined,
      },
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Web Reference",
      uri: chunk.web?.uri || "#",
    })) || [];

    res.json({
      text: response.text || "",
      sources,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message || "An error occurred with the Gemini API." });
  }
});

// 3. Vehicles Endpoints
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
      };
    });
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/vehicles", async (req, res) => {
  try {
    const { broker_id, brand, model, year, mileage, price, original_price, image_url, description, fuel_type, transmission, location } = req.body;
    const newVehicle = await db.addVehicle({
      broker_id: broker_id || "brk-1",
      brand,
      model,
      year: parseInt(year),
      mileage: parseInt(mileage) || 0,
      price: parseFloat(price),
      original_price: parseFloat(original_price || price),
      image_url: image_url || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
      description: description || "",
      fuel_type: fuel_type || "Benzine",
      transmission: transmission || "Automatic",
      location: location || "Addis Ababa"
    });
    res.status(201).json(newVehicle);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/vehicles/:id", async (req, res) => {
  try {
    const success = await db.updateVehicle(req.params.id, req.body);
    if (success) {
      res.json({ message: "Vehicle updated successfully" });
    } else {
      res.status(404).json({ error: "Vehicle not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/vehicles/:id/approve", async (req, res) => {
  try {
    const success = await db.updateVehicle(req.params.id, { status: "approved" });
    if (success) {
      res.json({ message: "Vehicle approved successfully" });
    } else {
      res.status(404).json({ error: "Vehicle not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/vehicles/:id", async (req, res) => {
  try {
    const success = await db.deleteVehicle(req.params.id);
    if (success) {
      res.json({ message: "Vehicle deleted successfully" });
    } else {
      res.status(404).json({ error: "Vehicle not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Leads Endpoints
app.get("/api/leads", async (req, res) => {
  try {
    const leads = await db.getLeads();
    const vehicles = await db.getVehicles();
    
    // Enrich leads with vehicle details
    const enrichedLeads = leads.map(l => {
      const v = vehicles.find(veh => veh.id === l.vehicleId);
      return {
        ...l,
        vehicleBrand: v?.brand,
        vehicleModel: v?.model,
        vehiclePrice: v?.price
      };
    });
    
    res.json(enrichedLeads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/leads", async (req, res) => {
  try {
    const { vehicle_id, buyer_id, buyer_name, buyer_email, buyer_phone, message } = req.body;
    const newLead = await db.addLead({
      vehicle_id,
      buyer_id: buyer_id || null,
      buyer_name,
      buyer_email,
      buyer_phone,
      message: message || ""
    });
    res.status(201).json(newLead);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/leads/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const success = await db.updateLeadStatus(req.params.id, status);
    if (success) {
      res.json({ message: "Lead status updated" });
    } else {
      res.status(404).json({ error: "Lead not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Sales Endpoints
app.get("/api/sales", async (req, res) => {
  try {
    const sales = await db.getSales();
    const vehicles = await db.getVehicles();
    
    const enrichedSales = sales.map(s => {
      const v = vehicles.find(veh => veh.id === s.vehicleId);
      return {
        ...s,
        vehicleBrand: v?.brand,
        vehicleModel: v?.model
      };
    });
    res.json(enrichedSales);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sales", async (req, res) => {
  try {
    const { vehicle_id, broker_id, buyer_id, sale_price, commission } = req.body;
    const newSale = await db.addSale({
      vehicle_id,
      broker_id,
      buyer_id: buyer_id || null,
      sale_price: parseFloat(sale_price),
      commission: parseFloat(commission)
    });
    
    // Automatically update vehicle status to sold
    await db.updateVehicle(vehicle_id, { status: "sold" });
    
    res.status(201).json(newSale);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Brokers Endpoint (enriched with user info)
app.get("/api/brokers", async (req, res) => {
  try {
    const brokers = await db.getBrokers();
    const users = await db.getUsers();
    const enriched = brokers.map(b => {
      const user = users.find(u => u.id === b.user_id);
      return {
        id: b.id,
        name: user?.name || "Unknown",
        email: user?.email || "",
        phone: user?.phone || "",
        licenseNumber: b.license_number,
        commissionRate: b.commission_rate,
      };
    });
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Dashboard Stats Endpoint
app.get("/api/stats", async (req, res) => {
  try {
    const vehicles = await db.getVehicles();
    const leads = await db.getLeads();
    const sales = await db.getSales();
    const brokers = await db.getBrokers();
    const users = await db.getUsers();

    const totalSalesRevenue = sales.reduce((sum, s) => sum + Number(s.salePrice), 0);
    const totalCommissionEarned = sales.reduce((sum, s) => sum + Number(s.commission), 0);
    
    res.json({
      totals: {
        vehicles: vehicles.length,
        pendingVehicles: vehicles.filter(v => v.status === "pending").length,
        approvedVehicles: vehicles.filter(v => v.status === "approved").length,
        soldVehicles: vehicles.filter(v => v.status === "sold").length,
        leads: leads.length,
        sales: sales.length,
        brokers: brokers.length,
        users: users.length,
        revenue: totalSalesRevenue,
        commission: totalCommissionEarned
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Express + Vite Integration (local dev only)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
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
    console.log(`Express server fully integrated! Listening on http://localhost:${PORT}`);
  });
}

// Start locally; on Vercel the serverless runtime handles invocation
if (!process.env.VERCEL) {
  startServer();
}

export default app;
