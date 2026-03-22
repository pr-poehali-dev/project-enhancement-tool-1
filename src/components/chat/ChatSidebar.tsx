import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import Icon from "@/components/ui/icon"
import { useNavigate } from "react-router-dom"
import type { Contact } from "@/pages/ChatPage"

type Props = {
  contacts: Contact[]
  selectedId?: string
  onSelect: (contact: Contact) => void
}

export function ChatSidebar({ contacts, selectedId, onSelect }: Props) {
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col w-full h-full bg-[#12101c] border-r border-purple-500/10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-purple-500/10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-orbitron text-lg font-bold text-white hover:text-purple-400 transition-colors"
        >
          <span className="text-purple-400">←</span>
          Vibe<span className="text-purple-400">Space</span>
        </button>
        <button className="text-purple-400 hover:text-purple-300 transition-colors">
          <Icon name="PenSquare" size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/50" />
          <Input
            placeholder="Поиск по чатам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#1a1728] border-purple-500/20 text-white placeholder:text-purple-300/30 focus-visible:ring-purple-500/50"
          />
        </div>
      </div>

      {/* Contacts list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelect(contact)}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-500/10 transition-colors text-left
              ${selectedId === contact.id ? "bg-purple-500/15 border-r-2 border-purple-500" : ""}
            `}
          >
            <div className="relative flex-shrink-0">
              <Avatar className="w-12 h-12">
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback className="bg-purple-700 text-white">
                  {contact.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              {contact.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#12101c]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm truncate">{contact.name}</span>
                <span className="text-xs text-purple-300/50 flex-shrink-0 ml-2">{contact.lastTime}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-xs text-purple-300/50 truncate">{contact.lastMessage}</span>
                {contact.unread > 0 && (
                  <span className="ml-2 flex-shrink-0 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {contact.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
