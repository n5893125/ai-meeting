import { GoogleGenerativeAI } from "@google/generative-ai";

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

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const transcript = conversation.map(({ speaker, english }: any) => ({ speaker, english }));

        const prompt = `
            You are an English teacher writing a learning report for a student who has just finished a practice session.
            The student is a Traditional Chinese speaker.
            The conversation topic was: ${theme}.
            The student's difficulty level was: ${level}.

            Based on the following conversation transcript, provide a helpful and encouraging report in Traditional Chinese.

            The report should have the following sections, clearly formatted with headings:
            1.  **總結 (Summary):** A brief, positive summary of the student's performance.
            2.  **語法修正 (Grammar Corrections):** Point out 1-3 key grammatical mistakes. For each, show the original sentence, the corrected sentence, and a brief explanation in Chinese. If there were no major mistakes, praise them for their accuracy.
            3.  **詞彙與片語建議 (Vocabulary & Phrase Suggestions):** Suggest 1-3 alternative words or more natural phrases the student could have used.
            4.  **鼓勵的話 (Encouragement):** End with a short, encouraging message to motivate them for their next practice session.

            Keep the tone friendly and supportive.

            Here is the transcript:
            ${JSON.stringify(transcript, null, 2)}
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;

        return new Response(JSON.stringify({
            success: true,
            report: response.text()
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
