import { readCollection, writeCollection, insertOne } from '../models/dbStore.js';

export const logAudit = ({
  action,
  complaintId,
  userId,
  userName,
  userRole,
  details,
  ip = '127.0.0.1'
}) => {
  try {
    const entry = {
      action,
      complaintId,
      userId,
      userName,
      userRole,
      details,
      ip,
      timestamp: new Date().toISOString()
    };
    insertOne('auditLogs', entry);
  } catch (err) {
    console.error('Audit log failure:', err);
  }
};

export const createNotification = ({
  userId,
  title,
  message,
  complaintId,
  type = 'INFO'
}) => {
  try {
    const notif = {
      userId,
      title,
      message,
      complaintId,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    return insertOne('notifications', notif);
  } catch (err) {
    console.error('Notification creation failure:', err);
  }
};

