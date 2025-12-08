import { GoogleGenerativeAI } from "@google/generative-ai";

export async function onRequest(context: any) {
    const { request, env } = context;
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    try {
        const { history } = await request.json();
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('API key not configured');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = \Analyze this conversation history and provide a learning report: \\;
        const result = await model.generateContent(prompt);
        const report = result.response.text();

        return new Response(JSON.stringify({ success: true, report }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
