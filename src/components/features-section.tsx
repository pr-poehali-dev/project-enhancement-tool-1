import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    title: "Фото и видео",
    description: "Делитесь моментами жизни: отправляйте фото и видео в высоком качестве прямо в чат или на свою страницу.",
    icon: "photo",
    badge: "Медиа",
  },
  {
    title: "Голосовые сообщения",
    description: "Записывайте голосовые и видеосообщения — общайтесь живо и естественно, как в реальной жизни.",
    icon: "mic",
    badge: "Голос",
  },
  {
    title: "Защита данных",
    description: "Сквозное шифрование всех сообщений и медиафайлов. Ваши данные принадлежат только вам.",
    icon: "lock",
    badge: "Приватность",
  },
  {
    title: "Умные группы",
    description: "Создавайте группы для друзей, сообществ и интересов. Гибкие настройки приватности для каждой.",
    icon: "group",
    badge: "Сообщество",
  },
  {
    title: "Мгновенная доставка",
    description: "Сообщения доставляются в долю секунды. Никаких задержек — общение в режиме реального времени.",
    icon: "zap",
    badge: "Быстро",
  },
  {
    title: "Открытая платформа",
    description: "Регистрация без ограничений. Находите новых друзей и интересных людей по всему миру.",
    icon: "globe",
    badge: "Открытость",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 font-sans">Всё для живого общения</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            VibeSpace объединяет всё необходимое для общения с друзьями в одном месте
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glow-border hover:shadow-lg transition-all duration-300 slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">
                    {feature.icon === "photo" && "📸"}
                    {feature.icon === "mic" && "🎙️"}
                    {feature.icon === "lock" && "🔒"}
                    {feature.icon === "group" && "👥"}
                    {feature.icon === "zap" && "⚡"}
                    {feature.icon === "globe" && "🌍"}
                  </span>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-card-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
