import { useState, useRef, useEffect } from "react"
import Icon from "@/components/ui/icon"
import type { Message } from "@/pages/ChatPage"

type Props = {
  message: Message
}

function VoicePlayer({ mediaUrl, duration }: { mediaUrl: string; duration?: number }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const barsRef = useRef<number[]>([])

  if (barsRef.current.length === 0) {
    barsRef.current = Array.from({ length: 24 }, () => Math.random() * 16 + 4)
  }

  const total = duration || 0

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) }
    else { a.play(); setPlaying(true) }
  }

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => {
      setCurrentTime(Math.floor(a.currentTime))
      setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0)
    }
    const onEnd = () => { setPlaying(false); setProgress(0); setCurrentTime(0) }
    a.addEventListener("timeupdate", onTime)
    a.addEventListener("ended", onEnd)
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("ended", onEnd) }
  }, [])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  return (
    <div className="flex items-center gap-3 py-1 min-w-[200px]">
      <audio ref={audioRef} src={mediaUrl} preload="metadata" />
      <button onClick={toggle} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors">
        <Icon name={playing ? "Pause" : "Play"} size={14} className="text-white ml-0.5" />
      </button>
      <div className="flex-1 flex items-center gap-0.5 cursor-pointer" onClick={(e) => {
        const a = audioRef.current
        if (!a || !a.duration) return
        const rect = e.currentTarget.getBoundingClientRect()
        const ratio = (e.clientX - rect.left) / rect.width
        a.currentTime = ratio * a.duration
      }}>
        {barsRef.current.map((h, i) => (
          <div key={i} className="rounded-full w-1 transition-colors"
            style={{ height: `${h}px`, backgroundColor: progress > (i / 24) * 100 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)" }}
          />
        ))}
      </div>
      <span className="text-xs text-white/60 flex-shrink-0 font-mono">
        {playing ? fmt(currentTime) : fmt(total)}
      </span>
    </div>
  )
}

function VideoPlayer({ mediaUrl }: { mediaUrl: string }) {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    if (playing) { v.pause(); setPlaying(false) }
    else { v.play(); setPlaying(true) }
  }

  return (
    <div className="rounded-xl overflow-hidden max-w-[260px] relative cursor-pointer" onClick={toggle}>
      <video ref={videoRef} src={mediaUrl} className="w-full rounded-xl" playsInline onEnded={() => setPlaying(false)} />
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center">
            <Icon name="Play" size={20} className="text-white ml-1" />
          </div>
        </div>
      )}
    </div>
  )
}

export function MessageBubble({ message }: Props) {
  const { fromMe, text, type, mediaUrl, time, status, duration } = message

  return (
    <div className={`flex ${fromMe ? "justify-end" : "justify-start"} mb-1`}>
      <div className={`
        max-w-[70%] rounded-2xl px-4 py-2 relative
        ${fromMe ? "bg-purple-600 text-white rounded-br-sm" : "bg-[#1e1a2e] text-white rounded-bl-sm"}
      `}>
        {type === "text" && (
          <p className="text-sm leading-relaxed break-words">{text}</p>
        )}

        {type === "image" && mediaUrl && (
          <div className="rounded-xl overflow-hidden max-w-[260px] -mx-2 -mt-1">
            <img src={mediaUrl} alt="фото" className="w-full h-auto object-cover rounded-xl" />
          </div>
        )}

        {type === "voice" && mediaUrl && (
          <VoicePlayer mediaUrl={mediaUrl} duration={duration} />
        )}

        {type === "voice" && !mediaUrl && (
          <div className="flex items-center gap-3 py-1 min-w-[180px]">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon name="Mic" size={14} className="text-white" />
            </div>
            <div className="flex-1 flex items-center gap-0.5">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="bg-white/35 rounded-full w-1" style={{ height: `${Math.random() * 16 + 4}px` }} />
              ))}
            </div>
            <span className="text-xs text-white/60 flex-shrink-0">0:08</span>
          </div>
        )}

        {type === "video" && mediaUrl && (
          <div className="-mx-2 -mt-1">
            <VideoPlayer mediaUrl={mediaUrl} />
          </div>
        )}

        <div className={`flex items-center gap-1 mt-1 ${fromMe ? "justify-end" : "justify-start"}`}>
          <span className="text-[10px] text-white/40">{time}</span>
          {fromMe && (
            <span>
              {status === "read" ? (
                <Icon name="CheckCheck" size={12} className="text-purple-300" />
              ) : status === "delivered" ? (
                <Icon name="CheckCheck" size={12} className="text-white/40" />
              ) : (
                <Icon name="Check" size={12} className="text-white/40" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
