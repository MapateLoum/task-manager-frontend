"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import api from "@/services/api"
import toast from "react-hot-toast"
import PageWrapper from "@/components/PageWrapper"

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [form, setForm] = useState({
    nom: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (form.nom.length < 2) newErrors.nom = "Le nom doit avoir au moins 2 caractères"
    if (!form.email.includes("@")) newErrors.email = "Email invalide"
    if (form.password.length < 8) newErrors.password = "Minimum 8 caractères"
    if (!/[A-Z]/.test(form.password)) newErrors.password = "Au moins une majuscule"
    if (!/[0-9]/.test(form.password)) newErrors.password = "Au moins un chiffre"
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(form.password)) newErrors.password = "Au moins un caractère spécial"
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setLoading(true)
    try {
      await api.post("/auth/register", {
        nom: form.nom,
        email: form.email,
        password: form.password
      })
      toast.success("Compte créé avec succès ! 🎉")
      router.push("/login")
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
  const inputStyle = { padding: "14px 24px" }
  const labelClass = "block font-medium text-white/80 mb-1"
  const labelStyle = { fontSize: "14px" }

  return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* Côté gauche — décoratif */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 items-center justify-center p-12 relative overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-20 left-10 w-48 h-48 bg-white/10 rounded-full"
          />
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full"
          />
          <div className="relative z-10 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-7xl mb-6"
            >
              ✅
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold mb-4"
            >
              Task Manager
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-white/80 text-lg"
            >
              Organise tes projets, collabore avec ton équipe et atteins tes objectifs.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-10 space-y-4 text-left"
            >
              {[
                { icon: "🚀", text: "Créer des projets en quelques secondes" },
                { icon: "👥", text: "Collaborer avec ton équipe" },
                { icon: "📋", text: "Gérer les tâches en mode Kanban" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-white/90">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Côté droit — formulaire */}
        <div className="w-full lg:w-1/2 min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div
              className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl w-full"
              style={{ padding: "40px 48px" }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-3xl font-bold text-white mb-1">
                  Créer un compte
                </h1>
                <p className="text-white/70 mb-6 text-base">
                  Rejoins Task Manager gratuitement
                </p>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Nom */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <label className={labelClass} style={labelStyle}>Nom complet</label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Ton nom"
                  />
                  {errors.nom && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-300 mt-1" style={{ fontSize: "11px" }}>
                      ⚠️ {errors.nom}
                    </motion.p>
                  )}
                </motion.div>

                {/* Email */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <label className={labelClass} style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                    style={inputStyle}
                    placeholder="ton@email.com"
                  />
                  {errors.email && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-300 mt-1" style={{ fontSize: "11px" }}>
                      ⚠️ {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                {/* Password */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <label className={labelClass} style={labelStyle}>Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-300 mt-1" style={{ fontSize: "11px" }}>
                      ⚠️ {errors.password}
                    </motion.p>
                  )}
                  {form.password && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            (form.password.length >= 8 ? 1 : 0) +
                            (/[A-Z]/.test(form.password) ? 1 : 0) +
                            (/[0-9]/.test(form.password) ? 1 : 0) +
                            (/[!@#$%^&*(),.?\":{}|<>]/.test(form.password) ? 1 : 0) >= level
                              ? level <= 1 ? "bg-red-400"
                              : level <= 2 ? "bg-orange-400"
                              : level <= 3 ? "bg-yellow-400"
                              : "bg-green-400"
                              : "bg-white/20"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Confirm Password */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                  <label className={labelClass} style={labelStyle}>Confirmer le mot de passe</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-300 mt-1" style={{ fontSize: "11px" }}>
                      ⚠️ {errors.confirmPassword}
                    </motion.p>
                  )}
                </motion.div>

                {/* Submit */}
                <div style={{ marginTop: "32px" }}>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(99,102,241,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full gradient-btn text-white rounded-xl font-semibold text-lg disabled:opacity-50"
                    style={{ padding: "14px 24px" }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Création en cours...
                      </span>
                    ) : "Créer mon compte 🚀"}
                  </motion.button>
                </div>
              </form>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-white/70 text-sm"
                style={{ marginTop: "24px" }}
              >
                Déjà un compte ?{" "}
                <Link href="/login" className="text-white hover:underline font-semibold">
                  Se connecter
                </Link>
              </motion.p>
            </div>
          </motion.div>
        </div>

      </div>
    </PageWrapper>
  )
}