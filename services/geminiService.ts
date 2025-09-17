import { GoogleGenAI, Type } from "@google/genai";
import type { City, Category, AISuggestionResponse, LocalizedString } from '../types';
import { loggingService } from './loggingService';


// FIX: Initialize GoogleGenAI directly with process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEventDetailsFromPrompt = async (
  prompt: string,
  cities: City[],
  categories: Category[],
  imageBase64: string | null
): Promise<AISuggestionResponse> => {
  try {
    const cityOptions = cities.map(c => `id: "${c.id}", name: "${c.name.en}"`).join('; ');
    const categoryOptions = categories.filter(c => c.id !== 'all').map(c => `id: "${c.id}", name: "${c.name.en}"`).join('; ');

    const systemInstruction = `You are an expert event planner assistant. Your task is to take a user's event idea and generate structured, creative, and appealing event details. The output must be in JSON format.
    
    1.  **Analyze the User's Prompt:** Understand the core concept, location hints, and event type.
    2.  **Generate Titles & Descriptions:** Create a catchy title and an engaging description for the event. Provide translations for English (en), Arabic (ar), and Kurdish (ku).
    3.  **Suggest City & Category:** Based on the prompt and the provided lists, choose the most appropriate city and category. You MUST return one of the provided IDs.
        - Available Cities: ${cityOptions}
        - Available Categories: ${categoryOptions}
    4.  **Create an Image Prompt:** Based on the event's theme, generate a descriptive and visually rich prompt suitable for an AI image generator. The prompt should be creative and detailed to produce a high-quality, relevant image. For example, for a music concert, suggest something like: 'Vibrant, dynamic shot of a music festival at night in Kurdistan, colorful stage lights, enthusiastic crowd with hands in the air, traditional Kurdish patterns subtly integrated into the modern stage design, cinematic lighting, high energy.'
    ${imageBase64 ? "5. **Analyze the Provided Image:** An image has been uploaded by the user for inspiration. Analyze its contents, style, and mood. Your suggestions for the title, description, and image prompt should be heavily influenced by this image." : ""}

    Your final output must strictly follow the JSON schema provided.`;

    const textPart = { text: `Here is my event idea: "${prompt}"` };
    // FIX: Explicitly type `contentParts` to allow both text and image parts, preventing a TypeScript error when conditionally adding an image.
    const contentParts: ({ text: string; } | { inlineData: { mimeType: string; data: string; }; })[] = [textPart];

    if (imageBase64) {
      // imageBase64 is a data URL like "data:image/png;base64,iVBORw0KGgo..."
      const [mimeTypePart, base64Data] = imageBase64.split(';base64,');
      if (!mimeTypePart || !base64Data) {
        throw new Error("Invalid image format. Expected a base64 data URL.");
      }
      const mimeType = mimeTypePart.split(':')[1];
      
      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      };
      contentParts.unshift(imagePart); // Place image before text for model context
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: contentParts },
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.OBJECT,
                        properties: {
                            en: { type: Type.STRING, description: "The event title in English." },
                            ar: { type: Type.STRING, description: "The event title in Arabic." },
                            ku: { type: Type.STRING, description: "The event title in Kurdish." },
                        }
                    },
                    description: {
                        type: Type.OBJECT,
                        properties: {
                            en: { type: Type.STRING, description: "The event description in English." },
                            ar: { type: Type.STRING, description: "The event description in Arabic." },
                            ku: { type: Type.STRING, description: "The event description in Kurdish." },
                        }
                    },
                    suggestedCityId: {
                        type: Type.STRING,
                        description: `The ID of the suggested city from the provided list. Must be one of [${cities.map(c => `"${c.id}"`).join(', ')}]`
                    },
                    suggestedCategoryId: {
                        type: Type.STRING,
                        description: `The ID of the suggested category from the provided list. Must be one of [${categories.filter(c => c.id !== 'all').map(c => `"${c.id}"`).join(', ')}]`
                    },
                    imagePrompt: {
                        type: Type.STRING,
                        description: "A creative prompt for an AI image generator, inspired by the user's text and image."
                    }
                }
            }
        },
    });

    const jsonText = response.text.trim();
    const details = JSON.parse(jsonText) as {
        title: LocalizedString;
        description: LocalizedString;
        suggestedCityId: string;
        suggestedCategoryId: string;
        imagePrompt: string;
    };

    // Now, generate the image using the prompt
    const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: details.imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '16:9',
        },
    });

    if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
        throw new Error("AI failed to generate an image.");
    }
    
    const generatedImageBase64 = imageResponse.generatedImages[0].image.imageBytes;

    return {
        title: details.title,
        description: details.description,
        suggestedCategoryId: details.suggestedCategoryId,
        suggestedCityId: details.suggestedCityId,
        generatedImageBase64: generatedImageBase64,
    };

  } catch (error) {
    loggingService.logError(error as Error, {
        context: 'generateEventDetailsFromPrompt',
        prompt: prompt,
    });
    throw new Error("Failed to get AI suggestions. Please try again later.");
  }
};