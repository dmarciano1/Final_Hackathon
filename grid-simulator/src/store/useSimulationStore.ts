import { create } from 'zustand';
export * from './types';
import { GridNode, MAP_CENTER } from './types';
import { MetricSlice, createMetricSlice } from './slices/metricSlice';
import { FilterSlice, createFilterSlice } from './slices/filterSlice';

export interface SimulationStore extends MetricSlice, FilterSlice {
  nodes: Record<string, GridNode>;
  theme: 'light' | 'dark';

  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  tickSim: () => void;
  resetSim: () => void;
  initGrid: () => void;
  recoverNode: (id: string) => void;
}

export const useSimulationStore = create<SimulationStore>()((...a) => ({
  ...createMetricSlice(...a),
  ...createFilterSlice(...a),

  nodes: {},
  theme: 'dark',

  setTheme: (theme) => a[0]({ theme }),

  recoverNode: (id) => {
    // ... existing logic will be ported to citySlice
    a[0]((state) => {
      const newNodes = { ...state.nodes };
      if (newNodes[id]) {
        newNodes[id] = { ...newNodes[id], status: 'normal' };
      }
      return { nodes: newNodes };
    });
    a[1]().tickSim();
  },

  initGrid: () => {
    const { lat, lng } = MAP_CENTER;
    const newNodes: Record<string, GridNode> = {};

    newNodes['plant_1'] = {
      id: 'plant_1', type: 'power_plant', name: 'Main Gas Plant',
      capacity: 1000, currentLoad: 0, status: 'normal',
      connections: ['sub_north', 'sub_south', 'sub_east', 'sub_west'],
      lat, lng, baseLoad: 0, generation: 1000
    };

    const baseSubstationParams = { capacity: 250, baseLoad: 120, generation: 0, status: 'normal' as const };
    newNodes['sub_north'] = { id: 'sub_north', type: 'substation', name: 'North Substation', ...baseSubstationParams, currentLoad: 0, connections: ['plant_1', 'sub_east', 'sub_west'], lat: lat + 0.0018, lng };
    newNodes['sub_south'] = { id: 'sub_south', type: 'substation', name: 'South Substation', ...baseSubstationParams, currentLoad: 0, connections: ['plant_1', 'sub_east', 'sub_west'], lat: lat - 0.0018, lng };
    newNodes['sub_east'] = { id: 'sub_east', type: 'substation', name: 'East Substation', ...baseSubstationParams, currentLoad: 0, connections: ['plant_1', 'sub_north', 'sub_south'], lat, lng: lng + 0.00175 };
    newNodes['sub_west'] = { id: 'sub_west', type: 'substation', name: 'West Substation', ...baseSubstationParams, currentLoad: 0, connections: ['plant_1', 'sub_north', 'sub_south'], lat, lng: lng - 0.0021 };

    a[0]({ nodes: newNodes });
    a[1]().tickSim();
  },

  tickSim: () => {
    const state = a[1]();
    const { nodes, activeFilters } = state;
    const newNodes = { ...nodes };

    let totalDemand = 0;
    let activeGeneration = 0;
    let failedNodes = 0;

    // Helper to get filter value
    const getVal = (id: string, fallback: string | number | boolean): string | number | boolean => activeFilters.find(f => f.id === id)?.value ?? fallback;

    // Extract relevant filters for calculation
    const dcLoad = getVal('dc_load', 250) as number;
    const growth = 1 + ((getVal('city_growth', 1.5) as number) / 100);
    const temp = getVal('wx_temp', 72) as number;
    const heatwave = 1 + (temp > 85 ? (temp - 85) * 0.02 : 0);

    // Basic recalc
    Object.values(newNodes).forEach(node => {
      if (node.status === 'offline') {
        failedNodes++;
        node.currentLoad = 0;
        return;
      }

      if (node.type === 'power_plant') {
        node.generation = 1000;
        activeGeneration += node.generation;
      }

      if (node.type === 'substation') {
        node.currentLoad = node.baseLoad * growth * heatwave;
      }
    });

    // Special: Data Center
    if ((getVal('dc_load', 0) as number) > 0) {
      if (newNodes['sub_west']) newNodes['sub_west'].currentLoad += dcLoad;
      totalDemand += dcLoad;
    }

    // Tally and Metrics
    Object.values(newNodes).forEach(node => {
      if (node.type === 'substation' && node.status !== 'offline') {
        totalDemand += node.currentLoad;
      }
    });

    const totalNodes = Object.keys(newNodes).length;
    const stability = Math.max(0, 100 - (failedNodes / totalNodes) * 100);

    state.setMetrics({
      totalDemand: Math.round(totalDemand),
      totalCapacity: Math.round(activeGeneration),
      gridStability: Math.round(stability),
      carbonIntensity: 400, // mock
      costPerHr: Math.round(totalDemand * 50),
    });

    a[0]({ nodes: newNodes });
  },

  resetSim: () => {
    a[0]({ activeFilters: [] });
    a[1]().initGrid();
  }
}));
