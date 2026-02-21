"use client";

import { useState } from "react";
import { useSimulationStore } from "../store/useSimulationStore";
import { Switch, Slider } from "./ui";
import { ChevronUp, ChevronDown, Settings } from "lucide-react";

export default function ControlPanel() {
    const { events, updateEvent, resetSim } = useSimulationStore();
    const [expanded, setExpanded] = useState(false);

    if (!expanded) {
        return (
            <button
                onClick={() => setExpanded(true)}
                className="flex items-center gap-2 bg-black/60 backdrop-blur-lg border border-white/10 rounded-full px-4 py-2.5 text-sm font-semibold text-[#64FFDA] hover:bg-black/80 transition-all shadow-lg"
            >
                <Settings size={14} />
                Grid Control
                <ChevronUp size={14} />
            </button>
        );
    }

    return (
        <div className="w-72 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setExpanded(false)}
                className="w-full flex items-center justify-between px-5 py-3 border-b border-white/10 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Settings size={14} className="text-[#64FFDA]" />
                    <span className="text-sm font-bold text-white">Grid Control</span>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
            </button>

            {/* Content */}
            <div className="px-5 py-4 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <label className="text-gray-300">Time of Day</label>
                            <span className="text-[#64FFDA] font-mono">{String(Math.floor(events.timeOfDay)).padStart(2, '0')}:00</span>
                        </div>
                        <Slider min={0} max={24} step={1} value={events.timeOfDay} onChange={(val) => updateEvent("timeOfDay", val)} className="text-cyan-500" />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <label className="text-gray-300">Heatwave Intensity</label>
                            <span className="text-orange-400 font-mono">{Math.round(events.heatwaveIntensity * 100)}%</span>
                        </div>
                        <Slider min={0} max={1} step={0.05} value={events.heatwaveIntensity} onChange={(val) => updateEvent("heatwaveIntensity", val)} className="text-orange-500" />
                    </div>
                </div>

                <div className="h-px bg-white/10" />

                <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-[#64FFDA] uppercase tracking-widest">Load Events</h3>
                    <Row label="EV Charging Surge" sub="5pm-10pm" checked={events.evSurgeActive} onChange={(v) => updateEvent("evSurgeActive", v)} />
                    <Row label="Industrial Spike" checked={events.industrialDemandActive} onChange={(v) => updateEvent("industrialDemandActive", v)} />
                </div>

                <div className="h-px bg-white/10" />

                <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-[#64FFDA] uppercase tracking-widest">Infrastructure</h3>
                    <Row label="Data Center Active" checked={events.dataCenterActive} onChange={(v) => updateEvent("dataCenterActive", v)} />
                    <Row label="Solar Farm Added" checked={events.solarFarmActive} onChange={(v) => updateEvent("solarFarmActive", v)} />
                    <Row label="Battery Storage Online" checked={events.batteryStorageActive} onChange={(v) => updateEvent("batteryStorageActive", v)} />
                    <Row label="Main Power Plant Offline" checked={events.powerPlantOffline} onChange={(v) => updateEvent("powerPlantOffline", v)} danger />
                </div>

                <button
                    onClick={resetSim}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-[#64FFDA] rounded-lg transition-colors text-xs font-bold uppercase tracking-wider border border-white/10"
                >
                    Reset Simulation
                </button>
            </div>
        </div>
    );
}

function Row({
    label,
    sub,
    checked,
    onChange,
    danger,
}: {
    label: string;
    sub?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    danger?: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${danger ? "text-red-400" : "text-gray-300"}`}>
                {label}
                {sub && <span className="block text-[10px] text-gray-500">{sub}</span>}
            </span>
            <Switch checked={checked} onChange={onChange} />
        </div>
    );
}
