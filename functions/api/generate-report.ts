import { GoogleGenerativeAI } from "@google/genai";

export async function onRequest(context: any) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { conversation, level, theme } = await request.json();

        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const ai = new GoogleGenerativeAI({ apiKey });
        const transcript = conversation.map(({ speaker, english }: any) => ({ speaker, english }));

        const prompt = `
            You are an English teacher writing a learning report for a student who has just finished a practice session.
            The student is a Traditional Chinese speaker.
            The conversation topic was: ${theme}.
            The student's difficulty level was: ${level}.

            Based on the following conversation transcript, provide a helpful and encouraging report in Traditional Chinese.

            The report should have the following sections, clearly formatted with headings:
            1.  **ç¸½ç? (Summary):** A brief, positive summary of the student's performance.
            2.  **èªžæ?ä¿®æ­£ (Grammar Corrections):** Point out 1-3 key grammatical mistakes. For each, show the original sentence, the corrected sentence, and a brief explanation in Chinese. If there were no major mistakes, praise them for their accuracy.
            3.  **è©žå??‡ç?èªžå»ºè­?(Vocabulary & Phrase Suggestions):** Suggest 1-3 alternative words or more natural phrases the student could have used.
            4.  **é¼“å‹µ?„è©± (Encouragement):** End with a short, encouraging message to motivate them for their next practice session.

            Keep the tone friendly and supportive.

            Here is the transcript:
            ${JSON.stringify(transcript, null, 2)}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return new Response(JSON.stringify({
            success: true,
            report: response.text
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error: any) {
        console.error("Error generating report:", error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to generate report' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
