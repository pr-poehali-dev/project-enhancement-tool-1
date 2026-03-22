import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] bg-black/95 backdrop-blur-md border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="font-orbitron text-xl font-bold text-white">
              Vibe<span className="text-purple-400">Space</span>
            </h1>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="font-geist text-white hover:text-purple-400 transition-colors duration-200">
                Возможности
              </a>
              <a href="#safety" className="font-geist text-white hover:text-purple-400 transition-colors duration-200">
                Безопасность
              </a>
              <a href="#faq" className="font-geist text-white hover:text-purple-400 transition-colors duration-200">
                Вопросы
              </a>
            </div>
          </div>

          <div className="hidden md:block">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white font-geist border-0">Присоединиться</Button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-purple-400 transition-colors duration-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/98 border-t border-purple-500/20">
              <a
                href="#features"
                className="block px-3 py-2 font-geist text-white hover:text-purple-400 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Возможности
              </a>
              <a
                href="#safety"
                className="block px-3 py-2 font-geist text-white hover:text-purple-400 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Безопасность
              </a>
              <a
                href="#faq"
                className="block px-3 py-2 font-geist text-white hover:text-purple-400 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Вопросы
              </a>
              <div className="px-3 py-2">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-geist border-0">
                  Присоединиться
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
