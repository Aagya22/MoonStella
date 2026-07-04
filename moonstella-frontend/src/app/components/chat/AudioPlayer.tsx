import React, { useState, useEffect, useRef } from 'react'

interface AudioPlayerProps {
  src: string
}

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(src)
    audioRef.current = audio

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0)
    }
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0)
    }
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)

    // Force load metadata
    audio.load()

    return () => {
      audio.pause()
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    }
  }, [src])

  // Sync playback rate changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch((err) => console.error('Audio playback failed:', err))
      setIsPlaying(true)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const val = Number(e.target.value)
    audioRef.current.currentTime = val
    setCurrentTime(val)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const cycleSpeed = () => {
    if (playbackRate === 1) setPlaybackRate(1.5)
    else if (playbackRate === 1.5) setPlaybackRate(2)
    else setPlaybackRate(1)
  }

  return (
    <div className="flex items-center gap-4 bg-[#FAF8F5] border border-[#5F3041]/10 rounded-2xl p-3.5 w-64 select-none shadow-xs animate-fade-in text-gray-700">
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-9 h-9 rounded-full bg-[#5F3041] hover:bg-[#4A2231] text-[#E9D7C3] flex items-center justify-center cursor-pointer border-none shadow-sm active:scale-95 transition-all flex-shrink-0"
      >
        {isPlaying ? (
          /* Pause Icon */
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          /* Play Icon */
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="transform translate-x-[1px]">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Progress Bar & Durations */}
      <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-[#5F3041]/15 rounded-lg appearance-none cursor-pointer accent-[#b49876] focus:outline-none"
          style={{
            background: `linear-gradient(to right, #b49876 0%, #b49876 ${(currentTime / (duration || 1)) * 100}%, rgba(95, 48, 65, 0.15) ${(currentTime / (duration || 1)) * 100}%, rgba(95, 48, 65, 0.15) 100%)`
          }}
        />
        <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 font-mono tracking-wider">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Speed Controller */}
      <button
        type="button"
        onClick={cycleSpeed}
        className="text-[9px] font-extrabold text-[#5F3041] hover:bg-[#5F3041]/10 px-2 py-1 rounded bg-[#5F3041]/5 tracking-widest font-sans uppercase flex-shrink-0 border-none cursor-pointer transition-colors"
      >
        {playbackRate}x
      </button>
    </div>
  )
}
