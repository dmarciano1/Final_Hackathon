import { create } from 'zustand';

export type NodeType = 'power_plant' | 'substation' | 'data_center' | 'solar_farm' | 'battery_storage' | 'hospital' | 'stadium';
export type NodeStatus = 'normal' | 'warning' | 'critical' | 'offline';

export interface GridNode {
  id: string;
  type: NodeType;
  name: string;
  capacity: number;
  currentLoad: number;
  status: NodeStatus;
  connections: string[]; // IDs of connected nodes
  position: [number, number, number]; // 3D placement (kept for compatibility)
  lat: number; // Mapbox latitude
  lng: number; // Mapbox longitude
  baseLoad: number; // For consumer nodes
  generation: number; // For generator nodes
}

// Neighborhood center for Mapbox (downtown San Francisco)
export const MAP_CENTER = { lat: 37.7749, lng: -122.4194 } as const;

export interface SimulationEvents {
  heatwaveIntensity: number; // 0 to 1
  timeOfDay: number; // 0 to 24
  dataCenterActive: boolean;
  solarFarmActive: boolean;
  batteryStorageActive: boolean;
  powerPlantOffline: boolean;
  evSurgeActive: boolean;
  industrialDemandActive: boolean;
}

interface SimulationStore {
  nodes: Record<string, GridNode>;
  events: SimulationEvents;
  metrics: {
    totalDemand: number;
    totalCapacity: number;
    gridStability: number;
    carbonIntensity: number;
    costPerHr: number;
  };
  
  // Actions
  updateEvent: <K extends keyof SimulationEvents>(key: K, value: SimulationEvents[K]) => void;
  tickSim: () => void; // Called repeatedly or when state changes to recalculate grid
  resetSim: () => void;
  recoverNode: (id: string) => void;
  // Initialize grid procedurally
  initGrid: () => void;
}

const INITIAL_EVENTS: SimulationEvents = {
  heatwaveIntensity: 0,
  timeOfDay: 12, // Noon
  dataCenterActive: false,
  solarFarmActive: false,
  batteryStorageActive: false,
  powerPlantOffline: false,
  evSurgeActive: false,
  industrialDemandActive: false,
};

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  nodes: {},
  events: { ...INITIAL_EVENTS },
  metrics: {
    totalDemand: 0,
    totalCapacity: 0,
    gridStability: 100,
    carbonIntensity: 0,
    costPerHr: 0,
  },

  updateEvent: (key, value) => {
    set((state) => ({
      events: {
        ...state.events,
        [key]: value,
      },
    }));
    get().tickSim(); // Immediately recalculate after event toggle
  },

  recoverNode: (id) => {
     set((state) => {
       const newNodes = { ...state.nodes };
       if (newNodes[id]) {
         newNodes[id] = { ...newNodes[id], status: 'normal' };
       }
       return { nodes: newNodes };
     });
     get().tickSim();
  },

  initGrid: () => {
    const { lat, lng } = MAP_CENTER;
    const newNodes: Record<string, GridNode> = {};

    // Core Generation - real lat/lng in downtown SF neighborhood
    newNodes['plant_1'] = {
      id: 'plant_1', type: 'power_plant', name: 'Main Gas Plant',
      capacity: 1000, currentLoad: 0, status: 'normal',
      connections: ['sub_north', 'sub_south', 'sub_east', 'sub_west'],
      position: [0, 0, 0], lat, lng, baseLoad: 0, generation: 1000
    };

    const baseSubstationParams = { capacity: 250, baseLoad: 120, generation: 0, status: 'normal' as NodeStatus };
    newNodes['sub_north'] = { id: 'sub_north', type: 'substation', name: 'North Substation', ...baseSubstationParams, currentLoad: 0, connections: ['plant_1', 'sub_east', 'sub_west'], position: [0, 0, 0], lat: lat + 0.0018, lng };
    newNodes['sub_south'] = { id: 'sub_south', type: 'substation', name: 'South Substation', ...baseSubstationParams, currentLoad: 0, connections: ['plant_1', 'sub_east', 'sub_west'], position: [0, 0, 0], lat: lat - 0.0018, lng };
    newNodes['sub_east'] = { id: 'sub_east', type: 'substation', name: 'East Substation', ...baseSubstationParams, currentLoad: 0, connections: ['plant_1', 'sub_north', 'sub_south'], position: [0, 0, 0], lat, lng: lng + 0.00175 };
    newNodes['sub_west'] = { id: 'sub_west', type: 'substation', name: 'West Substation', ...baseSubstationParams, currentLoad: 0, connections: ['plant_1', 'sub_north', 'sub_south'], position: [0, 0, 0], lat, lng: lng - 0.0021 };

    set({ nodes: newNodes, events: { ...INITIAL_EVENTS } });
    get().tickSim();
  },

  tickSim: () => {
    const { nodes, events } = get();
    const newNodes = { ...nodes };

    let totalDemand = 0;
    let activeGeneration = 0;
    let failedNodes = 0;

    // Apply modifiers
    const timeFactor = 1 + Math.sin((events.timeOfDay - 6) * (Math.PI / 12)) * 0.2; // Peak around 12-6pm roughly based on simple sine
    const heatwaveFactor = 1 + (events.heatwaveIntensity * 0.4); // Up to 40% increase
    const evFactor = events.evSurgeActive && events.timeOfDay > 17 && events.timeOfDay < 22 ? 1.3 : 1; // 30% jump 5PM-10PM
    const indFactor = events.industrialDemandActive ? 1.25 : 1; // 25% global jump

    // Calculate node base changes
    Object.values(newNodes).forEach(node => {
        // Skip base calculation if offline (or if type is generation only)
        if (node.status === 'offline') {
           failedNodes++;
           node.currentLoad = 0;
           return;
        }

        if (node.type === 'power_plant') {
           if (events.powerPlantOffline && node.id === 'plant_1') {
               node.status = 'offline';
               node.generation = 0;
               failedNodes++;
           } else {
               node.generation = 1000; // Reset just in case
               activeGeneration += node.generation;
           }
        }

        if (node.type === 'substation') {
            node.currentLoad = node.baseLoad * timeFactor * heatwaveFactor * evFactor * indFactor;
        }
    });

    // Special additions
    if (events.dataCenterActive) {
        if (!newNodes['datacenter']) {
            newNodes['datacenter'] = {
                id: 'datacenter', type: 'data_center', name: 'Cloud Region West',
                capacity: 300, currentLoad: 250, status: 'normal',
                connections: ['sub_west'], position: [0, 0, 0],
                lat: MAP_CENTER.lat - 0.0011, lng: MAP_CENTER.lng - 0.0021,
                baseLoad: 250, generation: 0
            };
        }
        if (newNodes['sub_west']) newNodes['sub_west'].currentLoad += 150; // Drain from local substation
        totalDemand += 250;
    } else {
        delete newNodes['datacenter'];
    }

    if (events.solarFarmActive && events.timeOfDay > 6 && events.timeOfDay < 19) {
        if (!newNodes['solar_farm']) {
            newNodes['solar_farm'] = {
                id: 'solar_farm', type: 'solar_farm', name: 'Valley Solar Array',
                capacity: 200, currentLoad: 0, status: 'normal',
                connections: ['sub_east'], position: [0, 0, 0],
                lat: MAP_CENTER.lat + 0.0013, lng: MAP_CENTER.lng + 0.0019,
                baseLoad: 0, generation: 200
            };
        }
        
        let sunlight = Math.sin((events.timeOfDay - 6) * (Math.PI / 12)); // peaks at midday
        if (sunlight < 0) sunlight = 0;
        newNodes['solar_farm'].generation = 200 * sunlight;
        activeGeneration += newNodes['solar_farm'].generation;
        if (newNodes['sub_east']) newNodes['sub_east'].currentLoad = Math.max(0, newNodes['sub_east'].currentLoad - newNodes['solar_farm'].generation);
    } else {
        delete newNodes['solar_farm'];
    }

    if (events.batteryStorageActive) {
        if (!newNodes['battery_mgr']) {
            newNodes['battery_mgr'] = {
                id: 'battery_mgr', type: 'battery_storage', name: 'City Megapack',
                capacity: 150, currentLoad: 0, status: 'normal',
                connections: ['sub_south'], position: [0, 0, 0],
                lat: MAP_CENTER.lat - 0.0007, lng: MAP_CENTER.lng + 0.0009,
                baseLoad: 0, generation: 150
            };
        }
        activeGeneration += 150;
        if (newNodes['sub_south']) newNodes['sub_south'].currentLoad = Math.max(0, newNodes['sub_south'].currentLoad - 80);
    } else {
        delete newNodes['battery_mgr'];
    }

    // Cascade failure logic
    // We do a simple propagation. If any substation is > 100%, it goes offline and adds its load to neighbors
    let unstable = true;
    let iteration = 0;
    while(unstable && iteration < 5) { // Prevent infinite loops
        unstable = false;
        Object.values(newNodes).forEach(node => {
            if (node.type === 'substation' && node.status !== 'offline') {
                if (node.currentLoad > node.capacity) {
                    node.status = 'offline';
                    unstable = true;
                    // Distribute its load to connected active substations
                    const activeNeighbors = node.connections
                        .map(nid => newNodes[nid])
                        .filter(n => n && n.type === 'substation' && n.status !== 'offline');
                    
                    if (activeNeighbors.length > 0) {
                        const loadShare = node.currentLoad / activeNeighbors.length;
                        activeNeighbors.forEach(n => {
                            n.currentLoad += loadShare;
                        });
                    }
                    node.currentLoad = 0; // It's offline now
                } else if (node.currentLoad > node.capacity * 0.85) {
                    node.status = 'warning';
                } else {
                    node.status = 'normal';
                }
            }
        });
        iteration++;
    }

    // Tally up
    Object.values(newNodes).forEach(node => {
        if (node.type === 'substation' && node.status !== 'offline') {
            totalDemand += node.currentLoad;
        }
    });

    // Calculate metrics
    const baseCarbon = 450; // gCO2/kWh gas base
    const totalNodes = Object.keys(newNodes).filter(k => newNodes[k].type === 'substation' || newNodes[k].type === 'power_plant').length;
    const stability = Math.max(0, 100 - (failedNodes / totalNodes) * 100);
    
    let carbonIntensity = baseCarbon;
    if (events.solarFarmActive) carbonIntensity -= 50;
    if (events.batteryStorageActive) carbonIntensity -= 20;

    const costPerHr = totalDemand * 50; // arbitrary $50/MW

    set({
        nodes: newNodes,
        metrics: {
            totalDemand: Math.round(totalDemand),
            totalCapacity: Math.round(activeGeneration),
            gridStability: Math.round(stability),
            carbonIntensity: Math.round(carbonIntensity),
            costPerHr: Math.round(costPerHr),
        }
    });
  },

  resetSim: () => {
    set({ events: { ...INITIAL_EVENTS } });
    get().initGrid();
  }
}));
