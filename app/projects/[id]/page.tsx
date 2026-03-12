"use client"

import { use } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import api from "@/services/api"
import useAuthStore from "@/store/authStore"
import toast from "react-hot-toast"
import PageWrapper from "@/components/PageWrapper"

interface Task {
  id: string
  titre: string
  description: string
  status: "todo" | "en_cours" | "termine"
  priority: "basse" | "moyenne" | "haute"
  assigned_to: string | null
  due_date: string | null
  project_id: string
}

interface Project {
  id: string
  titre: string
  description: string
  owner_id: string
  membres: string[]
}

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const UserAddIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
)

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const COLUMNS = [
  {
    key: "todo" as const,
    label: "À faire",
    icon: "📋",
    color: "from-slate-500/30 to-slate-600/20",
    border: "border-slate-400/30",
    badge: "bg-slate-400/20 text-slate-200",
  },
  {
    key: "en_cours" as const,
    label: "En cours",
    icon: "⚡",
    color: "from-amber-500/30 to-amber-600/20",
    border: "border-amber-400/30",
    badge: "bg-amber-400/20 text-amber-200",
  },
  {
    key: "termine" as const,
    label: "Terminé",
    icon: "✅",
    color: "from-emerald-500/30 to-emerald-600/20",
    border: "border-emerald-400/30",
    badge: "bg-emerald-400/20 text-emerald-200",
  },
]

const PRIORITY_CONFIG = {
  basse:   { label: "Basse",   color: "bg-blue-400/20 text-blue-200",     dot: "bg-blue-400" },
  moyenne: { label: "Moyenne", color: "bg-yellow-400/20 text-yellow-200", dot: "bg-yellow-400" },
  haute:   { label: "Haute",   color: "bg-red-400/20 text-red-200",       dot: "bg-red-400" },
}

// Helper pour extraire le message d'erreur proprement
const getErrorMessage = (error: any): string => {
  const detail = error.response?.data?.detail
  if (!detail) return "Une erreur est survenue"
  if (Array.isArray(detail)) return detail[0]?.msg || "Erreur de validation"
  if (typeof detail === "string") return detail
  return "Une erreur est survenue"
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { id: projectId } = use(params)

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)

  const [taskForm, setTaskForm] = useState({
    titre: "",
    description: "",
    priority: "moyenne",
    due_date: "",
    assigned_to: "",
    status: "todo",
  })
  const [inviteEmail, setInviteEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [projectId])

  const fetchAll = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`),
      ])
      setProject(projRes.data)
      setTasks(tasksRes.data)
    } catch {
      toast.error("Erreur lors du chargement")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskForm.titre.trim() || taskForm.titre.length < 3) {
      toast.error("Le titre doit avoir au moins 3 caractères")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        titre: taskForm.titre,
        description: taskForm.description || null,
        priority: taskForm.priority,
        due_date: taskForm.due_date || null,
        assigned_to: taskForm.assigned_to || null,
        status: taskForm.status,
      }
      if (editTask) {
        await api.put(`/tasks/${editTask.id}`, payload)
        toast.success("Tâche modifiée ! ✅")
      } else {
        await api.post(`/projects/${projectId}/tasks`, payload)
        toast.success("Tâche créée ! 🚀")
      }
      setShowTaskModal(false)
      resetTaskForm()
      fetchAll()
    } catch (error: any) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Supprimer cette tâche ?")) return
    try {
      await api.delete(`/tasks/${id}`)
      toast.success("Tâche supprimée !")
      fetchAll()
    } catch (error: any) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleEditTask = (task: Task) => {
    setEditTask(task)
    setTaskForm({
      titre: task.titre,
      description: task.description || "",
      priority: task.priority,
      due_date: task.due_date || "",
      assigned_to: task.assigned_to || "",
      status: task.status,
    })
    setShowTaskModal(true)
  }

  const handleStatusChange = async (task: Task, newStatus: Task["status"]) => {
    try {
      await api.put(`/tasks/${task.id}`, { ...task, status: newStatus })
      fetchAll()
    } catch (error: any) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.includes("@")) {
      toast.error("Email invalide")
      return
    }
    setSubmitting(true)
    try {
      await api.post(`/projects/${projectId}/invite`, { email: inviteEmail })
      toast.success("Invitation envoyée ! 🎉")
      setShowInviteModal(false)
      setInviteEmail("")
    } catch (error: any) {
      toast.error(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const resetTaskForm = () => {
    setTaskForm({ titre: "", description: "", priority: "moyenne", due_date: "", assigned_to: "", status: "todo" })
    setEditTask(null)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
  const inputStyle = { padding: "14px 24px" }
  const labelClass = "block font-medium text-white/80 mb-1"
  const labelStyle = { fontSize: "14px" }
  const selectClass = "w-full bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition"

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

        {/* Navbar — remplace l'ancienne */}
<motion.nav
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-white/10 backdrop-blur-md border-b border-white/20"
  style={{ padding: "16px 24px" }}
>
  <div className="max-w-7xl mx-auto flex items-center justify-between">
    <div className="flex items-center gap-3">
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
        <span className="text-white font-bold text-xl hidden sm:block">Task Manager</span>
      </div>
    </div>

    <div className="flex items-center gap-2 sm:gap-3">
      {/* Avatar cliquable → profil */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/profile")}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
        style={{ padding: "8px 12px" }}
      >
        <div
          className="bg-gradient-to-br from-indigo-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ width: "28px", height: "28px", fontSize: "11px", fontWeight: "bold" }}
        >
          {user?.nom?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
        </div>
        <span className="text-white/90 text-sm hidden sm:block font-medium">
          {user?.nom || "..."}
        </span>
      </motion.button>

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
  </div>
</motion.nav>

        {/* Contenu */}
        <div className="max-w-7xl mx-auto" style={{ padding: "40px 48px" }}>

          {/* Header projet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            style={{ marginBottom: "40px" }}
          >
            <div>
              <h1 className="text-3xl font-bold text-white">{project?.titre}</h1>
              {project?.description && (
                <p className="text-white/70" style={{ marginTop: "6px", fontSize: "15px" }}>
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-2" style={{ marginTop: "12px" }}>
                <span className="text-white/60" style={{ fontSize: "13px" }}>
                  👥 {project?.membres.length} membre{(project?.membres.length ?? 0) > 1 ? "s" : ""}
                </span>
                {project?.owner_id === user?.id && (
                  <span
                    className="bg-yellow-400/20 text-yellow-300 rounded-full"
                    style={{ fontSize: "11px", padding: "4px 10px" }}
                  >
                    👑 Owner
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 flex-shrink-0">
              {project?.owner_id === user?.id && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition"
                  style={{ padding: "12px 20px" }}
                >
                  <UserAddIcon />
                  <span className="hidden sm:block" style={{ fontSize: "14px" }}>Inviter</span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { resetTaskForm(); setShowTaskModal(true) }}
                className="flex items-center gap-2 bg-white text-purple-600 font-semibold rounded-xl transition"
                style={{ padding: "12px 20px" }}
              >
                <PlusIcon />
                <span style={{ fontSize: "14px" }}>Nouvelle tâche</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Stats tâches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4"
            style={{ marginBottom: "40px" }}
          >
            {COLUMNS.map((col, i) => (
              <motion.div
                key={col.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={`bg-gradient-to-br ${col.color} backdrop-blur-md rounded-2xl border ${col.border} text-center`}
                style={{ padding: "20px 16px" }}
              >
                <p className="text-2xl" style={{ marginBottom: "8px" }}>{col.icon}</p>
                <p className="text-2xl font-bold text-white" style={{ marginBottom: "4px" }}>
                  {tasks.filter(t => t.status === col.key).length}
                </p>
                <p className="text-white/70" style={{ fontSize: "13px" }}>{col.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Kanban */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter(t => t.status === col.key)
              return (
                <div key={col.key}>
                  {/* En-tête colonne */}
                  <div
                    className={`flex items-center justify-between bg-gradient-to-br ${col.color} backdrop-blur-md rounded-2xl border ${col.border}`}
                    style={{ padding: "16px 20px", marginBottom: "16px" }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{col.icon}</span>
                      <span className="text-white font-semibold" style={{ fontSize: "15px" }}>{col.label}</span>
                    </div>
                    <span
                      className={`${col.badge} rounded-full font-bold`}
                      style={{ fontSize: "12px", padding: "2px 10px" }}
                    >
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tâches */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <AnimatePresence>
                      {colTasks.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center text-white/40 bg-white/5 rounded-2xl border border-white/10 border-dashed"
                          style={{ padding: "32px 16px", fontSize: "13px" }}
                        >
                          Aucune tâche
                        </motion.div>
                      ) : (
                        colTasks.map((task, i) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(0,0,0,0.2)" }}
                            className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
                            style={{ padding: "18px 20px" }}
                          >
                            {/* Header tâche */}
                            <div
                              className="flex items-start justify-between gap-2"
                              style={{ marginBottom: "10px" }}
                            >
                              <h4 className="text-white font-semibold leading-tight" style={{ fontSize: "14px" }}>
                                {task.titre}
                              </h4>
                              <div className="flex gap-1 flex-shrink-0">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEditTask(task)}
                                  className="bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                                  style={{ padding: "6px" }}
                                >
                                  <EditIcon />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition"
                                  style={{ padding: "6px" }}
                                >
                                  <TrashIcon />
                                </motion.button>
                              </div>
                            </div>

                            {/* Description */}
                            {task.description && (
                              <p
                                className="text-white/50 line-clamp-2"
                                style={{ fontSize: "12px", marginBottom: "12px" }}
                              >
                                {task.description}
                              </p>
                            )}

                            {/* Priority + due date */}
                            <div
                              className="flex items-center gap-2 flex-wrap"
                              style={{ marginBottom: "12px" }}
                            >
                              <span
                                className={`flex items-center gap-1 ${PRIORITY_CONFIG[task.priority].color} rounded-full`}
                                style={{ fontSize: "11px", padding: "3px 8px" }}
                              >
                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${PRIORITY_CONFIG[task.priority].dot}`} />
                                {PRIORITY_CONFIG[task.priority].label}
                              </span>
                              {task.due_date && (
                                <span
                                  className="bg-white/10 text-white/60 rounded-full"
                                  style={{ fontSize: "11px", padding: "3px 8px" }}
                                >
                                  📅 {task.due_date}
                                </span>
                              )}
                            </div>

                            {/* Changer statut */}
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task, e.target.value as Task["status"])}
                              className="w-full bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition"
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                            >
                              <option value="todo" className="bg-purple-800">📋 À faire</option>
                              <option value="en_cours" className="bg-purple-800">⚡ En cours</option>
                              <option value="termine" className="bg-purple-800">✅ Terminé</option>
                            </select>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </div>

        {/* ── Modal Tâche ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {showTaskModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              style={{ padding: "16px" }}
              onClick={() => setShowTaskModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl w-full max-w-md"
                style={{ padding: "40px 48px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-white" style={{ marginBottom: "6px" }}>
                  {editTask ? "Modifier la tâche" : "Nouvelle tâche"}
                </h2>
                <p className="text-white/70" style={{ fontSize: "14px", marginBottom: "28px" }}>
                  {editTask ? "Modifie les infos de la tâche" : "Ajoute une tâche à ce projet"}
                </p>

                <form onSubmit={handleCreateOrUpdateTask}>

                  {/* Titre */}
                  <div style={{ marginBottom: "20px" }}>
                    <label className={labelClass} style={labelStyle}>Titre</label>
                    <input
                      type="text"
                      value={taskForm.titre}
                      onChange={(e) => setTaskForm({ ...taskForm, titre: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="Titre de la tâche"
                      autoFocus
                    />
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: "20px" }}>
                    <label className={labelClass} style={labelStyle}>Description</label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      className={inputClass}
                      style={{ padding: "14px 24px" }}
                      placeholder="Description (optionnel)"
                      rows={2}
                    />
                  </div>

                  {/* Priorité + Statut */}
                  <div className="grid grid-cols-2 gap-4" style={{ marginBottom: "20px" }}>
                    <div>
                      <label className={labelClass} style={labelStyle}>Priorité</label>
                      <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                        className={selectClass}
                        style={inputStyle}
                      >
                        <option value="basse" className="bg-purple-800">🔵 Basse</option>
                        <option value="moyenne" className="bg-purple-800">🟡 Moyenne</option>
                        <option value="haute" className="bg-purple-800">🔴 Haute</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass} style={labelStyle}>Statut</label>
                      <select
                        value={taskForm.status}
                        onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                        className={selectClass}
                        style={inputStyle}
                      >
                        <option value="todo" className="bg-purple-800">📋 À faire</option>
                        <option value="en_cours" className="bg-purple-800">⚡ En cours</option>
                        <option value="termine" className="bg-purple-800">✅ Terminé</option>
                      </select>
                    </div>
                  </div>

                  {/* Date limite */}
                  <div style={{ marginBottom: "20px" }}>
                    <label className={labelClass} style={labelStyle}>Date limite</label>
                    <input
                      type="date"
                      value={taskForm.due_date}
                      onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-3" style={{ marginTop: "32px" }}>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowTaskModal(false)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition"
                      style={{ padding: "12px 24px" }}
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 gradient-btn text-white rounded-xl font-semibold disabled:opacity-50"
                      style={{ padding: "12px 24px" }}
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          {editTask ? "Modification..." : "Création..."}
                        </span>
                      ) : editTask ? "Modifier ✅" : "Créer 🚀"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Modal Inviter ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {showInviteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              style={{ padding: "16px" }}
              onClick={() => setShowInviteModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl w-full max-w-md"
                style={{ padding: "40px 48px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-white" style={{ marginBottom: "6px" }}>
                  Inviter un membre
                </h2>
                <p className="text-white/70" style={{ fontSize: "14px", marginBottom: "28px" }}>
                  Entre l'email de la personne à inviter sur ce projet
                </p>

                <form onSubmit={handleInvite}>
                  <div style={{ marginBottom: "20px" }}>
                    <label className={labelClass} style={labelStyle}>Email</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="email@exemple.com"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3" style={{ marginTop: "32px" }}>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition"
                      style={{ padding: "12px 24px" }}
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 gradient-btn text-white rounded-xl font-semibold disabled:opacity-50"
                      style={{ padding: "12px 24px" }}
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Envoi...
                        </span>
                      ) : "Inviter 🎉"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageWrapper>
  )
}