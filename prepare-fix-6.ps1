
$source = Get-Location
$dest = "C:\Users\kyhsu\AiMeeting_Fix6"

Write-Host "Preparing FIXED source code (Round 6 - Syntax Fix) for GitHub upload..." -ForegroundColor Cyan
Write-Host "Source: $source"
Write-Host "Destination: $dest"

# Clean destination
if (Test-Path $dest) {
    Remove-Item -Path $dest -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -Path $dest -ItemType Directory -Force | Out-Null

# Copy all files first
Get-ChildItem -Path $source | ForEach-Object {
    $name = $_.Name
    if ($name -eq "node_modules" -or $name -eq ".git" -or $name -eq ".wrangler" -or $name -eq "dist" -or $name -eq "deploy-local-copy.ps1" -or $name -eq "wrangler.toml") {
        return
    }
    Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
}

Set-Location $dest

# --- REWRITE FILES WITH SAFER STRING SYNTAX ---

# 1. functions/api/chat-create.ts
$chatCreateContent = @"
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
    return "You are an English teacher conducting a practice conversation with a student in a language learning app.\\n" +
           "The user is a Traditional Chinese speaker.\\n" +
           "The conversation topic is: " + theme + ".\\n" +
           "The student's English difficulty level is: " + level + ".\\n\\n" +
           "Your role is to lead the conversation naturally. Start with a greeting or a question.\\n" +
           "Keep your responses concise and engaging, like a real spoken conversation.\\n" +
           "Ask questions to encourage the user to speak.\\n" +
           "Wait for the user's response before continuing.\\n\\n" +
           "After the user speaks, your response must do two things:\\n" +
           "1. (In the 'feedback' field) Provide brief, encouraging feedback on their sentence. Correct any grammatical errors or suggest more natural phrasing. If their English is perfect, give them a compliment.\\n" +
           "2. (In the 'english' and 'chinese' fields) Continue the conversation with your next line.\\n\\n" +
           "IMPORTANT: Your entire response MUST be a single, valid JSON object that conforms to the required schema.\\n" +
           "Do not include any text, markdown, or formatting outside of the JSON object.";
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
            model: "gemini-1.5-flash",
            systemInstruction: createSystemInstruction(level, theme),
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: chatResponseSchema,
            }
        });

        const chat = model.startChat();
        const result = await chat.sendMessage("Start the conversation.");
        const responseText = result.response.text();
        const firstLine = JSON.parse(responseText);

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
"@
Set-Content -Path "functions/api/chat-create.ts" -Value $chatCreateContent

# 2. functions/api/chat-message.ts
$chatMessageContent = @"
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
    return "You are an English teacher conducting a practice conversation with a student.\\n" +
           "Topic: " + theme + ". Level: " + level + ".\\n" +
           "Respond in JSON format with 'feedback', 'english', and 'chinese'.";
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
"@
Set-Content -Path "functions/api/chat-message.ts" -Value $chatMessageContent

# 3. functions/api/generate-report.ts
$genReportContent = @"
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

        const prompt = "Analyze this conversation history and provide a learning report: " + JSON.stringify(history);
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
"@
Set-Content -Path "functions/api/generate-report.ts" -Value $genReportContent

Write-Host "Done! 'AiMeeting_Fix6' folder is ready." -ForegroundColor Green
Write-Host "Please upload content of C:\Users\kyhsu\AiMeeting_Fix6 to GitHub." -ForegroundColor Yellow
Invoke-Item .
