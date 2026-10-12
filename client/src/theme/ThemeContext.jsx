import { createContext, useContext, useEffect, useState } from "react";

/* "system" follows the phone/computer setting; "light" and "dark" override it.
The choice lives in localStorage, since it's a per-device preference */
const storageKey = "justseen-theme";
const ThemeContext = createContext(null);

const systemPrefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

const readStoredTheme = () => {
  try {
    return localStorage.getItem(storageKey) || "system";
  } catch {
    return "system";
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    const apply = () => {
      const resolved = theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme;
      /* index.css switches every colour on this attribute, and so does daisyUI */
      document.documentElement.dataset.theme = resolved;
    };
    apply();

    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      /* private mode: the theme still works, it just won't be remembered */
    }

    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
