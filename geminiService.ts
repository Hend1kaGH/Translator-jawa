
import { GoogleGenAI, Type } from "@google/genai";
import { Context, JavaneseLevel, TranslationResult } from "./types";

export const translateToJavanese = async (
  inputText: string,
  context: Context
): Promise<TranslationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Fixed: Context is a type alias for string, not a value/enum with properties.
  // Comparing with the default string literal for the elder context.
  const level = context === 'Orang Tua/Simbah' ? JavaneseLevel.KRAMA_ALUS : JavaneseLevel.NGOKO;

  const prompt = `
    Anda adalah ahli bahasa Jawa.
    Terjemahkan teks Bahasa Indonesia berikut ke dalam Bahasa Jawa dengan tingkatan yang tepat.
    
    Teks Input: "${inputText}"
    Target Konteks: "${context}"
    Tingkatan yang Direkomendasikan: "${level}"

    Ketentuan:
    - Jika konteksnya "Orang Tua/Simbah", gunakan Krama Alus yang sangat sopan.
    - Jika konteksnya "Teman Sebaya", gunakan Ngoko yang akrab.
    
    Berikan respons dalam format JSON dengan struktur:
    {
      "translatedText": "hasil terjemahan",
      "level": "Tingkatan yang digunakan (Ngoko/Krama Madya/Krama Alus)",
      "explanation": "Penjelasan singkat mengapa gaya bahasa ini dipilih untuk konteks tersebut dalam 1 kalimat"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { type: Type.STRING },
            level: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["translatedText", "level", "explanation"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return {
      translatedText: result.translatedText,
      level: result.level as JavaneseLevel,
      explanation: result.explanation
    };
  } catch (error) {
    console.error("Translation Error:", error);
    throw new Error("Gagal menerjemahkan teks. Silakan coba lagi.");
  }
};

export const generateSituationalText = async (
  situationPrompt: string,
  context: Context
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Tuliskan sebuah kalimat pendek dalam Bahasa Indonesia yang tepat untuk situasi berikut: "${situationPrompt}".
    Kalimat ini nantinya akan diterjemahkan ke Bahasa Jawa untuk ${context}.
    Cukup berikan teks kalimatnya saja tanpa tanda kutip atau penjelasan tambahan.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text.trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Situation Generation Error:", error);
    return situationPrompt;
  }
};
