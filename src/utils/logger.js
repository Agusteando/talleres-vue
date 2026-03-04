const IS_DEV = process.env.NODE_ENV !== 'production';

export const logger = {
  auth: (msg, data = '') => {
    if (IS_DEV) console.log(`%c[AUTH] ${msg}`, 'color: #8b5cf6; font-weight: bold;', data)
  },
  api: (msg, data = '') => {
    if (IS_DEV) console.log(`%c[API] ${msg}`, 'color: #3b82f6; font-weight: bold;', data)
  },
  info: (msg, data = '') => {
    if (IS_DEV) console.log(`%c[INFO] ${msg}`, 'color: #10b981; font-weight: bold;', data)
  },
  warn: (msg, data = '') => {
    if (IS_DEV) console.warn(`%c[WARN] ${msg}`, 'color: #f59e0b; font-weight: bold;', data)
  },
  error: (msg, data = '') => {
    console.error(`%c[ERROR] ${msg}`, 'color: #ef4444; font-weight: bold;', data)
  }
};