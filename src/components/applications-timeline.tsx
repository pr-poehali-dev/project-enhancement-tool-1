import { Timeline } from "@/components/ui/timeline"

export function ApplicationsTimeline() {
  const data = [
    {
      title: "Общение с друзьями",
      content: (
        <div>
          <p className="text-white text-sm md:text-base font-normal mb-6 leading-relaxed">
            Личные переписки, голосовые и видеосообщения, обмен фото и видео — всё в одном месте.
            Никакой рекламы в личных чатах, только чистое общение.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-purple-400 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Личные и групповые чаты
            </div>
            <div className="flex items-center gap-3 text-purple-400 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Голосовые и видеосообщения
            </div>
            <div className="flex items-center gap-3 text-purple-400 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Фото и видео в высоком качестве
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Сообщества по интересам",
      content: (
        <div>
          <p className="text-white text-sm md:text-base font-normal mb-6 leading-relaxed">
            Создавайте открытые и закрытые сообщества, находите единомышленников,
            участвуйте в обсуждениях и делитесь контентом с аудиторией.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-purple-400 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Открытые и приватные группы
            </div>
            <div className="flex items-center gap-3 text-purple-400 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Тематические обсуждения и посты
            </div>
            <div className="flex items-center gap-3 text-purple-400 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Реакции, комментарии, репосты
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Безопасность и приватность",
      content: (
        <div>
          <p className="text-white text-sm md:text-base font-normal mb-6 leading-relaxed">
            Все данные зашифрованы и хранятся на защищённых серверах. Вы управляете
            тем, кто видит ваш контент — полный контроль над приватностью.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-purple-400 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Сквозное шифрование сообщений
            </div>
            <div className="flex items-center gap-3 text-purple-400 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Гибкие настройки приватности
            </div>
            <div className="flex items-center gap-3 text-purple-400 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Двухфакторная аутентификация
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <section id="applications" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">Всё что нужно для общения</h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            VibeSpace — это не просто мессенджер. Это пространство для настоящего общения:
            живого, безопасного и без лишнего шума.
          </p>
        </div>

        <div className="relative">
          <Timeline data={data} />
        </div>
      </div>
    </section>
  )
}
