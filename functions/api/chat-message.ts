import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const chatResponseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        feedback: {
            type: SchemaType.STRING,
            description: "Concise feedback on the user's previous sentence.",
            nullable: true
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
    return \
        You are an English teacher conducting a practice conversation with a student.
        Topic: \. Level: \.
        Respond in JSON format with 'feedback', 'english', and 'chinese'.
    \;
};

export async function onRequest(context: any) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { message, history, level, theme } = await request.json();

        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) { throw new Error('API key not configured'); }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: createSystemInstruction(level, theme),
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: chatResponseSchema,
            }
        });

        // Convert history to Gemini format if needed, or start new chat
        // For simplicity in this stateless function, we might just send the history as context
        // But startChat expects history in a specific format.
        // Simplified approach:
        const chat = model.startChat({
             history: history ? history.map((h: any) => ({
                 role: h.role === 'user' ? 'user' : 'model',
                 parts: [{ text: JSON.stringify(h.parts || h.text || h) }] 
             })) : []
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();
        const responseJson = JSON.parse(responseText);

        return new Response(JSON.stringify({
            success: true,
            message: responseJson
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
