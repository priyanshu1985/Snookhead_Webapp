export const ALERT_SOUND_B64 = "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AAAD%2F%2D%2F3%2F9%2F%2F%2F%2F5gAAAAAsAAAAgAAAAAAAA///uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AAAD%2F%2D%2F3%2F9%2F%2F%2F%2F5gAAAAAsAAAAgAAAAAAAA//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AAAD%2F%2D%2F3%2F9%2F%2F%2F%2F5gAAAAAsAAAAgAAAAAAAA//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AAAD%2F%2D%2F3%2F9%2F%2F%2F%2F5gAAAAAsAAAAgAAAAAAAA"; 

export const playAlertSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Play a "Phone Ring" pattern for ~10-12 seconds
    // Pattern: Bursts of [Ring... Ring...] ... pause ... [Ring... Ring...]
    
    const playRing = (startAt) => {
        // Create two oscillators for a "trill" effect (simulating phone)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        // Frequencies typical of old phones
        osc1.type = 'square';
        osc1.frequency.value = 840;
        osc2.type = 'sine';
        osc2.frequency.value = 1020;

        // Envelope: 
        // 0.4s ON, 0.2s OFF, 0.4s ON
        
        // First Ring
        gain.gain.setValueAtTime(0, startAt);
        gain.gain.linearRampToValueAtTime(0.1, startAt + 0.05);
        gain.gain.setValueAtTime(0.1, startAt + 0.4);
        gain.gain.linearRampToValueAtTime(0, startAt + 0.45);

        // Second Ring (Double ring style)
        gain.gain.linearRampToValueAtTime(0.1, startAt + 0.65);
        gain.gain.setValueAtTime(0.1, startAt + 1.0);
        gain.gain.linearRampToValueAtTime(0, startAt + 1.05);

        osc1.start(startAt);
        osc1.stop(startAt + 1.1);
        osc2.start(startAt);
        osc2.stop(startAt + 1.1);
    };

    // Schedule repeats for ~10 seconds
    // Loop every 3 seconds (1s ring + 2s silence)
    for (let i = 0; i < 4; i++) {
        playRing(now + (i * 3));
    }
    
    // Auto close context after 12 seconds to cleanup
    setTimeout(() => {
        if (ctx.state !== 'closed') ctx.close();
    }, 12000);

  } catch (e) {
    console.warn("Audio play failed", e);
  }
};
