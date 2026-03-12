import { create } from "zustand"

interface User {
  id: string
  nom: string
  email: string
}

interface AuthStore {
  user: User | null
  token: string | null
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem("token", token)
    set({ token })
  },
  logout: () => {
    localStorage.removeItem("token")
    set({ user: null, token: null })
  }
}))

export default useAuthStore