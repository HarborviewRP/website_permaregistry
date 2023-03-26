import React, { useState, useEffect, useRef } from "react";

interface CustomAudioPlayerProps {
  src: string;
}

const AudioPlayer: React.FC<CustomAudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      const currentProgress =
        ((audio?.currentTime || 0) / (audio?.duration || 1)) * 100;
      setProgress(currentProgress);
    };

    if (audio) {
      audio.addEventListener("timeupdate", updateProgress);
    }

    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", updateProgress);
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (isPlaying) {
      const playPromise = audio?.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          setIsPlaying(false);
          console.error("Error playing audio:", error);
        });
      }
    } else {
      audio?.pause();
    }
  }, [isPlaying]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    const audio = audioRef.current;
    if (audio) {
      const newTime = (newProgress / 100) * (audio.duration || 0);
      audio.currentTime = newTime;
      setProgress(newProgress);
    }
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={src}></audio>
      <div className="flex items-center justify-between">
        <button
          onClick={togglePlayPause}
          className="text-white px-3 py-2 rounded inline-flex items-center"
        >
          {isPlaying ? (
            <>
              <div className="h-4 w-1 bg-white mr-1"></div>
              <div className="h-4 w-1 bg-white"></div>
            </>
          ) : (
            <svg
              className="w-4 h-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M7 5l10 7-10 7V5z" />
            </svg>
          )}
        </button>
        <div className="flex-1 mx-4">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className="w-full bg-gray-300 h-1.5 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
