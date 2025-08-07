"use client";

import { useEffect, useRef, useCallback } from "react";

export type SoundType = "battleStart" | "hit" | "victory" | "defeat" | "buttonClick" | "error";

interface SoundConfig {
  volume?: number;
  loop?: boolean;
}

// Placeholder for sound file paths - these would be actual audio files in production
const SOUND_PATHS: Record<SoundType, string> = {
  battleStart: "/sounds/battle-start.mp3",
  hit: "/sounds/hit.mp3",
  victory: "/sounds/victory.mp3",
  defeat: "/sounds/defeat.mp3",
  buttonClick: "/sounds/button-click.mp3",
  error: "/sounds/error.mp3",
};

export function useBattleSound() {
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({} as any);
  const isEnabled = useRef(true); // Could be connected to user settings
  
  // Initialize audio elements
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Check if user has enabled sound in settings
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    isEnabled.current = soundEnabled;
    
    // Pre-load audio files
    Object.entries(SOUND_PATHS).forEach(([type, path]) => {
      try {
        const audio = new Audio(path);
        audio.preload = "auto";
        audioRefs.current[type as SoundType] = audio;
      } catch (error) {
        console.warn(`Failed to load sound: ${type}`, error);
      }
    });
    
    return () => {
      // Cleanup audio elements
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
    };
  }, []);
  
  const playSound = useCallback((type: SoundType, config?: SoundConfig) => {
    if (!isEnabled.current) return;
    
    const audio = audioRefs.current[type];
    if (!audio) return;
    
    try {
      // Reset and configure audio
      audio.currentTime = 0;
      audio.volume = config?.volume ?? 0.5;
      audio.loop = config?.loop ?? false;
      
      // Play the sound
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn(`Failed to play sound: ${type}`, error);
        });
      }
    } catch (error) {
      console.warn(`Error playing sound: ${type}`, error);
    }
  }, []);
  
  const stopSound = useCallback((type: SoundType) => {
    const audio = audioRefs.current[type];
    if (!audio) return;
    
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (error) {
      console.warn(`Error stopping sound: ${type}`, error);
    }
  }, []);
  
  const stopAllSounds = useCallback(() => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (error) {
          console.warn("Error stopping sound", error);
        }
      }
    });
  }, []);
  
  const toggleSound = useCallback((enabled?: boolean) => {
    const newState = enabled ?? !isEnabled.current;
    isEnabled.current = newState;
    localStorage.setItem("soundEnabled", String(newState));
    
    if (!newState) {
      stopAllSounds();
    }
    
    return newState;
  }, [stopAllSounds]);
  
  return {
    playSound,
    stopSound,
    stopAllSounds,
    toggleSound,
    isSoundEnabled: isEnabled.current,
  };
}

// Hook for button click sounds
export function useButtonSound() {
  const { playSound } = useBattleSound();
  
  return useCallback(() => {
    playSound("buttonClick", { volume: 0.3 });
  }, [playSound]);
}

// Hook for battle-specific sounds
export function useBattleEffects() {
  const { playSound, stopSound } = useBattleSound();
  
  const playBattleStart = useCallback(() => {
    playSound("battleStart", { volume: 0.6 });
  }, [playSound]);
  
  const playHit = useCallback(() => {
    playSound("hit", { volume: 0.4 });
  }, [playSound]);
  
  const playVictory = useCallback(() => {
    playSound("victory", { volume: 0.7 });
  }, [playSound]);
  
  const playDefeat = useCallback(() => {
    playSound("defeat", { volume: 0.5 });
  }, [playSound]);
  
  return {
    playBattleStart,
    playHit,
    playVictory,
    playDefeat,
  };
}