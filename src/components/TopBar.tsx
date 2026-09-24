import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BarChart3, Search, Compass, Volume2, VolumeX, Sun, Moon } from "lucide-react";
import type { Mode } from "../App";
import { sound } from "../utils/audio";
import type { Theme } from "../hooks/useTheme";

interface TopBarProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const MODES = [
  { key: "sorting" as const, label: "Sorting", Icon: BarChart3 },
  { key: "searching" as const, label: "Searching", Icon: Search },
  { key: "pathfinding" as const, label: "Pathfinding", Icon: Compass },
];

export function TopBar({ mode, setMode, theme, onToggleTheme }: TopBarProps) {
  const [audioEnabled, setAudioEnabled] = useState(sound.enabled);

  useEffect(() => {
    setAudioEnabled(sound.enabled);
  }, []);

  const handleToggleAudio = () => {
    const next = sound.toggle();
    setAudioEnabled(next);
    if (next) {
      sound.playSuccess();
      toast.success("Sound Synthesizer enabled", { description: "Real-time acoustic feedback active." });
    } else {
      toast.info("Sound muted");
    }
  };

  const handleThemeSwitch = () => {
    onToggleTheme();
    const nextTheme = theme === "dark" ? "light" : "dark";
    toast.info(`Switched to ${nextTheme} theme`);
  };

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 28 28" width="26" height="26" fill="none">
            <rect x="2" y="16" width="4.5" height="10" rx="2" fill="var(--accent)" />
            <rect x="8.5" y="10" width="4.5" height="16" rx="2" fill="var(--accent)" />
            <rect x="15" y="4" width="4.5" height="22" rx="2" fill="var(--accent)" />
            <rect x="21.5" y="12" width="4.5" height="14" rx="2" fill="var(--accent-2)" />
          </svg>
        </div>
        <h1 className="brand-text">
          <span className="brand-name">AlgoViz</span>
          <span className="brand-badge">STUDIO</span>
        </h1>
      </div>

      <nav className="mode-switch" role="tablist" aria-label="Visualizer mode">
        {MODES.map(({ key, label, Icon }) => {
          const isActive = mode === key;
          return (
            <button
              key={key}
              className={`mode-btn${isActive ? " is-active" : ""}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setMode(key);
                toast.info(`Switched to ${label} visualizer`);
              }}
            >
              <Icon size={16} className="mode-icon-svg" />
              <span className="mode-label">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="topbar-actions">
        {/* Audio Synthesizer Toggle */}
        <button
          className={`action-btn audio-btn${audioEnabled ? " is-active" : ""}`}
          onClick={handleToggleAudio}
          title={audioEnabled ? "Mute audio synthesizer" : "Enable sound synthesis"}
          aria-label={audioEnabled ? "Mute sound" : "Enable sound"}
        >
          {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="action-label">{audioEnabled ? "Sound ON" : "Sound"}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          className="action-btn theme-toggle"
          onClick={handleThemeSwitch}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle color theme"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* GitHub Project Repo Link Button */}
        <a
          href="https://github.com/AdityaKumarr77/Algo-Viz"
          target="_blank"
          rel="noreferrer"
          className="action-btn github-btn"
          title="Algo-Viz on GitHub"
          aria-label="Algo-Viz repository on GitHub"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span className="github-handle">AdityaKumarr77/Algo-Viz</span>
        </a>
      </div>
    </header>
  );
}
