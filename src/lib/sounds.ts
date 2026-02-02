let audioContext: AudioContext | null = null;
let gameMusic: HTMLAudioElement | null = null;
const isMuted = false;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function playLetterSelectSound(pathLength: number) {
  if (isMuted) return;

  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Ascending pitch as path gets longer (bubble/pop effect)
  const baseFreq = 350 + pathLength * 40;
  oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    baseFreq * 1.5,
    ctx.currentTime + 0.08,
  );
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.1);
}

export function playWordFoundSound(wordLength: number) {
  if (isMuted) return;

  const ctx = getAudioContext();

  // Play a pleasant chord for word found
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 major chord
  const freqMultiplier = 1 + (wordLength - 3) * 0.05;

  frequencies.forEach((freq, i) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = freq * freqMultiplier;
    oscillator.type = "sine";

    const startTime = ctx.currentTime + i * 0.05;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.4);
  });
}

export function playInvalidWordSound() {
  if (isMuted) return;

  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = 200;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.15);
}

export function startBackgroundMusic() {
  if (gameMusic) return;

  gameMusic = new Audio(
    "https://soundimage.org/wp-content/uploads/2025/10/Sky-Puzzle.ogg",
  );
  gameMusic.loop = true;
  gameMusic.volume = 0.3;

  if (!isMuted) {
    gameMusic.play().catch(() => {
      // Autoplay blocked, will play on user interaction
    });
  }
}

export function stopBackgroundMusic() {
  if (gameMusic) {
    gameMusic.pause();
    gameMusic.currentTime = 0;
    gameMusic = null;
  }
}
