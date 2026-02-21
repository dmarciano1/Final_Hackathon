import { StateCreator } from 'zustand';
import { SimulationStore } from '../useSimulationStore';

export interface MetricState {
    metrics: {
        totalDemand: number;
        totalCapacity: number;
        gridStability: number;
        carbonIntensity: number;
        costPerHr: number;
    };
}

export interface MetricActions {
    setMetrics: (metrics: MetricState['metrics']) => void;
}

export type MetricSlice = MetricState & MetricActions;

export const createMetricSlice: StateCreator<SimulationStore, [], [], MetricSlice> = (set) => ({
    metrics: {
        totalDemand: 0,
        totalCapacity: 0,
        gridStability: 100,
        carbonIntensity: 0,
        costPerHr: 0,
    },
    setMetrics: (metrics) => set({ metrics }),
});
