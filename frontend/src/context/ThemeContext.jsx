import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://e-commerce-project-with-dropshiping.onrender.com/api";
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState(
    () => localStorage.getItem("theme-mode") || "light"
  );
  const [primaryColor, setPrimaryColorState] = useState(
    () => localStorage.getItem("primary-color") || "#2563eb"
  );

  const setThemeMode = (mode) => {
    const nextMode = mode === "dark" ? "dark" : "light";
    setThemeModeState(nextMode);
    localStorage.setItem("theme-mode", nextMode);
  };

  const setPrimaryColor = (color) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) return;
    setPrimaryColorState(color);
    localStorage.setItem("primary-color", color.toLowerCase());
  };

  useEffect(() => {
    let active = true;

    const loadAppearance = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/settings`, { timeout: 5000 });
        const settings = data?.settings || {};

        if (!active) return;

        const serverMode = settings.themeMode === "dark" ? "dark" : "light";
        const serverColor = settings.primaryColor;

        setThemeModeState(serverMode);
        localStorage.setItem("theme-mode", serverMode);

        if (/^#[0-9a-fA-F]{6}$/.test(serverColor || "")) {
          setPrimaryColorState(serverColor.toLowerCase());
          localStorage.setItem("primary-color", serverColor.toLowerCase());
        }
      } catch {
        // Keep the locally cached appearance when the settings API is unavailable.
      }
    };

    const handleStorage = (event) => {
      if (event.key === "theme-mode" && ["light", "dark"].includes(event.newValue)) {
        setThemeModeState(event.newValue);
      }

      if (event.key === "primary-color" && /^#[0-9a-fA-F]{6}$/.test(event.newValue || "")) {
        setPrimaryColorState(event.newValue);
      }
    };

    loadAppearance();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", loadAppearance);
    const timer = window.setInterval(loadAppearance, 30000);

    return () => {
      active = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", loadAppearance);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "dark");
    document.body.classList.toggle("dark", themeMode === "dark");
    document.documentElement.style.setProperty("--brand-primary", primaryColor);
    document.documentElement.style.colorScheme = themeMode;
  }, [themeMode, primaryColor]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
