"use client";

import { useSimulationStore } from "@/store/useSimulationStore";
import { Play, Pause, SkipForward, RotateCcw, Gauge, Zap, Square, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { generateSimulationReport } from "@/lib/generateReport";

function formatTime(hour: number) {
    const h = Math.floor(hour);
    const m = Math.floor((hour - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function BottomControlBox() {
    const { isPlaying, setIsPlaying, simTime, simSpeed, setSimSpeed, resetSim, latestDispatch, dispatchLog } = useSimulationStore();
    const [generating, setGenerating] = useState(false);
    const [justGenerated, setJustGenerated] = useState(false);

    const handleStop = async () => {
        setIsPlaying(false);
        setGenerating(true);
        await new Promise(r => setTimeout(r, 600));
        const state = useSimulationStore.getState();
        generateSimulationReport(state.nodes, state.dispatchLog, state.latestDispatch);
        setGenerating(false);
        setJustGenerated(true);
        setTimeout(() => setJustGenerated(false), 3000);
    };

    const progressPercent = (simTime / 24) * 100;

    const peakLabel = simTime >= 12 && simTime <= 16 ? 'Solar Peak' : simTime >= 17 && simTime <= 21 ? 'Evening Peak' : simTime >= 6 && simTime <= 9 ? 'Morning Ramp' : 'Off-Peak';
    const peakColor = peakLabel === 'Solar Peak' ? 'text-yellow-400 bg-yellow-400/20' : peakLabel === 'Evening Peak' ? 'text-orange-400 bg-orange-400/20' : peakLabel === 'Morning Ramp' ? 'text-blue-400 bg-blue-400/20' : 'text-gray-400 bg-gray-400/20';

    return (
        <div className="w-[800px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto">

            <div className="flex items-center px-4 py-3 gap-6">

                {/* Playback Controls */}
                <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${
                            isPlaying
                                ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30'
                                : 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30'
                        }`}
                    >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <button
                        onClick={() => {
                            if (!isPlaying) setIsPlaying(true);
                            useSimulationStore.getState().tickSim();
                        }}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Step forward"
                    >
                        <SkipForward size={18} />
                    </button>
                    <button onClick={resetSim} className="p-2 text-gray-400 hover:text-white transition-colors" title="Reset">
                        <RotateCcw size={18} />
                    </button>

                    {/* Stop & Export button */}
                    <button
                        onClick={handleStop}
                        disabled={generating || dispatchLog.length < 2}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            justGenerated
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : generating
                                    ? 'bg-white/5 text-gray-400 border border-white/10 cursor-wait'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30'
                        } ${dispatchLog.length < 2 ? 'opacity-40 cursor-not-allowed' : ''}`}
                        title="Stop simulation and generate report"
                    >
                        {generating ? (
                            <><Loader2 size={13} className="animate-spin" /> Generating...</>
                        ) : justGenerated ? (
                            <><FileText size={13} /> Report saved</>
                        ) : (
                            <><Square size={13} fill="currentColor" /> Stop &amp; Report</>
                        )}
                    </button>
                </div>

                {/* Scrubber Area */}
                <div className="flex-1 flex flex-col gap-1.5 justify-center">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-medium text-white font-mono tabular-nums">
                            {formatTime(simTime)}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${peakColor}`}>
                            {peakLabel}
                        </span>
                        <span className="text-xs font-medium text-gray-500 font-mono">24:00</span>
                    </div>

                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative">
                        <div
                            className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                            style={{
                                width: `${progressPercent}%`,
                                background: isPlaying
                                    ? 'linear-gradient(90deg, #14b8a6, #06b6d4)'
                                    : '#6b7280',
                            }}
                        />
                        {isPlaying && (
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg shadow-cyan-500/30 border-2 border-cyan-400 transition-all duration-300"
                                style={{ left: `calc(${progressPercent}% - 6px)` }}
                            />
                        )}
                    </div>
                </div>

                {/* Speed + Status */}
                <div className="flex items-center gap-2 pl-6 border-l border-white/10">
                    {[0.5, 1, 2, 4].map((speed) => (
                        <button
                            key={speed}
                            onClick={() => setSimSpeed(speed)}
                            className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
                                simSpeed === speed
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                            }`}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>
            </div>

            {/* Mini status bar */}
            {latestDispatch && (
                <div className="flex items-center justify-between px-4 py-1.5 border-t border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-4 text-[10px] text-white/40">
                        <span className="flex items-center gap-1">
                            <Zap size={10} className="text-cyan-400" />
                            Gen: <span className="font-mono text-white/60">{latestDispatch.totalCapacity} MW</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <Gauge size={10} className="text-yellow-400" />
                            Load: <span className="font-mono text-white/60">{latestDispatch.totalDemand} MW</span>
                        </span>
                        <span>
                            Headroom: <span className={`font-mono ${latestDispatch.netHeadroom >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                                {latestDispatch.netHeadroom > 0 ? '+' : ''}{latestDispatch.netHeadroom} MW
                            </span>
                        </span>
                    </div>
                    <span className={`text-[10px] font-mono ${latestDispatch.frequency >= 59.95 && latestDispatch.frequency <= 60.05 ? 'text-emerald-400/60' : 'text-yellow-400/60'}`}>
                        {latestDispatch.frequency.toFixed(2)} Hz
                    </span>
                </div>
            )}
        </div>
    );
}
