"use client";

import { useSimulationStore } from "@/store/useSimulationStore";
import { INFRASTRUCTURE_BLUEPRINTS, InfrastructureBlueprint } from "@/store/types";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Trash2 } from "lucide-react";

const SECTIONS: { label: string; types: string[] }[] = [
  { label: "Generation", types: ["power_plant", "nuclear_plant", "wind_farm", "solar_farm", "hydro_plant"] },
  { label: "Grid", types: ["substation", "battery_storage", "microgrid"] },
  { label: "Load Centers", types: ["data_center", "ev_charging_hub", "hospital", "stadium"] },
];

function BlueprintCard({ bp, isSelected, count, onSelect }: {
  bp: InfrastructureBlueprint;
  isSelected: boolean;
  count: number;
  onSelect: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={`relative text-left p-2.5 rounded-xl border transition-all duration-200 ${
        isSelected
          ? "bg-white/10 border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
          : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
          style={{ backgroundColor: bp.color + "20" }}
        >
          {bp.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[13px] font-medium text-white/90 truncate">{bp.label}</span>
            {count > 0 && (
              <span className="text-[10px] font-mono text-white/40 bg-white/5 px-1.5 rounded shrink-0">
                {count}
              </span>
            )}
          </div>
          <p className="text-[10px] text-white/40 mt-0.5 leading-tight truncate">{bp.description}</p>
        </div>
      </div>
      {isSelected && (
        <motion.div layoutId="palette-sel" className="absolute inset-0 rounded-xl border-2 border-cyan-400/40 pointer-events-none" />
      )}
    </motion.button>
  );
}

export default function InfrastructurePalette() {
  const { placementMode, setPlacementMode, nodes, removeNode } = useSimulationStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const placedCounts = Object.values(nodes).reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {});

  const initialNodeIds = new Set(["plant_1", "sub_north", "sub_south", "sub_east", "sub_west"]);
  const userPlacedNodes = Object.values(nodes).filter((n) => !initialNodeIds.has(n.id));

  return (
    <>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 pointer-events-auto
                   bg-black/60 backdrop-blur-md border border-white/10 rounded-r-lg p-1.5
                   hover:bg-white/10 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="pointer-events-auto w-[250px] flex flex-col gap-3 max-h-[calc(100vh-180px)]"
          >
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 overflow-y-auto custom-scrollbar">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
                Infrastructure
              </h3>

              <AnimatePresence>
                {placementMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-center overflow-hidden"
                  >
                    <p className="text-xs text-cyan-300 font-medium">Click on the map to place</p>
                    <button
                      onClick={() => setPlacementMode(null)}
                      className="mt-1.5 text-[11px] text-white/50 hover:text-white flex items-center gap-1 mx-auto transition-colors"
                    >
                      <X size={11} /> Cancel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-3">
                {SECTIONS.map((section) => {
                  const blueprints = section.types
                    .map((t) => INFRASTRUCTURE_BLUEPRINTS.find((bp) => bp.type === t))
                    .filter(Boolean) as InfrastructureBlueprint[];

                  return (
                    <div key={section.label}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1.5 pl-1">
                        {section.label}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {blueprints.map((bp) => (
                          <BlueprintCard
                            key={bp.type}
                            bp={bp}
                            isSelected={placementMode === bp.type}
                            count={placedCounts[bp.type] ?? 0}
                            onSelect={() => setPlacementMode(placementMode === bp.type ? null : bp.type)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {userPlacedNodes.length > 0 && (
              <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-2">
                  Placed ({userPlacedNodes.length})
                </h3>
                <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto custom-scrollbar">
                  {userPlacedNodes.map((node) => {
                    const bp = INFRASTRUCTURE_BLUEPRINTS.find((b) => b.type === node.type);
                    return (
                      <div
                        key={node.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm">{bp?.icon}</span>
                          <span className="text-xs text-white/70 truncate">{node.name}</span>
                        </div>
                        <button
                          onClick={() => removeNode(node.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400/70 hover:text-red-400 transition-all p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
