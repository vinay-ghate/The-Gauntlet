// Backend API Configuration
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// API URL for client-side requests (uses Next.js API proxy)
export const API_URL = "/api";

// Export for backward compatibility
export { API_URL as default };
