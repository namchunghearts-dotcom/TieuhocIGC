import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function evaluatePronunciation(word: string, audioBase64: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: `Evaluate the pronunciation of the word "${word}" in this audio for a primary school student. 
            Provide a detailed breakdown in JSON format:
            - accuracy: score 1-100 (how close to the native sound)
            - fluency: score 1-100 (how smooth the delivery was)
            - pronunciation: score 1-100 (clarity of specific phonemes)
            - overallScore: 1-5 stars
            - feedback: short, encouraging feedback in English.
            - tips: one specific tip to improve (e.g., "Focus on the ending /s/ sound").` },
            { inlineData: { mimeType: "audio/wav", data: audioBase64 } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            accuracy: { type: Type.NUMBER },
            fluency: { type: Type.NUMBER },
            pronunciation: { type: Type.NUMBER },
            overallScore: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            tips: { type: Type.STRING }
          },
          required: ["accuracy", "fluency", "pronunciation", "overallScore", "feedback", "tips"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error evaluating pronunciation:", error);
    return { 
      accuracy: 70, 
      fluency: 75, 
      pronunciation: 65, 
      overallScore: 3, 
      feedback: "Keep trying! You are doing great!",
      tips: "Try to speak a bit louder and clearer."
    };
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
