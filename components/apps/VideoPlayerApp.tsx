
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, FolderOpen, Film, Repeat, PictureInPicture, FastForward, Rewind } from 'lucide-react';

export const VideoPlayerApp: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
      if (videoRef.current) {
          videoRef.current.loop = isLooping;
      }
  }, [isLooping]);

  const handleFileOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setFileName(file.name);
      setIsPlaying(true);
      setTimeout(() => videoRef.current?.play(), 100);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const togglePiP = async () => {
      if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
      } else if (videoRef.current) {
          await videoRef.current.requestPictureInPicture();
      }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
      setDuration(total);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const bar = e.currentTarget;
      const rect = bar.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const skip = (seconds: number) => {
      if (videoRef.current) {
          videoRef.current.currentTime += seconds;
      }
  };

  const cyclePlaybackRate = () => {
      const rates = [0.5, 1, 1.5, 2];
      const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
      setPlaybackRate(rates[nextIndex]);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col h-full bg-black text-white group-hover-controller select-none">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileOpen} 
        accept="video/*" 
        className="hidden" 
      />

      {/* Header / Title Bar */}
      {fileName && (
          <div className="absolute top-0 left-0 w-full p-3 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-sm font-medium text-white drop-shadow-md">{fileName}</span>
          </div>
      )}

      {/* Video Area */}
      <div className="flex-1 relative flex items-center justify-center bg-black group overflow-hidden" onDoubleClick={() => document.fullscreenElement ? document.exitFullscreen() : videoRef.current?.parentElement?.requestFullscreen()}>
        {videoSrc ? (
          <video 
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-contain"
            onClick={togglePlay}
            onEnded={() => !isLooping && setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
          />
        ) : (
          <div className="text-center flex flex-col items-center justify-center h-full w-full bg-gray-900/50">
            <Film size={64} className="text-gray-700 mb-4" />
            <div className="opacity-50 mb-6 text-lg">No Video Loaded</div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center gap-2 mx-auto font-bold transition-transform hover:scale-105 shadow-lg"
            >
              <FolderOpen size={20} /> Open Local File
            </button>
          </div>
        )}
        
        {/* Play Overlay */}
        {videoSrc && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
             <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-in zoom-in duration-200">
                <Play size={32} fill="white" className="ml-1" />
             </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="h-16 bg-[#1a1a1a] flex flex-col px-4 pb-2 border-t border-[#333] z-20">
         
         {/* Seek Bar */}
         <div className="w-full h-4 relative flex items-center cursor-pointer group/seek" onClick={handleSeek}>
             <div className="w-full h-1 bg-gray-600 rounded-full group-hover/seek:h-1.5 transition-all">
                <div 
                    className="h-full bg-blue-500 rounded-full relative"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/seek:opacity-100 shadow-sm transition-opacity"></div>
                </div>
             </div>
         </div>

         <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                 <button className="hover:text-blue-400 transition-colors" onClick={togglePlay} disabled={!videoSrc}>
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                 </button>
                 
                 <div className="flex items-center gap-2">
                     <button onClick={() => skip(-10)} className="hover:text-white text-gray-400" title="-10s"><Rewind size={18} /></button>
                     <button onClick={() => skip(10)} className="hover:text-white text-gray-400" title="+10s"><FastForward size={18} /></button>
                 </div>

                 <div className="flex items-center gap-2 group/vol">
                    <button onClick={toggleMute} className="hover:text-white text-gray-400">
                        {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input 
                        type="range" 
                        min="0" max="1" step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={e => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                        className="w-16 h-1 bg-gray-600 rounded-lg accent-white cursor-pointer opacity-0 group-hover/vol:opacity-100 transition-opacity"
                    />
                 </div>

                 <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                    {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                 </span>
             </div>

             <div className="flex items-center gap-3">
                 <button 
                    onClick={cyclePlaybackRate} 
                    className="text-xs font-bold text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5 w-10 text-center"
                    title="Playback Speed"
                 >
                    {playbackRate}x
                 </button>

                 <button 
                    onClick={() => setIsLooping(!isLooping)} 
                    className={`hover:text-white ${isLooping ? 'text-blue-500' : 'text-gray-400'}`}
                    title="Loop"
                 >
                    <Repeat size={18} />
                 </button>

                 <button onClick={togglePiP} className="text-gray-400 hover:text-white" title="Picture in Picture">
                     <PictureInPicture size={18} />
                 </button>

                 <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-white" title="Open File">
                   <FolderOpen size={18} />
                 </button>
                 
                 <button onClick={() => videoRef.current?.parentElement?.requestFullscreen()} className="text-gray-400 hover:text-white"><Maximize size={18} /></button>
             </div>
         </div>
      </div>
    </div>
  );
};
