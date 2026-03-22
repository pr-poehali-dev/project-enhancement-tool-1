import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Icon from "@/components/ui/icon"
import { MessageBubble } from "./MessageBubble"
import type { Contact, Message } from "@/pages/ChatPage"

type Props = {
  contact: Contact
  messages: Message[]
  onSend: (msg: Omit<Message, "id" | "fromMe" | "time" | "status">) => void
  onBack: () => void
}

type RecordMode = "idle" | "voice" | "video"

function getSupportedMimeType(kinds: string[]): string {
  for (const mime of kinds) {
    if (MediaRecorder.isTypeSupported(mime)) return mime
  }
  return ""
}

export function ChatWindow({ contact, messages, onSend, onBack }: Props) {
  const [text, setText] = useState("")
  const [mode, setMode] = useState<RecordMode>("idle")
  const [secs, setSecs] = useState(0)
  const [showAttach, setShowAttach] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileImgRef = useRef<HTMLInputElement>(null)
  const fileVidRef = useRef<HTMLInputElement>(null)
  const videoElRef = useRef<HTMLVideoElement>(null)

  // Refs that live across renders without causing re-renders
  const mrRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const secsRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const startTimer = () => {
    secsRef.current = 0
    setSecs(0)
    timerRef.current = setInterval(() => {
      secsRef.current += 1
      setSecs(secsRef.current)
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  // ── Voice ──────────────────────────────────────────────
  const startVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const mime = getSupportedMimeType(["audio/webm;codecs=opus", "audio/webm", "audio/ogg", "audio/mp4", ""])
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)

      mr.ondataavailable = e => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" })
        const url = URL.createObjectURL(blob)
        onSend({ type: "voice", mediaUrl: url, duration: secsRef.current })
        stream.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }

      mr.start(100) // collect chunks every 100ms
      mrRef.current = mr
      setMode("voice")
      startTimer()
    } catch {
      alert("Нет доступа к микрофону. Разрешите доступ в настройках браузера.")
    }
  }

  const stopVoice = () => {
    if (mrRef.current?.state === "recording") mrRef.current.stop()
    stopTimer()
    setMode("idle")
  }

  const cancelVoice = () => {
    if (mrRef.current?.state === "recording") {
      mrRef.current.onstop = null // prevent send
      mrRef.current.stop()
    }
    stopTimer()
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setMode("idle")
  }

  // ── Video message ──────────────────────────────────────
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true })
      streamRef.current = stream
      chunksRef.current = []

      // attach stream to video element AFTER state update renders it
      setMode("video")
      // use setTimeout to wait for DOM
      setTimeout(() => {
        if (videoElRef.current) {
          videoElRef.current.srcObject = stream
          videoElRef.current.play().catch(() => {})
        }
      }, 50)

      const mime = getSupportedMimeType(["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4", ""])
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)

      mr.ondataavailable = e => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "video/webm" })
        const url = URL.createObjectURL(blob)
        onSend({ type: "video", mediaUrl: url })
        stream.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }

      mr.start(100)
      mrRef.current = mr
      startTimer()
    } catch {
      setMode("idle")
      alert("Нет доступа к камере. Разрешите доступ в настройках браузера.")
    }
  }

  const stopVideo = () => {
    if (mrRef.current?.state === "recording") mrRef.current.stop()
    if (videoElRef.current) { videoElRef.current.srcObject = null }
    stopTimer()
    setMode("idle")
  }

  const cancelVideo = () => {
    if (mrRef.current?.state === "recording") {
      mrRef.current.onstop = null
      mrRef.current.stop()
    }
    if (videoElRef.current) { videoElRef.current.srcObject = null }
    stopTimer()
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setMode("idle")
  }

  // ── Files ──────────────────────────────────────────────
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0]
    if (!file) return
    onSend({ type, mediaUrl: URL.createObjectURL(file) })
    e.target.value = ""
    setShowAttach(false)
  }

  const handleSend = () => {
    if (!text.trim()) return
    onSend({ type: "text", text: text.trim() })
    setText("")
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0d14]">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-500/10 bg-[#12101c]">
        <button onClick={onBack} className="md:hidden text-purple-400 hover:text-purple-300 mr-1">
          <Icon name="ChevronLeft" size={24} />
        </button>
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback className="bg-purple-700 text-white text-sm">
              {contact.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          {contact.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#12101c]" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white text-sm">{contact.name}</p>
          <p className="text-xs text-purple-300/60">{contact.online ? "онлайн" : "был(а) недавно"}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-500/10 transition-colors">
            <Icon name="Phone" size={18} />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-500/10 transition-colors">
            <Icon name="Video" size={18} />
          </button>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex justify-center my-3">
          <span className="text-xs text-purple-300/40 bg-purple-500/10 px-3 py-1 rounded-full">Сегодня</span>
        </div>
        {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* ── Video preview ──────────────────────────────── */}
      {mode === "video" && (
        <div className="mx-4 mb-2 rounded-2xl overflow-hidden border border-purple-500/30 relative bg-black">
          <video
            ref={videoElRef}
            className="w-full max-h-52 object-cover"
            muted
            playsInline
            autoPlay
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 rounded-full px-2.5 py-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-xs font-mono font-bold">{fmt(secs)}</span>
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <button onClick={cancelVideo} className="bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 transition-colors">
              <Icon name="X" size={16} />
            </button>
            <button onClick={stopVideo} className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors">
              <Icon name="Square" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Input area ─────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-purple-500/10 bg-[#12101c]">

        {/* Voice recording bar */}
        {mode === "voice" && (
          <div className="flex items-center gap-3">
            <button onClick={cancelVoice} className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0">
              <Icon name="Trash2" size={20} />
            </button>
            <div className="flex-1 flex items-center gap-2 bg-[#1e1a2e] rounded-2xl px-3 py-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 flex items-end gap-px overflow-hidden h-6">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-purple-400/60 rounded-sm animate-pulse"
                    style={{
                      height: `${Math.sin(i * 0.8 + secs) * 40 + 50}%`,
                      animationDelay: `${i * 0.03}s`,
                      animationDuration: `${0.6 + (i % 3) * 0.2}s`
                    }}
                  />
                ))}
              </div>
              <span className="text-purple-300 text-sm font-mono flex-shrink-0">{fmt(secs)}</span>
            </div>
            <button
              onClick={stopVoice}
              className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white transition-colors flex-shrink-0"
            >
              <Icon name="Send" size={16} />
            </button>
          </div>
        )}

        {/* Normal input (also shown during video recording for stop button) */}
        {mode !== "voice" && (
          <div className="flex items-end gap-2">
            {/* Attach */}
            <div className="relative flex-shrink-0 mb-0.5">
              <button
                onClick={() => setShowAttach(v => !v)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-500/10 transition-colors"
              >
                <Icon name={showAttach ? "X" : "Paperclip"} size={18} />
              </button>

              {showAttach && (
                <div className="absolute bottom-12 left-0 bg-[#1e1a2e] border border-purple-500/20 rounded-2xl p-2 shadow-xl z-20 min-w-[170px]">
                  <button
                    onClick={() => fileImgRef.current?.click()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-white hover:bg-purple-500/15 rounded-xl text-sm"
                  >
                    <Icon name="Image" size={16} className="text-purple-400" /> Фото из галереи
                  </button>
                  <button
                    onClick={() => fileVidRef.current?.click()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-white hover:bg-purple-500/15 rounded-xl text-sm"
                  >
                    <Icon name="Film" size={16} className="text-purple-400" /> Видео из галереи
                  </button>
                  <button
                    onClick={() => { setShowAttach(false); startVideo() }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-white hover:bg-purple-500/15 rounded-xl text-sm"
                  >
                    <Icon name="Camera" size={16} className="text-purple-400" /> Снять видеосообщение
                  </button>
                </div>
              )}

              <input ref={fileImgRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e, "image")} />
              <input ref={fileVidRef} type="file" accept="video/*" className="hidden" onChange={e => handleFile(e, "video")} />
            </div>

            {/* Text input */}
            <div className="flex-1 relative">
              <Textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKey}
                placeholder={mode === "video" ? "Запись идёт..." : "Написать сообщение..."}
                disabled={mode === "video"}
                rows={1}
                className="resize-none bg-[#1e1a2e] border-purple-500/20 text-white placeholder:text-purple-300/30 focus-visible:ring-purple-500/50 rounded-2xl pr-10 min-h-[44px] max-h-[120px] py-2.5 disabled:opacity-50"
                style={{ scrollbarWidth: "none" }}
              />
              <button className="absolute right-3 bottom-2.5 text-purple-400 hover:text-purple-300 transition-colors">
                <Icon name="Smile" size={18} />
              </button>
            </div>

            {/* Send / Mic / Stop */}
            <div className="flex-shrink-0 mb-0.5">
              {mode === "video" ? (
                <button
                  onClick={stopVideo}
                  className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
                  title="Остановить и отправить"
                >
                  <Icon name="Square" size={14} />
                </button>
              ) : text.trim() ? (
                <Button onClick={handleSend} className="w-9 h-9 rounded-full p-0 bg-purple-600 hover:bg-purple-700 border-0">
                  <Icon name="Send" size={16} />
                </Button>
              ) : (
                <button
                  onClick={startVoice}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-500/10 active:bg-purple-500/20 transition-colors"
                  title="Записать голосовое"
                >
                  <Icon name="Mic" size={18} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}