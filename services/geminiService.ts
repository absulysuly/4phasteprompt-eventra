// FIX: Implemented Gemini service to provide AI-powered event suggestions.
import { GoogleGenAI, Type } from "@google/genai";
import { loggingService } from './loggingService';
import type { AISuggestionResponse, City, Category } from "@/types";

/**
 * Initializes the GoogleGenAI client instance.
 * The API key is sourced from environment variables as per security best practices.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Formats an array of city or category objects into a string for the AI prompt.
 * @param items - An array of City or Category objects.
 * @returns A comma-separated string of item IDs and names.
 */
const formatDataForPrompt = (items: (City | Category)[]) => {
  return items.map(item => `'${item.id}' (${item.name.en})`).join(', ');
};

/**
 * Generates a complete event suggestion, including multilingual text and a promotional image,
 * based on a user's prompt. It orchestrates two AI calls: one for structured text data
 * and another for image generation.
 *
 * @param prompt - The user's natural language input for the event idea.
 * @param cities - A list of available cities to help the AI choose a location.
 * @param categories - A list of available categories to help the AI classify the event.
 * @returns A promise that resolves to an AISuggestionResponse object.
 */
const getAISuggestions = async (
  prompt: string,
  cities: City[],
  categories: Category[]
): Promise<AISuggestionResponse> => {
  try {
    // Part 1: Generate structured event data using a powerful text model.
    const textModel = "gemini-2.5-flash";
    const cityList = formatDataForPrompt(cities);
    const categoryList = formatDataForPrompt(categories);

    const textPrompt = `
      Based on the following user prompt, create a compelling event suggestion for an event discovery app in Kurdistan.
      User Prompt: "${prompt}"

      You must generate the following information:
      1.  A catchy and descriptive title for the event in English, Arabic, and Kurdish.
      2.  A detailed and appealing description for the event (around 50-70 words) in English, Arabic, and Kurdish.
      3.  The single most appropriate city ID from this strict list: ${cityList}.
      4.  The single most appropriate category ID from this strict list: ${categoryList}.

      Return the response as a single, well-formed JSON object that adheres to the provided schema.
    `;

    const textResponse = await ai.models.generateContent({
      model: textModel,
      contents: textPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.OBJECT,
              properties: {
                en: { type: Type.STRING, description: "Event title in English" },
                ar: { type: Type.STRING, description: "Event title in Arabic" },
                ku: { type: Type.STRING, description: "Event title in Kurdish (Sorani)" },
              },
              required: ['en', 'ar', 'ku']
            },
            description: {
              type: Type.OBJECT,
              properties: {
                en: { type: Type.STRING, description: "Event description in English" },
                ar: { type: Type.STRING, description: "Event description in Arabic" },
                ku: { type: Type.STRING, description: "Event description in Kurdish (Sorani)" },
              },
              required: ['en', 'ar', 'ku']
            },
            suggestedCityId: { type: Type.STRING, description: `The most relevant city ID from the list provided.` },
            suggestedCategoryId: { type: Type.STRING, description: `The most relevant category ID from the list provided.` },
          },
          required: ['title', 'description', 'suggestedCityId', 'suggestedCategoryId']
        },
      },
    });

    const textResult = JSON.parse(textResponse.text);

    // Part 2: Generate a visually appealing image based on the generated event details.
    const imageModel = "imagen-4.0-generate-001";
    const imagePrompt = `Create a visually stunning and high-quality promotional image for an event called "${textResult.title.en}". The event is about: "${textResult.description.en}". The image should be vibrant, engaging, and suitable for social media. Do not include any text, logos, or words in the image.`;

    const imageResponse = await ai.models.generateImages({
      model: imageModel,
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9'
      },
    });
    
    if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0 || !imageResponse.generatedImages[0].image.imageBytes) {
      throw new Error("Image generation failed to return an image.");
    }

    const generatedImageBase64 = imageResponse.generatedImages[0].image.imageBytes;

    return {
      title: textResult.title,
      description: textResult.description,
      suggestedCategoryId: textResult.suggestedCategoryId,
      suggestedCityId: textResult.suggestedCityId,
      generatedImageBase64: generatedImageBase64,
    };
  } catch (error) {
    loggingService.logError(error as Error, { prompt });
    throw new Error("Failed to generate AI-powered event suggestion. Please try again.");
  }
};

export const geminiService = {
  getAISuggestions,
};
