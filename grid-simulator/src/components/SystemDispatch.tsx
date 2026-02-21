"use client";

import { useSimulationStore } from "@/store/useSimulationStore";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap, Wind, Sun, Atom, Droplets, Battery, Factory, TrendingUp, TrendingDown, Minus } from "lucide-react";

const GEN_COLORS: Record<string, string> = {
  Gas: "#f97316",
  Nuclear: "#06b6d4",
  Hydro: "#38bdf8",
  Wind: "#60a5fa",
  Solar: "#fbbf24",
  Battery: "#10b981",
  Microgrid: "#34d399",
};

const GEN_ICONS: Record<string, React.ReactNode> = {
  Gas: <Factory size={10} />,
  Nuclear: <Atom size={10} />,
  Hydro: <Droplets size={10} />,
  Wind: <Wind size={10} />,
  Solar: <Sun size={10} />,
  Battery: <Battery size={10} />,
};

function formatTime(hour: number) {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function SystemDispatch() {
  const { isPlaying, latestDispatch, simTime } = useSimulationStore();

  if (!latestDispatch) return null;

  const { generationMix, demandBreakdown, netHeadroom, frequency, totalDemand, totalCapacity } = latestDispatch;

  const totalGen = Object.values(generationMix).reduce((a, b) => a + b, 0);
  const headroomPct = totalCapacity > 0 ? ((netHeadroom / totalCapacity) * 100) : 0;

  const freqColor = Math.abs(frequency - 60) < 0.05 ? "text-emerald-400" : Math.abs(frequency - 60) < 0.15 ? "text-yellow-400" : "text-red-400";
  const headroomColor = headroomPct > 15 ? "text-emerald-400" : headroomPct > 5 ? "text-yellow-400" : "text-red-400";

  const HeadroomIcon = netHeadroom > 0 ? TrendingUp : netHeadroom < 0 ? TrendingDown : Minus;

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="pointer-events-auto w-full"
        >
          <div className="bg-black/70 backdrop-blur-xl border-b border-white/10 px-6 py-3">
            <div className="flex items-center gap-6">

              {/* Live indicator + time */}
              <div className="flex items-center gap-2.5 pr-5 border-r border-white/10">
                <div className="relative flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Live</span>
                </div>
                <span className="text-lg font-mono font-bold text-white tabular-nums">
                  {formatTime(simTime)}
                </span>
              </div>

              {/* Generation mix bar */}
              <div className="flex-1 pr-5 border-r border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Generation Mix</span>
                  <span className="text-[10px] font-mono text-white/50">{Math.round(totalGen)} MW</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-white/5">
                  {Object.entries(generationMix)
                    .filter(([, v]) => v > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([source, value]) => (
                      <div
                        key={source}
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${totalGen > 0 ? (value / totalGen) * 100 : 0}%`,
                          backgroundColor: GEN_COLORS[source] || "#6b7280",
                        }}
                      />
                    ))}
                </div>
                <div className="flex gap-3 mt-1.5">
                  {Object.entries(generationMix)
                    .filter(([, v]) => v > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([source, value]) => (
                      <div key={source} className="flex items-center gap-1">
                        <span style={{ color: GEN_COLORS[source] }}>{GEN_ICONS[source]}</span>
                        <span className="text-[10px] text-white/50">{source}</span>
                        <span className="text-[10px] font-mono text-white/70">{Math.round(value)}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Demand breakdown */}
              <div className="pr-5 border-r border-white/10 min-w-[140px]">
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold block mb-1">Demand</span>
                <span className="text-lg font-mono font-bold text-white">{totalDemand} <span className="text-xs text-white/40">MW</span></span>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                  {Object.entries(demandBreakdown)
                    .filter(([, v]) => v > 0)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 4)
                    .map(([source, value]) => (
                      <span key={source} className="text-[10px] text-white/50">
                        {source}: <span className="font-mono text-white/70">{value}</span>
                      </span>
                    ))}
                </div>
              </div>

              {/* Key metrics */}
              <div className="flex gap-4">
                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold block">Headroom</span>
                  <div className={`flex items-center gap-1 justify-center ${headroomColor}`}>
                    <HeadroomIcon size={14} />
                    <span className="text-sm font-mono font-bold">{netHeadroom} MW</span>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold block">Frequency</span>
                  <div className={`flex items-center gap-1 justify-center ${freqColor}`}>
                    <Activity size={14} />
                    <span className="text-sm font-mono font-bold">{frequency.toFixed(2)} Hz</span>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold block">Reserve</span>
                  <span className={`text-sm font-mono font-bold ${headroomColor}`}>
                    {headroomPct.toFixed(1)}%
                  </span>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
