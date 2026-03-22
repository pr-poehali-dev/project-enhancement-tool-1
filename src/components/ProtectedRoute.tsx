import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import Icon from "@/components/ui/icon"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon name="Loader2" size={32} className="text-purple-400 animate-spin" />
          <p className="text-purple-300/50 text-sm">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}
