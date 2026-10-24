// Simple Express backend for AlgoArena
// Serves health check and can be extended with API endpoints.

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies (if needed later)
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({status: 'ok', timestamp: new Date().toISOString()});
});

// Serve static files from Vite build (when built)
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Note: In development mode we serve only the health endpoint.
// SPA fallback is omitted because the 'dist' folder is not built during dev.
// When running a production build, you can uncomment the following lines:
// app.use((req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
// });

app.listen(PORT, () => {
  console.log(`✅ Backend server listening on http://localhost:${PORT}`);
});
