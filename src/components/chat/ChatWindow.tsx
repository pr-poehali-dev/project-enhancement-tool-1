import { useState, useRef, useEffect, useCallback } from "react"
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

type RecordingState = "idle" | "recording-voice" | "recording-video"

export function ChatWindow({ contact, messages, onSend, onBack }: Props) {
  const [text, setText] = useState("")
  const [recording, setRecording] = useState<RecordingState>("idle")
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const startTimer = () => {
    setRecordSeconds(0)
    timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  // — Voice recording —
  const startVoiceRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const mr = new MediaRecorder(stream)
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        onSend({ type: "voice", mediaUrl: url, duration: recordSeconds })
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      mr.start()
      mediaRecorderRef.current = mr
      setRecording("recording-voice")
      startTimer()
    } catch {
      alert("Нет доступа к микрофону")
    }
  }, [onSend, recordSeconds])

  const stopVoiceRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    stopTimer()
    setRecording("idle")
  }, [])

  // — Video message recording —
  const startVideoRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      chunksRef.current = []
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.play()
      }
      const mr = new MediaRecorder(stream)
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" })
        const url = URL.createObjectURL(blob)
        onSend({ type: "video", mediaUrl: url })
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        setVideoPreviewUrl(null)
      }
      mr.start()
      mediaRecorderRef.current = mr
      setRecording("recording-video")
      setVideoPreviewUrl("live")
      startTimer()
    } catch {
      alert("Нет доступа к камере")
    }
  }, [onSend])

  const stopVideoRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
    stopTimer()
    setRecording("idle")
  }, [])

  const cancelRecording = useCallback(() => {
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop())
    streamRef.current?.getTracks().forEach((t) => t.stop())
    stopTimer()
    setRecording("idle")
    setVideoPreviewUrl(null)
    chunksRef.current = []
  }, [])

  // — File sending —
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onSend({ type, mediaUrl: url })
    e.target.value = ""
    setShowAttachMenu(false)
  }

  const handleSendText = () => {
    if (!text.trim()) return
    onSend({ type: "text", text: text.trim() })
    setText("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendText() }
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0d14]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-500/10 bg-[#12101c]">
        <button onClick={onBack} className="md:hidden text-purple-400 hover:text-purple-300 mr-1">
          <Icon name="ChevronLeft" size={24} />
        </button>
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback className="bg-purple-700 text-white text-sm">
              {contact.name.split(" ").map((n) => n[0]).join("")}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center justify-center my-3">
          <span className="text-xs text-purple-300/40 bg-purple-500/10 px-3 py-1 rounded-full">Сегодня</span>
        </div>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Video preview while recording */}
      {recording === "recording-video" && (
        <div className="mx-4 mb-2 rounded-2xl overflow-hidden border border-purple-500/30 relative bg-black">
          <video ref={videoPreviewRef} className="w-full max-h-48 object-cover" muted playsInline />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 rounded-full px-2 py-0.5">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-xs font-mono">{formatTime(recordSeconds)}</span>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 py-3 border-t border-purple-500/10 bg-[#12101c]">

        {/* Recording voice UI */}
        {recording === "recording-voice" && (
          <div className="flex items-center gap-3 mb-2 px-2">
            <button onClick={cancelRecording} className="text-red-400 hover:text-red-300 transition-colors">
              <Icon name="X" size={20} />
            </button>
            <div className="flex-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 flex items-center gap-0.5">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="bg-purple-400/50 rounded-full w-0.5 animate-pulse"
                    style={{ height: `${Math.random() * 18 + 4}px`, animationDelay: `${i * 0.05}s` }} />
                ))}
              </div>
              <span className="text-purple-300 text-sm font-mono flex-shrink-0">{formatTime(recordSeconds)}</span>
            </div>
            <button
              onClick={stopVoiceRecording}
              className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white transition-colors"
            >
              <Icon name="Send" size={16} />
            </button>
          </div>
        )}

        {recording !== "recording-voice" && (
          <div className="flex items-end gap-2">
            {/* Attach button */}
            <div className="relative flex-shrink-0 mb-0.5">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-500/10 transition-colors"
              >
                <Icon name={showAttachMenu ? "X" : "Paperclip"} size={18} />
              </button>
              {showAttachMenu && (
                <div className="absolute bottom-12 left-0 bg-[#1e1a2e] border border-purple-500/20 rounded-2xl p-2 flex flex-col gap-1 shadow-xl z-10 min-w-[160px]">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 px-3 py-2 text-white hover:bg-purple-500/15 rounded-xl transition-colors text-sm"
                  >
                    <Icon name="Image" size={16} className="text-purple-400" />
                    Фото
                  </button>
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center gap-3 px-3 py-2 text-white hover:bg-purple-500/15 rounded-xl transition-colors text-sm"
                  >
                    <Icon name="Film" size={16} className="text-purple-400" />
                    Видео
                  </button>
                  <button
                    onClick={() => { startVideoRecording(); setShowAttachMenu(false) }}
                    className="flex items-center gap-3 px-3 py-2 text-white hover:bg-purple-500/15 rounded-xl transition-colors text-sm"
                  >
                    <Icon name="VideoIcon" fallback="Video" size={16} className="text-purple-400" />
                    Видеосообщение
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, "image")} />
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, "video")} />
            </div>

            <div className="flex-1 relative">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Написать сообщение..."
                rows={1}
                className="resize-none bg-[#1e1a2e] border-purple-500/20 text-white placeholder:text-purple-300/30 focus-visible:ring-purple-500/50 rounded-2xl pr-10 min-h-[44px] max-h-[120px] py-2.5"
                style={{ scrollbarWidth: "none" }}
              />
              <button className="absolute right-3 bottom-2.5 text-purple-400 hover:text-purple-300 transition-colors">
                <Icon name="Smile" size={18} />
              </button>
            </div>

            <div className="flex-shrink-0 mb-0.5">
              {text.trim() ? (
                <Button onClick={handleSendText} className="w-9 h-9 rounded-full p-0 bg-purple-600 hover:bg-purple-700 border-0">
                  <Icon name="Send" size={16} />
                </Button>
              ) : recording === "recording-video" ? (
                <button
                  onClick={stopVideoRecording}
                  className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
                >
                  <Icon name="Square" size={14} />
                </button>
              ) : (
                <button
                  onMouseDown={startVoiceRecording}
                  onTouchStart={startVoiceRecording}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-500/10 transition-colors"
                  title="Удержите для записи голосового"
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
