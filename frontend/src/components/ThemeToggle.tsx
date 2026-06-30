import { useAppStore } from "../store/appStore";

/** Show and return the dark-mode toggle button. */
export function ShowThemeToggle() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);
  const label = isDarkMode ? "Light" : "Dark";

  return (
    <button
      aria-pressed={isDarkMode}
      className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      type="button"
      onClick={toggleDarkMode}
    >
      {label}
    </button>
  );
}
