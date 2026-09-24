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
      </div>
    </header>
  );
}
