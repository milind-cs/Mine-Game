import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  gemSound: HTMLAudioElement | null;
  cashoutSound: HTMLAudioElement | null;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setGemSound: (sound: HTMLAudioElement) => void;
  setCashoutSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  playHit: () => void;
  playSuccess: () => void;
  playGem: () => void;
  playCashout: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  gemSound: null,
  cashoutSound: null,
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setGemSound: (sound) => set({ gemSound: sound }),
  setCashoutSound: (sound) => set({ cashoutSound: sound }),
  
  playHit: () => {
    const { hitSound } = get();
    if (hitSound) {
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.4;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playGem: () => {
    const { gemSound } = get();
    if (gemSound) {
      // Clone the sound to allow overlapping playback
      const soundClone = gemSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Gem sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound } = get();
    if (successSound) {
      successSound.currentTime = 0;
      successSound.volume = 0.4;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },
  
  playCashout: () => {
    const { cashoutSound } = get();
    if (cashoutSound) {
      cashoutSound.currentTime = 0;
      cashoutSound.volume = 0.4;
      cashoutSound.play().catch(error => {
        console.log("Cashout sound play prevented:", error);
      });
    }
  }
}));
