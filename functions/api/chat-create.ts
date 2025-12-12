import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const chatResponseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        feedback: {
            type: SchemaType.STRING,
            description: "Concise feedback on the user's previous sentence, correcting grammar or suggesting more natural phrasing. If there are no errors, say something encouraging. This can be null if it's the first turn.",
        },
        english: {
            type: SchemaType.STRING,
            description: "The dialogue line in English.",
        },
        chinese: {
            type: SchemaType.STRING,
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
        const { level, theme } = await request.json();

        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: createSystemInstruction(level, theme),
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: chatResponseSchema,
            },
        });

        const chat = model.startChat();
        const result = await chat.sendMessage("Start the conversation.");
        const firstLine = JSON.parse(result.response.text());

        return new Response(JSON.stringify({
            success: true,
            firstMessage: firstLine
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error: any) {
        console.error("Error creating chat:", error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to create chat' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
