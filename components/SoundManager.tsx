import React, { useCallback } from 'react';

// Using base64 data URIs for simple beeps to avoid external dependencies or 404s
const CORRECT_SOUND = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YXIGAACBhYqFbF1fdJivrJBhNjVgodDbqWE+QmCj1d+tYT5CYKPV361hPkJgo9XfrWE+QmCj1d+tYT5CYKPV361hPkJgo9XfrWE+QmCj1d+tYT5CYKPV361hPkJgo9XfrWE+Qg=="; // Placeholder short beep
const INCORRECT_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU..."; // Placeholder logic

// For a real app, we use Web Audio API for synthetic sounds to be robust
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

export const useSoundEffects = () => {
    const playCorrect = useCallback(() => {
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    }, []);

    const playIncorrect = useCallback(() => {
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    }, []);

    return { playCorrect, playIncorrect };
};
