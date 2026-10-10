import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
// Absolute path so uploads work regardless of the directory the server is started from.
export const UPLOAD_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
