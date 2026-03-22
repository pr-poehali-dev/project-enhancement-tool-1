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
  onSend: (text: string) => void
  onBack: () => void
}

export function ChatWindow({ contact, messages, onSend, onBack }: Props) {
  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text.trim())
    setText("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0d14]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-500/10 bg-[#12101c]">
        <button
          onClick={onBack}
          className="md:hidden text-purple-400 hover:text-purple-300 mr-1"
        >
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
          <p className="text-xs text-purple-300/60">
            {contact.online ? "онлайн" : "был(а) недавно"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-500/10 transition-colors">
            <Icon name="Phone" size={18} />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-500/10 transition-colors">
            <Icon name="Video" size={18} />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-500/10 transition-colors">
            <Icon name="MoreVertical" size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
        {/* Date divider */}
        <div className="flex items-center justify-center my-3">
          <span className="text-xs text-purple-300/40 bg-purple-500/10 px-3 py-1 rounded-full">
            Сегодня
          </span>
        </div>

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-purple-500/10 bg-[#12101c]">
        <div className="flex items-end gap-2">
          <button className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-500/10 transition-colors mb-0.5">
            <Icon name="Paperclip" size={18} />
          </button>
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
              <Button
                onClick={handleSend}
                className="w-9 h-9 rounded-full p-0 bg-purple-600 hover:bg-purple-700 border-0"
              >
                <Icon name="Send" size={16} />
              </Button>
            ) : (
              <button className="w-9 h-9 rounded-full flex items-center justify-center text-purple-400 hover:bg-purple-500/10 transition-colors">
                <Icon name="Mic" size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
