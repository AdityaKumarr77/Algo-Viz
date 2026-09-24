import { useState, useEffect } from "react";
import type { Mode } from "../App";
import { sound } from "../utils/audio";
import type { Theme } from "../hooks/useTheme";

interface TopBarProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const MODES: { key: Mode; label: string; icon: string }[] = [
  { key: "sorting", label: "Sorting", icon: "📊" },
  { key: "searching", label: "Searching", icon: "🔍" },
  { key: "pathfinding", label: "Pathfinding", icon: "🧭" },
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
    }
  };

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
            <defs>
              <linearGradient id="brand-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00F0FF" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#F43F5E" />
              </linearGradient>
            </defs>
            <rect x="2" y="16" width="4.5" height="10" rx="1.5" fill="url(#brand-grad)" />
            <rect x="8.5" y="10" width="4.5" height="16" rx="1.5" fill="url(#brand-grad)" />
            <rect x="15" y="4" width="4.5" height="22" rx="1.5" fill="url(#brand-grad)" />
            <rect x="21.5" y="12" width="4.5" height="14" rx="1.5" fill="url(#brand-grad)" />
          </svg>
        </div>
        <div className="brand-text">
          <span className="brand-name">AlgoViz</span>
          <span className="brand-badge">STUDIO</span>
        </div>
      </div>

      <nav className="mode-switch" role="tablist" aria-label="Visualizer mode">
        {MODES.map((m) => {
          const isActive = mode === m.key;
          return (
            <button
              key={m.key}
              className={`mode-btn${isActive ? " is-active" : ""}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => setMode(m.key)}
            >
              <span className="mode-icon">{m.icon}</span>
              <span className="mode-label">{m.label}</span>
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
          {audioEnabled ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" strokeLinecap="round" />
              <line x1="17" y1="9" x2="23" y2="15" strokeLinecap="round" />
            </svg>
          )}
          <span className="action-label">{audioEnabled ? "Sound ON" : "Sound"}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          className="action-btn theme-toggle"
          onClick={onToggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle color theme"
        >
          {theme === "dark" ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" strokeLinecap="round" />
              <line x1="12" y1="21" x2="12" y2="23" strokeLinecap="round" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeLinecap="round" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeLinecap="round" />
              <line x1="1" y1="12" x2="3" y2="12" strokeLinecap="round" />
              <line x1="21" y1="12" x2="23" y2="12" strokeLinecap="round" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeLinecap="round" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* User GitHub Profile Link Button */}
        <a
          href="https://github.com/AdityaKumarr77"
          target="_blank"
          rel="noreferrer"
          className="action-btn github-btn"
          title="Aditya Kumar Jha on GitHub"
          aria-label="Aditya Kumar Jha on GitHub"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span className="github-handle">AdityaKumarr77</span>
        </a>
      </div>
    </header>
  );
}
