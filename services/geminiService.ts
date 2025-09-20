import { GoogleGenAI } from "@google/genai";
import { Question } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const evaluateAnswer = async (question: Question, userAnswer: string): Promise<string> => {
  if (!API_KEY) {
    return "Clave de API no configurada. No se puede evaluar la respuesta.";
  }
  
  try {
    const prompt = `You are an expert USCIS interviewer conducting a citizenship test. Your goal is to provide simple, encouraging, and clear feedback.
    The official question is: "${question.question_en}"
    The acceptable official answer(s) are: "${question.answer_en.join(', ')}"
    The applicant's answer is: "${userAnswer}"

    Evaluate if the applicant's answer is correct. 
    - If the answer is correct or very close, start with "That is correct." and provide brief positive reinforcement.
    - If the answer is incorrect, gently say "Not quite." and provide the correct answer without being discouraging.
    - Keep your entire response to a maximum of two short sentences.
    - Respond in a friendly and professional tone.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Lo siento, encontré un error al evaluar tu respuesta. Por favor, inténtalo de nuevo.";
  }
};