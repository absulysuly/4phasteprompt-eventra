
const API_KEY = process.env.API_KEY;

if (!API_KEY || API_KEY === 'your_api_key_here') {
  console.warn("WARNING: Gemini API key is not configured or is using the default placeholder in .env.local. AI features will not work.");
}

export const config = {
  geminiApiKey: API_KEY as string,
};
