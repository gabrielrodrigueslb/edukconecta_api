import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import alunoRoutes from './src/routes/alunoRoutes.js';
import presencaRoutes from './src/routes/presencaRoutes.js';
import turmaRoutes from './src/routes/turmaRoutes.js';
import avisoRoutes from './src/routes/avisoRoutes.js';
import eventoRoutes from './src/routes/eventoRoutes.js';
import documentoEscolaRoutes from './src/routes/documentoEscolaRoutes.js';
import tenantRoutes from './src/routes/tenantRoutes.js';
import path from 'path';
import { tenantMiddleware } from './middlewares/tenant.middleware.js';

const app = express();
const PORT = process.env.PORT || 4457;

app.set('trust proxy', 1);

const LOCAL_ORIGINS = new Set([
  'http://localhost:3000',
  'http://localhost:2006',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:2006',
]);

function isEdukconectaOrigin(origin) {
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    if (host === 'edukconecta.com') return true;
    return host.endsWith('.edukconecta.com');
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (LOCAL_ORIGINS.has(origin)) return true;
  if (process.env.NEXT_FRONTEND_URL && origin === process.env.NEXT_FRONTEND_URL) {
    return true;
  }
  return isEdukconectaOrigin(origin);
}

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      const msg =
        'A politica CORS para este site nao permite acesso da origem ' +
        origin;
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-tenant'],
  }),
);

app.use(tenantMiddleware);

app.use('/api/tenant', tenantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/presencas', presencaRoutes);
app.use('/api/turmas', turmaRoutes);
app.use('/api/avisos', avisoRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/documentos', documentoEscolaRoutes);
app.use('/uploads', express.static(path.resolve('src/uploads')));

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
