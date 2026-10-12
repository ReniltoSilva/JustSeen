import { useTheme } from "../theme/ThemeContext";
import { MoonIcon, SunIcon } from "./icons";

/* One tap switches between light and dark (whatever is showing now) */
const ThemeToggle = ({ className = "" }) => {
  const { theme, setTheme } = useTheme();
  /* "system" can be either, so ask the device which one it means */
  const isDark =
    theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`grid h-10 w-10 place-items-center rounded-full bg-black/30 text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-black/45 ${className}`}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};

export default ThemeToggle;
