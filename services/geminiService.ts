import { GoogleGenAI } from "@google/genai";
import { LightParams } from "../types";

/**
 * Converts technical lighting parameters into a descriptive photography prompt.
 */
const generateLightingPrompt = (params: LightParams): string => {
  const { azimuth, elevation, intensity } = params;

  // 1. Horizontal Direction (Azimuth)
  let hDir = "";
  if (azimuth >= 315 || azimuth < 45) hDir = "front";
  else if (azimuth >= 45 && azimuth < 135) hDir = "right side";
  else if (azimuth >= 135 && azimuth < 225) hDir = "back/rim"; // Backlighting
  else if (azimuth >= 225 && azimuth < 315) hDir = "left side";

  // 2. Vertical Angle (Elevation)
  let vDir = "";
  if (elevation > 45) vDir = "high-angle top-down";
  else if (elevation > 15) vDir = "overhead";
  else if (elevation >= -15 && elevation <= 15) vDir = "eye-level";
  else if (elevation < -15) vDir = "low-angle dramatic";

  // 3. Intensity Description
  let iDesc = "";
  if (intensity < 0.5) iDesc = "dim, subtle";
  else if (intensity < 1.0) iDesc = "soft, balanced";
  else if (intensity < 1.5) iDesc = "bright, strong";
  else iDesc = "intense, harsh, overexposed highlights";

  // Combined Construct
  // Updated to emphasize content preservation
  return `Strictly preserve the original composition, character, pose, facial features, clothing, and background details. Do NOT add, remove, or modify any objects or geometry. 
Your ONLY task is to apply a new lighting setup: ${vDir} ${hDir} key light.
Lighting intensity: ${intensity}x (${iDesc}).
Cast accurate shadows consistent with this new light direction while keeping the original image structure exactly the same. Photorealistic quality.`;
};

export const generateLitImage = async (
  base64Image: string,
  params: LightParams,
  aspectRatio: string = "1:1"
): Promise<string> => {
  // 1. Check/Get API Key using the specialized window.aistudio flow for paid models
  if (!window.aistudio) {
      throw new Error("AI Studio environment not detected.");
  }

  const hasKey = await window.aistudio.hasSelectedApiKey();
  if (!hasKey) {
      await window.aistudio.openSelectKey();
      // As per guidelines, assume success after triggering openSelectKey.
  }

  // 2. Initialize Client (Key is injected via process.env.API_KEY after selection)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 3. Construct Payload
  const prompt = generateLightingPrompt(params);
  
  // Strip data:image/png;base64, prefix if present
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG or generic image handling
              data: cleanBase64,
            },
          },
        ],
      },
      config: {
        // High quality image generation settings
        imageConfig: {
            imageSize: "1K", 
            aspectRatio: aspectRatio as any // Pass the calculated aspect ratio
        }
      },
    });

    // 4. Extract Image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in response.");

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    
    // Check for Permission Denied (403) or Entity Not Found (often 404 or 400 related to key scope)
    const errorString = error.toString() + JSON.stringify(error);
    if (
        errorString.includes("403") || 
        errorString.includes("PERMISSION_DENIED") || 
        errorString.includes("Requested entity was not found")
    ) {
         try {
            await window.aistudio.openSelectKey();
         } catch (e) {
             console.error("Error reopening key selector:", e);
         }
         throw new Error("Permission denied. Please select a paid API key valid for Gemini 3 Pro.");
    }
    throw error;
  }
};