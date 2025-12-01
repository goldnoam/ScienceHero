import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Topic, ContentData } from "../types";

const modelName = 'gemini-2.5-flash';

// Schema for generating a list of topics
const topicListSchema: Schema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            icon: { type: Type.STRING, description: "A simple emoji representing the topic" },
            visualPrompt: { type: Type.STRING, description: "A concise English visual description of the topic for image generation (e.g., 'A microscope on a lab table', 'The solar system')." }
        },
        required: ["id", "title", "description", "icon", "visualPrompt"]
    }
};

// Schema for generating full content for a topic
const contentSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        topicTitle: { type: Type.STRING },
        introduction: { type: Type.STRING, description: "A comprehensive scientific explanation suitable for the specific grade level (approx 150 words)." },
        demonstration: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING, description: "Instructions on how to perform a simple experiment or a description of a real-world phenomenon." },
                visualPrompt: { type: Type.STRING, description: "A short English prompt to generate a placeholder image for this demo." }
            },
            required: ["title", "description", "visualPrompt"]
        },
        youtubeQueries: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3 specific search queries in Hebrew to find educational videos on YouTube about this topic."
        },
        quiz: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctIndex", "explanation"]
            },
            description: "5 multiple choice questions."
        }
    },
    required: ["topicTitle", "introduction", "demonstration", "youtubeQueries", "quiz"]
};

const getClient = () => {
    // Falls back to a specific logic if process.env.API_KEY is missing but managed externally
    const apiKey = process.env.API_KEY; 
    // If running in an environment where the key is injected but not in process.env directly,
    // the SDK might handle it, or we rely on the caller to ensure it works.
    return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const fetchTopicsForGrade = async (gradeLabel: string): Promise<Topic[]> => {
    try {
        const ai = getClient();
        // Updated prompt to be specific about Israeli Curriculum
        const prompt = `Generate a list of 8 key Science and Technology topics for ${gradeLabel} strictly according to the Israeli Ministry of Education curriculum (Toshba/Matar). 
        
        Guidelines:
        - Content must be accurate for the Israeli curriculum.
        - For "כיתה ה'" (Grade 5), include topics like "סוגי קרקעות" (Soil types), "משאבי טבע", "אנרגיה", etc.
        - For "כיתה ג'" (Grade 3), include topics like "חומרים ותכונותיהם", "עולם היצורים החיים".
        - Output strictly in Hebrew.
        - Provide a concise description for each topic.
        
        Return JSON matching the schema.`;
        
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: topicListSchema
            }
        });

        const text = response.text;
        if (!text) return [];
        return JSON.parse(text) as Topic[];
    } catch (error) {
        console.error("Error fetching topics:", error);
        // Fallback for demo purposes if API fails/missing
        if (gradeLabel.includes("ה'")) {
             return [
                { id: '1', title: 'סוגי קרקעות', description: 'הכרת מרכיבי הקרקע, סוגי קרקעות שונים (חולית, חרסיתית, כבודה) ותכונותיהן.', icon: '🪨', visualPrompt: 'Layers of soil cross section earth science' },
                { id: '2', title: 'אנרגיה ושימושיה', description: 'סוגי אנרגיה, המרות אנרגיה ומקורות אנרגיה מתחדשים ומתכלים.', icon: '⚡', visualPrompt: 'Solar panels and wind turbines energy concept' },
                { id: '3', title: 'מערכת השמש', description: 'הכרת כוכבי הלכת, השמש והירח, ותנועות בחלל.', icon: '🪐', visualPrompt: 'Solar system planets orbiting sun' },
                { id: '4', title: 'המים בכדור הארץ', description: 'מחזור המים בטבע, חשיבות המים ליצורים חיים וחיסכון במים.', icon: '💧', visualPrompt: 'Water cycle nature illustration rain clouds' },
            ];
        }
        return [];
    }
};

export const fetchContentForTopic = async (topicTitle: string, gradeLabel: string): Promise<ContentData | null> => {
    try {
        const ai = getClient();
        const prompt = `Create a comprehensive learning unit for the topic "${topicTitle}" for students in ${gradeLabel}. 
        
        Guidelines:
        - Based on the Israeli Ministry of Education curriculum.
        - The entire content must be in Hebrew.
        - Introduction: Clear scientific explanation adapted to the age group.
        - Demonstration: A simple classroom or home experiment, or a clear observation task.
        - Quiz: 5 questions testing understanding of the core concepts.
        `;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: contentSchema
            }
        });

        const text = response.text;
        if (!text) return null;
        return JSON.parse(text) as ContentData;
    } catch (error) {
        console.error("Error fetching content:", error);
        return null;
    }
};