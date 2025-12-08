import { GoogleGenerativeAI } from "@google/genai";

const chatResponseSchema = {
    type: Type.OBJECT,
    properties: {
        feedback: {
            type: Type.STRING,
            description: "Concise feedback on the user's previous sentence, correcting grammar or suggesting more natural phrasing. If there are no errors, say something encouraging. This can be null if it's the first turn.",
        },
        english: {
            type: Type.STRING,
            description: "The dialogue line in English.",
        },
        chinese: {
            type: Type.STRING,
            description: "The dialogue line in Traditional Chinese.",
        },
    },
    required: ["english", "chinese"],
};

const createSystemInstruction = (level: string, theme: string): string => {
    return `
        You are an English teacher conducting a practice conversation with a student in a language learning app.
        The user is a Traditional Chinese speaker.
        The conversation topic is: ${theme}.
        The student's English difficulty level is: ${level}.

        Your role is to lead the conversation naturally. Start with a greeting or a question.
        Keep your responses concise and engaging, like a real spoken conversation.
        Ask questions to encourage the user to speak.
        Wait for the user's response before continuing.
        
        After the user speaks, your response must do two things:
        1. (In the 'feedback' field) Provide brief, encouraging feedback on their sentence. Correct any grammatical errors or suggest more natural phrasing. If their English is perfect, give them a compliment.
        2. (In the 'english' and 'chinese' fields) Continue the conversation with your next line.

        IMPORTANT: Your entire response MUST be a single, valid JSON object that conforms to the required schema.
        Do not include any text, markdown, or formatting outside of the JSON object.
        The JSON object must contain "english", "chinese", and an optional "feedback" key.
    `;
};

export async function onRequest(context: any) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { message, level, theme, history } = await request.json();

        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const ai = new GoogleGenerativeAI({ apiKey });
        const systemInstruction = createSystemInstruction(level, theme);

        // Create a new chat with history
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: chatResponseSchema,
            },
            history: history || []
        });

        const response = await chat.sendMessage({ message });
        const aiResponse = JSON.parse(response.text);

        return new Response(JSON.stringify({
            success: true,
            response: aiResponse
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error: any) {
        console.error("Error sending message:", error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to send message' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
