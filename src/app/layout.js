
import '../styles/globals.css'
import { OrdenesProvider } from '@/components/OrdenesContext'
import { AuthProvider } from '@/components/AuthContext'
import Topbar from '@/components/Topbar'
import BackButton from '@/components/BackButton'
import FloatingHome from "@/components/FloatingHome";

export const metadata = {
  title: 'Rectificadora Suarez',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-stone-100">
        <FloatingHome />

        <Topbar />
        <header className="flex flex-col items-center py-10 bg-white shadow-sm">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Rectificadora <span className="text-red-600">Suarez</span>
          </h1>
          <div className="w-20 h-1 bg-red-600 mt-2"></div>
        </header>

        {/* ErrorBoundary eliminado para evitar error de build en Server Component */}
          <AuthProvider>
            <OrdenesProvider>
              <main className="max-w-5xl mx-auto p-6">
              <div className="mb-4 flex justify-start">
                <BackButton />
              </div>
                {children}
              </main>
              <footer className="bg-stone-100 border-t border-stone-200 mt-12">
                <div className="max-w-5xl mx-auto px-6 py-8">
                  <div className="text-center text-stone-600 text-sm">
                    <p>&copy; 2026 Rectificadora Suárez. Todos los derechos reservados.</p>
                    <p className="mt-2">Sistema de gestión desarrollado para optimizar procesos de rectificación de motores.</p>
                    <p className="mt-2 text-stone-500">Versión 1.0.0</p>
                  </div>
                </div>
              </footer>
            </OrdenesProvider>
          </AuthProvider>
        {/* ErrorBoundary eliminado para evitar error de build en Server Component */}
      </body>
    </html>
  )
}



