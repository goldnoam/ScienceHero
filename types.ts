
export interface GradeLevel {
    id: string;
    label: string; // e.g., "כיתה ג'"
    color: string; // Button styling
    cardTheme: string; // Topic card styling
}

export interface Topic {
    id: string;
    title: string;
    description: string;
    icon?: string;
    visualPrompt?: string; // English prompt for image generation
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export interface ContentData {
    topicTitle: string;
    introduction: string;
    demonstration: {
        title: string;
        description: string;
        visualPrompt: string; // For placeholder image
    };
    youtubeQueries: string[];
    quiz: QuizQuestion[];
}

export enum AppState {
    SELECT_GRADE = 'SELECT_GRADE',
    SELECT_TOPIC = 'SELECT_TOPIC',
    VIEW_CONTENT = 'VIEW_CONTENT'
}