"use client";

import { useSimulationStore } from "../store/useSimulationStore";
import { Switch, Slider } from "./ui";

export default function ControlPanel() {
    const { events, updateEvent, resetSim } = useSimulationStore();

    return (
        <div className="w-80 bg-gray-900/80 backdrop-blur-md border-r border-gray-800 p-4 shrink-0 flex flex-col gap-6 overflow-y-auto z-10 relative">
            <div>
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1">
                    Grid Ops Center
                </h2>
                <p className="text-xs text-gray-400">Simulation Controls & Events</p>
            </div>

            <div className="space-y-5">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <label className="text-gray-300 font-medium">Time of Day</label>
                        <span className="text-cyan-400 font-mono">{String(Math.floor(events.timeOfDay)).padStart(2, '0')}:00</span>
                    </div>
                    <Slider
                        min={0} max={24} step={1}
                        value={events.timeOfDay}
                        onChange={(val) => updateEvent("timeOfDay", val)}
                        className="text-cyan-500"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <label className="text-gray-300 font-medium text-orange-400">Heatwave Intensity</label>
                        <span className="text-orange-400 font-mono">{Math.round(events.heatwaveIntensity * 100)}%</span>
                    </div>
                    <Slider
                        min={0} max={1} step={0.05}
                        value={events.heatwaveIntensity}
                        onChange={(val) => updateEvent("heatwaveIntensity", val)}
                        className="text-orange-500"
                    />
                </div>
            </div>

            <div className="w-full h-px bg-gray-800" />

            <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Load Events</h3>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">EV Charging Surge (5pm-10pm)</span>
                    <Switch checked={events.evSurgeActive} onChange={(v) => updateEvent("evSurgeActive", v)} />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Industrial Spike</span>
                    <Switch checked={events.industrialDemandActive} onChange={(v) => updateEvent("industrialDemandActive", v)} />
                </div>
            </div>

            <div className="w-full h-px bg-gray-800" />

            <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Infrastructure</h3>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Data Center Active</span>
                    <Switch checked={events.dataCenterActive} onChange={(v) => updateEvent("dataCenterActive", v)} />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Solar Farm Added</span>
                    <Switch checked={events.solarFarmActive} onChange={(v) => updateEvent("solarFarmActive", v)} />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Battery Storage Online</span>
                    <Switch checked={events.batteryStorageActive} onChange={(v) => updateEvent("batteryStorageActive", v)} />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-red-400">Main Power Plant Offline</span>
                    <Switch checked={events.powerPlantOffline} onChange={(v) => updateEvent("powerPlantOffline", v)} />
                </div>
            </div>

            <div className="mt-auto pt-6">
                <button
                    onClick={resetSim}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 transition-colors text-sm font-medium"
                >
                    Reset Simulation
                </button>
            </div>
        </div>
    );
}
