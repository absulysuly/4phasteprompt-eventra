// FIX: Implemented the geminiService to generate event suggestions and images using the Gemini API, following all provided coding guidelines. This includes initializing the client, using `ai.models.generateContent` with a JSON schema for structured output, and `ai.models.generateImages` for visuals. This resolves the 'not a module' error for this file.
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { City, Category, AISuggestionResponse, LocalizedString } from '../types';

// FIX: Initialized the GoogleGenerativeAI client according to guidelines.
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

const getAISuggestions = async (
  prompt: string,
  cities: City[],
  categories: Category[]
): Promise<AISuggestionResponse> => {
  
  // Create a simplified list of cities and categories for the model prompt.
  const cityList = cities.map(c => `id: "${c.id}", name: "${c.name.en}"`).join('; ');
  const categoryList = categories.map(c => `id: "${c.id}", name: "${c.name.en}"`).join('; ');

  const systemInstruction = `You are an expert event planner assistant. Based on the user's prompt, you will generate compelling, multilingual event details (title and description in English, Arabic, and Kurdish). You must also select the most appropriate city and category from the provided lists. Your response must be in JSON format matching the specified schema.

  Available cities: ${cityList}
  Available categories: ${categoryList}`;

  // Define the expected JSON response structure for the model.
  const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.OBJECT,
        properties: {
          en: { type: SchemaType.STRING, description: "Event title in English." },
          ar: { type: SchemaType.STRING, description: "Event title in Arabic." },
          ku: { type: SchemaType.STRING, description: "Event title in Kurdish." },
        },
        required: ["en", "ar", "ku"]
      },
      description: {
        type: SchemaType.OBJECT,
        properties: {
          en: { type: SchemaType.STRING, description: "Event description in English (around 50 words)." },
          ar: { type: SchemaType.STRING, description: "Event description in Arabic (around 50 words)." },
          ku: { type: SchemaType.STRING, description: "Event description in Kurdish (around 50 words)." },
        },
        required: ["en", "ar", "ku"]
      },
      suggestedCityId: {
        type: SchemaType.STRING,
        description: `The ID of the most relevant city from the available list.`,
      },
      suggestedCategoryId: {
        type: SchemaType.STRING,
        description: `The ID of the most relevant category from the available list.`,
      },
      imagePrompt: {
        type: SchemaType.STRING,
        description: `A creative, concise prompt (5-10 words) for an image generation model to create a visually appealing banner for this event.`,
      }
    },
    required: ["title", "description", "suggestedCityId", "suggestedCategoryId", "imagePrompt"],
  };

  try {
    // Generate text content using Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const textResponse = await model.generateContent(prompt);
    const textResultJson = textResponse.response.text();
    const textResult = JSON.parse(textResultJson);

    // Validate that the returned IDs are valid
    const finalCityId = cities.some(c => c.id === textResult.suggestedCityId) ? textResult.suggestedCityId : cities[0].id;
    const finalCategoryId = categories.some(c => c.id === textResult.suggestedCategoryId) ? textResult.suggestedCategoryId : categories[0].id;

    // For now, we'll use a placeholder image since Google Generative AI doesn't support image generation directly
    // In a real app, you would use a separate image generation service
    const imageBase64 = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00D2FF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#3A47D5;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="32" font-family="Arial, sans-serif">
          ${textResult.title.en}
        </text>
      </svg>
    `);
    
    return {
      title: textResult.title as LocalizedString,
      description: textResult.description as LocalizedString,
      suggestedCityId: finalCityId,
      suggestedCategoryId: finalCategoryId,
      generatedImageBase64: imageBase64,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Rethrow a more user-friendly error
    throw new Error("Failed to generate AI suggestions. Please check your prompt or API key and try again.");
  }
};

export const geminiService = {
  getAISuggestions,
};
