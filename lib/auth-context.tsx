"use client"

import { createContext, useContext, useCallback, type ReactNode } from "react"
import useSWR from "swr"
import type { UserPayload } from "@/lib/auth"

interface AuthContextType {
  user: UserPayload | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: UserPayload }>
  register: (
    name: string,
    email: string,
    password: string,
    role: string,
    registrationNumber?: string,
    phoneNumber?: string
  ) => Promise<{ success: boolean; error?: string; user?: UserPayload }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) return { user: null }
  return res.json()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, mutate } = useSWR("/api/auth/session", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })

  const user = data?.user ?? null

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!res.ok) return { success: false, error: json.error }
      await mutate()
      return { success: true, user: json.user }
    },
    [mutate]
  )

  const register = useCallback(
    async (name: string, email: string, password: string, role: string, registrationNumber?: string, phoneNumber?: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, registrationNumber, phoneNumber }),
      })
      const json = await res.json()
      if (!res.ok) return { success: false, error: json.error }
      await mutate()
      return { success: true, user: json.user }
    },
    [mutate]
  )

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    await mutate({ user: null }, false)
  }, [mutate])

  const refresh = useCallback(async () => {
    await mutate()
  }, [mutate])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
