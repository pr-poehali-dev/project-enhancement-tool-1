import Icon from "@/components/ui/icon"
import type { Message } from "@/pages/ChatPage"

type Props = {
  message: Message
}

export function MessageBubble({ message }: Props) {
  const { fromMe, text, type, mediaUrl, time, status } = message

  return (
    <div className={`flex ${fromMe ? "justify-end" : "justify-start"} mb-1`}>
      <div
        className={`
          max-w-[70%] rounded-2xl px-4 py-2 relative
          ${fromMe
            ? "bg-purple-600 text-white rounded-br-sm"
            : "bg-[#1e1a2e] text-white rounded-bl-sm"
          }
        `}
      >
        {type === "text" && (
          <p className="text-sm leading-relaxed break-words">{text}</p>
        )}

        {type === "image" && mediaUrl && (
          <div className="rounded-xl overflow-hidden max-w-[260px]">
            <img
              src={mediaUrl}
              alt="фото"
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>
        )}

        {type === "voice" && (
          <div className="flex items-center gap-3 py-1 min-w-[180px]">
            <button className="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center hover:bg-purple-500/50 transition-colors flex-shrink-0">
              <Icon name="Play" size={14} className="text-white ml-0.5" />
            </button>
            <div className="flex-1 flex items-center gap-0.5">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-purple-300/60 rounded-full w-1"
                  style={{ height: `${Math.random() * 16 + 4}px` }}
                />
              ))}
            </div>
            <span className="text-xs text-purple-200/70 flex-shrink-0">0:08</span>
          </div>
        )}

        {type === "video" && mediaUrl && (
          <div className="rounded-xl overflow-hidden max-w-[260px] relative">
            <video src={mediaUrl} className="w-full rounded-xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center">
                <Icon name="Play" size={20} className="text-white ml-1" />
              </div>
            </div>
          </div>
        )}

        {/* Time + status */}
        <div className={`flex items-center gap-1 mt-1 ${fromMe ? "justify-end" : "justify-start"}`}>
          <span className="text-[10px] text-white/40">{time}</span>
          {fromMe && (
            <span className="text-white/50">
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
