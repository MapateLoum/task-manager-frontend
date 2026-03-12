"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import api from "@/services/api"
import useAuthStore from "@/store/authStore"
import toast from "react-hot-toast"
import PageWrapper from "@/components/PageWrapper"

interface UserProfile {
  id: string
  nom: string
  email: string
}

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

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

const getErrorMessage = (error: any): string => {
  const detail = error.response?.data?.detail
  if (!detail) return "Une erreur est survenue"
  if (Array.isArray(detail)) return detail[0]?.msg || "Erreur de validation"
  if (typeof detail === "string") return detail
  return "Une erreur est survenue"
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser, logout } = useAuthStore()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"info" | "password">("info")

  // Formulaire infos
  const [infoForm, setInfoForm] = useState({ nom: "" })
  const [submittingInfo, setSubmittingInfo] = useState(false)

  // Formulaire mot de passe
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [submittingPassword, setSubmittingPassword] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get("/auth/me")
      setProfile(response.data)
      setInfoForm({ nom: response.data.nom })
    } catch {
      toast.error("Erreur lors du chargement du profil")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (infoForm.nom.trim().length < 2) {
      toast.error("Le nom doit avoir au moins 2 caractères")
      return
    }
    setSubmittingInfo(true)
    try {
      const response = await api.put("/auth/me", { nom: infoForm.nom.trim() })
      setProfile(response.data)
      setUser({ ...user!, nom: infoForm.nom.trim() })
      toast.success("Profil mis à jour ! ✅")
    } catch (error: any) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmittingInfo(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.new_password.length < 8) {
      toast.error("Minimum 8 caractères")
      return
    }
    if (!/[A-Z]/.test(passwordForm.new_password)) {
      toast.error("Au moins une majuscule requise")
      return
    }
    if (!/[0-9]/.test(passwordForm.new_password)) {
      toast.error("Au moins un chiffre requis")
      return
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(passwordForm.new_password)) {
      toast.error("Au moins un caractère spécial requis")
      return
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }
    setSubmittingPassword(true)
    try {
      await api.put("/auth/me/password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })
      toast.success("Mot de passe mis à jour ! 🔒")
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" })
    } catch (error: any) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmittingPassword(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
  const inputStyle = { padding: "14px 24px" }
  const labelClass = "block font-medium text-white/80 mb-1"
  const labelStyle = { fontSize: "14px" }

  const passwordStrength = passwordForm.new_password
    ? (passwordForm.new_password.length >= 8 ? 1 : 0) +
      (/[A-Z]/.test(passwordForm.new_password) ? 1 : 0) +
      (/[0-9]/.test(passwordForm.new_password) ? 1 : 0) +
      (/[!@#$%^&*(),.?\":{}|<>]/.test(passwordForm.new_password) ? 1 : 0)
    : 0

  const initiales = profile?.nom
    ? profile.nom.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600">

        {/* Navbar */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md border-b border-white/20"
          style={{ padding: "16px 32px" }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
                style={{ padding: "8px 16px" }}
              >
                <BackIcon />
                <span className="text-sm hidden sm:block">Retour</span>
              </motion.button>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <span className="text-white font-bold text-xl">Task Manager</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
              style={{ padding: "8px 16px" }}
            >
              <LogoutIcon />
              <span className="text-sm hidden sm:block">Déconnexion</span>
            </motion.button>
          </div>
        </motion.nav>

        {/* Contenu */}
        <div className="max-w-4xl mx-auto" style={{ padding: "40px 48px" }}>

          {/* Header avatar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-6"
            style={{ marginBottom: "40px" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="bg-gradient-to-br from-indigo-400 to-pink-400 rounded-3xl flex items-center justify-center flex-shrink-0"
              style={{ width: "96px", height: "96px" }}
            >
              <span className="text-white font-bold" style={{ fontSize: "32px" }}>
                {initiales}
              </span>
            </motion.div>

            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-white">{profile?.nom}</h1>
              <p className="text-white/70" style={{ marginTop: "6px", fontSize: "15px" }}>
                {profile?.email}
              </p>
              <div style={{ marginTop: "12px" }}>
                <span
                  className="bg-green-400/20 text-green-300 rounded-full"
                  style={{ fontSize: "12px", padding: "4px 12px" }}
                >
                  ✅ Compte actif
                </span>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2 bg-white/10 rounded-2xl"
            style={{ padding: "6px", marginBottom: "32px" }}
          >
            {[
              { key: "info", label: "Mes informations", icon: "👤" },
              { key: "password", label: "Mot de passe", icon: "🔒" },
            ].map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.key as "info" | "password")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-semibold transition ${
                  activeTab === tab.key
                    ? "bg-white text-purple-600"
                    : "text-white/70 hover:text-white"
                }`}
                style={{ padding: "10px 20px", fontSize: "14px" }}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:block">{tab.label}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Contenu tab */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl"
            style={{ padding: "40px 48px", marginBottom: "24px" }}
          >

            {/* Tab infos */}
            {activeTab === "info" && (
              <form onSubmit={handleUpdateInfo}>
                <h2 className="text-xl font-bold text-white" style={{ marginBottom: "6px" }}>
                  Mes informations
                </h2>
                <p className="text-white/60" style={{ fontSize: "14px", marginBottom: "32px" }}>
                  Mets à jour ton nom d'affichage
                </p>

                {/* Nom */}
                <div style={{ marginBottom: "20px" }}>
                  <label className={labelClass} style={labelStyle}>Nom complet</label>
                  <input
                    type="text"
                    value={infoForm.nom}
                    onChange={(e) => setInfoForm({ nom: e.target.value })}
                    className={inputClass}
                    style={inputStyle}
                    placeholder="Ton nom"
                  />
                </div>

                {/* Email lecture seule */}
                <div style={{ marginBottom: "32px" }}>
                  <label className={labelClass} style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded-xl text-white/40 cursor-not-allowed"
                    style={inputStyle}
                  />
                  <p className="text-white/40" style={{ fontSize: "12px", marginTop: "6px" }}>
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <motion.button
                  type="submit"
                  disabled={submittingInfo}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full gradient-btn text-white rounded-xl font-semibold disabled:opacity-50"
                  style={{ padding: "14px 24px" }}
                >
                  {submittingInfo ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Mise à jour...
                    </span>
                  ) : "Sauvegarder ✅"}
                </motion.button>
              </form>
            )}

            {/* Tab mot de passe */}
            {activeTab === "password" && (
              <form onSubmit={handleUpdatePassword}>
                <h2 className="text-xl font-bold text-white" style={{ marginBottom: "6px" }}>
                  Changer le mot de passe
                </h2>
                <p className="text-white/60" style={{ fontSize: "14px", marginBottom: "32px" }}>
                  Choisis un mot de passe fort pour sécuriser ton compte
                </p>

                {/* Mot de passe actuel */}
                <div style={{ marginBottom: "20px" }}>
                  <label className={labelClass} style={labelStyle}>Mot de passe actuel</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
                    >
                      {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div style={{ marginBottom: "20px" }}>
                  <label className={labelClass} style={labelStyle}>Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
                    >
                      {showNew ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {/* Indicateur force */}
                  {passwordForm.new_password && (
                    <div className="flex gap-1" style={{ marginTop: "8px" }}>
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength >= level
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
                </div>

                {/* Confirmer */}
                <div style={{ marginBottom: "32px" }}>
                  <label className={labelClass} style={labelStyle}>Confirmer le nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
                    >
                      {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {passwordForm.confirm_password && (
                    <p
                      className={passwordForm.new_password === passwordForm.confirm_password ? "text-green-300" : "text-red-300"}
                      style={{ fontSize: "12px", marginTop: "6px" }}
                    >
                      {passwordForm.new_password === passwordForm.confirm_password
                        ? "✅ Les mots de passe correspondent"
                        : "❌ Les mots de passe ne correspondent pas"}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={submittingPassword}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full gradient-btn text-white rounded-xl font-semibold disabled:opacity-50"
                  style={{ padding: "14px 24px" }}
                >
                  {submittingPassword ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Mise à jour...
                    </span>
                  ) : "Changer le mot de passe 🔒"}
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Zone danger */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-red-500/10 border border-red-500/20 rounded-3xl"
            style={{ padding: "32px 48px" }}
          >
            <h3 className="text-red-300 font-bold" style={{ fontSize: "16px", marginBottom: "6px" }}>
              ⚠️ Zone de danger
            </h3>
            <p className="text-white/50" style={{ fontSize: "13px", marginBottom: "20px" }}>
              La déconnexion mettra fin à ta session en cours
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-xl font-semibold transition"
              style={{ padding: "12px 24px" }}
            >
              <LogoutIcon />
              Se déconnecter
            </motion.button>
          </motion.div>

        </div>
      </div>
    </PageWrapper>
  )
}