'use client';

import { useEffect, useRef } from 'react';

export function useBattleSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // AudioContext를 한 번만 생성
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 승리 사운드: 짠짜자잔 ~~
  const playVictorySound = () => {
    if (!audioContextRef.current) return;
    
    const audioContext = audioContextRef.current;
    const currentTime = audioContext.currentTime;
    
    // 승리 팡파레 사운드 생성
    const notes = [
      { frequency: 523.25, duration: 0.2, time: 0 },     // C5
      { frequency: 523.25, duration: 0.1, time: 0.2 },   // C5
      { frequency: 523.25, duration: 0.1, time: 0.3 },   // C5
      { frequency: 659.25, duration: 0.4, time: 0.4 },   // E5
      { frequency: 783.99, duration: 0.2, time: 0.8 },   // G5
      { frequency: 783.99, duration: 0.6, time: 1.0 },   // G5 (길게)
    ];

    notes.forEach(note => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(note.frequency, currentTime + note.time);
      
      // 볼륨 엔벨로프
      gainNode.gain.setValueAtTime(0, currentTime + note.time);
      gainNode.gain.linearRampToValueAtTime(0.3, currentTime + note.time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.time + note.duration);
      
      oscillator.start(currentTime + note.time);
      oscillator.stop(currentTime + note.time + note.duration);
    });
    
    // 추가 화음 효과
    const chord = audioContext.createOscillator();
    const chordGain = audioContext.createGain();
    chord.connect(chordGain);
    chordGain.connect(audioContext.destination);
    
    chord.type = 'sine';
    chord.frequency.setValueAtTime(1046.5, currentTime + 0.8); // C6
    chordGain.gain.setValueAtTime(0.15, currentTime + 0.8);
    chordGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 1.6);
    
    chord.start(currentTime + 0.8);
    chord.stop(currentTime + 1.6);
  };

  // 패배 사운드: 띠유우웅 ~~~
  const playDefeatSound = () => {
    if (!audioContextRef.current) return;
    
    const audioContext = audioContextRef.current;
    const currentTime = audioContext.currentTime;
    
    // 슬픈 하강 멜로디
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    
    // 주파수 하강 (띠유우웅 효과)
    oscillator.frequency.setValueAtTime(440, currentTime);           // A4
    oscillator.frequency.linearRampToValueAtTime(330, currentTime + 0.3);  // E4
    oscillator.frequency.linearRampToValueAtTime(220, currentTime + 0.8);  // A3
    oscillator.frequency.linearRampToValueAtTime(165, currentTime + 1.2);  // E3
    
    // 볼륨 페이드 아웃
    gainNode.gain.setValueAtTime(0.3, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 1.5);
    
    oscillator.start(currentTime);
    oscillator.stop(currentTime + 1.5);
    
    // 추가 낮은 음 효과
    const bassOsc = audioContext.createOscillator();
    const bassGain = audioContext.createGain();
    
    bassOsc.connect(bassGain);
    bassGain.connect(audioContext.destination);
    
    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(110, currentTime + 0.2);  // A2
    bassOsc.frequency.linearRampToValueAtTime(55, currentTime + 1.3);   // A1
    
    bassGain.gain.setValueAtTime(0, currentTime + 0.2);
    bassGain.gain.linearRampToValueAtTime(0.15, currentTime + 0.4);
    bassGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 1.5);
    
    bassOsc.start(currentTime + 0.2);
    bassOsc.stop(currentTime + 1.5);
  };

  // 배틀 시작 사운드
  const playBattleStartSound = () => {
    if (!audioContextRef.current) return;
    
    const audioContext = audioContextRef.current;
    const currentTime = audioContext.currentTime;
    
    // 전투 시작 알림음
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(220, currentTime);
    oscillator.frequency.linearRampToValueAtTime(440, currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
    
    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.2);
  };

  return {
    playVictorySound,
    playDefeatSound,
    playBattleStartSound
  };
}