import { useState } from "react";
import { Toaster } from "sonner";
import { TopBar } from "./components/TopBar";
import { Footer } from "./components/Footer";
import { SortingView } from "./views/SortingView";
import { SearchingView } from "./views/SearchingView";
import { PathfindingView } from "./views/PathfindingView";
import { useTheme } from "./hooks/useTheme";
import "./styles/global.css";

export type Mode = "sorting" | "searching" | "pathfinding";

export default function App() {
  const [mode, setMode] = useState<Mode>("sorting");
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <Toaster position="bottom-right" richColors theme={theme} closeButton />
      <TopBar mode={mode} setMode={setMode} theme={theme} onToggleTheme={toggleTheme} />
      {mode === "sorting" && <SortingView />}
      {mode === "searching" && <SearchingView />}
      {mode === "pathfinding" && <PathfindingView />}
      <Footer />
    </>
  );
}
