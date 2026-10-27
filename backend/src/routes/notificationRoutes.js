import express from 'express';
import { readCollection, updateById } from '../models/dbStore.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications - User's notifications
router.get('/', authenticateToken, (req, res) => {
  const all = readCollection('notifications');
  const userId = req.user.id;
  const userRole = req.user.role;

  // Fetch notifications for user or global notifications for role
  const list = all.filter(n =>
    n.userId === userId ||
    (userRole === 'SUPERVISOR' && n.userId === 'all_supervisors')
  );

  res.json({
    success: true,
    notifications: list
  });
});

// PATCH /api/notifications/:id/read - Mark as read
router.patch('/:id/read', authenticateToken, (req, res) => {
  const { id } = req.params;
  const updated = updateById('notifications', id, { read: true });
  res.json({ success: true, notification: updated });
});

export default router;

