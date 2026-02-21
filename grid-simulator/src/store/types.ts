export type FilterTheme =
    | 'Demand'
    | 'Generation'
    | 'Storage'
    | 'Grid Assets'
    | 'DER & EV'
    | 'Reliability'
    | 'Policy'
    | 'Markets'
    | 'Environment'
    | 'Telemetry'
    | 'Construction'
    | 'Cyber';

export const THEME_COLORS: Record<FilterTheme, string> = {
    'Demand': '#FFBC00',
    'Generation': '#00D4AA',
    'Storage': '#5AC8FA',
    'Grid Assets': '#34A853',
    'DER & EV': '#3B82F6',
    'Reliability': '#EA4335',
    'Policy': '#6366F1',
    'Markets': '#A78BFA',
    'Environment': '#FB923C',
    'Telemetry': '#9CA3AF',
    'Construction': '#94A3B8',
    'Cyber': '#EC4899',
};

export interface GridFilter {
    id: string;
    label: string;
    theme: FilterTheme;
    type: 'toggle' | 'slider' | 'dropdown' | 'number';
    value: string | number | boolean;
    min?: number;
    max?: number;
    step?: number;
    options?: string[];
    unit?: string;
    tooltip?: string;
}

export type NodeType =
    | 'power_plant'
    | 'nuclear_plant'
    | 'wind_farm'
    | 'solar_farm'
    | 'substation'
    | 'data_center'
    | 'battery_storage'
    | 'ev_charging_hub'
    | 'hospital'
    | 'stadium'
    | 'microgrid'
    | 'hydro_plant';
export type NodeStatus = 'normal' | 'warning' | 'critical' | 'offline';

export interface GridNode {
    id: string;
    type: NodeType;
    name: string;
    capacity: number;
    currentLoad: number;
    status: NodeStatus;
    connections: string[];
    lat: number;
    lng: number;
    baseLoad: number;
    generation: number;
}

export interface SimulationEvents {
    heatwaveIntensity: number;
    timeOfDay: number;
    dataCenterActive: boolean;
    solarFarmActive: boolean;
    batteryStorageActive: boolean;
    powerPlantOffline: boolean;
    evSurgeActive: boolean;
    industrialDemandActive: boolean;
}

export const MAP_CENTER = { lat: 37.7749, lng: -122.4194 } as const;

export interface InfrastructureBlueprint {
    type: NodeType;
    label: string;
    icon: string;
    description: string;
    defaultCapacity: number;
    defaultBaseLoad: number;
    defaultGeneration: number;
    color: string;
}

export const INFRASTRUCTURE_BLUEPRINTS: InfrastructureBlueprint[] = [
    // Generation
    { type: 'power_plant', label: 'Gas Power Plant', icon: '🏭', description: 'Combined-cycle gas turbine — 1 GW', defaultCapacity: 1000, defaultBaseLoad: 0, defaultGeneration: 1000, color: '#f97316' },
    { type: 'nuclear_plant', label: 'Nuclear Plant', icon: '☢️', description: 'Nuclear reactor — 1.2 GW baseload', defaultCapacity: 1200, defaultBaseLoad: 0, defaultGeneration: 1200, color: '#06b6d4' },
    { type: 'wind_farm', label: 'Wind Farm', icon: '💨', description: 'Utility-scale turbines — 400 MW', defaultCapacity: 400, defaultBaseLoad: 0, defaultGeneration: 400, color: '#60a5fa' },
    { type: 'solar_farm', label: 'Solar Farm', icon: '☀️', description: 'Photovoltaic array — 200 MW', defaultCapacity: 200, defaultBaseLoad: 0, defaultGeneration: 200, color: '#fbbf24' },
    { type: 'hydro_plant', label: 'Hydro Plant', icon: '🌊', description: 'Hydroelectric dam — 500 MW', defaultCapacity: 500, defaultBaseLoad: 0, defaultGeneration: 500, color: '#38bdf8' },

    // Grid Infrastructure
    { type: 'substation', label: 'Substation', icon: '⚡', description: 'Distribution hub — 250 MW capacity', defaultCapacity: 250, defaultBaseLoad: 120, defaultGeneration: 0, color: '#22d3ee' },
    { type: 'battery_storage', label: 'Battery Storage', icon: '🔋', description: 'Grid-scale BESS — 300 MW / 1200 MWh', defaultCapacity: 300, defaultBaseLoad: 0, defaultGeneration: 150, color: '#10b981' },
    { type: 'microgrid', label: 'Microgrid', icon: '🔌', description: 'Islanded district grid — 50 MW', defaultCapacity: 50, defaultBaseLoad: 20, defaultGeneration: 30, color: '#34d399' },

    // Load Centers
    { type: 'data_center', label: 'Data Center', icon: '🖥️', description: 'Hyperscale compute — 500 MW draw', defaultCapacity: 500, defaultBaseLoad: 400, defaultGeneration: 0, color: '#a855f7' },
    { type: 'ev_charging_hub', label: 'EV Charging Hub', icon: '🚗', description: 'Fast-charge station cluster — 50 MW', defaultCapacity: 50, defaultBaseLoad: 30, defaultGeneration: 0, color: '#4ade80' },
    { type: 'hospital', label: 'Hospital', icon: '🏥', description: 'Critical-load medical campus — 100 MW', defaultCapacity: 100, defaultBaseLoad: 80, defaultGeneration: 0, color: '#ef4444' },
    { type: 'stadium', label: 'Stadium', icon: '🏟️', description: 'Event venue — 150 MW peak demand', defaultCapacity: 150, defaultBaseLoad: 100, defaultGeneration: 0, color: '#facc15' },
];
