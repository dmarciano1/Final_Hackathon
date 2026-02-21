"use client";

import { useSimulationStore } from "@/store/useSimulationStore";
import { Play, Pause, SkipForward, RotateCcw, MonitorPlay, Activity } from "lucide-react";
import { useState } from "react";

export default function BottomControlBox() {
    const { events, resetSim } = useSimulationStore();
    const [isPlaying, setIsPlaying] = useState(true);

    // Mock progress calculation for the scrubber based on time of day (0-24)
    const progressPercent = (events.timeOfDay / 24) * 100;

    return (
        <div className="w-[800px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">

            {/* Main Control Bar */}
            <div className="flex items-center px-4 py-3 gap-6">

                {/* Playback Controls */}
                <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <SkipForward size={18} />
                    </button>
                    <button onClick={resetSim} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <RotateCcw size={18} />
                    </button>
                </div>

                {/* Scrubber Area */}
                <div className="flex-1 flex flex-col gap-1.5 justify-center">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-medium text-white font-mono">
                            {String(Math.floor(events.timeOfDay)).padStart(2, '0')}:00
                        </span>
                        <div className="flex gap-2">
                            <span className="text-[10px] uppercase font-bold text-[#f59e0b] bg-[#f59e0b]/20 px-1.5 py-0.5 rounded">Heat Peak</span>
                            <span className="text-[10px] uppercase font-bold text-[#3b82f6] bg-[#3b82f6]/20 px-1.5 py-0.5 rounded">EV Load</span>
                        </div>
                        <span className="text-xs font-medium text-gray-500 font-mono">24:00</span>
                    </div>

                    {/* Timeline Track */}
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative group cursor-pointer">
                        <div
                            className="absolute top-0 left-0 h-full bg-[#14b8a6] transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                        />
                        {/* Hover preview line could go here */}
                    </div>
                </div>

                {/* Mode Toggles */}
                <div className="flex items-center gap-2 pl-6 border-l border-white/10">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition-colors">
                        <Activity size={14} />
                        Realtime
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 border border-white/10 text-xs font-semibold hover:bg-white/10 transition-colors">
                        <MonitorPlay size={14} />
                        Deterministic
                    </button>
                </div>
            </div>

        </div>
    );
}
