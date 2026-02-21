"use client";

import { useState, useMemo } from "react";
import { useSimulationStore, GridFilter, FilterTheme } from "@/store/useSimulationStore";
import { Search, Plus, X, Settings2 } from "lucide-react";
import { Switch, Slider } from "./ui";

// Dictionary mapping themes to Tailwind background colors for chips
const themeColors: Record<FilterTheme, string> = {
    amber: "bg-[#f59e0b]",
    green: "bg-[#10b981]",
    teal: "bg-[#14b8a6]",
    cyan: "bg-[#06b6d4]",
    red: "bg-[#ef4444]",
    violet: "bg-[#8b5cf6]",
    indigo: "bg-[#6366f1]",
    orange: "bg-[#f97316]",
    slate: "bg-[#64748b]",
    blue: "bg-[#3b82f6]",
    gray: "bg-[#6b7280]",
    magenta: "bg-[#d946ef]",
};

// Available universe of filters (mocked for the scope of this UI update)
const AVAILABLE_FILTERS: GridFilter[] = [
    { id: "heatwaveIntensity", label: "Heatwave Intensity", theme: "orange", type: "slider", value: 0.8, min: 0, max: 1, step: 0.1, category: "Environment & Weather" },
    { id: "timeOfDay", label: "Time of Day", theme: "gray", type: "slider", value: 17, min: 0, max: 24, step: 1, category: "Environment & Weather" },
    { id: "dataCenterActive", label: "Large Data Center", theme: "amber", type: "toggle", value: true, category: "Demand & Load" },
    { id: "evSurgeActive", label: "EV Charging Surge", theme: "blue", type: "toggle", value: true, category: "DER & EV" },
    { id: "solarFarmActive", label: "Utility Solar Farm", theme: "teal", type: "toggle", value: true, category: "Generation" },
    { id: "batteryStorageActive", label: "Grid Megapack", theme: "cyan", type: "toggle", value: true, category: "Storage & Flexibility" },
    { id: "powerPlantOffline", label: "N-1 Generator Trip", theme: "red", type: "toggle", value: true, category: "Reliability & Protection" },
    { id: "industrialDemandActive", label: "Industrial Spike", theme: "amber", type: "toggle", value: true, category: "Demand & Load" },
];

export default function FilterSearch() {
    const { filters, addFilter, removeFilter, updateFilterValue } = useSimulationStore();
    const [search, setSearch] = useState("");
    const [activeChipEditor, setActiveChipEditor] = useState<string | null>(null);

    // Filter suggestions based on search
    const suggestions = useMemo(() => {
        if (!search.trim()) return [];
        const query = search.toLowerCase();
        return AVAILABLE_FILTERS.filter(
            (f) =>
                !filters.find((active) => active.id === f.id) &&
                (f.label.toLowerCase().includes(query) || f.category.toLowerCase().includes(query))
        ).slice(0, 5); // Max 5 suggestions
    }, [search, filters]);

    return (
        <div className="w-[400px] flex flex-col gap-4">
            {/* Search Input Container - Glass Effect */}
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <div className="flex items-center px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                    <Search size={16} className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search filters (e.g. 'heat wave', 'data center')"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-gray-500"
                    />
                </div>

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                        {suggestions.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => {
                                    addFilter(s);
                                    setSearch("");
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0"
                            >
                                <div>
                                    <div className="text-sm font-medium text-white">{s.label}</div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{s.category}</div>
                                </div>
                                <div className={`p-1 rounded-full ${themeColors[s.theme]} bg-opacity-20`}>
                                    <Plus size={14} className={`text-${s.theme}-400`} style={{ color: themeColors[s.theme] }} />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Filter Chips */}
            <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                    <div key={f.id} className="relative group">
                        <div
                            className={`flex items-center gap-2 pl-3 pr-1 py-1.5 rounded-full border border-white/20 backdrop-blur-md shadow-lg cursor-pointer transition-all hover:brightness-125 ${themeColors[f.theme]} bg-opacity-20`}
                            onClick={() => setActiveChipEditor(activeChipEditor === f.id ? null : f.id)}
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: themeColors[f.theme] }}
                            />
                            <span className="text-xs font-semibold text-white whitespace-nowrap">
                                {f.label}
                                {f.type === "slider" && `: ${typeof f.value === 'number' && f.step && f.step < 1 ? Math.round(f.value * 100) + '%' : f.value}`}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFilter(f.id);
                                    if (activeChipEditor === f.id) setActiveChipEditor(null);
                                }}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors ml-1"
                            >
                                <X size={12} className="text-white/70" />
                            </button>
                        </div>

                        {/* Chip Editor Popover */}
                        {activeChipEditor === f.id && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-xl p-4 shadow-2xl z-40">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                                        <Settings2 size={14} className="text-gray-400" />
                                        Configure Filter
                                    </div>
                                    <button onClick={() => setActiveChipEditor(null)}>
                                        <X size={14} className="text-gray-400 hover:text-white" />
                                    </button>
                                </div>

                                {f.type === "toggle" ? (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-300">Active Status</span>
                                        <Switch
                                            checked={f.value as boolean}
                                            onChange={(v) => updateFilterValue(f.id, v)}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs text-gray-300">
                                            <span>Value: {f.value}</span>
                                        </div>
                                        <Slider
                                            min={f.min!}
                                            max={f.max!}
                                            step={f.step!}
                                            value={f.value as number}
                                            onChange={(v) => updateFilterValue(f.id, v)}
                                            className="text-white"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
