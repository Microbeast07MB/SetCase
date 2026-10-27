import express from 'express';
import { readCollection } from '../models/dbStore.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/audit - View system audit trail (Supervisor only)
router.get('/', authenticateToken, authorizeRoles('SUPERVISOR'), (req, res) => {
  const logs = readCollection('auditLogs');
  const { complaintId, limit = 50 } = req.query;

  let filtered = [...logs];
  if (complaintId) {
    filtered = filtered.filter(l => l.complaintId === complaintId);
  }

  // Sort newest first
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json({
    success: true,
    total: filtered.length,
    logs: filtered.slice(0, Number(limit))
  });
});

export default router;

