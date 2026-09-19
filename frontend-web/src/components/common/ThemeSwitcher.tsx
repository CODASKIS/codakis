import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="ck-theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? "Passer au thème clair" : "Passer au thème sombre"}
      title={isDark ? "Thème clair" : "Thème sombre"}
    >
      {isDark ? <Sun size={18} strokeWidth={2.4} aria-hidden /> : <Moon size={18} strokeWidth={2.4} aria-hidden />}
    </button>
  );
}
