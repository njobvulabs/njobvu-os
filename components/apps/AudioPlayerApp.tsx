
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, Repeat, Shuffle, Volume2, FolderOpen, List, Repeat1 } from 'lucide-react';
import { useOS } from '../../context/OSContext';

interface Track {
  title: string;
  artist: string;
  duration: number; // in seconds
  url: string;
}

export const AudioPlayerApp: React.FC = () => {
  const { addNotification } = useOS();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showPlaylist, setShowPlaylist] = useState(false);
  
  // Playback Modes
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [shuffleQueue, setShuffleQueue] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
     if (isPlaying) {
         audioRef.current?.play().catch(e => {
             console.error("Playback failed", e);
             setIsPlaying(false);
         });
     } else {
         audioRef.current?.pause();
     }
  }, [isPlaying, currentTrackIndex]);

  // Handle Shuffle Queue Generation
  useEffect(() => {
      if (isShuffle && tracks.length > 0) {
          const queue = tracks.map((_, i) => i);
          // Fisher-Yates shuffle
          for (let i = queue.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [queue[i], queue[j]] = [queue[j], queue[i]];
          }
          // Ensure current track is first if playing
          const currentInQueue = queue.indexOf(currentTrackIndex);
          if (currentInQueue !== -1) {
              queue.splice(currentInQueue, 1);
              queue.unshift(currentTrackIndex);
          }
          setShuffleQueue(queue);
      }
  }, [isShuffle, tracks.length]);

  const togglePlay = () => {
    if (tracks.length === 0) return;
    setIsPlaying(!isPlaying);
  };
  
  const handleTrackEnd = () => {
      if (repeatMode === 'one') {
          if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
          }
      } else {
          nextTrack();
      }
  };

  const nextTrack = () => {
      if (tracks.length === 0) return;
      
      let nextIndex = 0;

      if (isShuffle) {
          const currentQueueIndex = shuffleQueue.indexOf(currentTrackIndex);
          if (currentQueueIndex === -1 || currentQueueIndex === shuffleQueue.length - 1) {
              // End of shuffle queue
              if (repeatMode === 'all') {
                  nextIndex = shuffleQueue[0]; // Loop back
              } else {
                  setIsPlaying(false);
                  return; // Stop
              }
          } else {
              nextIndex = shuffleQueue[currentQueueIndex + 1];
          }
      } else {
          if (currentTrackIndex === tracks.length - 1) {
              // End of list
              if (repeatMode === 'all') {
                  nextIndex = 0;
              } else {
                  setIsPlaying(false);
                  return;
              }
          } else {
              nextIndex = currentTrackIndex + 1;
          }
      }
      setCurrentTrackIndex(nextIndex);
      setIsPlaying(true);
  };

  const prevTrack = () => {
      if (tracks.length === 0) return;
      // If played more than 3 sec, restart track
      if (currentTime > 3) {
          if (audioRef.current) audioRef.current.currentTime = 0;
          return;
      }
      
      let prevIndex = 0;
      if (isShuffle) {
          const currentQueueIndex = shuffleQueue.indexOf(currentTrackIndex);
          if (currentQueueIndex <= 0) prevIndex = shuffleQueue[shuffleQueue.length - 1];
          else prevIndex = shuffleQueue[currentQueueIndex - 1];
      } else {
          prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
      }
      
      setCurrentTrackIndex(prevIndex);
      setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
      if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          setDuration(audioRef.current.duration || 0);
      }
  };

  const handleFileOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newTracks: Track[] = Array.from(files).map((file: File) => ({
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: "Unknown Artist",
          duration: 0,
          url: URL.createObjectURL(file)
      }));
      
      setTracks(prev => {
          const combined = [...prev, ...newTracks];
          if (prev.length === 0) {
              setCurrentTrackIndex(0);
              setIsPlaying(true);
          }
          return combined;
      });
      addNotification("Music Player", `Added ${files.length} songs to queue`, 'success');
    }
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const toggleRepeat = () => {
      if (repeatMode === 'off') setRepeatMode('all');
      else if (repeatMode === 'all') setRepeatMode('one');
      else setRepeatMode('off');
  };

  const formatTime = (time: number) => {
      if (isNaN(time)) return "0:00";
      const m = Math.floor(time / 60);
      const s = Math.floor(time % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentTrack = tracks[currentTrackIndex];

  return (
    <div className="flex flex-col h-full bg-[#181818] text-gray-200 font-sans select-none">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileOpen} 
        accept="audio/*" 
        multiple
        className="hidden" 
      />

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={currentTrack?.url} 
        onEnded={handleTrackEnd} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
      />

      {/* Main Visual Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-[#181818] z-0"></div>
        
        {currentTrack ? (
            <div className="z-10 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-48 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl mx-auto mb-6 flex items-center justify-center border border-white/5 relative overflow-hidden">
                    <Music size={64} className={`text-gray-600 ${isPlaying ? 'animate-pulse' : ''}`} />
                    {/* Visualizer Simulation */}
                    {isPlaying && (
                        <div className="absolute bottom-0 left-0 w-full flex items-end justify-center gap-1 h-16 opacity-30">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="w-3 bg-blue-500 rounded-t-sm animate-music-bar" style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }}></div>
                            ))}
                        </div>
                    )}
                </div>
                <h2 className="text-2xl font-bold truncate max-w-[300px] text-white mb-1">{currentTrack.title}</h2>
                <p className="text-gray-400">{currentTrack.artist}</p>
            </div>
        ) : (
            <div className="z-10 text-center text-gray-500">
                <Music size={64} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg">No music playing</p>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm transition-transform hover:scale-105"
                >
                    Open Files
                </button>
            </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-[#202020] p-4 border-t border-[#333]">
         {/* Progress */}
         <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 font-mono">
           <span className="w-10 text-right">{formatTime(currentTime)}</span>
           <div 
             className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer relative group"
             onClick={(e) => {
                 if (audioRef.current && duration) {
                     const rect = e.currentTarget.getBoundingClientRect();
                     const pos = (e.clientX - rect.left) / rect.width;
                     audioRef.current.currentTime = pos * duration;
                 }
             }}
           >
             <div className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-blue-400" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
             <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${(currentTime / duration) * 100}%` }}></div>
           </div>
           <span className="w-10">{formatTime(duration)}</span>
         </div>

         {/* Buttons */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
                 <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="text-gray-400 hover:text-white p-2 rounded hover:bg-white/5"
                    title="Add Songs"
                >
                    <FolderOpen size={20} />
                </button>
                 <button 
                    onClick={() => setShowPlaylist(!showPlaylist)} 
                    className={`p-2 rounded hover:bg-white/5 ${showPlaylist ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                    title="Playlist"
                >
                    <List size={20} />
                </button>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={() => setIsShuffle(!isShuffle)} 
                className={`transition-colors ${isShuffle ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
                title="Shuffle"
              >
                  <Shuffle size={18} />
              </button>

              <button onClick={prevTrack} className="hover:text-white transition-colors"><SkipBack size={24} /></button>
              
              <button 
                onClick={togglePlay} 
                className="w-12 h-12 rounded-full bg-white text-black hover:scale-105 flex items-center justify-center shadow-lg transition-transform"
                disabled={!currentTrack}
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
              </button>
              
              <button onClick={nextTrack} className="hover:text-white transition-colors"><SkipForward size={24} /></button>
              
              <button 
                onClick={toggleRepeat} 
                className={`transition-colors ${repeatMode !== 'off' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
                title="Repeat"
              >
                  {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
              </button>
            </div>

            <div className="flex items-center gap-2 w-24 md:w-32">
               <Volume2 size={18} className="text-gray-400" />
               <input 
                 type="range" 
                 min="0" 
                 max="1" 
                 step="0.01" 
                 value={volume}
                 onChange={(e) => setVolume(Number(e.target.value))}
                 className="w-full accent-white h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
               />
            </div>
         </div>
      </div>
      
      {/* Playlist Drawer */}
      {showPlaylist && (
          <div className="absolute top-0 right-0 w-64 h-[calc(100%-85px)] bg-[#1a1a1a]/95 backdrop-blur shadow-xl border-l border-[#333] z-20 animate-in slide-in-from-right overflow-y-auto custom-scrollbar">
             <div className="p-3 border-b border-[#333] font-bold text-sm bg-[#1a1a1a] sticky top-0">Queue ({tracks.length})</div>
             {tracks.map((track, idx) => (
               <div 
                 key={idx}
                 className={`px-3 py-2 text-sm cursor-pointer hover:bg-white/10 flex items-center gap-3 truncate border-b border-white/5 ${currentTrackIndex === idx ? 'text-blue-400 font-medium bg-blue-500/10' : 'text-gray-300'}`}
                 onClick={() => playTrack(idx)}
               >
                  <span className="text-xs opacity-50 w-4 text-center">{currentTrackIndex === idx && isPlaying ? <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mx-auto"></div> : idx + 1}</span>
                  <div className="truncate">
                      <div className="truncate">{track.title}</div>
                      <div className="text-xs opacity-60 truncate">{track.artist}</div>
                  </div>
               </div>
             ))}
             {tracks.length === 0 && <div className="p-4 text-center text-gray-500 text-xs italic">Queue is empty</div>}
          </div>
      )}
    </div>
  );
};
