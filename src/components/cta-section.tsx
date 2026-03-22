import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export function CTASection() {
  const navigate = useNavigate()
  return (
    <section className="py-24 px-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
      <div className="max-w-4xl mx-auto text-center">
        <div className="slide-up">
          <h2 className="text-5xl font-bold text-foreground mb-6 font-sans text-balance">Готовы к настоящему общению?</h2>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
            Присоединяйтесь к VibeSpace — платформе, где ваши данные в безопасности,
            а общение остаётся живым и настоящим. Без слежки. Без лишнего шума.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/chat")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 pulse-button text-lg px-8 py-4"
            >
              Создать аккаунт
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-4 bg-transparent"
            >
              Узнать больше
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}