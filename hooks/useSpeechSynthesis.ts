
import { useState, useEffect, useCallback } from 'react';

export const useSpeechSynthesis = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingText, setSpeakingText] = useState<string | null>(null);

    const populateVoiceList = useCallback(() => {
        const newVoices = window.speechSynthesis.getVoices();
        const englishVoices = newVoices.filter(voice => voice.lang.startsWith('en-'));
        setVoices(englishVoices);
    }, []);

    useEffect(() => {
        populateVoiceList();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = populateVoiceList;
        }
    }, [populateVoiceList]);

    const speak = useCallback((text: string, voice: SpeechSynthesisVoice | null) => {
        if (!text) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        if (voice) {
            utterance.voice = voice;
        }
        utterance.onstart = () => {
            setIsSpeaking(true);
            setSpeakingText(text);
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            setSpeakingText(null);
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            setSpeakingText(null);
        };
        window.speechSynthesis.speak(utterance);
    }, []);

    const cancel = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setSpeakingText(null);
    }, []);

    return { voices, speak, cancel, isSpeaking, speakingText };
};
