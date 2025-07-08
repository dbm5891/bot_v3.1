import { createContext, useContext, useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { setDarkMode } from "../../store/slices/uiSlice"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const dispatch = useDispatch()
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    // Remove existing theme classes
    root.classList.remove("light", "dark")

    // Set color scheme meta tag
    const meta = document.querySelector('meta[name="color-scheme"]')
    if (!meta) {
      const newMeta = document.createElement('meta')
      newMeta.name = 'color-scheme'
      document.head.appendChild(newMeta)
    }

    let effectiveTheme = theme
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }

    // Update Redux state
    dispatch(setDarkMode(effectiveTheme === "dark"))

    // Apply theme class
    root.classList.add(effectiveTheme)
    const metaElement = document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement
    if (metaElement) metaElement.content = effectiveTheme

    // Listen for system theme changes if in system mode
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? "dark" : "light"
        root.classList.remove("light", "dark")
        root.classList.add(newTheme)
        dispatch(setDarkMode(e.matches))
        if (metaElement) metaElement.content = newTheme
      }
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme, dispatch])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
} 