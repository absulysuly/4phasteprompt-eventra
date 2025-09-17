// FIX: Implemented the geminiService to generate event suggestions and images using the Gemini API, following all provided coding guidelines. This includes initializing the client, using `ai.models.generateContent` with a JSON schema for structured output, and `ai.models.generateImages` for visuals. This resolves the 'not a module' error for this file.
import { GoogleGenAI, Type } from "@google/genai";
import type { City, Category, AISuggestionResponse, LocalizedString } from '@/types';

// FIX: Initialized the GoogleGenAI client according to guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.OBJECT,
        properties: {
          en: { type: Type.STRING, description: "Event title in English." },
          ar: { type: Type.STRING, description: "Event title in Arabic." },
          ku: { type: Type.STRING, description: "Event title in Kurdish." },
        },
        required: ["en", "ar", "ku"]
      },
      description: {
        type: Type.OBJECT,
        properties: {
          en: { type: Type.STRING, description: "Event description in English (around 50 words)." },
          ar: { type: Type.STRING, description: "Event description in Arabic (around 50 words)." },
          ku: { type: Type.STRING, description: "Event description in Kurdish (around 50 words)." },
        },
        required: ["en", "ar", "ku"]
      },
      suggestedCityId: {
        type: Type.STRING,
        description: `The ID of the most relevant city from the available list.`,
      },
      suggestedCategoryId: {
        type: Type.STRING,
        description: `The ID of the most relevant category from the available list.`,
      },
      imagePrompt: {
        type: Type.STRING,
        description: `A creative, concise prompt (5-10 words) for an image generation model to create a visually appealing banner for this event.`,
      }
    },
    required: ["title", "description", "suggestedCityId", "suggestedCategoryId", "imagePrompt"],
  };

  try {
    // Generate text content using Gemini 2.5 Flash
    // FIX: Using ai.models.generateContent as per guidelines
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    // FIX: Using .text property to extract text response as per guidelines
    const textResultJson = textResponse.text;
    const textResult = JSON.parse(textResultJson);

    // Validate that the returned IDs are valid
    const finalCityId = cities.some(c => c.id === textResult.suggestedCityId) ? textResult.suggestedCityId : cities[0].id;
    const finalCategoryId = categories.some(c => c.id === textResult.suggestedCategoryId) ? textResult.suggestedCategoryId : categories[0].id;

    // Generate image using Imagen 4.0
    // FIX: Using ai.models.generateImages as per guidelines
    const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: textResult.imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    // FIX: Extracting image bytes from the response
    const imageBase64 = imageResponse.generatedImages[0].image.imageBytes;

    if (!imageBase64) {
      throw new Error("Image generation failed to return data.");
    }
    
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
