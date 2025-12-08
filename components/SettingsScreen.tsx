import React, { useState } from 'react';
import type { PracticeSettings } from '../types';
import { PracticeLevel, PracticeTheme, PracticeDuration } from '../types';
import { LEVEL_OPTIONS, THEME_OPTIONS, DURATION_OPTIONS } from '../constants';

interface SettingsScreenProps {
    onStart: (settings: PracticeSettings) => void;
}

const SettingsCard: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-full">
        <h2 className="text-xl font-semibold text-cyan-400 mb-4">{title}</h2>
        {children}
    </div>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onStart }) => {
    const [level, setLevel] = useState<PracticeLevel>(PracticeLevel.Beginner);
    const [theme, setTheme] = useState<PracticeTheme>(PracticeTheme.Life);
    const [duration, setDuration] = useState<PracticeDuration>(PracticeDuration.Short);

    const handleStart = () => {
        onStart({ level, theme, duration });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-4xl mx-auto space-y-8">
                <header className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-white">英語口說練習</h1>
                    <p className="text-slate-400 mt-2">請選擇您的練習設定</p>
                </header>

                <div className="space-y-6">
                    <SettingsCard title="1. 選擇課程時長">
                        <div className="flex flex-wrap gap-3">
                            {DURATION_OPTIONS.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDuration(d)}
                                    className={`px-4 py-2 rounded-md transition-colors text-sm sm:text-base ${duration === d ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </SettingsCard>

                    <SettingsCard title="2. 選擇難度級別">
                         <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value as PracticeLevel)}
                                className="w-full bg-slate-700 text-white p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            >
                                {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </SettingsCard>

                    <SettingsCard title="3. 選擇對話主題">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {/* FIX: Destructure `icon` as `Icon` and render it as a component, as it is now a function reference. */}
                            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setTheme(value)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 transform border-2 ${theme === value ? 'bg-slate-700 border-cyan-500 scale-105 shadow-lg' : 'bg-slate-700/50 border-transparent hover:bg-slate-700'}`}
                                >
                                    <span className={theme === value ? 'text-cyan-400' : 'text-slate-300'}><Icon /></span>
                                    <span className="mt-2 text-sm text-center">{label}</span>
                                </button>
                            ))}
                        </div>
                    </SettingsCard>
                </div>
                
                <div className="text-center pt-4">
                    <button
                        onClick={handleStart}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-10 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-xl"
                    >
                        開始練習
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;
