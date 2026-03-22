import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "Как VibeSpace защищает мои данные?",
      answer:
        "Все сообщения шифруются сквозным шифрованием — это значит, что даже мы не можем прочитать вашу переписку. Медиафайлы хранятся на защищённых серверах с ограниченным доступом.",
    },
    {
      question: "Можно ли отправлять фото и видео в хорошем качестве?",
      answer:
        "Да. VibeSpace передаёт фото без потери качества, а видео — в разрешении до 4K. Вы также можете записывать и отправлять голосовые и видеосообщения прямо из приложения.",
    },
    {
      question: "Есть ли реклама в VibeSpace?",
      answer:
        "В личных чатах и сообщениях рекламы нет и не будет. Мы монетизируем платформу за счёт платных функций, а не за счёт данных пользователей.",
    },
    {
      question: "Кто может зарегистрироваться?",
      answer:
        "VibeSpace — открытая платформа. Регистрация доступна всем желающим. Вы можете общаться с друзьями, создавать сообщества и находить новых людей по всему миру.",
    },
    {
      question: "Как настроить приватность своего профиля?",
      answer:
        "В настройках профиля вы выбираете, кто видит ваши посты, фото, статус и другую информацию: все, только друзья или только вы. Каждая группа тоже имеет свои настройки доступа.",
    },
    {
      question: "VibeSpace работает на мобильных устройствах?",
      answer:
        "Да, платформа доступна в браузере на любом устройстве. Мобильные приложения для iOS и Android находятся в разработке и будут доступны в ближайшее время.",
    },
  ]

  return (
    <section id="faq" className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-orbitron">Частые вопросы</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-space-mono">
            Ответы на популярные вопросы о VibeSpace, безопасности и возможностях платформы.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-purple-500/20 mb-4">
                <AccordionTrigger className="text-left text-lg font-semibold text-white hover:text-purple-400 font-orbitron px-6 py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 leading-relaxed px-6 pb-4 font-space-mono">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
