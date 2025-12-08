import { GoogleGenAI } from "@google/generative-ai";

export async function onRequest(context: any) {
    const { request, env } = context;
    
    // Only allow POST requests
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: 'A friendly and welcoming English teacher, digital art style, looking directly at the camera, head and shoulders portrait, neutral background.',
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });
        
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        const imageDataUrl = `data:image/png;base64,${base64ImageBytes}`;
        
        return new Response(JSON.stringify({ imageUrl: imageDataUrl }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error: any) {
        console.error("Error generating teacher image:", error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to generate image' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
