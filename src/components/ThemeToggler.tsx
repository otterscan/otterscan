import { faCog, faLightbulb, faMoon } from "@fortawesome/free-solid-svg-icons";
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
      className={`max-w-max mx-2 my-1 flex justify-left gap-1 bg-gray-100 rounded-full [&_>button]:transition [&_>button]:duration-100 [&_>button]:ease-in-out text-xs`}
    >
      <button
        className={`px-4 py-2 rounded-full border-2 ${theme === "light" ? "border-gray-500" : "border-gray-300"} hover:border-yellow-500 active:border-yellow-600 text-gray-600`}
        onClick={() => handleThemeChange("light")}
        title="Light theme"
      >
        <FontAwesomeIcon icon={faLightbulb} size="lg" />
      </button>
      <button
        className={`px-4 py-2 rounded-full border-2 ${theme === "dark" ? "border-gray-500" : "border-gray-300"} hover:border-gray-700 active:border-gray-700 text-gray-600`}
        onClick={() => handleThemeChange("dark")}
        title="Dark theme"
      >
        <FontAwesomeIcon icon={faMoon} size="lg" />
      </button>
      <button
        className={`px-4 py-2 rounded-full border-2 ${theme === "system" ? "border-gray-500" : "border-gray-300"} hover:border-gray-600 active:border-gray-800 text-gray-600`}
        onClick={() => handleThemeChange("system")}
        title="System preference"
      >
        <FontAwesomeIcon icon={faCog} size="lg" />
      </button>
    </div>
  );
};

export default ThemeToggler;
