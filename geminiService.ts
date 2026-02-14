
import { GoogleGenAI, Type } from "@google/genai";
import { Context, JavaneseLevel, TranslationResult } from "./types";

export const translateToJavanese = async (
  inputText: string,
  context: Context
): Promise<TranslationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const level = context === Context.ELDER ? JavaneseLevel.KRAMA_ALUS 
              : context === Context.PEER ? JavaneseLevel.NGOKO 
              : JavaneseLevel.KRAMA_MADYA;

  const prompt = `
    Anda adalah ahli bahasa Jawa.
    Terjemahkan teks Bahasa Indonesia berikut ke dalam Bahasa Jawa dengan tingkatan yang tepat.
    
    Teks Input: "${inputText}"
    Target Konteks: "${context}"
    Tingkatan yang Direkomendasikan: "${level}"

    Ketentuan:
    - Jika konteksnya "Orang Tua/Simbah", gunakan Krama Alus yang sangat sopan.
    - Jika konteksnya "Teman Sebaya", gunakan Ngoko yang akrab.
    - Jika konteksnya "Anak Kecil", gunakan bahasa yang mendidik dan mudah dimengerti (Ngoko Alus atau Krama Madya yang sederhana).
    
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
