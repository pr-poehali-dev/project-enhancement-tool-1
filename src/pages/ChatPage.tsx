import { useState } from "react"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { useIsMobile } from "@/hooks/use-mobile"

export type Contact = {
  id: string
  name: string
  avatar: string
  lastMessage: string
  lastTime: string
  unread: number
  online: boolean
}

export type Message = {
  id: string
  fromMe: boolean
  text?: string
  type: "text" | "image" | "voice" | "video"
  mediaUrl?: string
  time: string
  status: "sent" | "delivered" | "read"
}

const MOCK_CONTACTS: Contact[] = [
  {
    id: "1",
    name: "Алина Морозова",
    avatar: "/professional-woman-scientist.png",
    lastMessage: "Привет! Как дела? 😊",
    lastTime: "12:41",
    unread: 3,
    online: true,
  },
  {
    id: "2",
    name: "Дмитрий Краснов",
    avatar: "/cybersecurity-expert-man.jpg",
    lastMessage: "Голосовое сообщение",
    lastTime: "11:20",
    unread: 0,
    online: true,
  },
  {
    id: "3",
    name: "Мария Соколова",
    avatar: "/asian-woman-tech-developer.jpg",
    lastMessage: "Смотри какое фото!",
    lastTime: "вчера",
    unread: 1,
    online: false,
  },
  {
    id: "4",
    name: "Артём Волков",
    avatar: "/placeholder-user.jpg",
    lastMessage: "Окей, увидимся завтра",
    lastTime: "вчера",
    unread: 0,
    online: false,
  },
  {
    id: "5",
    name: "Светлана Иванова",
    avatar: "/placeholder-user.jpg",
    lastMessage: "Спасибо за видео!",
    lastTime: "пн",
    unread: 0,
    online: true,
  },
]

const MOCK_MESSAGES: Record<string, Message[]> = {
  "1": [
    { id: "m1", fromMe: false, text: "Привет! Как дела? 😊", type: "text", time: "12:30", status: "read" },
    { id: "m2", fromMe: true, text: "Отлично! Сделал новый проект на VibeSpace 🚀", type: "text", time: "12:32", status: "read" },
    { id: "m3", fromMe: false, text: "Вау, серьёзно? Покажи!", type: "text", time: "12:33", status: "read" },
    { id: "m4", fromMe: true, text: "Да, вот скоро поделюсь. Ты когда онлайн?", type: "text", time: "12:35", status: "read" },
    { id: "m5", fromMe: false, text: "Я сейчас онлайн 😄 Жду!", type: "text", time: "12:36", status: "read" },
    { id: "m6", fromMe: false, text: "Привет! Как дела? 😊", type: "text", time: "12:41", status: "read" },
  ],
  "2": [
    { id: "m1", fromMe: false, text: "Слушай, ты видел новую фичу?", type: "text", time: "10:50", status: "read" },
    { id: "m2", fromMe: true, text: "Нет, а что такое?", type: "text", time: "11:00", status: "read" },
    { id: "m3", fromMe: false, text: "Голосовое сообщение", type: "voice", time: "11:20", status: "delivered" },
  ],
  "3": [
    { id: "m1", fromMe: false, text: "Смотри какое фото!", type: "text", time: "вчера", status: "read" },
    { id: "m2", fromMe: false, mediaUrl: "/futuristic-cyberpunk-laboratory-with-holographic-d.jpg", type: "image", time: "вчера", status: "read" },
    { id: "m3", fromMe: true, text: "Красота! 😍 Где это?", type: "text", time: "вчера", status: "read" },
  ],
  "4": [
    { id: "m1", fromMe: true, text: "Встретимся завтра?", type: "text", time: "вчера", status: "read" },
    { id: "m2", fromMe: false, text: "Окей, увидимся завтра", type: "text", time: "вчера", status: "read" },
  ],
  "5": [
    { id: "m1", fromMe: true, text: "Держи видео с встречи!", type: "text", time: "пн", status: "read" },
    { id: "m2", fromMe: false, text: "Спасибо за видео!", type: "text", time: "пн", status: "read" },
  ],
}

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(MOCK_CONTACTS[0])
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES)
  const [showSidebar, setShowSidebar] = useState(true)
  const isMobile = useIsMobile()

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact)
    if (isMobile) setShowSidebar(false)
  }

  const handleSendMessage = (text: string) => {
    if (!selectedContact || !text.trim()) return
    const newMsg: Message = {
      id: `m${Date.now()}`,
      fromMe: true,
      text,
      type: "text",
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    }
    setMessages((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMsg],
    }))
  }

  return (
    <div className="flex h-screen bg-[#0d0d14] overflow-hidden">
      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? "absolute inset-0 z-20" : "relative"} 
          ${isMobile && !showSidebar ? "hidden" : "flex"}
          w-full md:w-[340px] lg:w-[380px] flex-shrink-0
        `}
      >
        <ChatSidebar
          contacts={MOCK_CONTACTS}
          selectedId={selectedContact?.id}
          onSelect={handleSelectContact}
        />
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col ${isMobile && showSidebar ? "hidden" : "flex"}`}>
        {selectedContact ? (
          <ChatWindow
            contact={selectedContact}
            messages={messages[selectedContact.id] || []}
            onSend={handleSendMessage}
            onBack={() => setShowSidebar(true)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-purple-300/50 text-lg">
            Выберите чат для начала общения
          </div>
        )}
      </div>
    </div>
  )
}
