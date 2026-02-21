"use client";

import { useSimulationStore } from "../store/useSimulationStore";
import { Switch, Slider } from "./ui";

export default function ControlPanel() {
    const { events, updateEvent, resetSim } = useSimulationStore();

    return (
        <div className="w-80 h-full bg-[#0A192F]/80 backdrop-blur-md border border-[#112240] rounded-2xl p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar shadow-lg text-[#8892B0]">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                    Grid Control
                </h2>
                <p className="text-xs text-[#64FFDA]">Simulation Parameters</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <label className="font-semibold text-white">Time of Day</label>
                        <span className="text-[#64FFDA] font-mono bg-[#112240] px-2 py-0.5 rounded-md">{String(Math.floor(events.timeOfDay)).padStart(2, '0')}:00</span>
                    </div>
                    <Slider
                        min={0} max={24} step={1}
                        value={events.timeOfDay}
                        onChange={(val) => updateEvent("timeOfDay", val)}
                        className="text-cyan-500"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <label className="font-semibold text-white">Heatwave Intensity</label>
                        <span className="text-orange-400 font-mono bg-[#112240] px-2 py-0.5 rounded-md">{Math.round(events.heatwaveIntensity * 100)}%</span>
                    </div>
                    <Slider
                        min={0} max={1} step={0.05}
                        value={events.heatwaveIntensity}
                        onChange={(val) => updateEvent("heatwaveIntensity", val)}
                        className="text-orange-500"
                    />
                </div>
            </div>

            <div className="w-full h-px bg-[#112240]" />

            <div className="space-y-5">
                <h3 className="text-xs font-bold text-[#64FFDA] uppercase tracking-widest">Load Events</h3>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">EV Charging Surge <span className="text-xs opacity-50 block font-normal">(5pm-10pm)</span></span>
                    <Switch checked={events.evSurgeActive} onChange={(v) => updateEvent("evSurgeActive", v)} />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Industrial Spike</span>
                    <Switch checked={events.industrialDemandActive} onChange={(v) => updateEvent("industrialDemandActive", v)} />
                </div>
            </div>

            <div className="w-full h-px bg-[#112240]" />

            <div className="space-y-5">
                <h3 className="text-xs font-bold text-[#64FFDA] uppercase tracking-widest">Infrastructure</h3>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Center Active</span>
                    <Switch checked={events.dataCenterActive} onChange={(v) => updateEvent("dataCenterActive", v)} />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Solar Farm Added</span>
                    <Switch checked={events.solarFarmActive} onChange={(v) => updateEvent("solarFarmActive", v)} />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Battery Storage Online</span>
                    <Switch checked={events.batteryStorageActive} onChange={(v) => updateEvent("batteryStorageActive", v)} />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-400">Main Power Plant Offline</span>
                    <Switch checked={events.powerPlantOffline} onChange={(v) => updateEvent("powerPlantOffline", v)} />
                </div>
            </div>

            <div className="mt-auto pt-6">
                <button
                    onClick={resetSim}
                    className="w-full py-3 bg-[#112240] hover:bg-[#233554] text-[#64FFDA] rounded-lg transition-colors text-sm font-bold uppercase tracking-wider"
                >
                    Reset Simulation
                </button>
            </div>
        </div>
    );
}
