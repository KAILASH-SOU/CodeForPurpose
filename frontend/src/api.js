// Central API base — reads from VITE_API_URL env var in production,
// falls back to localhost for local dev.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export default API_BASE;
