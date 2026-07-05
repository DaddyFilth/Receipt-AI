import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import templateRoutes from './routes/templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Restrict CORS to a configurable origin instead of allowing any site.
// Defaults to the Vite dev server origin; set CORS_ORIGIN in production.
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '10mb' }));

app.use('/api', templateRoutes);

const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Receipt AI server running on port ${PORT}`);
});
