import { create } from 'zustand';
export * from './types';
import { GridNode, MAP_CENTER, NodeType, INFRASTRUCTURE_BLUEPRINTS } from './types';
import { MetricSlice, createMetricSlice } from './slices/metricSlice';
import { FilterSlice, createFilterSlice } from './slices/filterSlice';

export interface DispatchSnapshot {
  time: number;
  totalDemand: number;
  totalCapacity: number;
  gridStability: number;
  carbonIntensity: number;
  costPerHr: number;
  generationMix: Record<string, number>;
  demandBreakdown: Record<string, number>;
  netHeadroom: number;
  frequency: number;
}

export interface SimulationStore extends MetricSlice, FilterSlice {
  nodes: Record<string, GridNode>;
  theme: 'light' | 'dark';
  placementMode: NodeType | null;
  lastPlacedId: string | null;

  // Simulation state
  isPlaying: boolean;
  simTime: number;
  simSpeed: number;
  dispatchLog: DispatchSnapshot[];
  latestDispatch: DispatchSnapshot | null;

  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setPlacementMode: (mode: NodeType | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setSimSpeed: (speed: number) => void;
  addNode: (type: NodeType, lat: number, lng: number) => void;
  removeNode: (id: string) => void;
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
  placementMode: null,
  lastPlacedId: null,

  isPlaying: false,
  simTime: 12,
  simSpeed: 1,
  dispatchLog: [],
  latestDispatch: null,

  setTheme: (theme) => a[0]({ theme }),
  setPlacementMode: (mode) => a[0]({ placementMode: mode }),
  setIsPlaying: (playing) => a[0]({ isPlaying: playing }),
  setSimSpeed: (speed) => a[0]({ simSpeed: speed }),

  addNode: (type, lat, lng) => {
    const blueprint = INFRASTRUCTURE_BLUEPRINTS.find(b => b.type === type);
    if (!blueprint) return;

    const id = `${type}_${Date.now()}`;
    const state = a[1]();
    const existingNodes = Object.values(state.nodes);

    const nearest = existingNodes
      .map(n => ({ id: n.id, dist: Math.hypot(n.lat - lat, n.lng - lng) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 2)
      .map(n => n.id);

    const newNode: GridNode = {
      id,
      type,
      name: `${blueprint.label} ${Object.values(state.nodes).filter(n => n.type === type).length + 1}`,
      capacity: blueprint.defaultCapacity,
      currentLoad: 0,
      status: 'normal',
      connections: nearest,
      lat,
      lng,
      baseLoad: blueprint.defaultBaseLoad,
      generation: blueprint.defaultGeneration,
    };

    const newNodes = { ...state.nodes, [id]: newNode };
    nearest.forEach(nId => {
      if (newNodes[nId]) {
        newNodes[nId] = { ...newNodes[nId], connections: [...newNodes[nId].connections, id] };
      }
    });

    a[0]({ nodes: newNodes, placementMode: null, lastPlacedId: id });
    a[1]().tickSim();
  },

  removeNode: (id) => {
    const state = a[1]();
    const newNodes = { ...state.nodes };
    const removed = newNodes[id];
    if (!removed) return;

    delete newNodes[id];
    Object.values(newNodes).forEach(node => {
      if (node.connections.includes(id)) {
        newNodes[node.id] = { ...node, connections: node.connections.filter(c => c !== id) };
      }
    });

    a[0]({ nodes: newNodes });
    a[1]().tickSim();
  },

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
    const { nodes, activeFilters, isPlaying, simTime, simSpeed, dispatchLog } = state;
    const newNodes = { ...nodes };

    const newSimTime = isPlaying ? (simTime + 0.25 * simSpeed) % 24 : simTime;
    const hour = newSimTime;

    let totalDemand = 0;
    let activeGeneration = 0;
    let failedNodes = 0;
    const generationMix: Record<string, number> = {};
    const demandBreakdown: Record<string, number> = {};

    const getVal = (id: string, fallback: string | number | boolean): string | number | boolean =>
      activeFilters.find(f => f.id === id)?.value ?? fallback;

    const dcLoad = getVal('dc_load', 250) as number;
    const growth = 1 + ((getVal('city_growth', 1.5) as number) / 100);
    const temp = getVal('wx_temp', 72) as number;
    const heatwave = 1 + (temp > 85 ? (temp - 85) * 0.02 : 0);

    // Time-of-day demand curve (peaks at 14:00 and 19:00)
    const demandCurve = 0.6 + 0.4 * (
      Math.exp(-((hour - 14) ** 2) / 8) +
      0.7 * Math.exp(-((hour - 19) ** 2) / 6)
    );

    // Solar availability (bell curve centered at 12:00, zero at night)
    const solarFactor = hour >= 6 && hour <= 20
      ? Math.max(0, Math.sin(((hour - 6) / 14) * Math.PI))
      : 0;

    // Wind profile (stronger at night, dips midday)
    const windFactor = 0.5 + 0.3 * Math.cos(((hour - 3) / 24) * 2 * Math.PI) + Math.random() * 0.15;

    // EV charging curve (peaks 17:00-22:00)
    const evFactor = Math.exp(-((hour - 20) ** 2) / 10) * 1.5;

    Object.values(newNodes).forEach(node => {
      if (node.status === 'offline') {
        failedNodes++;
        node.currentLoad = 0;
        return;
      }

      let gen = 0;
      let load = 0;

      switch (node.type) {
        case 'power_plant':
          gen = node.capacity * (0.7 + 0.3 * demandCurve);
          generationMix['Gas'] = (generationMix['Gas'] || 0) + gen;
          break;
        case 'nuclear_plant':
          gen = node.capacity * 0.92;
          generationMix['Nuclear'] = (generationMix['Nuclear'] || 0) + gen;
          break;
        case 'hydro_plant':
          gen = node.capacity * (0.6 + 0.3 * demandCurve);
          generationMix['Hydro'] = (generationMix['Hydro'] || 0) + gen;
          break;
        case 'wind_farm':
          gen = node.capacity * windFactor;
          generationMix['Wind'] = (generationMix['Wind'] || 0) + gen;
          break;
        case 'solar_farm':
          gen = node.capacity * solarFactor;
          generationMix['Solar'] = (generationMix['Solar'] || 0) + gen;
          break;
        case 'battery_storage': {
          const discharging = demandCurve > 0.8;
          gen = discharging ? node.capacity * 0.8 : node.capacity * 0.1;
          generationMix['Battery'] = (generationMix['Battery'] || 0) + gen;
          break;
        }
        case 'microgrid':
          gen = node.capacity * 0.5 * solarFactor;
          load = node.baseLoad * growth * demandCurve;
          generationMix['Microgrid'] = (generationMix['Microgrid'] || 0) + gen;
          demandBreakdown['Microgrid'] = (demandBreakdown['Microgrid'] || 0) + load;
          break;
        case 'substation':
          load = node.baseLoad * growth * heatwave * demandCurve;
          demandBreakdown['Distribution'] = (demandBreakdown['Distribution'] || 0) + load;
          break;
        case 'data_center':
          load = node.baseLoad * heatwave * (0.9 + 0.1 * Math.random());
          demandBreakdown['Data Center'] = (demandBreakdown['Data Center'] || 0) + load;
          break;
        case 'ev_charging_hub':
          load = node.baseLoad * growth * evFactor;
          demandBreakdown['EV Charging'] = (demandBreakdown['EV Charging'] || 0) + load;
          break;
        case 'hospital':
          load = node.baseLoad * growth * (0.85 + 0.15 * demandCurve);
          demandBreakdown['Hospital'] = (demandBreakdown['Hospital'] || 0) + load;
          break;
        case 'stadium':
          const eventActive = hour >= 18 && hour <= 22;
          load = eventActive ? node.baseLoad * growth : node.baseLoad * 0.1;
          demandBreakdown['Stadium'] = (demandBreakdown['Stadium'] || 0) + load;
          break;
      }

      node.generation = gen;
      node.currentLoad = load;
      activeGeneration += gen;
      totalDemand += load;

      // Auto-status based on load ratio
      if (node.capacity > 0 && node.currentLoad > 0) {
        const ratio = node.currentLoad / node.capacity;
        if (ratio > 0.95) node.status = 'critical';
        else if (ratio > 0.8) node.status = 'warning';
        else node.status = 'normal';
      }
    });

    if ((getVal('dc_load', 0) as number) > 0) {
      if (newNodes['sub_west']) newNodes['sub_west'].currentLoad += dcLoad;
      totalDemand += dcLoad;
      demandBreakdown['Data Center'] = (demandBreakdown['Data Center'] || 0) + dcLoad;
    }

    const totalNodes = Object.keys(newNodes).length;
    const stability = Math.max(0, 100 - (failedNodes / totalNodes) * 100);
    const netHeadroom = activeGeneration - totalDemand;
    const frequencyDeviation = netHeadroom >= 0 ? 0 : (netHeadroom / activeGeneration) * 2;
    const frequency = 60 + frequencyDeviation + (Math.random() - 0.5) * 0.02;

    // Carbon intensity per source (g CO2 / kWh)
    const carbonRates: Record<string, number> = {
      Gas: 450, Nuclear: 12, Hydro: 24, Wind: 11, Solar: 45, Battery: 20, Microgrid: 30,
    };
    let weightedCarbon = 0;
    Object.entries(generationMix).forEach(([source, mw]) => {
      weightedCarbon += mw * (carbonRates[source] || 0);
    });
    const carbonIntensity = activeGeneration > 0 ? Math.round(weightedCarbon / activeGeneration) : 0;

    // Cost per MWh by source ($/MWh)
    const costRates: Record<string, number> = {
      Gas: 65, Nuclear: 30, Hydro: 20, Wind: 25, Solar: 22, Battery: 55, Microgrid: 40,
    };
    let generationCost = 0;
    Object.entries(generationMix).forEach(([source, mw]) => {
      generationCost += mw * (costRates[source] || 50);
    });
    const costPerHr = Math.round(generationCost + totalDemand * 12);

    // Stability accounts for headroom too
    const headroomPenalty = netHeadroom < 0 ? Math.min(30, Math.abs(netHeadroom / (activeGeneration || 1)) * 100) : 0;
    const stabilityScore = Math.max(0, Math.round(stability - headroomPenalty));

    const metricsObj = {
      totalDemand: Math.round(totalDemand),
      totalCapacity: Math.round(activeGeneration),
      gridStability: stabilityScore,
      carbonIntensity,
      costPerHr,
    };

    state.setMetrics(metricsObj);

    const snapshot: DispatchSnapshot = {
      time: newSimTime,
      ...metricsObj,
      generationMix: Object.fromEntries(Object.entries(generationMix).map(([k, v]) => [k, Math.round(v)])),
      demandBreakdown: Object.fromEntries(Object.entries(demandBreakdown).map(([k, v]) => [k, Math.round(v)])),
      netHeadroom: Math.round(netHeadroom),
      frequency: Math.round(frequency * 100) / 100,
    };

    const newLog = [...dispatchLog.slice(-95), snapshot];

    a[0]({ nodes: newNodes, simTime: newSimTime, dispatchLog: newLog, latestDispatch: snapshot });
  },

  resetSim: () => {
    a[0]({ activeFilters: [], simTime: 12, dispatchLog: [], latestDispatch: null, isPlaying: false });
    a[1]().initGrid();
  }
}));
