import { GoogleGenAI } from "@google/genai";
import { UserSettings } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getComfortMessage = async (mood: string, context: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `My girlfriend is feeling ${mood}. Context: ${context}. Write a very short, soft, cute, and comforting message (max 20 words) to make her smile. Use gentle language.`,
    });
    return response.text || "I love you, everything will be okay. 🌸";
  } catch (error) {
    console.error("AI Error", error);
    return "Sending you a big warm hug! 🐰";
  }
};

export const getHealthTip = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Give a one-sentence, cute, scientifically accurate health tip for a woman's daily wellness. Keep it under 15 words.",
    });
    return response.text || "Drink water and shine bright today! 💧";
  } catch (error) {
    return "Take a deep breath and relax your shoulders.";
  }
};

export const getChatResponse = async (userMessage: string, history: string[], settings: UserSettings): Promise<string> => {
    try {
        const prompt = `
            You are acting as ${settings.partnerName}, the loving, protective, and gentle boyfriend of ${settings.name}.
            You are chatting with her in a secure app.
            
            Tone: Extremely affectionate, soft, safe, supportive, and slightly playful.
            Context: She just said "${userMessage}".
            Previous context: ${history.slice(-3).join(" | ")}.
            
            Keep the response short (under 30 words), conversational, and use 1 cute emoji.
            Never mention you are an AI. You are her guardian partner.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "I'm always here for you, love. ❤️";
    } catch (error) {
        return "I love you so much. (Network hiccup, but my love is strong!) ❤️";
    }
};
