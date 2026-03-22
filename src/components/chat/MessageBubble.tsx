import { useState, useRef, useEffect } from "react"
import Icon from "@/components/ui/icon"
import type { Message } from "@/pages/ChatPage"

// ── Voice player ─────────────────────────────────────────────────────────────
function VoicePlayer({ mediaUrl, duration }: { mediaUrl: string; duration?: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentSec, setCurrentSec] = useState(0)
  const [totalSec, setTotalSec] = useState(duration ?? 0)
  const bars = useRef(Array.from({ length: 28 }, () => 4 + Math.random() * 18))

  useEffect(() => {
    const audio = new Audio(mediaUrl)
    audioRef.current = audio
    audio.onloadedmetadata = () => {
      if (isFinite(audio.duration)) setTotalSec(Math.round(audio.duration))
    }
    audio.ontimeupdate = () => {
      setCurrentSec(Math.floor(audio.currentTime))
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0)
    }
    audio.onended = () => { setPlaying(false); setProgress(0); setCurrentSec(0) }
    return () => { audio.pause(); audio.src = "" }
  }, [mediaUrl])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}) }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration
  }

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  return (
    <div className="flex items-center gap-2.5 py-0.5 min-w-[210px] max-w-[280px]">
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors"
      >
        <Icon name={playing ? "Pause" : "Play"} size={15} className="text-white" />
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-end gap-px h-6 cursor-pointer" onClick={seek}>
          {bars.current.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-colors"
              style={{
                height: `${h}px`,
                backgroundColor: i / bars.current.length <= progress
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
        <span className="text-[10px] text-white/50 font-mono">
          {playing ? fmt(currentSec) : fmt(totalSec)}
        </span>
      </div>
    </div>
  )
}

// ── Video player ─────────────────────────────────────────────────────────────
function VideoPlayer({ mediaUrl }: { mediaUrl: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    if (playing) { v.pause(); setPlaying(false) }
    else { v.play().then(() => setPlaying(true)).catch(() => {}) }
  }

  return (
    <div className="relative rounded-xl overflow-hidden max-w-[260px] cursor-pointer bg-black" onClick={toggle}>
      <video
        ref={videoRef}
        src={mediaUrl}
        className="w-full block rounded-xl"
        playsInline
        preload="metadata"
        onEnded={() => setPlaying(false)}
      />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-12 h-12 bg-black/70 rounded-full flex items-center justify-center">
            <Icon name="Play" size={20} className="text-white" />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Bubble ────────────────────────────────────────────────────────────────────
type Props = { message: Message }

export function MessageBubble({ message }: Props) {
  const { fromMe, text, type, mediaUrl, time, status, duration } = message

  return (
    <div className={`flex ${fromMe ? "justify-end" : "justify-start"} mb-1.5`}>
      <div className={`
        max-w-[72%] rounded-2xl px-3 py-2
        ${fromMe ? "bg-purple-600 text-white rounded-br-sm" : "bg-[#1e1a2e] text-white rounded-bl-sm"}
      `}>
        {type === "text" && (
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{text}</p>
        )}
        {type === "image" && mediaUrl && (
          <div className="-mx-1 -mt-1 rounded-xl overflow-hidden max-w-[260px]">
            <img src={mediaUrl} alt="фото" className="w-full h-auto object-cover block" />
          </div>
        )}
        {type === "voice" && mediaUrl && (
          <VoicePlayer mediaUrl={mediaUrl} duration={duration} />
        )}
        {type === "video" && mediaUrl && (
          <div className="-mx-1 -mt-1">
            <VideoPlayer mediaUrl={mediaUrl} />
          </div>
        )}

        <div className={`flex items-center gap-1 mt-1 ${fromMe ? "justify-end" : "justify-start"}`}>
          <span className="text-[10px] text-white/40">{time}</span>
          {fromMe && (
            <>
              {status === "read" && <Icon name="CheckCheck" size={12} className="text-purple-300" />}
              {status === "delivered" && <Icon name="CheckCheck" size={12} className="text-white/40" />}
              {status === "sent" && <Icon name="Check" size={12} className="text-white/40" />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
