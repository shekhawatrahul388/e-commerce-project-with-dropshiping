import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://dropshiping-products-backend-3.onrender.com/api";
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
  };

  const setPrimaryColor = (color) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) return;
    setPrimaryColorState(color);
  };

  useEffect(() => {
    axios.get(`${API_URL}/settings`, { timeout: 5000 })
      .then(({ data }) => {
        const settings = data?.settings || {};
        if (!localStorage.getItem("theme-mode")) {
          setThemeMode(settings.themeMode === "dark" ? "dark" : "light");
        }
        if (!localStorage.getItem("primary-color") && /^#[0-9a-fA-F]{6}$/.test(settings.primaryColor || "")) {
          setPrimaryColor(settings.primaryColor);
        }
      })
      .catch(() => {});
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
