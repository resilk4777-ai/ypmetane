let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  gain: number,
  type: OscillatorType = 'sine',
  startDelay = 0
) {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + startDelay);

  gainNode.gain.setValueAtTime(0, ctx.currentTime + startDelay);
  gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + startDelay + 0.02);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startDelay + duration);

  osc.start(ctx.currentTime + startDelay);
  osc.stop(ctx.currentTime + startDelay + duration + 0.05);
}

export function playMicStart() {
  playTone(660, 0.1, 0.15, 'sine', 0);
  playTone(880, 0.1, 0.12, 'sine', 0.12);
}

export function playSuccess() {
  playTone(523, 0.15, 0.2, 'sine', 0);
  playTone(659, 0.15, 0.2, 'sine', 0.15);
  playTone(784, 0.2, 0.2, 'sine', 0.3);
  playTone(1047, 0.3, 0.25, 'sine', 0.5);
}

export function playStamp() {
  playTone(880, 0.1, 0.2, 'sine', 0);
  playTone(1100, 0.15, 0.2, 'sine', 0.1);
  playTone(1320, 0.2, 0.18, 'sine', 0.22);
}

export function playSegmentRead() {
  playTone(1046, 0.08, 0.1, 'sine', 0);
}

export function resumeContext() {
  const ctx = getCtx();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}
