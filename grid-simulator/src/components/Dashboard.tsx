"use client";

import { useSimulationStore } from "../store/useSimulationStore";
import { Zap, Battery, Activity, Factory, DollarSign } from "lucide-react";

export default function Dashboard() {
    const { metrics } = useSimulationStore();

    const stabilityColor =
        metrics.gridStability < 50
            ? "text-red-400"
            : metrics.gridStability < 80
              ? "text-yellow-400"
              : "text-white";

    const stabilityBorder =
        metrics.gridStability < 50
            ? "border-red-500/40"
            : metrics.gridStability < 80
              ? "border-yellow-500/40"
              : "border-white/10";

    return (
        <div className="flex gap-2 flex-wrap justify-center">
            <Pill icon={<Zap size={12} />} label="Demand" value={`${metrics.totalDemand} MW`} />
            <Pill icon={<Battery size={12} />} label="Capacity" value={`${metrics.totalCapacity} MW`} />
            <Pill
                icon={<Activity size={12} />}
                label="Stability"
                value={`${metrics.gridStability}%`}
                valueClassName={stabilityColor}
                className={stabilityBorder}
            />
            <Pill icon={<Factory size={12} />} label="Carbon" value={`${metrics.carbonIntensity} g/kWh`} />
            <Pill icon={<DollarSign size={12} />} label="Cost/hr" value={`$${metrics.costPerHr.toLocaleString()}`} />
        </div>
    );
}

function Pill({
    icon,
    label,
    value,
    valueClassName = "text-white",
    className = "border-white/10",
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    valueClassName?: string;
    className?: string;
}) {
    return (
        <div
            className={`flex items-center gap-2 bg-black/50 backdrop-blur-lg border ${className} rounded-full px-4 py-2 shadow-lg`}
        >
            <span className="text-[#64FFDA]">{icon}</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</span>
            <span className={`text-sm font-mono font-bold ${valueClassName}`}>{value}</span>
        </div>
    );
}
