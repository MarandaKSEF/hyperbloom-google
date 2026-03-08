import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  try {
    return process.env.GEMINI_API_KEY || "";
  } catch (e) {
    return "";
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const agriculturalAssistant = {
  async getAdvice(prompt: string, isPro: boolean = false, context?: any) {
    const model = isPro ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: `You are HYPERBLOOM ${isPro ? 'PRO' : ''}, an expert agricultural assistant for farmers in Sub-Saharan Africa. 
        ${isPro ? 'You are the advanced version of the assistant, providing deeper insights and more complex reasoning.' : 'You are the standard version of the assistant.'}
        Provide practical, localized, and timely advice on crop management, livestock health, pest control, and modern farming techniques.
        Keep your tone supportive, professional, and easy to understand.
        If the user asks about weather, pests, or vaccinations, provide specific actionable steps.
        Current context: ${JSON.stringify(context || {})}`,
      },
    });
    return response.text;
  },

  async generateAlerts(weatherData: any) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this weather data: ${JSON.stringify(weatherData)}, identify potential pest or disease risks for common crops in Sub-Saharan Africa (e.g., maize, cassava, beans). Return a JSON array of alerts.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "Pest or Disease" },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              severity: { type: Type.STRING, description: "Low, Medium, High" },
            },
            required: ["type", "title", "description", "severity"],
          },
        },
      },
    });
    return JSON.parse(response.text || "[]");
  },

  async getLearningContent(topic: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a short, educational guide for a farmer on the topic: ${topic}. Include 3-5 key modern practices.`,
    });
    return response.text;
  },

  async getWeatherHighlights(location: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3-5 current weather highlights for agricultural regions in ${location} and surrounding areas. 
      Include specific locations (towns/counties), the expected weather event (e.g., heavy rain, heatwave, strong winds), and its impact on farming.
      Return a JSON array of objects with 'location', 'lat', 'lon', 'event', 'impact', and 'severity' (Low, Medium, High).
      Example: { "location": "Siaya", "lat": 0.061, "lon": 34.288, "event": "Heavy Rainfall", "impact": "Potential for flash floods; ensure drainage is clear.", "severity": "High" }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              location: { type: Type.STRING },
              lat: { type: Type.NUMBER },
              lon: { type: Type.NUMBER },
              event: { type: Type.STRING },
              impact: { type: Type.STRING },
              severity: { type: Type.STRING },
            },
            required: ["location", "lat", "lon", "event", "impact", "severity"],
          },
        },
      },
    });
    return JSON.parse(response.text || "[]");
  }
};
