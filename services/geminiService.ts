import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { ChatMessage } from '../types';

// In Vite-based projects, environment variables exposed to the client must be prefixed with VITE_
// and are accessed via `import.meta.env`.
// @ts-ignore - The build environment provides import.meta.env
const API_KEY = import.meta.env.VITE_API_KEY;


if (!API_KEY) {
  // This error is thrown if the VITE_API_KEY is not set in the build environment.
  // On platforms like Vercel, this needs to be set in the project's "Environment Variables" settings.
  // The project must be redeployed after setting the variable for the change to take effect.
  throw new Error("VITE_API_KEY environment variable not set. Please follow these steps: 1. In your Vercel project settings, go to 'Environment Variables'. 2. Create a variable with the key 'VITE_API_KEY' and your API key as the value. 3. Trigger a new deployment for the changes to take effect.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateLandscapeDesign = async (baseImage: string, mimeType: string, prompt: string) => {
  // Enhanced prompt to guide the model for better accuracy with specific plant names.
  const enhancedPrompt = `
    Act as a professional landscape designer. The user has provided an image of their garden and wants a new design based on their request.
    Generate a photorealistic image showing the redesigned garden.
    It is crucial to accurately include any specific plants mentioned by the user. For context:
    - 'luohansong' refers to Podocarpus macrophyllus (Buddhist Pine).
    - 'foxtail' can refer to Foxtail Fern (Asparagus densiflorus 'Myersii') or various foxtail grasses. Please use a visually appropriate one.
    
    User's request: "${prompt}"

    Incorporate the user's request into the provided garden image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: baseImage,
              mimeType: mimeType,
            },
          },
          {
            text: enhancedPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return {
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
        };
      }
    }
    throw new Error("No image was generated.");
  } catch (error) {
    console.error("Error generating landscape design:", error);
    throw new Error("Failed to generate landscape design. Please check the console for details.");
  }
};

export const identifyPlantsInImage = async (base64Image: string, mimeType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          { text: "Analyze this image of a garden. List the names of the plants visible. Return the result as a JSON object with a key 'plants' containing an array of strings. Example: {\"plants\": [\"Lavender\", \"Rose Bush\"]}. If no plants are clearly identifiable, return an empty array." },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plants: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
                description: "The common name of a plant.",
              },
            },
          },
          required: ["plants"],
        },
      },
    });
    
    const jsonText = response.text.trim();
    if (!jsonText) {
      // If the model returns nothing, we can't identify plants.
      return [];
    }
    
    try {
        const result = JSON.parse(jsonText);
        // Validate the structure of the returned object
        if (result && Array.isArray(result.plants)) {
            // Ensure we handle non-string items in the array gracefully
            return result.plants.map((name: unknown) => ({ name: String(name) }));
        } else {
            // The JSON is valid but doesn't match our schema.
            console.warn("Plant identification returned malformed data structure.", jsonText);
            throw new Error("AI returned an unexpected data structure for plants.");
        }
    } catch (parseError) {
        console.error("Error parsing JSON from plant identification:", parseError, "Received:", jsonText);
        throw new Error("Failed to parse plant data from the AI response.");
    }
  } catch (error) {
    console.error("Error identifying plants:", error);
    throw new Error("Failed to identify plants in the generated image.");
  }
};

let chat: Chat | null = null;

export const startChat = (): Chat => {
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are Bloom, a friendly and knowledgeable gardening assistant. You help users with their gardening questions and provide tips on how to use this landscape design app. Keep your responses concise and helpful.",
            },
        });
    }
    return chat;
};

export const sendMessageToChat = async (message: string): Promise<string> => {
    try {
        const chatInstance = startChat();
        const response = await chatInstance.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error sending chat message:", error);
        throw new Error("Sorry, I couldn't process your message right now.");
    }
};