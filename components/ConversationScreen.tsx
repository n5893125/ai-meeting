import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateTeacherImage, createChat, Chat } from '../services/geminiService';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import type { PracticeSettings, DialogueLine } from '../types';

interface ConversationScreenProps {
    settings: PracticeSettings;
    onFinish: (conversation: DialogueLine[]) => void;
}

const LoadingSpinner: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
        <p className="text-slate-300 text-lg">{text}</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string; onRetry: () => void; }> = ({ message, onRetry }) => (
    <div className="text-center bg-red-900/50 border border-red-700 p-6 rounded-lg">
        <p className="text-red-400 mb-4">{message}</p>
        <button onClick={onRetry} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded">
            重試
        </button>
    </div>
);

const ConversationScreen: React.FC<ConversationScreenProps> = ({ settings, onFinish }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [conversation, setConversation] = useState<DialogueLine[]>([]);
    const [loadingMessage, setLoadingMessage] = useState("正在初始化...");
    const [teacherImageUrl, setTeacherImageUrl] = useState<string | null>(null);
    const [isWaitingForAI, setIsWaitingForAI] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);

    const { voices, speak, cancel, isSpeaking } = useSpeechSynthesis();
    const [teacherVoice, setTeacherVoice] = useState<SpeechSynthesisVoice | null>(null);
    const conversationEndRef = useRef<HTMLDivElement>(null);

    const handleUserSpeech = async (transcript: string) => {
        if (!transcript || isWaitingForAI || !chat) return;

        const userLine: DialogueLine = { speaker: 'B', english: transcript };
        setConversation(prev => [...prev, userLine]);
        setIsWaitingForAI(true);

        try {
            const response = await chat.sendMessage({ message: transcript });
            const aiResponse = JSON.parse(response.text);
            const { feedback, english, chinese } = aiResponse;

            if (feedback) {
                setConversation(prev => {
                    const newConversation = [...prev];
                    let lastUserLineIndex = -1;
                    for (let i = newConversation.length - 1; i >= 0; i--) {
                        if (newConversation[i].speaker === 'B') {
                            lastUserLineIndex = i;
                            break;
                        }
                    }
                    if (lastUserLineIndex !== -1) {
                        newConversation[lastUserLineIndex] = { ...newConversation[lastUserLineIndex], feedback };
                    }
                    return newConversation;
                });
            }

            const teacherLine: DialogueLine = { speaker: 'A', english, chinese };
            setConversation(prev => [...prev, teacherLine]);
            speak(teacherLine.english, teacherVoice);

        } catch (err) {
            console.error("Error sending message to Gemini:", err);
            const errorLine: DialogueLine = { speaker: 'A', english: "Sorry, I had a problem responding. Please try again.", chinese: "抱歉，我回應時發生問題，請再試一次。" };
            setConversation(prev => [...prev, errorLine]);
            speak(errorLine.english, teacherVoice);
        } finally {
            setIsWaitingForAI(false);
        }
    };

    const { isListening, startListening, stopListening, error: recognitionError } = useSpeechRecognition(handleUserSpeech);

    const initializeSession = useCallback(async () => {
        setLoadingMessage("正在為您生成 AI 老師...");
        setIsWaitingForAI(true);
        setError(null);
        setConversation([]);

        const imageUrl = await generateTeacherImage();
        if (!imageUrl) {
            setError("無法生成老師圖像，請稍後再試。");
            setIsWaitingForAI(false);
            return;
        }
        setTeacherImageUrl(imageUrl);

        setLoadingMessage("正在連接對話...");

        try {
            const { chat: newChat, firstMessage } = await createChat(settings);
            setChat(newChat);

            const teacherLine: DialogueLine = { speaker: 'A', ...firstMessage };
            setConversation([teacherLine]);
            speak(teacherLine.english, teacherVoice);

        } catch (err) {
            setError("無法開始對話,請稍後再試。");
            console.error(err);
        } finally {
            setIsWaitingForAI(false);
        }
    }, [settings, teacherVoice, speak]);

    useEffect(() => {
        if (voices.length > 0 && !teacherVoice) {
            const preferredVoices = voices.filter(v => v.lang.startsWith('en-US'));
            const randomVoice = preferredVoices[Math.floor(Math.random() * preferredVoices.length)] || voices[0];
            setTeacherVoice(randomVoice);
        }
    }, [voices, teacherVoice]);

    useEffect(() => {
        if (teacherVoice) {
            initializeSession();
        }
        return () => {
            cancel();
        };
    }, [settings, teacherVoice, initializeSession, cancel]);

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    if (!teacherImageUrl && !error) {
        return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner text={loadingMessage} /></div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center p-4"><ErrorDisplay message={error} onRetry={initializeSession} /></div>;
    }

    const lastTeacherLine = [...conversation].reverse().find(line => line.speaker === 'A');

    return (
        <div className="min-h-screen flex flex-col md:flex-row max-w-7xl mx-auto p-4 sm:p-6 gap-6">
            {/* Left Column: Teacher Panel */}
            <aside className="w-full md:w-2/5 flex-shrink-0 flex flex-col items-center bg-slate-800 rounded-xl shadow-xl p-6">
                <div className="w-full max-w-[250px] md:max-w-xs aspect-square mb-6">
                    {teacherImageUrl && (
                        <img src={teacherImageUrl} alt="AI Teacher" className="w-full h-full object-cover rounded-full shadow-2xl border-4 border-cyan-500/50" />
                    )}
                </div>
                <div className="text-center w-full">
                    <p className="text-sm text-slate-400 mb-2">AI 老師</p>
                    {isWaitingForAI && conversation.length === 0 ? (
                        <div className="flex justify-center items-center gap-2">
                            <span className="animate-pulse">...</span>
                            <p className="text-slate-300">正在準備中</p>
                        </div>
                    ) : (
                        <div className="bg-slate-900/50 p-4 rounded-lg min-h-[120px] flex flex-col justify-center">
                            <p className="text-2xl font-bold">{lastTeacherLine?.english}</p>
                            <p className="text-slate-300 mt-1">{lastTeacherLine?.chinese}</p>
                        </div>
                    )}
                </div>
                <div className="w-full mt-auto pt-6">
                    <button onClick={() => onFinish(conversation)} className="w-full text-center bg-slate-700 hover:bg-slate-600 text-cyan-400 font-semibold py-3 rounded-lg transition">&larr; 結束練習並查看報告</button>
                </div>
            </aside>

            {/* Right Column: Conversation & Controls */}
            <div className="w-full md:w-3/5 flex flex-col">
                <header className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div className="text-left">
                        <h1 className="text-2xl font-bold">{settings.theme}</h1>
                        <p className="text-sm text-slate-400">{settings.level} / {settings.duration}</p>
                    </div>
                </header>

                <main className="flex-grow flex flex-col bg-slate-800 rounded-lg shadow-xl p-4 sm:p-6 overflow-hidden">
                    {/* Transcript Area */}
                    <div className={`flex-grow mb-4 overflow-y-auto pr-2 ${isTranscriptVisible ? 'max-h-full' : 'max-h-0 overflow-hidden'}`}>
                        <h3 className="text-lg font-semibold text-cyan-400 mb-2 border-b border-slate-700 pb-2">對話逐字稿</h3>
                        <div className="space-y-4">
                            {conversation.map((line, index) => (
                                <div key={index}>
                                    <div className={`flex items-end gap-3 ${line.speaker === 'B' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${line.speaker === 'A' ? 'bg-cyan-600' : 'bg-green-600'}`}>
                                            {line.speaker === 'A' ? 'A' : 'B'}
                                        </div>
                                        <div className={`p-3 rounded-lg max-w-[80%] ${line.speaker === 'A' ? 'bg-slate-700/80' : 'bg-slate-700'}`}>
                                            <p className="text-slate-100">{line.english}</p>
                                            {line.chinese && <p className="text-sm text-slate-400 mt-1">{line.chinese}</p>}
                                        </div>
                                    </div>
                                    {line.speaker === 'B' && line.feedback && (
                                        <div className={`flex justify-end mt-2 mr-11`}>
                                            <div className="bg-amber-800/60 text-amber-200 text-xs p-2 rounded-lg max-w-[80%] border border-amber-700/80">
                                                <span className="font-bold">💡 老師建議：</span>{line.feedback}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={conversationEndRef} />
                        </div>
                    </div>

                    {/* Controls Area */}
                    <div className="mt-auto pt-6 border-t border-slate-700">
                        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg text-center">
                            <h4 className="font-semibold mb-2">換你說了！</h4>
                            <p className="text-sm text-slate-400 mb-4">點擊麥克風按鈕，然後說出您的回應。</p>
                            <button
                                onClick={isListening ? stopListening : startListening}
                                disabled={isWaitingForAI || isSpeaking}
                                className={`p-4 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed ${isListening ? 'bg-red-600 animate-pulse' : 'bg-green-600 hover:bg-green-500'}`}
                            >
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z"></path><path fillRule="evenodd" d="M5.5 8.5a.5.5 0 01.5.5v1.5a4 4 0 004 4h0a4 4 0 004-4V9a.5.5 0 011 0v1.5a5 5 0 01-4.5 4.975V17h3a.5.5 0 010 1h-7a.5.5 0 010-1h3v-1.525A5 5 0 014.5 10.5V9a.5.5 0 01.5-.5z" clipRule="evenodd"></path></svg>
                            </button>
                            {isWaitingForAI && conversation.length > 0 && <p className="mt-2 text-sm text-slate-300 animate-pulse">老師正在思考中...</p>}
                            {recognitionError && <p className="mt-2 text-sm text-red-400">{recognitionError}</p>}
                        </div>
                    </div>
                </main>

                <footer className="mt-4 flex flex-wrap justify-center items-center gap-4 flex-shrink-0">
                    <button onClick={() => setIsTranscriptVisible(!isTranscriptVisible)} className="bg-slate-700 hover:bg-slate-600 py-2 px-4 rounded-md">
                        {isTranscriptVisible ? '隱藏逐字稿' : '顯示逐字稿'}
                    </button>
                    <button onClick={initializeSession} className="bg-slate-700 hover:bg-slate-600 py-2 px-4 rounded-md">
                        重新開始
                    </button>
                    <div className="w-full sm:w-auto">
                        <select
                            value={teacherVoice?.name}
                            onChange={(e) => {
                                const newVoice = voices.find(v => v.name === e.target.value) || null;
                                setTeacherVoice(newVoice);
                            }}
                            className="bg-slate-700 text-white p-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none w-full"
                        >
                            <option value="">更換老師聲音</option>
                            {voices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                        </select>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ConversationScreen;