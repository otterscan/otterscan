import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";
import { faDisplay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const ThemeToggler: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(localStorage.theme ?? "system");
  const [updated, setUpdated] = useState<number | null>(null);

  const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  useEffect(() => {
    const mediaQueryListener = (event: MediaQueryListEvent) => {
      if (theme === "system") {
        setUpdated(Date.now());
      }
    };
    darkModeQuery.addEventListener("change", mediaQueryListener);

    return () => {
      darkModeQuery.removeEventListener("change", mediaQueryListener);
    };
  }, [theme, setTheme, setUpdated]);

  useEffect(() => {
    const isDarkMode =
      theme === "dark" || (theme === "system" && darkModeQuery.matches);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, updated]);

  const handleThemeChange = (newTheme: Theme) => {
    if (newTheme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.theme = newTheme;
    }
    setTheme(newTheme);
  };

  return (
    <div
      className={`max-w-max mx-2 my-0.5 flex justify-left gap-1 bg-gray-50 rounded-full [&_>button]:transition [&_>button]:duration-100 [&_>button]:ease-in-out text-xs`}
    >
      <button
        className={`px-3 py-1.5 rounded-full border ${theme === "light" ? "border-gray-500" : "border-gray-300"} hover:border-gray-700 active:border-gray-800 text-gray-500`}
        onClick={() => handleThemeChange("light")}
        title="Light theme"
      >
        <FontAwesomeIcon icon={faSun} size="lg" />
      </button>
      <button
        className={`px-3 py-1.5 rounded-full border ${theme === "dark" ? "border-gray-500" : "border-gray-300"} hover:border-gray-700 active:border-gray-800 text-gray-500`}
        onClick={() => handleThemeChange("dark")}
        title="Dark theme"
      >
        <FontAwesomeIcon icon={faMoon} size="lg" />
      </button>
      <button
        className={`px-3 py-1.5 rounded-full border ${theme === "system" ? "border-gray-500" : "border-gray-300"} hover:border-gray-600 active:border-gray-800 text-gray-500`}
        onClick={() => handleThemeChange("system")}
        title="System preference"
      >
        <FontAwesomeIcon icon={faDisplay} size="lg" />
      </button>
    </div>
  );
};

export default ThemeToggler;
