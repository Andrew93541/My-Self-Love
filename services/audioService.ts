
// Web Audio API to generate soothing noises without external files
let audioCtx: AudioContext | null = null;
let activeSource: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);
    }
};

const createPinkNoise = () => {
    if (!audioCtx) return null;
    const bufferSize = audioCtx.sampleRate * 2; // 2 seconds buffer
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOutLocal = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOutLocal + (0.02 * white)) / 1.02;
        lastOutLocal = data[i];
        data[i] *= 3.5; // (roughly) compensate for gain
    }
    return buffer;
};

const createBrownNoise = () => {
    if (!audioCtx) return null;
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOutLocal = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOutLocal + (0.02 * white)) / 1.02;
        lastOutLocal = data[i];
        data[i] *= 3.5; 
    }
    return buffer;
}

export const audioService = {
    playNoise: (type: 'rain' | 'deep') => {
        initAudio();
        if (activeSource) {
            activeSource.stop();
        }
        if (!audioCtx || !gainNode) return;

        const buffer = type === 'rain' ? createPinkNoise() : createBrownNoise();
        if (!buffer) return;

        const noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;
        
        // Lowpass filter for softness
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = type === 'rain' ? 800 : 400;

        noiseSource.connect(filter);
        filter.connect(gainNode);
        
        // Fade in
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 1);
        
        noiseSource.start();
        activeSource = noiseSource;
    },

    playSiren: () => {
        initAudio();
        if (!audioCtx || !gainNode) return;

        const osc = audioCtx.createOscillator();
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();

        osc.type = 'sawtooth';
        lfo.type = 'sine';
        lfo.frequency.value = 2; // 2 Hz modulation (fast siren)

        // Modulate frequency 
        lfoGain.gain.value = 200; 
        osc.frequency.value = 600; // Base freq

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(gainNode);

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);

        osc.start();
        lfo.start();

        // Play for 4 seconds only
        setTimeout(() => {
            gainNode?.gain.linearRampToValueAtTime(0, audioCtx!.currentTime + 0.5);
            setTimeout(() => {
                osc.stop();
                lfo.stop();
            }, 500);
        }, 4000);
    },

    stop: () => {
        if (activeSource && gainNode && audioCtx) {
            // Fade out
            gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
            setTimeout(() => {
                if (activeSource) {
                    activeSource.stop();
                    activeSource = null;
                }
            }, 500);
        }
    }
};
