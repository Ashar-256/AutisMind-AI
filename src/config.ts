// Allow runtime configuration for hosted demos
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem("custom_api_url") : null;
// Default to the hosted backend, but allow override via env var or local storage
export const API_URL = storedUrl || import.meta.env.VITE_API_URL || "https://autismind-ai.onrender.com";
console.log("API URL configured as:", API_URL);
