import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const readCollection = (collectionName) => {
  const filePath = path.join(DATA_DIR, `${collectionName}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${collectionName}.json:`, err);
    return [];
  }
};

export const writeCollection = (collectionName, data) => {
  const filePath = path.join(DATA_DIR, `${collectionName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

export const findById = (collectionName, id) => {
  const list = readCollection(collectionName);
  return list.find(item => item._id === id || item.id === id);
};

export const insertOne = (collectionName, doc) => {
  const list = readCollection(collectionName);
  const now = new Date().toISOString();
  const newDoc = {
    _id: doc._id || 'gen_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    ...doc,
    createdAt: doc.createdAt || now,
    updatedAt: now
  };
  list.unshift(newDoc);
  writeCollection(collectionName, list);
  return newDoc;
};

export const updateById = (collectionName, id, updates) => {
  const list = readCollection(collectionName);
  const idx = list.findIndex(item => item._id === id || item.id === id);
  if (idx === -1) return null;
  list[idx] = {
    ...list[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  writeCollection(collectionName, list);
  return list[idx];
};

export const removeById = (collectionName, id) => {
  const list = readCollection(collectionName);
  const filtered = list.filter(item => item._id !== id && item.id !== id);
  writeCollection(collectionName, filtered);
  return true;
};

