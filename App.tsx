import React, { useState } from 'react';
import SettingsScreen from './components/SettingsScreen';
import ConversationScreen from './components/ConversationScreen';
import ReportScreen from './components/ReportScreen';
import type { PracticeSettings, DialogueLine } from './types';

type AppView = 'settings' | 'conversation' | 'report';

const App: React.FC = () => {
    const [view, setView] = useState<AppView>('settings');
    const [settings, setSettings] = useState<PracticeSettings | null>(null);
    const [conversationHistory, setConversationHistory] = useState<DialogueLine[]>([]);

    const handleStartPractice = (newSettings: PracticeSettings) => {
        setSettings(newSettings);
        setConversationHistory([]);
        setView('conversation');
    };

    const handleFinishPractice = (conversation: DialogueLine[]) => {
        setConversationHistory(conversation);
        setView('report');
    };

    const handleRestart = () => {
        setSettings(null);
        setConversationHistory([]);
        setView('settings');
    };

    const renderContent = () => {
        switch (view) {
            case 'settings':
                return <SettingsScreen onStart={handleStartPractice} />;
            case 'conversation':
                if (settings) {
                    return <ConversationScreen settings={settings} onFinish={handleFinishPractice} />;
                }
                return null; // Should not happen
            case 'report':
                if (settings) {
                    return <ReportScreen settings={settings} conversation={conversationHistory} onRestart={handleRestart} />;
                }
                return null; // Should not happen
            default:
                return <SettingsScreen onStart={handleStartPractice} />;
        }
    };

    return (
        <div className="bg-slate-900 text-white font-sans">
            {renderContent()}
        </div>
    );
};

export default App;