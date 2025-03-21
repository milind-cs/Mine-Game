import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import MineGame from "./components/MineGame";
import { useEffect } from "react";
import { useAudio } from "./lib/stores/useAudio";
import "./index.css";

function App() {
  // Initialize audio elements
  useEffect(() => {
    const backgroundMusic = new Audio("/sounds/background.mp3");
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.2;
    
    const hitSound = new Audio("/sounds/hit.mp3");
    const successSound = new Audio("/sounds/success.mp3");
    
    // Store audio elements in the audio store
    const audioStore = useAudio.getState();
    audioStore.setBackgroundMusic(backgroundMusic);
    audioStore.setHitSound(hitSound);
    audioStore.setSuccessSound(successSound);
    
    // Clean up on unmount
    return () => {
      backgroundMusic.pause();
      backgroundMusic.src = "";
      hitSound.src = "";
      successSound.src = "";
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        <MineGame />
      </div>
    </QueryClientProvider>
  );
}

export default App;
