"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import api from "@/services/api"
import useAuthStore from "@/store/authStore"
import toast from "react-hot-toast"
import PageWrapper from "@/components/PageWrapper"
import SkeletonCard from "@/components/SkeletonCard"

interface Project {
  id: string
  titre: string
  description: string
  owner_id: string
  membres: string[]
  created_at: string
}

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  </svg>
)

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [form, setForm] = useState({ titre: "", description: "" })
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects/")
      setProjects(response.data)
    } catch (error) {
      toast.error("Erreur lors du chargement des projets")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titre.trim() || form.titre.length < 3) {
      toast.error("Le titre doit avoir au moins 3 caractères")
      return
    }
    setSubmitting(true)
    try {
      if (editProject) {
        await api.put(`/projects/${editProject.id}`, form)
        toast.success("Projet modifié ! ✅")
      } else {
        await api.post("/projects/", form)
        toast.success("Projet créé ! 🚀")
      }
      setShowModal(false)
      setForm({ titre: "", description: "" })
      setEditProject(null)
      fetchProjects()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Une erreur est survenue")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce projet ?")) return
    try {
      await api.delete(`/projects/${id}`)
      toast.success("Projet supprimé !")
      fetchProjects()
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleEdit = (project: Project) => {
    setEditProject(project)
    setForm({ titre: project.titre, description: project.description })
    setShowModal(true)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const filteredProjects = projects.filter(p =>
    p.titre.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
  const inputStyle = { padding: "14px 24px" }
  const labelClass = "block font-medium text-white/80 mb-1"
  const labelStyle = { fontSize: "14px" }

  // Initiales pour l'avatar navbar
  const initiales = user?.nom
    ? user.nom.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600">

        {/* Navbar */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md border-b border-white/20"
          style={{ padding: "16px 24px" }}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <span className="text-2xl">✅</span>
              <span className="text-white font-bold text-xl hidden sm:block">Task Manager</span>
            </motion.div>

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
                  {initiales}
                </div>
                <span className="text-white/90 text-sm hidden sm:block font-medium">
                  {user?.nom || "..."}
                </span>
              </motion.button>

              {/* Bouton profil visible seulement sur mobile */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/profile")}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white rounded-xl transition sm:hidden"
                style={{ padding: "8px 12px" }}
              >
                <UserIcon />
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
        <div className="max-w-6xl mx-auto" style={{ padding: "32px 16px" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ marginBottom: "24px" }}
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Mes Projets</h1>
              <p className="text-white/70" style={{ marginTop: "6px", fontSize: "15px" }}>
                {projects.length} projet{projects.length > 1 ? "s" : ""} au total
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditProject(null)
                setForm({ titre: "", description: "" })
                setShowModal(true)
              }}
              className="flex items-center justify-center gap-2 bg-white text-purple-600 font-semibold rounded-xl transition w-full sm:w-auto"
              style={{ padding: "12px 24px" }}
            >
              <PlusIcon />
              Nouveau projet
            </motion.button>
          </motion.div>

          {/* Barre de recherche */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ marginBottom: "24px" }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Rechercher un projet..."
              className={inputClass}
              style={inputStyle}
            />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-3 sm:gap-4"
            style={{ marginBottom: "32px" }}
          >
            {[
              { label: "Total", value: projects.length, icon: "📁" },
              { label: "Mes projets", value: projects.filter(p => p.owner_id === user?.id).length, icon: "👑" },
              { label: "Collaborations", value: projects.filter(p => p.owner_id !== user?.id).length, icon: "🤝" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl text-center"
                style={{ padding: "16px 8px" }}
              >
                <p className="text-xl sm:text-2xl" style={{ marginBottom: "6px" }}>{stat.icon}</p>
                <p className="text-xl sm:text-2xl font-bold text-white" style={{ marginBottom: "4px" }}>{stat.value}</p>
                <p className="text-white/70" style={{ fontSize: "11px" }}>{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Liste des projets */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
              style={{ paddingTop: "80px", paddingBottom: "80px" }}
            >
              <p className="text-6xl" style={{ marginBottom: "16px" }}>📭</p>
              <p className="text-white text-xl font-semibold">Aucun projet trouvé</p>
              <p className="text-white/60" style={{ marginTop: "8px" }}>
                {search ? "Essaie un autre terme de recherche" : "Crée ton premier projet !"}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <AnimatePresence>
                {filteredProjects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl cursor-pointer border border-white/20 transition-all"
                    style={{ padding: "20px" }}
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2" style={{ marginBottom: "14px" }}>
                      <div className="bg-white/20 rounded-xl flex-shrink-0" style={{ padding: "8px" }}>
                        <FolderIcon />
                      </div>
                      <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(project)}
                          className="bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                          style={{ padding: "8px" }}
                        >
                          <EditIcon />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(project.id)}
                          className="bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition"
                          style={{ padding: "8px" }}
                        >
                          <TrashIcon />
                        </motion.button>
                      </div>
                    </div>

                    <h3
                      className="text-white font-bold truncate overflow-hidden"
                      style={{ fontSize: "16px", marginBottom: "8px" }}
                    >
                      {project.titre}
                    </h3>

                    <p
                      className="text-white/60 line-clamp-2"
                      style={{ fontSize: "13px", marginBottom: "16px" }}
                    >
                      {project.description || "Aucune description"}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span style={{ fontSize: "12px" }}>👥</span>
                        <span className="text-white/60" style={{ fontSize: "12px" }}>
                          {project.membres.length} membre{project.membres.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      {project.owner_id === user?.id ? (
                        <span className="bg-yellow-400/20 text-yellow-300 rounded-full" style={{ fontSize: "11px", padding: "4px 10px" }}>
                          👑 Owner
                        </span>
                      ) : (
                        <span className="bg-blue-400/20 text-blue-300 rounded-full" style={{ fontSize: "11px", padding: "4px 10px" }}>
                          🤝 Membre
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Modal créer/modifier projet */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              style={{ padding: "16px" }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl w-full max-w-md"
                style={{ padding: "32px 24px" }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-white" style={{ marginBottom: "6px" }}>
                  {editProject ? "Modifier le projet" : "Nouveau projet"}
                </h2>
                <p className="text-white/70" style={{ fontSize: "14px", marginBottom: "28px" }}>
                  {editProject ? "Modifie les infos de ton projet" : "Crée un nouveau projet pour ton équipe"}
                </p>

                <form onSubmit={handleCreateOrUpdate}>
                  <div style={{ marginBottom: "20px" }}>
                    <label className={labelClass} style={labelStyle}>Titre</label>
                    <input
                      type="text"
                      value={form.titre}
                      onChange={(e) => setForm({ ...form, titre: e.target.value })}
                      className={inputClass}
                      style={inputStyle}
                      placeholder="Nom du projet"
                      autoFocus
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label className={labelClass} style={labelStyle}>Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className={inputClass}
                      style={{ padding: "14px 24px" }}
                      placeholder="Description du projet (optionnel)"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3" style={{ marginTop: "32px" }}>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowModal(false)}
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
                          {editProject ? "Modification..." : "Création..."}
                        </span>
                      ) : editProject ? "Modifier ✅" : "Créer 🚀"}
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