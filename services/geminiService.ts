import type { PracticeSettings, DialogueLine } from '../types';

// API base URL - will use relative paths in production
const API_BASE = '/api';

// Function to generate an AI teacher image
export const generateTeacherImage = async (): Promise<string> => {
    try {
        const response = await fetch(`${API_BASE}/generate-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to generate image');
        }

        const data = await response.json();
        return data.imageUrl;
    } catch (error) {
        console.error("Error generating teacher image:", error);
        return "";
    }
};

// Chat interface to maintain compatibility with existing code
export class Chat {
    private level: string;
    private theme: string;
    private history: any[] = [];

    constructor(level: string, theme: string) {
        this.level = level;
        this.theme = theme;
    }

    async sendMessage({ message }: { message: string }): Promise<{ text: string }> {
        try {
            const response = await fetch(`${API_BASE}/chat-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    level: this.level,
                    theme: this.theme,
                    history: this.history
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();

            // Update history
            this.history.push({ role: 'user', parts: [{ text: message }] });
            this.history.push({ role: 'model', parts: [{ text: JSON.stringify(data.response) }] });

            return { text: JSON.stringify(data.response) };
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    }
}

// AI service object to maintain compatibility
export const ai = {
    chats: {
        create: ({ config }: { model: string; config: any }) => {
            // Extract settings from system instruction
            // This is a simplified approach - in production you'd parse this properly
            return new Chat('intermediate', 'general');
        }
    }
};

// Initialize chat with settings
export const createChat = async (settings: PracticeSettings): Promise<{ chat: Chat; firstMessage: any }> => {
    try {
        const response = await fetch(`${API_BASE}/chat-create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                level: settings.level,
                theme: settings.theme
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create chat');
        }

        const data = await response.json();
        const chat = new Chat(settings.level, settings.theme);

        return {
            chat,
            firstMessage: data.firstMessage
        };
    } catch (error) {
        console.error("Error creating chat:", error);
        throw error;
    }
};

export const generateReport = async (conversation: DialogueLine[], settings: PracticeSettings): Promise<string> => {
    try {
        const response = await fetch(`${API_BASE}/generate-report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversation,
                level: settings.level,
                theme: settings.theme
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate report');
        }

        const data = await response.json();
        return data.report;
    } catch (error) {
        console.error("Error generating report:", error);
        return "抱歉，產生學習報告時發生錯誤。請稍後再試。";
    }
};

// Export schema for compatibility (not used in frontend anymore)
export const chatResponseSchema = {};
export const createSystemInstruction = (settings: PracticeSettings): string => '';