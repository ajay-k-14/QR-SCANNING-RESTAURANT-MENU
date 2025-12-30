// Configuration for API and WebSocket URLs
// Automatically switches between localhost (development) and Render (production)

const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Update these URLs after deploying to Render
const PRODUCTION_API_URL = 'https://qr-menu-chqv.onrender.com'; // Replace with your Render URL
const DEVELOPMENT_API_URL = 'http://localhost:5000';

export const API_BASE_URL = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;
export const WS_URL = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;

console.log(`🔗 Using ${isProduction ? 'Production' : 'Development'} API: ${API_BASE_URL}`);
