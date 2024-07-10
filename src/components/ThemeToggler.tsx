import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";
import { faDisplay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { SourcifyMenuItem, SourcifyMenuTitle } from "../SourcifyMenu";

type Theme = "light" | "dark" | "system";

function updateTheme(theme: Theme) {
  const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const isDarkMode =
    theme === "dark" || (theme === "system" && darkModeQuery.matches);
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

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
    updateTheme(theme);
  }, [theme, updated]);

  const handleThemeChange = (newTheme: Theme) => {
    if (newTheme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.theme = newTheme;
    }
    setTheme(newTheme);
    updateTheme(newTheme);
  };

  return (
    <>
      <SourcifyMenuTitle>Theme</SourcifyMenuTitle>
      <SourcifyMenuItem
        checked={theme === "light"}
        onClick={() => handleThemeChange("light")}
      >
        <FontAwesomeIcon icon={faSun} className="w-4 mr-0.5" /> Light
      </SourcifyMenuItem>
      <SourcifyMenuItem
        checked={theme === "dark"}
        onClick={() => handleThemeChange("dark")}
      >
        <FontAwesomeIcon icon={faMoon} className="w-4 mr-0.5" /> Dark
      </SourcifyMenuItem>
      <SourcifyMenuItem
        checked={theme === "system"}
        onClick={() => handleThemeChange("system")}
      >
        <FontAwesomeIcon icon={faDisplay} className="w-4 mr-0.5" /> System
      </SourcifyMenuItem>
    </>
  );
};

export default ThemeToggler;
