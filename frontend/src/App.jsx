import { useMemo, useState } from "react";
import TopNav from "./components/TopNav";
import FantasyDashboard from "./pages/FantasyDashboard";
import Marketplace from "./pages/Marketplace";
import MyTeam from "./pages/MyTeam";
import Stats from "./pages/Stats";

function App() {
  const [activeView, setActiveView] = useState("fantasy");

  const view = useMemo(() => {
    switch (activeView) {
      case "team":
        return <MyTeam />;
      case "marketplace":
        return <Marketplace />;
      case "stats":
        return <Stats />;
      case "fantasy":
      default:
        return <FantasyDashboard />;
    }
  }, [activeView]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111b0d] via-[#253b18] to-[#090d08] text-zinc-100">
      <TopNav activeView={activeView} onChange={setActiveView} />
      <main className="mx-auto w-full px-4 py-8 max-w-[2000px] md:px-12 xl:px-20">{view}</main>
    </div>
  );
}

export default App;
