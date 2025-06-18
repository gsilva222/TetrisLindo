// Sistema de som para o Tetris usando Web Audio API
class TetrisAudio {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = true;
        this.init();
    }
    
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (error) {
            console.log('Web Audio API não disponível');
            this.enabled = false;
        }
    }
    
    createSounds() {
        // Som de linha completada
        this.sounds.lineClear = this.createTone([800, 1000, 1200], 0.3);
        
        // Som de peça colocada
        this.sounds.drop = this.createTone([200], 0.1);
        
        // Som de rotação
        this.sounds.rotate = this.createTone([400], 0.05);
        
        // Som de movimento
        this.sounds.move = this.createTone([300], 0.03);
        
        // Som de game over
        this.sounds.gameOver = this.createTone([400, 300, 200, 100], 1.0);
    }
    
    createTone(frequencies, duration) {
        return () => {
            if (!this.enabled || !this.audioContext) return;
            
            const oscillators = frequencies.map(freq => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
                
                return oscillator;
            });
        };
    }
    
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Instância global do sistema de áudio
window.tetrisAudio = new TetrisAudio();
