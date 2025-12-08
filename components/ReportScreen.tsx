import React, { useState, useEffect } from 'react';
import type { PracticeSettings, DialogueLine } from '../types';
import { generateReport } from '../services/geminiService';

interface ReportScreenProps {
    settings: PracticeSettings;
    conversation: DialogueLine[];
    onRestart: () => void;
}

const LoadingSpinner: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
        <p className="text-slate-300 text-lg">{text}</p>
    </div>
);

const ReportScreen: React.FC<ReportScreenProps> = ({ settings, conversation, onRestart }) => {
    const [report, setReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            setIsLoading(true);
            const generatedReport = await generateReport(conversation, settings);
            setReport(generatedReport);
            setIsLoading(false);
        };

        if (conversation.length > 0) {
            fetchReport();
        } else {
            setReport("沒有足夠的對話來生成報告。");
            setIsLoading(false);
        }
    }, [conversation, settings]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-3xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white">學習報告</h1>
                    <p className="text-slate-400 mt-2">這是您本次練習的總結</p>
                </header>
                
                <main className="bg-slate-800 p-6 sm:p-8 rounded-lg shadow-xl">
                    {isLoading ? (
                        <LoadingSpinner text="正在為您生成學習報告..." />
                    ) : (
                        <div className="text-slate-200 space-y-4 whitespace-pre-wrap font-mono">
                            {report}
                        </div>
                    )}
                </main>

                <footer className="text-center pt-8">
                    <button
                        onClick={onRestart}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-10 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-xl"
                    >
                        再練習一次
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ReportScreen;