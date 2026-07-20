import type { GameState } from '../Chess.ts';

export type SoundEvent = 'move' | 'capture' | 'check' | 'checkmate';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return null;
    try {
      audioCtx = new AudioContextCtor();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function tone(freq: number, startOffset: number, duration: number, type: OscillatorType, peakGain: number) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;

  const startTime = ctx.currentTime + startOffset;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function playSound(event: SoundEvent, enabled: boolean) {
  if (!enabled) return;
  switch (event) {
    case 'move':
      tone(520, 0, 0.09, 'sine', 0.12);
      break;
    case 'capture':
      tone(300, 0, 0.06, 'square', 0.1);
      tone(170, 0.035, 0.09, 'square', 0.1);
      break;
    case 'check':
      tone(880, 0, 0.08, 'sawtooth', 0.11);
      tone(880, 0.12, 0.08, 'sawtooth', 0.11);
      break;
    case 'checkmate':
      tone(660, 0, 0.12, 'sawtooth', 0.14);
      tone(520, 0.12, 0.12, 'sawtooth', 0.14);
      tone(390, 0.24, 0.28, 'sawtooth', 0.14);
      break;
  }
}

/** Figures out which sound to play by diffing two consecutive game states. */
export function soundEventForTransition(before: GameState, after: GameState): SoundEvent {
  if (after.status === 'checkmate') return 'checkmate';
  const capturedBefore = before.capturedByWhite.length + before.capturedByBlack.length;
  const capturedAfter = after.capturedByWhite.length + after.capturedByBlack.length;
  const captured = capturedAfter > capturedBefore;
  if (after.status === 'check') return 'check';
  return captured ? 'capture' : 'move';
}