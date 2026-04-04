import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, addDoc } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/acoustics/echo", async (req, res) => {
    const { project_id, event, data, timestamp } = req.body;
    
    if (!project_id || !event) {
      return res.status(400).json({ error: "Missing project_id or event" });
    }

    try {
      // 1. Get Project Owner
      const projectDoc = await getDoc(doc(db, "projects", project_id));
      if (!projectDoc.exists()) {
        return res.status(404).json({ error: "Project not found" });
      }
      const ownerId = projectDoc.data().ownerId;

      // 2. Check if Owner is Pro/Founder
      const userDoc = await getDoc(doc(db, "users", ownerId));
      const userData = userDoc.data();
      const isPro = userData?.isPro || userData?.isFounder;

      if (isPro) {
        // 3. Save to acoustics_logs
        await addDoc(collection(db, "acoustics_logs"), {
          projectId: project_id,
          event,
          data: data || {},
          timestamp: timestamp || new Date().toISOString(),
          location: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown'
        });
        return res.json({ status: "echo_recorded" });
      } else {
        return res.json({ status: "discarded", reason: "pro_required" });
      }
    } catch (error) {
      console.error("Acoustics Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist/
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // SPA fallback: serve index.html for all non-file requests
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
