import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function evaluatePronunciation(word: string, audioBase64: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: `Evaluate the pronunciation of the word "${word}" in this audio. Pay special attention to the ending sounds (like /s/, /t/, /d/). Provide a score from 1 to 5 stars and a short encouraging feedback in English for a primary school student. Mention if the ending sound was clear.` },
            { inlineData: { mimeType: "audio/wav", data: audioBase64 } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          },
          required: ["score", "feedback"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error evaluating pronunciation:", error);
    return { score: 3, feedback: "Keep trying! You are doing great!" };
  }
}

export async function identifyEcoObject(imageData: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Look at this image from an English learning app for kids. Identify if there is a 'Forest', 'Volcano', 'Ocean', or 'Island' (or related objects like 'Tree', 'Lava', 'Beach'). Return the name of the EcoZone it belongs to ('forest', 'volcano', 'ocean', or 'island'). If nothing is found, return 'none'." },
            { inlineData: { mimeType: "image/jpeg", data: imageData } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            zoneId: { type: Type.STRING, enum: ['forest', 'volcano', 'ocean', 'island', 'none'] },
            detectedObject: { type: Type.STRING }
          },
          required: ["zoneId", "detectedObject"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error identifying object:", error);
    return { zoneId: 'none', detectedObject: '' };
  }
}
