import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Icon from "@/components/ui/icon"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await register(username, email, password, displayName || username)
      }
      navigate("/chat")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="font-orbitron text-3xl font-bold text-white hover:opacity-80 transition-opacity"
          >
            Vibe<span className="text-purple-400">Space</span>
          </button>
          <p className="text-purple-300/60 mt-2 text-sm">
            {mode === "login" ? "Войдите в свой аккаунт" : "Создайте новый аккаунт"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#12101c] border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-[#0d0d14] rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode("login"); setError("") }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-purple-600 text-white shadow"
                  : "text-purple-300/60 hover:text-purple-300"
              }`}
            >
              Войти
            </button>
            <button
              onClick={() => { setMode("register"); setError("") }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "register"
                  ? "bg-purple-600 text-white shadow"
                  : "text-purple-300/60 hover:text-purple-300"
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-purple-200 text-sm">Имя пользователя</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    required
                    autoComplete="username"
                    className="bg-[#1e1a2e] border-purple-500/20 text-white placeholder:text-purple-300/30 focus-visible:ring-purple-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-purple-200 text-sm">Отображаемое имя</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Как вас называть?"
                    className="bg-[#1e1a2e] border-purple-500/20 text-white placeholder:text-purple-300/30 focus-visible:ring-purple-500/50"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label className="text-purple-200 text-sm">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="bg-[#1e1a2e] border-purple-500/20 text-white placeholder:text-purple-300/30 focus-visible:ring-purple-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-purple-200 text-sm">Пароль</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "Минимум 6 символов" : "Введите пароль"}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="bg-[#1e1a2e] border-purple-500/20 text-white placeholder:text-purple-300/30 focus-visible:ring-purple-500/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/60 hover:text-purple-400 transition-colors"
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <Icon name="AlertCircle" size={14} />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-xl mt-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  {mode === "login" ? "Входим..." : "Создаём аккаунт..."}
                </span>
              ) : (
                mode === "login" ? "Войти" : "Создать аккаунт"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-purple-300/40 text-xs mt-6">
          Продолжая, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  )
}
