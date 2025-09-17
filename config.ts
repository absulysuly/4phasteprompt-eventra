// A central place for application configuration, especially environment variables.

// In a real build process (like Vite or Next.js), process.env is populated.
// We'll read from it directly, assuming the execution environment provides it.

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a critical error for a production build.
  // In a real CI/CD pipeline, this would fail the build.
  console.error("FATAL: Gemini API key is not configured in environment variables.");
}

export const config = {
  geminiApiKey: API_KEY as string,
};
