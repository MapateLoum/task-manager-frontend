import { Toaster } from "react-hot-toast"
import "./globals.css"

export const metadata = {
  title: "Task Manager",
  description: "Gestion de tâches collaboratives"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  )
}