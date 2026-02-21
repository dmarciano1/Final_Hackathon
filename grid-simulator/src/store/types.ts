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

export type NodeType = 'power_plant' | 'substation' | 'data_center' | 'solar_farm' | 'battery_storage' | 'hospital' | 'stadium';
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
