"use client";

import { useSimulationStore } from "../store/useSimulationStore";
import { Zap, Battery, Activity, Factory, DollarSign } from "lucide-react";

export default function Dashboard() {
    const { metrics } = useSimulationStore();

    return (
        <div className="flex gap-4 p-4 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 shrink-0 overflow-x-auto w-full z-10 relative">
            <div className="flex-1 min-w-[150px] bg-black/50 border border-gray-700 p-3 rounded-lg flex flex-col items-start shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1 uppercase tracking-wider">
                    <Zap size={16} className="text-blue-400" /> Total Demand
                </div>
                <div className="text-2xl font-bold font-mono text-blue-100">{metrics.totalDemand} <span className="text-sm text-gray-500">MW</span></div>
            </div>

            <div className="flex-1 min-w-[150px] bg-black/50 border border-gray-700 p-3 rounded-lg flex flex-col items-start shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1 uppercase tracking-wider">
                    <Battery size={16} className="text-green-400" /> Gen Capacity
                </div>
                <div className="text-2xl font-bold font-mono text-green-100">{metrics.totalCapacity} <span className="text-sm text-gray-500">MW</span></div>
            </div>

            <div className={`flex-1 min-w-[150px] bg-black/50 border ${metrics.gridStability < 50 ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : (metrics.gridStability < 80 ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-gray-700')} p-3 rounded-lg flex flex-col items-start`}>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1 uppercase tracking-wider">
                    <Activity size={16} className={metrics.gridStability < 50 ? 'text-red-400' : 'text-gray-300'} /> Stability
                </div>
                <div className={`text-2xl font-bold font-mono ${metrics.gridStability < 50 ? 'text-red-400' : (metrics.gridStability < 80 ? 'text-yellow-400' : 'text-white')}`}>
                    {metrics.gridStability}%
                </div>
            </div>

            <div className="flex-1 min-w-[150px] bg-black/50 border border-gray-700 p-3 rounded-lg flex flex-col items-start">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1 uppercase tracking-wider">
                    <Factory size={16} className="text-emerald-400" /> Carbon Int.
                </div>
                <div className="text-2xl font-bold font-mono text-gray-200">{metrics.carbonIntensity} <span className="text-sm text-gray-500">g/kWh</span></div>
            </div>

            <div className="flex-1 min-w-[150px] bg-black/50 border border-gray-700 p-3 rounded-lg flex flex-col items-start">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1 uppercase tracking-wider">
                    <DollarSign size={16} className="text-yellow-400" /> Hourly Cost
                </div>
                <div className="text-2xl font-bold font-mono text-gray-200">${metrics.costPerHr.toLocaleString()}</div>
            </div>
        </div>
    );
}
