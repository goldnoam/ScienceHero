import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Topic, ContentData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const fetchTopicsForGrade = async (gradeLabel: string): Promise<Topic[]> => {
    try {
        const prompt = `Generate a list of 8 key Science and Technology topics for ${gradeLabel} according to the Israeli Ministry of Education curriculum. Focus on core scientific concepts. Return JSON.`;
        
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
        return [];
    }
};

export const fetchContentForTopic = async (topicTitle: string, gradeLabel: string): Promise<ContentData | null> => {
    try {
        const prompt = `Create a comprehensive learning unit for the topic "${topicTitle}" for students in ${gradeLabel}. 
        The content must be in Hebrew. 
        Include an introduction, a demonstration idea, 3 youtube search queries, and a 5-question quiz.`;

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