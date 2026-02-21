"use client";

import { useSimulationStore } from "../store/useSimulationStore";
import { Zap, Battery, Activity, Factory, DollarSign } from "lucide-react";

export default function Dashboard() {
    const { metrics } = useSimulationStore();

    return (
        <div className="flex gap-4 w-full">
            <div className="flex-1 min-w-[150px] bg-[#0A192F]/80 backdrop-blur-md border border-[#112240] p-4 rounded-2xl flex flex-col items-start shadow-lg">
                <div className="flex items-center gap-2 text-[#64FFDA] text-xs font-bold mb-2 uppercase tracking-widest">
                    <Zap size={14} /> Total Demand
                </div>
                <div className="text-3xl font-bold font-mono text-white">{metrics.totalDemand} <span className="text-sm font-sans text-gray-400 font-normal">MW</span></div>
            </div>

            <div className="flex-1 min-w-[150px] bg-[#0A192F]/80 backdrop-blur-md border border-[#112240] p-4 rounded-2xl flex flex-col items-start shadow-lg">
                <div className="flex items-center gap-2 text-[#64FFDA] text-xs font-bold mb-2 uppercase tracking-widest">
                    <Battery size={14} /> Gen Capacity
                </div>
                <div className="text-3xl font-bold font-mono text-white">{metrics.totalCapacity} <span className="text-sm font-sans text-gray-400 font-normal">MW</span></div>
            </div>

            <div className={`flex-1 min-w-[150px] bg-[#0A192F]/80 backdrop-blur-md border p-4 rounded-2xl flex flex-col items-start shadow-lg ${metrics.gridStability < 50 ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : (metrics.gridStability < 80 ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'border-[#112240]')}`}>
                <div className={`flex items-center gap-2 text-xs font-bold mb-2 uppercase tracking-widest ${metrics.gridStability < 50 ? 'text-red-400' : 'text-[#64FFDA]'}`}>
                    <Activity size={14} /> Stability
                </div>
                <div className={`text-3xl font-bold font-mono ${metrics.gridStability < 50 ? 'text-red-400' : (metrics.gridStability < 80 ? 'text-yellow-400' : 'text-white')}`}>
                    {metrics.gridStability}%
                </div>
            </div>

            <div className="flex-1 min-w-[150px] bg-[#0A192F]/80 backdrop-blur-md border border-[#112240] p-4 rounded-2xl flex flex-col items-start shadow-lg">
                <div className="flex items-center gap-2 text-[#64FFDA] text-xs font-bold mb-2 uppercase tracking-widest">
                    <Factory size={14} /> Carbon Int.
                </div>
                <div className="text-3xl font-bold font-mono text-white">{metrics.carbonIntensity} <span className="text-sm font-sans text-gray-400 font-normal">g/kWh</span></div>
            </div>

            <div className="flex-1 min-w-[150px] bg-[#0A192F]/80 backdrop-blur-md border border-[#112240] p-4 rounded-2xl flex flex-col items-start shadow-lg">
                <div className="flex items-center gap-2 text-[#64FFDA] text-xs font-bold mb-2 uppercase tracking-widest">
                    <DollarSign size={14} /> Hourly Cost
                </div>
                <div className="text-3xl font-bold font-mono text-white">${metrics.costPerHr.toLocaleString()}</div>
            </div>
        </div>
    );
}
